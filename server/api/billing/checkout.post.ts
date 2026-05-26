import { z } from 'zod'
import { serverSupabaseUser } from '#supabase/server'

const bodySchema = z.object({
  interval: z.enum(['monthly', 'annual'])
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'billing-checkout', limit: 10, windowSeconds: 60 })

  const body = await readValidatedBody(event, bodySchema.parse)

  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const stripe = useStripe()
  const store = await getStoreByUserId(event, user.id)

  let customerId = store.stripe_customer_id
  if (!customerId) {
    const existing = await stripe.customers.list({ email: user.email ?? undefined, limit: 1 })
    const reusable = existing.data.find((c) => c.metadata?.store_id === store.id)
    if (reusable) {
      customerId = reusable.id
    } else {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { store_id: store.id, user_id: user.id }
      })
      customerId = customer.id
    }
    await updateStoreById(event, store.id, { stripe_customer_id: customerId })
  }

  const config = useRuntimeConfig()
  const successUrl = `${config.public.appUrl}/admin/billing?checkout=success`
  const cancelUrl = `${config.public.appUrl}/admin/billing?checkout=cancelled`

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: resolvePriceId(body.interval), quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { store_id: store.id, user_id: user.id, interval: body.interval }
    },
    metadata: { store_id: store.id, user_id: user.id, interval: body.interval }
  })

  if (!session.url) {
    throw createError({ statusCode: 500, statusMessage: 'Stripe no devolvió URL de checkout' })
  }

  return { url: session.url }
})
