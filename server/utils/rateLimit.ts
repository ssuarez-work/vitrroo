import type { H3Event } from 'h3'

interface RateLimitOptions {
  identifier: string
  limit: number
  windowSeconds: number
}

interface BucketState {
  count: number
  resetAt: number
}

const STORAGE_BASE = 'rate-limit'

const clientIdentifier = (event: H3Event): string => {
  return resolveClientIp(event) ?? 'unknown'
}

export const enforceRateLimit = async (
  event: H3Event,
  options: RateLimitOptions
): Promise<void> => {
  const storage = useStorage(STORAGE_BASE)
  const key = `${options.identifier}:${clientIdentifier(event)}`
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000

  const current = (await storage.getItem<BucketState>(key)) ?? null

  if (!current || current.resetAt <= now) {
    await storage.setItem(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (current.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000))
    setHeader(event, 'retry-after', retryAfter)
    throw createError({
      statusCode: 429,
      statusMessage: 'Demasiadas peticiones. Intenta de nuevo en un momento.'
    })
  }

  await storage.setItem(key, { count: current.count + 1, resetAt: current.resetAt })
}
