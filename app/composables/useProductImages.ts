import type { ProductImage } from '~/types'

export interface ImageInput {
  url: string
}

export const useProductImages = () => {
  const supabase = useSupabaseClient()
  const { removeByUrls } = useImageUpload()

  const listByProduct = async (productId: string): Promise<ProductImage[]> => {
    if (!productId) return []

    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error cargando imágenes:', error)
      return []
    }
    return (data ?? []) as ProductImage[]
  }

  const replaceAll = async (productId: string, images: ImageInput[]): Promise<boolean> => {
    const previous = await listByProduct(productId)
    const keptUrls = new Set(images.map((image) => image.url.trim()))
    const removedUrls = previous.map((image) => image.url).filter((url) => !keptUrls.has(url))

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId)

    if (deleteError) {
      console.error('Error limpiando imágenes previas:', deleteError)
      return false
    }

    const rows = images
      .map((image, index) => ({
        product_id: productId,
        url: image.url.trim(),
        sort_order: index + 1
      }))
      .filter((row) => row.url.length > 0)

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from('product_images').insert(rows)
      if (insertError) {
        console.error('Error insertando imágenes:', insertError)
        return false
      }
    }

    void removeByUrls(removedUrls)
    return true
  }

  return { listByProduct, replaceAll }
}
