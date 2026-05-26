import type { Product, Store } from '~/types'

const PRODUCT_SELECT = '*, product_variants(*), product_images(*)'

export const useSupabaseStore = () => {
  const supabase = useSupabaseClient()
  const { withRandomSuffix } = useSlug()

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

    if (data) return data as Store

    return createDefaultStore(user.id, user.email ?? null)
  }

  const createDefaultStore = async (userId: string, email: string | null): Promise<Store | null> => {
    const seed = email?.split('@')[0] ?? 'tienda'
    const { data, error } = await supabase
      .from('stores')
      .insert({ user_id: userId, name: 'Mi Tienda', slug: withRandomSuffix(seed) })
      .select()
      .single()

    if (error) {
      console.error('Error auto-creando la tienda:', error)
      return null
    }
    return data as Store
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
