import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { ServiceClient } from '~~/server/utils/serviceClient'

const cancelSubscriptionSafely = async (subscriptionId: string | null): Promise<void> => {
  if (!subscriptionId) return
  try {
    const stripe = useStripe()
    await stripe.subscriptions.cancel(subscriptionId)
  } catch (error) {
    captureError(error, { scope: 'user-delete:cancel-subscription', subscriptionId })
  }
}

const STORAGE_BUCKET = 'vitrroo-assets'
const LIST_PAGE_SIZE = 100
const REMOVE_CHUNK_SIZE = 100

const listAllFiles = async (admin: ServiceClient, prefix: string): Promise<string[]> => {
  const paths: string[] = []
  let offset = 0

  while (true) {
    const { data } = await admin.storage
      .from(STORAGE_BUCKET)
      .list(prefix, { limit: LIST_PAGE_SIZE, offset })

    const entries = data ?? []
    if (entries.length === 0) break

    for (const entry of entries) {
      const entryPath = `${prefix}/${entry.name}`
      if (entry.id === null) {
        paths.push(...(await listAllFiles(admin, entryPath)))
      } else {
        paths.push(entryPath)
      }
    }

    if (entries.length < LIST_PAGE_SIZE) break
    offset += LIST_PAGE_SIZE
  }

  return paths
}

const removeStorageFolder = async (admin: ServiceClient, userId: string): Promise<void> => {
  try {
    const paths = await listAllFiles(admin, userId)
    for (let i = 0; i < paths.length; i += REMOVE_CHUNK_SIZE) {
      await admin.storage.from(STORAGE_BUCKET).remove(paths.slice(i, i + REMOVE_CHUNK_SIZE))
    }
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
