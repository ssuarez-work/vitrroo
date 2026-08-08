import type { H3Event } from 'h3'

const firstNonEmpty = (value: string | undefined): string | null => {
  const trimmed = value?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : null
}

export const resolveClientIp = (event: H3Event): string | null => {
  const cloudflare = firstNonEmpty(getHeader(event, 'cf-connecting-ip'))
  if (cloudflare) return cloudflare

  const realIp = firstNonEmpty(getHeader(event, 'x-real-ip'))
  if (realIp) return realIp

  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) {
    const hops = forwarded.split(',').map((hop) => hop.trim()).filter(Boolean)
    const nearestProxyHop = hops.at(-1)
    if (nearestProxyHop) return nearestProxyHop
  }

  return firstNonEmpty(event.node.req.socket?.remoteAddress ?? undefined)
}
