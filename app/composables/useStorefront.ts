import type { Category, Product, ProductSelection, Store } from '~/types'

interface StorefrontData {
  store: Store
  products: Product[]
  categories: Category[]
}

const PRODUCT_SELECT = '*, product_variants(*), product_images(*)'

export const useStorefront = () => {
  const supabase = useSupabaseClient()

  const loadBySlug = async (slug: string): Promise<StorefrontData | null> => {
    if (!slug) return null

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (storeError || !store) return null

    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('store_id', store.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('store_id', store.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })
    ])

    return {
      store: store as unknown as Store,
      products: (productsResult.data ?? []) as unknown as Product[],
      categories: (categoriesResult.data ?? []) as unknown as Category[]
    }
  }

  const renderMessageTemplate = (
    template: string,
    product: Product,
    variantLabel: string | null,
    optionLabel: string | null
  ): string => {
    const optionText = variantLabel ?? optionLabel ?? ''
    return template
      .replace(/\{producto\}/gi, product.name)
      .replace(/\{precio\}/gi, (product.price / 100).toFixed(2))
      .replace(/\{opcion\}/gi, optionText)
      .replace(/\{variante\}/gi, optionText)
      .trim()
  }

  const buildDefaultMessage = (
    product: Product,
    variantLabel: string | null,
    optionLabel: string | null
  ): string => {
    const lines = [`¡Hola! Me interesa: *${product.name}*`]
    const option = variantLabel ?? optionLabel
    if (option) lines.push(`Opción: ${option}`)
    return lines.join('\n')
  }

  const buildWhatsAppUrl = (
    store: Store,
    product: Product,
    selection: ProductSelection
  ): string | null => {
    if (!store.whatsapp_number) return null

    const variant = product.product_variants?.find((v) => v.id === selection.variantId) ?? null
    const message = product.custom_wa_message?.trim()
      ? renderMessageTemplate(product.custom_wa_message, product, variant?.label ?? null, selection.option)
      : buildDefaultMessage(product, variant?.label ?? null, selection.option)

    const phone = store.whatsapp_number.replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  return { loadBySlug, buildWhatsAppUrl }
}
