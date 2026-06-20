# Vitrroo

Catálogos digitales móvil-first para vender por WhatsApp. Cada negocio crea su tienda, sube sus productos y comparte un enlace tipo `vitrroo.com/mi-tienda`. Los clientes ven el catálogo, eligen lo que quieren y completan el pedido en una conversación de WhatsApp con un mensaje precargado.

## Stack

- Nuxt 4 + Vue 3 + TypeScript
- Tailwind CSS + `@nuxt/icon`
- Supabase (Auth, Postgres, Storage, RLS, MFA TOTP)
- Stripe (suscripciones)
- Resend (correos transaccionales)

## Estructura

```
app/
├── components/         UI compartida (ImageUploader, BottomSheet, AdminSheet, ThemePicker, etc.)
├── composables/        Hooks de dominio (useStorefront, usePlanLimits, useAnalytics, useAccountSecurity, ...)
├── layouts/            admin, storefront
├── middleware/         auth (protección del panel)
├── pages/              landing, auth (login, register, callback, forgot/reset), [slug], admin/*, terms, privacy
├── plugins/            session-monitor (cliente)
├── themes/             Catálogo de 10 temas con tokens visuales
└── types/              Modelos compartidos
server/
├── api/                Endpoints Nitro (billing, cron, user, health)
└── utils/              Helpers (stripe, rateLimit, cronAuth, logger, email, audit, monitor, storeAdmin, phone)
supabase/migrations/    Esquema inicial + 6 migraciones evolutivas
public/                 favicon.svg, apple-touch-icon.svg, manifest.json, robots.txt
```

## Setup local

1. Copia `.env.example` a `.env` y llena las variables.
2. Aplica las migraciones SQL de `supabase/migrations/` en orden (00001 → 00007).
3. En Supabase Auth → Redirect URLs, agrega `http://localhost:3000/reset-password` y `http://localhost:3000/auth/callback`.
4. Instala y arranca:

```bash
npm install
npm run dev
```

5. (Opcional) Para probar el flujo Stripe en local, instala [Stripe CLI](https://stripe.com/docs/stripe-cli) y corre:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

## Modelo de datos

- `stores`: una por usuario, slug único, plan, trial, theme, referral_code, is_published.
- `products`: nombre, precio (en centavos), category_id, sort_order, is_active, is_pinned, custom_wa_message.
- `product_variants`: label + stock_quantity nullable + sort_order.
- `product_images`: galería de hasta 5 imágenes por producto (Pro).
- `categories`: por tienda con sort_order.
- `store_events`: visitas y clics WhatsApp (analytics).
- `email_queue`: cola con retry exponencial.
- `referrals`: programa de referidos (oculto del UI, infra preservada).
- `audit_logs`: trazabilidad de acciones críticas.

## Producción — configuración externa

### Variables de entorno

Ver `.env.example`. En producción:

- `SUPABASE_SERVICE_ROLE_KEY` es requerida para los endpoints server (webhook Stripe, crons, eliminar cuenta).
- `NUXT_PUBLIC_APP_URL` debe ser tu dominio real (sin slash final).
- `NUXT_CRON_SECRET` genera con `openssl rand -base64 32`.

### Stripe

1. Crea producto **Vitrroo Pro Mensual** ($99 MXN/mes) y copia el `price_xxx`.
2. Crea producto **Vitrroo Pro Anual** ($890 MXN/año) y copia el `price_xxx`.
3. Webhook → `https://tu-dominio.com/api/billing/webhook` escuchando:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el `whsec_xxx` del webhook a `NUXT_STRIPE_WEBHOOK_SECRET`.

### Resend

1. Crea API key.
2. Verifica el dominio remitente (sin esto, los correos van a spam o son rechazados).
3. Configura `NUXT_RESEND_FROM_EMAIL` con un alias de tu dominio.

### Supabase

1. Aplica las 7 migraciones SQL en orden.
2. Auth → URL Configuration → Redirect URLs:
   - `https://tu-dominio.com/reset-password`
   - `https://tu-dominio.com/auth/callback`
3. (Opcional) Activa email confirmation si quieres requerirla.
4. Storage → bucket `vitrroo-assets` se crea con la migración 00001 y se restringe en 00007.

### Cron jobs

Configura 3 endpoints con `Authorization: Bearer $NUXT_CRON_SECRET`:

| Endpoint | Frecuencia |
|---|---|
| `POST /api/cron/process-email-queue` | cada 10 minutos |
| `POST /api/cron/weekly-summary` | lunes 9:00 AM |
| `POST /api/cron/trial-warnings` | diario 8:00 AM |

Opciones recomendadas: Vercel Cron, GitHub Actions, supabase pg_cron, o un job manager (Inngest, Trigger.dev).

### Deploy

Vercel/Netlify/Cloudflare Pages funcionan con Nuxt 4 sin configuración especial. Apunta el repo, agrega las variables y deploya.

### Healthcheck

`GET /api/health` devuelve `200 ok` si todo está bien o `503 degraded` si la base no responde. Útil para load balancers y monitoreo externo (UptimeRobot, BetterUptime).

## Scripts

```bash
npm run dev        # entorno de desarrollo en http://localhost:3000
npm run build      # build de producción
npm run preview    # previsualiza el build
npm run lint       # ESLint
```
