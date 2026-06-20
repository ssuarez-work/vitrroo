# Vitrroo — Deployment checklist

Pasos obligatorios antes y después del primer deploy a producción.

## Antes del primer deploy

### Cuentas externas

- [ ] Supabase: proyecto creado, plan **Pro o superior** (para backups PITR de 7 días).
- [ ] Stripe: cuenta verificada en modo **Live**, no Test.
- [ ] Stripe Products en modo Live: "Vitrroo Pro Mensual" ($99 MXN) y "Vitrroo Pro Anual" ($890 MXN). Anota los `price_live_...`.
- [ ] Resend: cuenta y dominio verificado (3 registros DNS en verde).
- [ ] Sentry (opcional pero recomendado): proyecto Node, copia el DSN.
- [ ] UptimeRobot o BetterStack: pendiente, se configura post-deploy.

### Variables de entorno (Hostinger Setup Node.js App → Variables)

| Variable | Valor |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_KEY` | anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key (⚠️ secret) |
| `NUXT_STRIPE_SECRET_KEY` | `sk_live_...` |
| `NUXT_STRIPE_WEBHOOK_SECRET` | `whsec_...` (del endpoint LIVE) |
| `NUXT_STRIPE_PRICE_MONTHLY` | `price_live_...` mensual |
| `NUXT_STRIPE_PRICE_ANNUAL` | `price_live_...` anual |
| `NUXT_RESEND_API_KEY` | `re_...` |
| `NUXT_RESEND_FROM_EMAIL` | `"Vitrroo <hola@tudominio.com>"` |
| `NUXT_CRON_SECRET` | `openssl rand -base64 32` |
| `NUXT_PUBLIC_APP_URL` | `https://tudominio.com` (sin slash) |
| `NUXT_SENTRY_DSN` | DSN de Sentry (opcional) |
| `NODE_ENV` | `production` |

### Migraciones de Supabase

Aplica en orden en Supabase Dashboard → SQL Editor:

1. `supabase/migrations/00001_initial_schema.sql`
2. `00002_store_events.sql`
3. `00003_categories_variants_ordering.sql`
4. `00004_plans_and_growth.sql`
5. `00005_store_themes.sql`
6. `00006_polish_and_compliance.sql`
7. `00007_audit_retries_storage.sql`
8. `00008_atomic_stock_and_email_dedup.sql`
9. `00009_retention_and_downgrade_email.sql`
10. `00010_remove_referrals.sql`

### Supabase Dashboard

- [ ] Authentication → URL Configuration → **Site URL**: `https://tudominio.com`
- [ ] Authentication → URL Configuration → **Redirect URLs**:
  - `https://tudominio.com/reset-password`
  - `https://tudominio.com/auth/callback`
- [ ] Storage → bucket `vitrroo-assets` → confirmar política "Owners only upload" (la migración 00007 lo hace).

### Stripe Dashboard

- [ ] Developers → Webhooks → "+ Add endpoint":
  - URL: `https://tudominio.com/api/billing/webhook`
  - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Copia el `whsec_...` → ponlo en `NUXT_STRIPE_WEBHOOK_SECRET`.

### Resend Dashboard

- [ ] Domains → tu dominio: 3 registros DNS (SPF, DKIM, DMARC) en ✅ Verified.

---

## Durante el deploy

1. `npm run build` local. Verifica `.output/server/index.mjs` existe.
2. Sube código a Hostinger (Git pull o zip).
3. hPanel → Setup Node.js App:
   - **Startup file**: `.output/server/index.mjs`
   - **Node version**: 20.x
   - **Mode**: Production
4. "Run NPM Install" → espera fin.
5. "Start App".

## Después del deploy

### Smoke tests (en orden)

- [ ] `https://tudominio.com/` carga landing.
- [ ] `https://tudominio.com/api/health` devuelve `{"status":"ok"}`.
- [ ] `https://tudominio.com/sitemap.xml` devuelve XML válido.
- [ ] Registro: crear cuenta con email real, recibir welcome email.
- [ ] Login: logout y volver a entrar. Verifica que `?next=` redirige bien.
- [ ] MFA: activar 2FA en "Mi cuenta", logout, login → debe pedir código.
- [ ] Crear producto con foto. Abrir storefront en `/<slug>`, verificar render mobile + desktop.
- [ ] Click WhatsApp en producto → debe abrir wa.me con mensaje precargado.
- [ ] Stripe: hacer suscripción de prueba con tarjeta 4242 4242 4242 4242 (en modo test temporal).
- [ ] Verificar webhook llegó en Stripe Dashboard (status 200).
- [ ] Confirmar que `stores.plan` cambió a `pro` en Supabase.
- [ ] Eliminar la cuenta de prueba → confirmar `auth.users` y `stores` se borraron.

### Cron jobs en hPanel

| Frecuencia | Comando |
|---|---|
| `*/10 * * * *` (cada 10 min) | `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://tudominio.com/api/cron/process-email-queue` |
| `0 9 * * 1` (lunes 9am) | `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://tudominio.com/api/cron/weekly-summary` |
| `0 8 * * *` (diario 8am) | `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://tudominio.com/api/cron/trial-warnings` |
| `0 3 * * *` (diario 3am) | `curl -fsS -X POST -H "Authorization: Bearer $CRON_SECRET" https://tudominio.com/api/cron/purge-old-data` |

Reemplaza `$CRON_SECRET` por el valor real de `NUXT_CRON_SECRET`.

### Monitoreo externo

- [ ] UptimeRobot: monitor HTTP a `https://tudominio.com/api/health` cada 5 min. Alerta si baja 2 ciclos.
- [ ] Sentry: confirma que un error de prueba (lanza en `/api/health` un `throw new Error()`) aparece en el dashboard.
- [ ] Cronitor (opcional): dale ping desde cada cron, alerta si dejan de venir.

### Configuración de DNS

- [ ] Apuntar dominio (A/CNAME) a Hostinger.
- [ ] SSL: hPanel → SSL → instalar Let's Encrypt gratis (autorenovable).
- [ ] Verifica candado verde en `https://tudominio.com`.

---

## Staging environment (opcional pero recomendado)

1. Crear segundo proyecto Supabase: `vitrroo-staging` (Free plan basta).
2. Aplicar las mismas migraciones.
3. Crear subdominio `staging.tudominio.com` apuntando a otra app Node en Hostinger.
4. Mismo `.env` pero apuntando a `vitrroo-staging.supabase.co`.
5. En Stripe usar modo Test, con su propio webhook a `https://staging.tudominio.com/api/billing/webhook`.
6. GitHub: rama `staging` con workflow que despliega solo a ese entorno.

Usa staging para probar cada PR antes de mergear a `main`.

---

## Rollback

Si el deploy nuevo rompe algo:

1. hPanel → Setup Node.js App → "Stop App".
2. `git checkout` al commit anterior estable en el servidor: `git checkout <sha_anterior>`.
3. `npm install && npm run build`.
4. "Start App".

Para datos de Supabase corrompidos: ver [RUNBOOK.md → Restaurar desde backup](./RUNBOOK.md#restaurar-desde-backup).
