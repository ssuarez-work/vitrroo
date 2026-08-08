import type { Product, Store } from '~/types'
import { PRODUCT_SELECT } from '~/utils/product'

export const useSupabaseStore = () => {
  const supabase = useSupabaseClient()

  const getMyStore = async (): Promise<Store | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Error obteniendo la tienda:', error)
      return null
    }

    return data as Store | null
  }

  const getMyProducts = async (storeId: string): Promise<Product[]> => {
    if (!storeId) return []

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo productos:', error)
      return []
    }
    return (data ?? []) as unknown as Product[]
  }

  const reorderProducts = async (storeId: string, orderedIds: string[]): Promise<boolean> => {
    if (orderedIds.length === 0) return true

    const { error } = await supabase.rpc('reorder_products', {
      p_store_id: storeId,
      p_ordered_ids: orderedIds
    })

    if (error) console.error('Error reordenando productos:', error)
    return !error
  }

  const isSlugAvailable = async (slug: string, excludeStoreId: string | null = null): Promise<boolean> => {
    if (!slug) return false

    let query = supabase.from('stores').select('id').eq('slug', slug).limit(1)
    if (excludeStoreId) query = query.neq('id', excludeStoreId)

    const { data, error } = await query
    if (error) {
      console.error('Error verificando slug:', error)
      return false
    }
    return (data ?? []).length === 0
  }

  return { getMyStore, getMyProducts, reorderProducts, isSlugAvailable }
}
