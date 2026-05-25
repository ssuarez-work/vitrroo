import type { ProductVariant } from '~/types'

export interface VariantInput {
  label: string
  stock_quantity: number | null
}

export const useProductVariants = () => {
  const supabase = useSupabaseClient()

  const listByProduct = async (productId: string): Promise<ProductVariant[]> => {
    if (!productId) return []

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando variantes:', error)
      return []
    }
    return (data ?? []) as ProductVariant[]
  }

  const replaceAll = async (productId: string, variants: VariantInput[]): Promise<boolean> => {
    const { error: deleteError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', productId)

    if (deleteError) {
      console.error('Error limpiando variantes previas:', deleteError)
      return false
    }

    if (variants.length === 0) return true

    const rows = variants
      .map((v, index) => ({
        product_id: productId,
        label: v.label.trim(),
        stock_quantity: v.stock_quantity,
        sort_order: index + 1
      }))
      .filter((row) => row.label.length > 0)

    if (rows.length === 0) return true

    const { error: insertError } = await supabase.from('product_variants').insert(rows)
    if (insertError) console.error('Error insertando variantes:', insertError)
    return !insertError
  }

  const decrementStock = async (variantId: string): Promise<void> => {
    if (!variantId) return
    const { data } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('id', variantId)
      .maybeSingle()

    const current = data?.stock_quantity
    if (current === null || current === undefined || current <= 0) return

    await supabase
      .from('product_variants')
      .update({ stock_quantity: current - 1 })
      .eq('id', variantId)
  }

  return { listByProduct, replaceAll, decrementStock }
}
