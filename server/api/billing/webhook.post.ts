import type Stripe from 'stripe'
import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

const enqueueDowngradeEmail = async (event: H3Event, storeId: string): Promise<void> => {
  try {
    const admin = serverSupabaseServiceRole<Database>(event)
    await admin.from('email_queue').insert({
      store_id: storeId,
      kind: 'subscription_cancelled',
      payload: {}
    })
  } catch (error) {
    captureError(error, { scope: 'webhook:enqueue-downgrade-email', storeId })
  }
}

const proUntilFromSubscription = (subscription: Stripe.Subscription): string | null => {
  const legacyEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
  const itemEnd = subscription.items.data[0]?.current_period_end
  const periodEnd = legacyEnd ?? itemEnd
  if (!periodEnd) return null
  return new Date(periodEnd * 1000).toISOString()
}

const handleSubscriptionUpsert = async (event: any, subscription: Stripe.Subscription) => {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const store = await findStoreByCustomerId(event, customerId)
  if (!store) return

  const isActive = ['active', 'trialing', 'past_due'].includes(subscription.status)
  await updateStoreById(event, store.id, {
    plan: isActive ? 'pro' : 'free',
    pro_until: isActive ? proUntilFromSubscription(subscription) : null,
    stripe_subscription_id: subscription.id
  })

  await recordAudit(event, isActive ? 'billing.subscription_updated' : 'billing.subscription_cancelled', {
    userId: store.user_id,
    storeId: store.id,
    targetType: 'stripe_subscription',
    targetId: subscription.id,
    metadata: { status: subscription.status, plan: isActive ? 'pro' : 'free' }
  })
}

const handleSubscriptionDeleted = async (event: any, subscription: Stripe.Subscription) => {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id
  const store = await findStoreByCustomerId(event, customerId)
  if (!store) return

  await updateStoreById(event, store.id, {
    plan: 'free',
    pro_until: null,
    stripe_subscription_id: null
  })
  await runDowngradeCleanup(event, store.id)
  await enqueueDowngradeEmail(event, store.id)

  await recordAudit(event, 'billing.subscription_cancelled', {
    userId: store.user_id,
    storeId: store.id,
    targetType: 'stripe_subscription',
    targetId: subscription.id
  })
  await recordAudit(event, 'billing.downgrade_cleanup', {
    userId: store.user_id,
    storeId: store.id
  })
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'billing-webhook', limit: 100, windowSeconds: 60 })

  const config = useRuntimeConfig()
  if (!config.stripeWebhookSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Webhook secret no configurado' })
  }

  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    throw createError({ statusCode: 400, statusMessage: 'Falta firma de Stripe' })
  }

  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Body vacío' })
  }

  const stripe = useStripe()
  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Firma inválida'
    throw createError({ statusCode: 400, statusMessage: message })
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          await handleSubscriptionUpsert(event, subscription)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpsert(event, stripeEvent.data.object as Stripe.Subscription)
        break
      }
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event, stripeEvent.data.object as Stripe.Subscription)
        break
      }
      default:
        break
    }
  } catch (error) {
    captureError(error, { stripeEventType: stripeEvent.type, stripeEventId: stripeEvent.id })
    throw error
  }

  return { received: true }
})
