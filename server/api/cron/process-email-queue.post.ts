import { serverSupabaseServiceRole } from '#supabase/server'

interface QueueRow {
  id: number
  store_id: string
  kind: string
  payload: Record<string, unknown>
  retry_count: number
}

interface StoreRow {
  id: string
  name: string
  slug: string
  user_id: string
}

const BATCH_SIZE = 25
const MAX_RETRIES = 5

const logger = createLogger('cron-email')

const buildStoreUrl = (slug: string): string => {
  const config = useRuntimeConfig()
  return `${config.public.appUrl}/${slug}`
}

const buildAdminUrl = (): string => {
  const config = useRuntimeConfig()
  return `${config.public.appUrl}/admin`
}

const buildBillingUrl = (): string => {
  const config = useRuntimeConfig()
  return `${config.public.appUrl}/admin/billing`
}

const renderEmail = (kind: string, store: StoreRow, payload: Record<string, unknown>) => {
  if (kind === 'weekly_summary') {
    return renderWeeklySummaryEmail({
      storeName: store.name,
      visits: Number(payload.visits ?? 0),
      whatsappClicks: Number(payload.whatsapp_clicks ?? 0),
      topProduct: (payload.top_product as string | null) ?? null,
      storeUrl: buildStoreUrl(store.slug)
    })
  }
  if (kind === 'first_click_of_month') {
    return renderFirstClickEmail({ storeName: store.name, storeUrl: buildStoreUrl(store.slug) })
  }
  if (kind === 'welcome') {
    return renderWelcomeEmail({
      storeName: store.name,
      storeUrl: buildStoreUrl(store.slug),
      adminUrl: buildAdminUrl()
    })
  }
  if (kind === 'trial_ending_soon') {
    return renderTrialEndingSoonEmail({
      storeName: store.name,
      trialEndsAt: String(payload.trial_ends_at ?? new Date().toISOString()),
      billingUrl: buildBillingUrl()
    })
  }
  if (kind === 'trial_expired') {
    return renderTrialExpiredEmail({ storeName: store.name, billingUrl: buildBillingUrl() })
  }
  return null
}

const nextRetryAt = (retryCount: number): string => {
  const minutes = Math.pow(2, retryCount) * 5
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export default defineEventHandler(async (event) => {
  requireCronAuth(event)

  const admin = serverSupabaseServiceRole(event)
  const nowIso = new Date().toISOString()

  const { data: queue, error } = await admin
    .from('email_queue')
    .select('id, store_id, kind, payload, retry_count')
    .eq('status', 'pending')
    .or(`next_retry_at.is.null,next_retry_at.lte.${nowIso}`)
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  let processed = 0
  let failed = 0
  let retried = 0

  for (const job of (queue ?? []) as QueueRow[]) {
    const { data: store } = await admin
      .from('stores')
      .select('id, name, slug, user_id')
      .eq('id', job.store_id)
      .maybeSingle()

    if (!store) {
      await admin.from('email_queue').update({ status: 'failed', error_message: 'store_not_found' }).eq('id', job.id)
      failed++
      continue
    }

    const typedStore = store as StoreRow
    const { data: authUser } = await admin.auth.admin.getUserById(typedStore.user_id)
    const email = authUser?.user?.email
    if (!email) {
      await admin.from('email_queue').update({ status: 'failed', error_message: 'missing_email' }).eq('id', job.id)
      failed++
      continue
    }

    const message = renderEmail(job.kind, typedStore, job.payload)
    if (!message) {
      await admin.from('email_queue').update({ status: 'failed', error_message: 'unknown_kind' }).eq('id', job.id)
      failed++
      continue
    }

    const result = await sendEmail({ to: email, subject: message.subject, html: message.html })

    if (result.ok) {
      await admin
        .from('email_queue')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', job.id)
      processed++
      continue
    }

    const nextRetry = job.retry_count + 1
    if (nextRetry >= MAX_RETRIES) {
      logger.error(`email permanently failed after ${MAX_RETRIES} retries`, {
        jobId: job.id,
        kind: job.kind,
        error: result.error
      })
      await admin
        .from('email_queue')
        .update({ status: 'failed', error_message: result.error, retry_count: nextRetry })
        .eq('id', job.id)
      failed++
    } else {
      await admin
        .from('email_queue')
        .update({
          retry_count: nextRetry,
          next_retry_at: nextRetryAt(nextRetry),
          error_message: result.error
        })
        .eq('id', job.id)
      retried++
    }
  }

  return { processed, failed, retried }
})
