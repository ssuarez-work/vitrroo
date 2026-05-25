import { serverSupabaseServiceRole } from '#supabase/server'

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

export default defineEventHandler(async (event) => {
  requireCronAuth(event)

  const admin = serverSupabaseServiceRole(event)

  const { data: stores, error } = await admin
    .from('stores')
    .select('id, name, slug')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  let queued = 0
  for (const store of (stores ?? []) as StoreRow[]) {
    const { data: summary, error: summaryError } = await admin.rpc('get_weekly_summary', { p_store_id: store.id })
    if (summaryError || !summary || summary.length === 0) continue

    const [row] = summary as SummaryRow[]
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
    queued++
  }

  return { queued }
})
