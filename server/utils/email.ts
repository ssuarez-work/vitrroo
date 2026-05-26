interface SendEmailInput {
  to: string
  subject: string
  html: string
}

interface SendEmailResult {
  ok: boolean
  error: string | null
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const config = useRuntimeConfig()
  if (!config.resendApiKey) {
    return { ok: false, error: 'RESEND_API_KEY no configurada' }
  }

  try {
    await $fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        from: config.resendFromEmail,
        to: [input.to],
        subject: input.subject,
        html: input.html
      }
    })
    return { ok: true, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return { ok: false, error: message }
  }
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

interface EmailTemplate {
  subject: string
  html: string
}

const wrapper = (innerHtml: string): string => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #0f0f10; padding: 24px;">
    <div style="margin-bottom: 24px;">
      <span style="display:inline-flex;align-items:center;gap:8px;font-size:18px;font-weight:800;color:#0f0f10;">
        <span style="width:24px;height:24px;border-radius:6px;background:#22c55e;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">V</span>
        Vitrroo
      </span>
    </div>
    ${innerHtml}
    <hr style="margin: 32px 0 16px; border:none; border-top: 1px solid #f0f0f2;" />
    <p style="color:#9ca3af; font-size: 12px; line-height: 1.5;">
      Recibes este mensaje porque tienes una cuenta en Vitrroo. Si quieres dejar de recibirlos, escribe a hola@vitrroo.com.
    </p>
  </div>
