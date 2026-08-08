import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Json } from '~/types/database.types'

export type AuditAction =
  | 'account.deleted'
  | 'account.email_changed'
  | 'account.mfa_enabled'
  | 'account.mfa_disabled'
  | 'billing.checkout_started'
  | 'billing.subscription_created'
  | 'billing.subscription_updated'
  | 'billing.subscription_cancelled'
  | 'billing.downgrade_cleanup'
  | 'store.published'
  | 'store.unpublished'

interface AuditOptions {
  userId?: string | null
  storeId?: string | null
  targetType?: string
  targetId?: string
  metadata?: Record<string, Json>
}

const logger = createLogger('audit')

export const recordAudit = async (
  event: H3Event,
  action: AuditAction,
  options: AuditOptions = {}
): Promise<void> => {
  try {
    const admin = serverSupabaseServiceRole(event)
    await admin.from('audit_logs').insert({
      user_id: options.userId ?? null,
      store_id: options.storeId ?? null,
      action,
      target_type: options.targetType ?? null,
      target_id: options.targetId ?? null,
      metadata: options.metadata ?? {},
      ip_address: resolveClientIp(event),
      user_agent: getHeader(event, 'user-agent') ?? null
    })
  } catch (error) {
    logger.error(`failed to record ${action}`, {
      error: error instanceof Error ? error.message : String(error)
    })
  }
}
