import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'
import type { Database } from '~/types/database.types'

type StoreUpdate = Database['public']['Tables']['stores']['Update']

interface MinimalStore {
  id: string
  user_id: string
  name: string
  slug: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'free' | 'pro'
  pro_until: string | null
}

export const requireUser = async (event: H3Event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'No autenticado' })
  }
  return user
}

export const getStoreByUserId = async (event: H3Event, userId: string): Promise<MinimalStore> => {
  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('stores')
    .select('id, user_id, name, slug, stripe_customer_id, stripe_subscription_id, plan, pro_until')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Tienda no encontrada' })
  }
  return data as MinimalStore
}

export const updateStoreById = async (
  event: H3Event,
  storeId: string,
  patch: StoreUpdate
): Promise<void> => {
  const client = serverSupabaseServiceRole<Database>(event)
  const { error } = await client.from('stores').update(patch).eq('id', storeId)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
}

export const findStoreByCustomerId = async (
  event: H3Event,
  customerId: string
): Promise<MinimalStore | null> => {
  const client = serverSupabaseServiceRole(event)
  const { data } = await client
    .from('stores')
    .select('id, user_id, name, slug, stripe_customer_id, stripe_subscription_id, plan, pro_until')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()
  return (data as MinimalStore | null) ?? null
}

export const runDowngradeCleanup = async (event: H3Event, storeId: string): Promise<void> => {
  const client = serverSupabaseServiceRole(event)
  const { error } = await client.rpc('cleanup_after_downgrade', { p_store_id: storeId })
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
}

const UNIQUE_VIOLATION_CODE = '23505'

export const claimStripeEvent = async (
  event: H3Event,
  stripeEventId: string,
  stripeEventType: string
): Promise<boolean> => {
  const client = serverSupabaseServiceRole<Database>(event)
  const { error } = await client
    .from('stripe_events')
    .insert({ id: stripeEventId, type: stripeEventType })

  if (!error) return true
  if (error.code === UNIQUE_VIOLATION_CODE) return false
  throw createError({ statusCode: 500, statusMessage: error.message })
}
