import { describe, expect, it } from 'vitest'
import { STORE_THEMES, findThemeById, buildGoogleFontsUrl } from '../app/themes'

describe('findThemeById', () => {
  it('returns the default theme when id is null', () => {
    const result = findThemeById(null)
    expect(result.id).toBe('soft')
  })

  it('returns the default theme when id is undefined', () => {
    const result = findThemeById(undefined)
    expect(result.id).toBe('soft')
  })

  it('returns the default theme when id does not exist', () => {
    const result = findThemeById('nonexistent-theme')
    expect(result.id).toBe('soft')
  })

  it('returns the matching theme when id exists', () => {
    const result = findThemeById('luxury')
    expect(result.id).toBe('luxury')
    expect(result.brandColor).toBe('#92400e')
  })

  it('always returns a defined theme object', () => {
    for (const candidateId of ['', '   ', 'invalid', 'soft', 'luxury']) {
      expect(findThemeById(candidateId)).toBeDefined()
    }
  })
})

describe('buildGoogleFontsUrl', () => {
  it('builds a valid Google Fonts URL with display=swap', () => {
    const url = buildGoogleFontsUrl(['jakarta'])
    expect(url).toContain('https://fonts.googleapis.com/css2?')
    expect(url).toContain('display=swap')
  })

  it('deduplicates font params', () => {
    const url = buildGoogleFontsUrl(['inter', 'inter-black'])
    const familyMatches = url.match(/family=Inter/g) ?? []
    expect(familyMatches.length).toBe(2)
  })

  it('handles a single theme key', () => {
    const url = buildGoogleFontsUrl(['playfair'])
    expect(url).toContain('Playfair+Display')
  })
})

describe('STORE_THEMES catalog', () => {
  it('exposes at least 10 themes', () => {
    expect(STORE_THEMES.length).toBeGreaterThanOrEqual(10)
  })

  it('each theme has a unique id', () => {
    const ids = STORE_THEMES.map((theme) => theme.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each theme defines required visual tokens', () => {
    for (const theme of STORE_THEMES) {
      expect(theme.brandColor).toMatch(/^#[0-9a-f]{6}$/i)
      expect(theme.background).toMatch(/^#[0-9a-f]{6}$/i)
      expect(theme.surface).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })
})
