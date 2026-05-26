# Vitrroo — Runbook

Procedimientos para incidentes comunes en producción.

## Tabla de contenido

- [Servicio caído](#servicio-caído)
- [Webhook de Stripe falla](#webhook-de-stripe-falla)
- [Emails no se envían](#emails-no-se-envían)
- [Crons no se ejecutan](#crons-no-se-ejecutan)
- [Storefront público devuelve 500](#storefront-público-devuelve-500)
- [Restaurar desde backup](#restaurar-desde-backup)
- [Rotación de secrets](#rotación-de-secrets)
- [Bloquear usuario abusivo](#bloquear-usuario-abusivo)
- [Cambiar dominio](#cambiar-dominio)
- [Migración de schema](#migración-de-schema)

---

## Servicio caído

**Síntoma**: `https://tudominio.com` responde 5xx o no responde.

1. Visita `https://tudominio.com/api/health` directamente.
   - Si devuelve 200 → es CDN o DNS. Verifica registros en Hostinger.
   - Si devuelve 503 → la base no responde, ve a Supabase Dashboard → Project Status.
   - Si no devuelve nada → el Node app de Hostinger murió.
2. En hPanel → Hosting → Setup Node.js App → click "Restart App".
3. Si no levanta: revisa logs en hPanel → "Logs" o por SSH `tail -f ~/logs/app.log`.
4. Si Node arranca pero rutas fallan: probable env var faltante. Ver paso siguiente.

---

## Webhook de Stripe falla

**Síntoma**: en Stripe Dashboard → Webhooks → el endpoint muestra eventos con 4xx/5xx.

1. **Signature inválida (400)**: `NUXT_STRIPE_WEBHOOK_SECRET` en Hostinger no coincide con el del endpoint en Stripe. Copia el actual de Stripe → pega en Hostinger → restart app.
2. **Body vacío (400)**: probablemente algún proxy comió el raw body. Ver `routeRules['/api/billing/webhook']` en `nuxt.config.ts`.
3. **500**: revisa el log del endpoint en Sentry (si `NUXT_SENTRY_DSN` está set) o en Hostinger.
4. **Re-enviar evento**: en Stripe Dashboard → Webhooks → click el evento fallido → "Resend".
5. Si el cliente quedó en plan inconsistente (pagó pero no es Pro), corrige manualmente:
   - Supabase → SQL Editor → `UPDATE stores SET plan='pro', pro_until='YYYY-MM-DD' WHERE id='...';`

---

## Emails no se envían

**Síntoma**: usuarios reportan que no llegó el welcome / weekly summary.

1. Revisa la cola: `SELECT status, count(*) FROM email_queue WHERE created_at >= now() - interval '24 hours' GROUP BY status;`
2. Si `pending` está creciendo y `sent` está estancado → el cron de `process-email-queue` no corre.
   - Verifica en hPanel → Cron Jobs que el job esté activo.
   - Prueba manualmente: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" https://tudominio.com/api/cron/process-email-queue`
3. Si `failed` está alto → revisa `error_message` en la cola:
   - "missing_email" → user borró su cuenta sin que se procesara el email
   - "store_not_found" → tienda borrada antes de procesar
   - Mensajes de Resend → revisa que dominio esté verificado (Resend Dashboard → Domains)
4. Reset retry de un job específico:
   ```sql
   UPDATE email_queue
   SET status='pending', retry_count=0, next_retry_at=NULL, error_message=NULL
   WHERE id=<jobId>;
   ```

---

## Crons no se ejecutan

1. hPanel → Cron Jobs → verifica que existan 4 jobs:
   - `process-email-queue` cada 10 min
   - `weekly-summary` lunes 9am
   - `trial-warnings` diario 8am
   - `purge-old-data` diario 3am
2. Cada job debe llevar `Authorization: Bearer $NUXT_CRON_SECRET` como header.
3. Hostinger no manda alerta si fallan. Recomendado: configurar [cronitor.io](https://cronitor.io) o usar webhook ping en cada endpoint.

---

## Storefront público devuelve 500

**Síntoma**: `https://tudominio.com/algun-slug` devuelve 500.

1. Si es solo un slug → puede ser un bug específico de esa tienda (caracteres raros, datos inválidos). Captura el SSR trace en Sentry.
2. Si son todos los slugs → algo del SSR rompe en general. Causas pasadas:
   - `useRuntimeConfig` llamado fuera de setup en computed que `useHead` evalúa lazy.
   - Variables de entorno faltantes (`SUPABASE_URL`).
3. Reproducir local: `npm run build && node .output/server/index.mjs` y abre la URL.

---

## Restaurar desde backup

**Supabase (Plan Pro o superior)**:
1. Dashboard → Project Settings → Database → Backups → escoge fecha → "Restore".
2. ⚠️ Esto reemplaza TODO. Tomar dump del estado actual primero: `pg_dump $SUPABASE_DB_URL > before-restore.sql`.

**Storage `vitrroo-assets`**:
- Supabase no respalda Storage automáticamente. Si tienes dump manual con `rclone copy supabase:vitrroo-assets s3:backups`, restaura desde ahí.

**Stripe**:
- Stripe no se respalda. Si pierdes el `stripe_customer_id` de un store, búscalo en Stripe Dashboard por email del usuario.

---

## Rotación de secrets

1. **Service role key de Supabase**:
   - Supabase Dashboard → Settings → API → "Regenerate" en `service_role` (después de las 3am hora local — todos los endpoints server-side fallan durante ~30s).
   - Actualiza `SUPABASE_SERVICE_ROLE_KEY` en Hostinger panel → Restart App.

2. **Cron secret**:
   - Local: `openssl rand -base64 32`
   - Actualiza `NUXT_CRON_SECRET` en Hostinger + en cada cron job que lo pase como Bearer.

3. **Stripe webhook secret**:
   - Stripe Dashboard → Webhooks → "Roll secret".
   - Copia el nuevo, actualiza `NUXT_STRIPE_WEBHOOK_SECRET` en Hostinger, restart.

---

## Bloquear usuario abusivo

1. Identifica `user_id` (Supabase → Auth → Users) o `store_id` (`stores` table).
2. Bloquear acceso al panel:
   ```sql
   UPDATE auth.users SET banned_until = '2099-12-31'::timestamptz WHERE id = '...';
   ```
3. Despublicar tienda:
   ```sql
   UPDATE stores SET is_published = false WHERE id = '...';
   ```
4. Registrar acción en `audit_logs`:
   ```sql
   INSERT INTO audit_logs (user_id, action, metadata) VALUES ('...', 'admin.user_banned', '{"reason":"..."}');
   ```

---

## Cambiar dominio

1. Apunta DNS del dominio nuevo a Hostinger.
2. Actualiza `NUXT_PUBLIC_APP_URL` en variables de entorno de Hostinger.
3. En Supabase → Auth → URL Configuration → añade nuevos redirect URLs (manten los viejos durante 30 días).
4. En Stripe → Webhooks → crea nuevo endpoint apuntando al nuevo dominio (manten el viejo durante 30 días para que no se pierdan eventos en tránsito).
5. Actualiza Resend → Domains si cambiaste también el dominio del remitente.

---

## Migración de schema

1. Crea archivo en `supabase/migrations/00XXX_descripción.sql`.
2. **NUNCA edites una migración ya aplicada** — crea una nueva que la modifique.
3. Aplica localmente con `supabase db push` (si usas CLI) o copia/pega en Supabase Dashboard → SQL Editor.
4. Si la migración rompe algo en prod, hay que escribir otra migración que revierta.
5. Si el CI tiene `SUPABASE_ACCESS_TOKEN` configurado, aplica automáticamente en cada deploy.

---

## Contactos de proveedores

| Servicio | Status page | Soporte |
|---|---|---|
| Supabase | https://status.supabase.com | support@supabase.com |
| Stripe | https://status.stripe.com | Dashboard → Help |
| Resend | https://status.resend.com | support@resend.com |
| Hostinger | https://www.hostinger.com/status | chat 24/7 en hPanel |
