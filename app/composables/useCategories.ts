import type { Category } from '~/types'

export const useCategories = () => {
  const supabase = useSupabaseClient()

  const listByStore = async (storeId: string): Promise<Category[]> => {
    if (!storeId) return []

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando categorías:', error)
      return []
    }
    return (data ?? []) as Category[]
  }

  const create = async (storeId: string, name: string): Promise<Category | null> => {
    const trimmed = name.trim()
    if (!trimmed) return null

    const { data, error } = await supabase
      .from('categories')
      .insert({ store_id: storeId, name: trimmed })
      .select()
      .single()

    if (error) {
      console.error('Error creando categoría:', error)
      return null
    }
    return data as Category
  }

  const rename = async (categoryId: string, name: string): Promise<boolean> => {
    const trimmed = name.trim()
    if (!trimmed) return false

    const { error } = await supabase
      .from('categories')
      .update({ name: trimmed })
      .eq('id', categoryId)

    return !error
  }

  const remove = async (categoryId: string): Promise<boolean> => {
    const { error } = await supabase.from('categories').delete().eq('id', categoryId)
    return !error
  }

  const reorder = async (storeId: string, orderedIds: string[]): Promise<boolean> => {
    if (orderedIds.length === 0) return true

    const { error } = await supabase.rpc('reorder_categories', {
      p_store_id: storeId,
      p_ordered_ids: orderedIds
    })

    if (error) console.error('Error reordenando categorías:', error)
    return !error
  }

  return { listByStore, create, rename, remove, reorder }
}
