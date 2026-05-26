import { z } from 'zod'

const bodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  await enforceRateLimit(event, { identifier: 'auth-login', limit: 10, windowSeconds: 600 })
  const body = await readValidatedBody(event, bodySchema.parse)
  return { ok: true, email: body.email }
})
