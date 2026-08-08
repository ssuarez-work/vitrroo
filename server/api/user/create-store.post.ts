import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

const SLUG_MAX_RETRIES = 5
const UNIQUE_VIOLATION_CODE = '23505'

const sanitizeSlugBase = (raw: string): string => {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

const randomSuffix = (): string => Math.random().toString(36).slice(2, 6)

const buildCandidateSlug = (base: string): string => {
  const cleanBase = base || 'tienda'
  return `${cleanBase}-${randomSuffix()}`
}

const deriveDefaults = (email: string | null) => {
  const localPart = email?.split('@')[0] ?? 'tienda'
  const niceName = localPart.charAt(0).toUpperCase() + localPart.slice(1)
  return {
    name: `Tienda de ${niceName}`,
    slugBase: sanitizeSlugBase(localPart)
  }
}

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'user-create-store', limit: 5, windowSeconds: 600 })

  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'No autenticado' })

  const admin = serverSupabaseServiceRole<Database>(event)

  const { data: existing } = await admin
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Ya tienes una tienda asociada.' })
  }

  const { name, slugBase } = deriveDefaults(user.email ?? null)

  const alreadyHasStore = async (): Promise<boolean> => {
    const { data } = await admin.from('stores').select('id').eq('user_id', user.id).maybeSingle()
    return Boolean(data)
  }

  for (let attempt = 0; attempt < SLUG_MAX_RETRIES; attempt++) {
    const slug = buildCandidateSlug(slugBase)
    const { data, error } = await admin
      .from('stores')
      .insert({ user_id: user.id, name, slug })
      .select('id, slug')
      .single()

    if (!error && data) return { id: data.id, slug: data.slug }
    if (!error) break
    if (error.code !== UNIQUE_VIOLATION_CODE) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    if (await alreadyHasStore()) {
      throw createError({ statusCode: 409, statusMessage: 'Ya tienes una tienda asociada.' })
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'No pudimos generar un enlace único.' })
})
