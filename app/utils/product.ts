import type { Product, ProductImage } from '~/types'

export const PRODUCT_SELECT = '*, product_variants(*), product_images(*)'

type WithImages = Pick<Product, 'product_images'>
type WithCover = Pick<Product, 'product_images' | 'image_url'>

export const sortedProductImages = (product: WithImages): ProductImage[] => {
  return [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
}

export const coverImageOf = (product: WithCover): string | null => {
  return sortedProductImages(product)[0]?.url ?? product.image_url ?? null
}
