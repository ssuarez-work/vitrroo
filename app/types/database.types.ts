export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Timestamp = string

type StoreRow = {
  id: string
  user_id: string
  slug: string
  name: string
  description: string | null
  whatsapp_number: string | null
  logo_url: string | null
  plan: 'free' | 'pro'
  trial_ends_at: Timestamp | null
  pro_until: Timestamp | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  theme_color: string | null
  theme_id: string | null
  referral_code: string | null
  is_published: boolean
  social_links: Json
  welcome_email_sent_at: Timestamp | null
  trial_warning_sent_at: Timestamp | null
  trial_expired_email_sent_at: Timestamp | null
  created_at: Timestamp
}

type StoreInsert = {
  id?: string
  user_id: string
  slug: string
  name: string
  description?: string | null
  whatsapp_number?: string | null
  logo_url?: string | null
  plan?: 'free' | 'pro'
  trial_ends_at?: Timestamp | null
  pro_until?: Timestamp | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  theme_color?: string | null
  theme_id?: string | null
  referral_code?: string | null
  is_published?: boolean
  social_links?: Json
  welcome_email_sent_at?: Timestamp | null
  trial_warning_sent_at?: Timestamp | null
  trial_expired_email_sent_at?: Timestamp | null
  created_at?: Timestamp
}

type ProductRow = {
  id: string
  store_id: string
  category_id: string | null
  name: string
  price: number
  image_url: string | null
  is_active: boolean
  is_pinned: boolean
  custom_wa_message: string | null
  options: Json
  sort_order: number
  created_at: Timestamp
}

type ProductInsert = {
  id?: string
  store_id: string
  category_id?: string | null
  name: string
  price?: number
  image_url?: string | null
  is_active?: boolean
  is_pinned?: boolean
  custom_wa_message?: string | null
  options?: Json
  sort_order?: number
  created_at?: Timestamp
}

type CategoryRow = {
  id: string
  store_id: string
  name: string
  sort_order: number
  created_at: Timestamp
}

type CategoryInsert = {
  id?: string
  store_id: string
  name: string
  sort_order?: number
  created_at?: Timestamp
}

type VariantRow = {
  id: string
  product_id: string
  label: string
  stock_quantity: number | null
  sort_order: number
  created_at: Timestamp
}

type VariantInsertRow = {
  id?: string
  product_id: string
  label: string
  stock_quantity?: number | null
  sort_order?: number
  created_at?: Timestamp
}

type ProductImageRow = {
  id: string
  product_id: string
  url: string
  sort_order: number
  created_at: Timestamp
}

type ProductImageInsert = {
  id?: string
  product_id: string
  url: string
  sort_order?: number
  created_at?: Timestamp
}

type StoreEventRow = {
  id: number
  store_id: string
  product_id: string | null
  event_type: 'visit' | 'whatsapp_click'
  created_at: Timestamp
}

type StoreEventInsert = {
  id?: number
  store_id: string
  product_id?: string | null
  event_type: 'visit' | 'whatsapp_click'
  created_at?: Timestamp
}

type EmailQueueStatus = 'pending' | 'processing' | 'sent' | 'failed'

type EmailQueueRow = {
  id: number
  store_id: string
  kind: string
  payload: Json
  status: EmailQueueStatus
  sent_at: Timestamp | null
  error_message: string | null
  retry_count: number
  next_retry_at: Timestamp | null
  claimed_at: Timestamp | null
  created_at: Timestamp
}

type EmailQueueInsert = {
  id?: number
  store_id: string
  kind: string
  payload?: Json
  status?: EmailQueueStatus
  sent_at?: Timestamp | null
  error_message?: string | null
  retry_count?: number
  next_retry_at?: Timestamp | null
  claimed_at?: Timestamp | null
  created_at?: Timestamp
}

type StripeEventRow = {
  id: string
  type: string
  received_at: Timestamp
}

type StripeEventInsert = {
  id: string
  type: string
  received_at?: Timestamp
}

type ReferralRow = {
  id: string
  referrer_store_id: string
  referred_store_id: string
  code: string
  rewarded_at: Timestamp | null
  created_at: Timestamp
}

type ReferralInsert = {
  id?: string
  referrer_store_id: string
  referred_store_id: string
  code: string
  rewarded_at?: Timestamp | null
  created_at?: Timestamp
}

type AuditLogRow = {
  id: number
  user_id: string | null
  store_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  metadata: Json
  ip_address: string | null
  user_agent: string | null
  created_at: Timestamp
}

type AuditLogInsert = {
  id?: number
  user_id?: string | null
  store_id?: string | null
  action: string
  target_type?: string | null
  target_id?: string | null
  metadata?: Json
  ip_address?: string | null
  user_agent?: string | null
  created_at?: Timestamp
}

type Table<Row, Insert> = {
  Row: Row
  Insert: Insert
  Update: Partial<Insert>
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      stores: Table<StoreRow, StoreInsert>
      products: Table<ProductRow, ProductInsert>
      categories: Table<CategoryRow, CategoryInsert>
      product_variants: Table<VariantRow, VariantInsertRow>
      product_images: Table<ProductImageRow, ProductImageInsert>
      store_events: Table<StoreEventRow, StoreEventInsert>
      email_queue: Table<EmailQueueRow, EmailQueueInsert>
      referrals: Table<ReferralRow, ReferralInsert>
      audit_logs: Table<AuditLogRow, AuditLogInsert>
      stripe_events: Table<StripeEventRow, StripeEventInsert>
    }
    Views: Record<string, never>
    Functions: {
      get_store_stats: {
        Args: { p_store_id: string, p_since?: Timestamp }
        Returns: { visits: number, whatsapp_clicks: number }[]
      }
      get_store_analytics: {
        Args: { p_store_id: string, p_since?: Timestamp }
        Returns: { bucket: string, visits: number, whatsapp_clicks: number }[]
      }
      get_top_products: {
        Args: { p_store_id: string, p_since?: Timestamp, p_limit?: number }
        Returns: { product_id: string, product_name: string, whatsapp_clicks: number }[]
      }
      get_weekly_summary: {
        Args: { p_store_id: string }
        Returns: { visits: number, whatsapp_clicks: number, top_product: string | null }[]
      }
      reorder_products: {
        Args: { p_store_id: string, p_ordered_ids: string[] }
        Returns: null
      }
      reorder_categories: {
        Args: { p_store_id: string, p_ordered_ids: string[] }
        Returns: null
      }
      redeem_referral: {
        Args: { p_code: string, p_referred_store_id: string }
        Returns: boolean
      }
      is_store_pro: {
        Args: { p_store_id: string }
        Returns: boolean
      }
      cleanup_after_downgrade: {
        Args: { p_store_id: string }
        Returns: null
      }
      enqueue_trial_warnings: {
        Args: Record<string, never>
        Returns: { queued_3d: number, queued_expired: number }[]
      }
      decrement_variant_stock: {
        Args: { p_variant_id: string }
        Returns: number | null
      }
      claim_email_jobs: {
        Args: { p_limit: number, p_stale_minutes?: number }
        Returns: { id: number, store_id: string, kind: string, payload: Json, retry_count: number }[]
      }
      purge_old_events: {
        Args: { p_days_to_keep?: number }
        Returns: number
      }
      purge_old_audit_logs: {
        Args: { p_days_to_keep?: number }
        Returns: number
      }
      purge_old_email_jobs: {
        Args: { p_days_to_keep?: number }
        Returns: number
      }
    }
    Enums: {
      store_plan: 'free' | 'pro'
      store_event_type: 'visit' | 'whatsapp_click'
    }
    CompositeTypes: Record<string, never>
  }
}
