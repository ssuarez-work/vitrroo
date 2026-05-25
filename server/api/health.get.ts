import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()

  try {
    const admin = serverSupabaseServiceRole(event)
    const { error } = await admin.from('stores').select('id').limit(1)
    if (error) throw error

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'reachable',
      uptime_ms: Date.now() - startedAt
    }
  } catch (error) {
    setResponseStatus(event, 503)
    const message = error instanceof Error ? error.message : 'unknown'
    return {
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: 'unreachable',
      error: message
    }
  }
})
