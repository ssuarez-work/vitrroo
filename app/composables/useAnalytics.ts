import type { AnalyticsBucket, StoreEventPayload, StoreEventType, StoreStats, TopProduct } from '~/types'

const sinceDate = (days: number): string => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export const useAnalytics = () => {
  const supabase = useSupabaseClient()

  const track = async (
    storeId: string,
    eventType: StoreEventType,
    productId: string | null = null
  ): Promise<void> => {
    if (!storeId) return

    const payload: StoreEventPayload = {
      store_id: storeId,
      event_type: eventType,
      product_id: productId
    }

    const { error } = await supabase.from('store_events').insert(payload)
    if (error) console.error('No se pudo registrar el evento:', error.message)
  }

  const getStats = async (storeId: string, sinceDays = 30): Promise<StoreStats> => {
    const { data, error } = await supabase.rpc('get_store_stats', {
      p_store_id: storeId,
      p_since: sinceDate(sinceDays)
    })

    if (error || !data || data.length === 0) {
      return { visits: 0, whatsapp_clicks: 0 }
    }

    const row = data[0]
    if (!row) return { visits: 0, whatsapp_clicks: 0 }
    return { visits: Number(row.visits ?? 0), whatsapp_clicks: Number(row.whatsapp_clicks ?? 0) }
  }

  const getDailyBuckets = async (storeId: string, sinceDays = 30): Promise<AnalyticsBucket[]> => {
    const { data, error } = await supabase.rpc('get_store_analytics', {
      p_store_id: storeId,
      p_since: sinceDate(sinceDays)
    })

    if (error || !data) {
      if (error) console.error('Error obteniendo analytics:', error.message)
      return []
    }

    return (data as Array<{ bucket: string; visits: number; whatsapp_clicks: number }>).map((row) => ({
      bucket: row.bucket,
      visits: Number(row.visits ?? 0),
      whatsapp_clicks: Number(row.whatsapp_clicks ?? 0)
    }))
  }

  const getTopProducts = async (storeId: string, sinceDays = 30, limit = 5): Promise<TopProduct[]> => {
    const { data, error } = await supabase.rpc('get_top_products', {
      p_store_id: storeId,
      p_since: sinceDate(sinceDays),
      p_limit: limit
    })

    if (error || !data) {
      if (error) console.error('Error obteniendo top products:', error.message)
      return []
    }

    return (data as Array<{ product_id: string; product_name: string; whatsapp_clicks: number }>).map((row) => ({
      product_id: row.product_id,
      product_name: row.product_name,
      whatsapp_clicks: Number(row.whatsapp_clicks ?? 0)
    }))
  }

  return { track, getStats, getDailyBuckets, getTopProducts }
}
