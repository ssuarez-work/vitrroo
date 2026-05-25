import type { H3Event } from 'h3'
import { timingSafeEqual } from 'node:crypto'

const safeEqual = (a: string, b: string): boolean => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  if (bufferA.length !== bufferB.length) return false
  return timingSafeEqual(bufferA, bufferB)
}

export const requireCronAuth = (event: H3Event): void => {
  const config = useRuntimeConfig()
  if (!config.cronSecret) {
    throw createError({ statusCode: 500, statusMessage: 'CRON_SECRET no configurado' })
  }

  const header = getHeader(event, 'authorization') ?? ''
  const expected = `Bearer ${config.cronSecret}`
  if (!safeEqual(header, expected)) {
    throw createError({ statusCode: 401, statusMessage: 'No autorizado' })
  }
}
