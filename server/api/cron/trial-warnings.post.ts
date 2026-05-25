import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  requireCronAuth(event)

  const admin = serverSupabaseServiceRole(event)
  const { data, error } = await admin.rpc('enqueue_trial_warnings')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const [row] = (data as Array<{ queued_3d: number; queued_expired: number }> | null) ?? []
  return {
    queued_3d: Number(row?.queued_3d ?? 0),
    queued_expired: Number(row?.queued_expired ?? 0)
  }
})