`

const ctaButton = (label: string, href: string, color: 'primary' | 'dark' = 'primary'): string => {
  const bg = color === 'dark' ? '#0f0f10' : '#22c55e'
  return `<a href="${href}" style="display:inline-block; padding:12px 24px; background:${bg}; color:#fff; border-radius:12px; font-weight:700; text-decoration:none;">${escapeHtml(label)}</a>`
}

export const renderWeeklySummaryEmail = (params: {
  storeName: string
  visits: number
  whatsappClicks: number
  topProduct: string | null
  storeUrl: string
}): EmailTemplate => {
  const topLine = params.topProduct
    ? `<p style="margin:8px 0;">Producto más visto: <strong>${escapeHtml(params.topProduct)}</strong></p>`
    : ''

  const html = wrapper(`
    <h1 style="font-size: 22px; margin-bottom: 16px;">Tu semana en Vitrroo</h1>
    <p style="margin: 0 0 16px; color: #555;">Hola, ${escapeHtml(params.storeName)}. Este es tu resumen de los últimos 7 días.</p>
    <div style="background: #f8f8fa; border-radius: 16px; padding: 20px; margin-bottom: 16px;">
      <p style="margin:8px 0;">Visitas: <strong>${params.visits}</strong></p>
      <p style="margin:8px 0;">Clics a WhatsApp: <strong>${params.whatsappClicks}</strong></p>
      ${topLine}
    </div>
    ${ctaButton('Abrir mi panel', params.storeUrl, 'dark')}
  `)

  return { subject: 'Tu semana en Vitrroo', html }
}

export const renderFirstClickEmail = (params: {
  storeName: string
  storeUrl: string
}): EmailTemplate => {
  const html = wrapper(`
    <h1 style="font-size: 22px; margin-bottom: 16px;">¡Recibiste tu primer pedido del mes!</h1>
    <p style="margin: 0 0 16px; color: #555;">Hola, ${escapeHtml(params.storeName)}. Alguien acaba de tocar tu botón de WhatsApp.</p>
    <p style="margin: 0 0 24px; color: #555;">Responde pronto: la conversación más rápida es la que cierra venta.</p>
    ${ctaButton('Ver mi catálogo', params.storeUrl)}
  `)
  return { subject: '¡Tu primer pedido del mes en Vitrroo!', html }
}

export const renderWelcomeEmail = (params: {
  storeName: string
  storeUrl: string
  adminUrl: string
}): EmailTemplate => {
  const html = wrapper(`
    <h1 style="font-size: 24px; margin-bottom: 8px;">¡Bienvenido a Vitrroo!</h1>
    <p style="margin: 0 0 20px; color: #555;">Tu catálogo "${escapeHtml(params.storeName)}" ya está creado y tienes 14 días de Pro gratis para probar todas las funciones.</p>

    <p style="margin: 0 0 8px; font-weight: 700;">Próximos pasos:</p>
    <ol style="margin: 0 0 24px; padding-left: 20px; color: #555; line-height: 1.7;">
      <li>Sube tu logo y configura tu número de WhatsApp.</li>
      <li>Crea tus primeros productos con fotos y precios.</li>
      <li>Comparte tu enlace en tu bio de Instagram o stories.</li>
    </ol>

    ${ctaButton('Configurar mi tienda', params.adminUrl, 'dark')}

    <p style="margin: 28px 0 8px; color: #555;">Tu enlace público es:</p>
    <p style="margin: 0; font-family: monospace; background:#f8f8fa; padding:8px 12px; border-radius:8px;">${escapeHtml(params.storeUrl)}</p>
  `)
  return { subject: '¡Bienvenido a Vitrroo!', html }
}

export const renderTrialEndingSoonEmail = (params: {
  storeName: string
  trialEndsAt: string
  billingUrl: string
}): EmailTemplate => {
  const date = new Date(params.trialEndsAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
  const html = wrapper(`
    <h1 style="font-size: 22px; margin-bottom: 16px;">Tu trial termina pronto</h1>
    <p style="margin: 0 0 16px; color: #555;">Hola, ${escapeHtml(params.storeName)}. Tu trial de Pro termina el <strong>${date}</strong>.</p>
    <p style="margin: 0 0 24px; color: #555;">Si lo activas antes, mantienes la galería de imágenes, los productos destacados, las estadísticas avanzadas y el resto de funciones que ya estás usando.</p>
    ${ctaButton('Activar Pro ahora', params.billingUrl)}
  `)
  return { subject: 'Tu trial de Vitrroo Pro termina pronto', html }
}

export const renderSubscriptionCancelledEmail = (params: {
  storeName: string
  billingUrl: string
}): EmailTemplate => {
  const html = wrapper(`
    <h1 style="font-size: 22px; margin-bottom: 16px;">Tu suscripción Pro fue cancelada</h1>
    <p style="margin: 0 0 16px; color: #555;">Hola, ${escapeHtml(params.storeName)}. Confirmamos la cancelación de tu plan Pro.</p>
    <p style="margin: 0 0 16px; color: #555;">Tu tienda sigue activa en plan Free. Algunos productos pueden haberse desactivado para respetar el límite del plan; puedes reactivarlos manualmente desde el panel.</p>
    <p style="margin: 0 0 24px; color: #555;">Si fue un error o quieres volver, puedes reactivar Pro en cualquier momento.</p>
    ${ctaButton('Reactivar Pro', params.billingUrl)}
  `)
  return { subject: 'Tu suscripción Pro de Vitrroo fue cancelada', html }
}

export const renderTrialExpiredEmail = (params: {
  storeName: string
  billingUrl: string
}): EmailTemplate => {
  const html = wrapper(`
    <h1 style="font-size: 22px; margin-bottom: 16px;">Tu trial de Pro terminó</h1>
    <p style="margin: 0 0 16px; color: #555;">Hola, ${escapeHtml(params.storeName)}. Tu trial de Pro venció. Volviste al plan Free, pero tus datos están intactos.</p>
    <p style="margin: 0 0 24px; color: #555;">Si quieres volver a Pro y recuperar productos ilimitados, mensajes personalizados y stats avanzadas, activa la suscripción cuando quieras.</p>
    ${ctaButton('Pasar a Pro', params.billingUrl)}
  `)
  return { subject: 'Tu trial de Vitrroo Pro terminó' , html }
}
