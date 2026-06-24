import type { SocialNetwork } from '~/types'
import {
  detectNetworkFromUrl,
  extractHandleFromUrl,
  handleHostNetworks
} from './useSocialNetworks'

export interface ParsedSocialInput {
  type: SocialNetwork
  value: string
}

export type NormalizationResult =
  | { ok: true, value: string }
  | { ok: false, reason: string }

const HANDLE_REGEX = /^[a-z0-9._-]{1,40}$/i
const PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/i

const stripWrappingWhitespace = (raw: string): string => raw.trim()

const stripLeadingAt = (value: string): string => value.replace(/^@+/, '')

const ensureHttps = (raw: string): string => {
  const trimmed = stripWrappingWhitespace(raw)
  if (!trimmed) return trimmed
  if (PROTOCOL_REGEX.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

const tryParseUrl = (raw: string): URL | null => {
  try {
    return new URL(ensureHttps(raw))
  } catch {
    return null
  }
}

const isLikelyUrl = (raw: string): boolean => {
  const trimmed = stripWrappingWhitespace(raw).toLowerCase()
  if (!trimmed || trimmed.startsWith('@')) return false
  if (PROTOCOL_REGEX.test(trimmed)) return true
  return trimmed.includes('/')
}

export const detectNetworkFromInput = (raw: string): SocialNetwork | null => {
  const trimmed = stripWrappingWhitespace(raw)
  if (!trimmed) return null

  if (isLikelyUrl(trimmed)) {
    const url = tryParseUrl(trimmed)
    if (url) {
      const detected = detectNetworkFromUrl(url)
      if (detected) return detected
      return 'website'
    }
  }

  return null
}

export const normalizeHandleInput = (raw: string): NormalizationResult => {
  const trimmed = stripWrappingWhitespace(raw)
  if (!trimmed) return { ok: false, reason: 'empty' }

  if (isLikelyUrl(trimmed)) {
    const url = tryParseUrl(trimmed)
    if (!url) return { ok: false, reason: 'invalid_url' }
    for (const network of handleHostNetworks()) {
      if (network.hostPatterns.includes(url.hostname.toLowerCase())) {
        const handle = extractHandleFromUrl(network.key, url)
        if (!handle) return { ok: false, reason: 'no_handle_in_url' }
        return validateHandle(handle)
      }
    }
    return { ok: false, reason: 'unknown_host' }
  }

  return validateHandle(stripLeadingAt(trimmed))
}

const validateHandle = (handle: string): NormalizationResult => {
  if (!handle) return { ok: false, reason: 'empty' }
  if (!HANDLE_REGEX.test(handle)) return { ok: false, reason: 'invalid_chars' }
  return { ok: true, value: handle }
}

export const normalizeUrlInput = (raw: string, requireKnownHosts: string[] = []): NormalizationResult => {
  const trimmed = stripWrappingWhitespace(raw)
  if (!trimmed) return { ok: false, reason: 'empty' }

  const url = tryParseUrl(trimmed)
  if (!url) return { ok: false, reason: 'invalid_url' }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return { ok: false, reason: 'invalid_protocol' }

  if (requireKnownHosts.length > 0) {
    const host = url.hostname.toLowerCase()
    if (!requireKnownHosts.includes(host)) return { ok: false, reason: 'host_not_allowed' }
  }

  const normalized = `${url.origin}${url.pathname.replace(/\/$/, '')}${url.search}`
  return { ok: true, value: normalized }
}

export const useSocialLinkParser = () => {
  return {
    detectNetworkFromInput,
    normalizeHandleInput,
    normalizeUrlInput
  }
}
