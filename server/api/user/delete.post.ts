import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'user-delete', limit: 3, windowSeconds: 600 })

  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const admin = serverSupabaseServiceRole(event)

  await recordAudit(event, 'account.deleted', {
    userId: user.id,
    metadata: { email: user.email ?? null }
  })

  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    captureError(error, { scope: 'user-delete', userId: user.id })
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { ok: true }
})
