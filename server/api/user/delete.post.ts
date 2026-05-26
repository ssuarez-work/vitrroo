import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

type ServiceClient = ReturnType<typeof serverSupabaseServiceRole<Database>>

const cancelSubscriptionSafely = async (subscriptionId: string | null): Promise<void> => {
  if (!subscriptionId) return
  try {
    const stripe = useStripe()
    await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    captureError(error, { scope: 'user-delete:cancel-subscription', subscriptionId })
  }
}

const removeStorageFolder = async (admin: ServiceClient, userId: string): Promise<void> => {
  try {
    const { data: files } = await admin.storage.from('vitrroo-assets').list(userId, { limit: 1000 })
    if (!files || files.length === 0) return
    const paths = files.map((file) => `${userId}/${file.name}`)
    await admin.storage.from('vitrroo-assets').remove(paths)
  } catch (error) {
    captureError(error, { scope: 'user-delete:remove-storage', userId })
  }
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'user-delete', limit: 3, windowSeconds: 600 })

  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const admin = serverSupabaseServiceRole<Database>(event)

  const { data: store } = await admin
    .from('stores')
    .select('id, stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const subscriptionId = store?.stripe_subscription_id ?? null

  await recordAudit(event, 'account.deleted', {
    userId: user.id,
    metadata: { email: user.email ?? null, had_subscription: Boolean(subscriptionId) }
  })

  await cancelSubscriptionSafely(subscriptionId)
  await removeStorageFolder(admin, user.id)

  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    captureError(error, { scope: 'user-delete', userId: user.id })
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
