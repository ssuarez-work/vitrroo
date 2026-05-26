import Stripe from 'stripe'

let cachedClient: Stripe | null = null

export const useStripe = (): Stripe => {
  if (cachedClient) return cachedClient

  const config = useRuntimeConfig()
  if (!config.stripeSecretKey) {
    throw createError({ statusCode: 500, statusMessage: 'STRIPE_SECRET_KEY no está configurada' })
  }

  type StripeConfig = ConstructorParameters<typeof Stripe>[1]
  cachedClient = new Stripe(config.stripeSecretKey, {
    apiVersion: '2024-09-30.acacia' as NonNullable<StripeConfig>['apiVersion']
  })
  return cachedClient
}

export const resolvePriceId = (interval: 'monthly' | 'annual'): string => {
  const config = useRuntimeConfig()
  const priceId = interval === 'annual' ? config.stripePriceAnnual : config.stripePriceMonthly
  if (!priceId) {
    throw createError({ statusCode: 500, statusMessage: `Price id de ${interval} no configurado` })
  }
  return priceId
}
