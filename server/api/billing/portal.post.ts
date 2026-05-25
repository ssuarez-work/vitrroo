import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'billing-portal', limit: 10, windowSeconds: 60 })

  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const store = await getStoreByUserId(event, user.id)
  if (!store.stripe_customer_id) {
    throw createError({ statusCode: 400, statusMessage: 'Esta tienda aún no tiene una suscripción' })
  }

  const stripe = useStripe()
  const config = useRuntimeConfig()

  const session = await stripe.billingPortal.sessions.create({
    customer: store.stripe_customer_id,
    return_url: `${config.public.appUrl}/admin/billing`
  })

  return { url: session.url }
})
