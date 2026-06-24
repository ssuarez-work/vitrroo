import { describe, expect, it } from 'vitest'
import {
  detectNetworkFromInput,
  normalizeHandleInput,
  normalizeUrlInput
} from '../app/composables/useSocialLinkParser'

describe('detectNetworkFromInput', () => {
  it('returns null for empty input', () => {
    expect(detectNetworkFromInput('')).toBeNull()
    expect(detectNetworkFromInput('   ')).toBeNull()
  })

  it('returns null for a bare handle starting with @', () => {
    expect(detectNetworkFromInput('@kuki.apparel')).toBeNull()
  })

  it('detects instagram from full URL', () => {
    expect(detectNetworkFromInput('https://instagram.com/foo')).toBe('instagram')
    expect(detectNetworkFromInput('https://www.instagram.com/foo')).toBe('instagram')
    expect(detectNetworkFromInput('instagram.com/foo')).toBe('instagram')
  })

  it('detects tiktok across subdomains', () => {
    expect(detectNetworkFromInput('https://tiktok.com/@bar')).toBe('tiktok')
    expect(detectNetworkFromInput('https://vm.tiktok.com/abc123')).toBe('tiktok')
  })

  it('detects facebook', () => {
    expect(detectNetworkFromInput('https://facebook.com/MiPagina')).toBe('facebook')
    expect(detectNetworkFromInput('https://m.facebook.com/MiPagina')).toBe('facebook')
  })

  it('detects twitter and x.com equivalently', () => {
    expect(detectNetworkFromInput('https://twitter.com/elon')).toBe('twitter')
    expect(detectNetworkFromInput('https://x.com/elon')).toBe('twitter')
  })

  it('falls back to website for any other valid URL', () => {
    expect(detectNetworkFromInput('https://midominio.com.mx')).toBe('website')
    expect(detectNetworkFromInput('midominio.com.mx/about')).toBe('website')
  })

  it('returns null for a bare token without slash to avoid handle-vs-domain ambiguity', () => {
    expect(detectNetworkFromInput('kuki.apparel')).toBeNull()
  })
})

describe('normalizeHandleInput', () => {
  it('strips leading @ from bare handle', () => {
    expect(normalizeHandleInput('@kuki.apparel')).toEqual({ ok: true, value: 'kuki.apparel' })
  })

  it('accepts bare handle without @', () => {
    expect(normalizeHandleInput('kuki.apparel')).toEqual({ ok: true, value: 'kuki.apparel' })
  })

  it('extracts handle from Instagram URL stripping tracking params', () => {
    const result = normalizeHandleInput('https://www.instagram.com/foo.bar/?utm_source=igshid')
    expect(result).toEqual({ ok: true, value: 'foo.bar' })
  })

  it('extracts handle from TikTok URL with @ prefix', () => {
    const result = normalizeHandleInput('https://www.tiktok.com/@dona.mati')
    expect(result).toEqual({ ok: true, value: 'dona.mati' })
  })

  it('extracts handle from X URL', () => {
    const result = normalizeHandleInput('https://x.com/elonmusk')
    expect(result).toEqual({ ok: true, value: 'elonmusk' })
  })

  it('rejects URL of unknown host', () => {
    const result = normalizeHandleInput('https://random-site.com/foo')
    expect(result.ok).toBe(false)
  })

  it('rejects invalid characters', () => {
    expect(normalizeHandleInput('foo bar').ok).toBe(false)
    expect(normalizeHandleInput('foo/bar').ok).toBe(false)
  })

  it('rejects empty after trimming @', () => {
    expect(normalizeHandleInput('@').ok).toBe(false)
  })
})

describe('normalizeUrlInput', () => {
  it('accepts well-formed https URL and removes trailing slash', () => {
    expect(normalizeUrlInput('https://example.com/')).toEqual({ ok: true, value: 'https://example.com' })
  })

  it('accepts host without protocol and adds https', () => {
    expect(normalizeUrlInput('example.com/path')).toEqual({ ok: true, value: 'https://example.com/path' })
  })

  it('preserves query strings', () => {
    const result = normalizeUrlInput('https://example.com/path?a=1&b=2')
    expect(result).toEqual({ ok: true, value: 'https://example.com/path?a=1&b=2' })
  })

  it('rejects javascript: protocol', () => {
    const result = normalizeUrlInput('javascript:alert(1)')
    expect(result.ok).toBe(false)
  })

  it('rejects empty', () => {
    expect(normalizeUrlInput('').ok).toBe(false)
  })

  it('limits to allowed hosts when provided', () => {
    expect(normalizeUrlInput('https://facebook.com/foo', ['facebook.com']).ok).toBe(true)
    expect(normalizeUrlInput('https://other.com/foo', ['facebook.com']).ok).toBe(false)
  })
})
