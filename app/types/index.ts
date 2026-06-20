export type StorePlan = 'free' | 'pro'

export interface Store {
  id: string
  user_id: string
  slug: string
  name: string
  description: string | null
  whatsapp_number: string | null
  logo_url: string | null
  plan: StorePlan
  trial_ends_at: string | null
  pro_until: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  theme_color: string | null
  theme_id: string | null
  is_published: boolean
  created_at: string
}

export interface Category {
  id: string
  store_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  label: string
  stock_quantity: number | null
  sort_order: number
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  name: string
  price: number
  image_url: string | null
  is_active: boolean
  is_pinned: boolean
  custom_wa_message: string | null
  options: string[]
  sort_order: number
  created_at: string
  product_variants?: ProductVariant[]
  product_images?: ProductImage[]
}

export interface ProductWithVariants extends Product {
  product_variants: ProductVariant[]
}

export type StoreEventType = 'visit' | 'whatsapp_click'

export interface StoreEventPayload {
  store_id: string
  event_type: StoreEventType
  product_id?: string | null
}

export interface StoreStats {
  visits: number
  whatsapp_clicks: number
}

export interface AnalyticsBucket {
  bucket: string
  visits: number
  whatsapp_clicks: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  whatsapp_clicks: number
}

export interface ToastMessage {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

export interface ProductSelection {
  variantId: string | null
  option: string | null
}

