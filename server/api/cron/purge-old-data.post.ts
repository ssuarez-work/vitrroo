import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

const EVENT_RETENTION_DAYS = 90
const AUDIT_RETENTION_DAYS = 730
const EMAIL_JOB_RETENTION_DAYS = 30

export default defineEventHandler(async (event) => {
  requireCronAuth(event)

  const admin = serverSupabaseServiceRole<Database>(event)

  const [events, audits, emails] = await Promise.all([
    admin.rpc('purge_old_events', { p_days_to_keep: EVENT_RETENTION_DAYS }),
    admin.rpc('purge_old_audit_logs', { p_days_to_keep: AUDIT_RETENTION_DAYS }),
    admin.rpc('purge_old_email_jobs', { p_days_to_keep: EMAIL_JOB_RETENTION_DAYS })
  ])

  const failure = events.error ?? audits.error ?? emails.error
  if (failure) {
    throw createError({ statusCode: 500, statusMessage: failure.message })
  }

  return {
    events_deleted: Number(events.data ?? 0),
    audit_logs_deleted: Number(audits.data ?? 0),
    email_jobs_deleted: Number(emails.data ?? 0)
  }
})
