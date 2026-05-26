export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxtjs/supabase',
    '@nuxt/eslint'
  ],

  supabase: {
    redirect: false
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ]
    }
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' data: https://fonts.gstatic.com",
          "img-src 'self' data: blob: https: http:",
          "media-src 'self' blob: https:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.resend.com",
          "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'"
        ].join('; ')
      }
    },
    '/api/billing/webhook': {
      headers: {
        'X-Content-Type-Options': 'nosniff'
      }
    },
    '/[slug]': {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
      }
    }
  },

  runtimeConfig: {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    stripePriceMonthly: '',
    stripePriceAnnual: '',
    resendApiKey: '',
    resendFromEmail: 'Vitrroo <hola@vitrroo.com>',
    cronSecret: '',
    public: {
      appUrl: 'http://localhost:3000'
    }
  },

  app: {
    head: {
      title: 'Vitrroo — Catálogos para WhatsApp',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Crea tu catálogo digital y vende más rápido por WhatsApp.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
