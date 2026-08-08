import type { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

export type ServiceClient = ReturnType<typeof serverSupabaseServiceRole<Database>>
