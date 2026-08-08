import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'
import type { ServiceClient } from '~~/server/utils/serviceClient'

interface StoreRow {
  id: string
  name: string
  slug: string
}

interface SummaryRow {
  visits: number
  whatsapp_clicks: number
  top_product: string | null
}

const PAGE_SIZE = 500
const DEDUP_WINDOW_DAYS = 6

const loadRecentlyQueuedStoreIds = async (admin: ServiceClient): Promise<Set<string>> => {
  const sinceIso = new Date(Date.now() - DEDUP_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await admin
    .from('email_queue')
    .select('store_id')
    .eq('kind', 'weekly_summary')
    .gte('created_at', sinceIso)
  return new Set((data ?? []).map((row) => (row as { store_id: string }).store_id))
}

export default defineEventHandler(async (event) => {
  requireCronAuth(event)

  const admin = serverSupabaseServiceRole<Database>(event)
  const alreadyQueued = await loadRecentlyQueuedStoreIds(admin)

  let queued = 0
  let offset = 0

  while (true) {
    const { data: stores, error } = await admin
      .from('stores')
      .select('id, name, slug')
      .order('created_at', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const page = (stores ?? []) as StoreRow[]
    if (page.length === 0) break

    for (const store of page) {
      if (alreadyQueued.has(store.id)) continue

      const { data: summary, error: summaryError } = await admin.rpc('get_weekly_summary', { p_store_id: store.id })
      if (summaryError || !summary || summary.length === 0) continue

      const row = (summary as SummaryRow[])[0]
      if (!row) continue
      const visits = Number(row.visits ?? 0)
      const clicks = Number(row.whatsapp_clicks ?? 0)
      if (visits === 0 && clicks === 0) continue

      await admin.from('email_queue').insert({
        store_id: store.id,
        kind: 'weekly_summary',
        payload: {
          store_name: store.name,
          store_slug: store.slug,
          visits,
          whatsapp_clicks: clicks,
          top_product: row.top_product
        }
      })
      alreadyQueued.add(store.id)
      queued++
    }

    if (page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return { queued }
})
