import { describe, expect, it } from 'vitest'
import {
  STORE_THEMES,
  FREE_THEMES,
  PRO_THEMES,
  THEMES_FREE_FIRST,
  DEFAULT_THEME_ID,
  findThemeById,
  buildGoogleFontsUrl,
  isThemeFree,
  resolveAllowedThemeId
} from '../app/themes'

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

describe('theme tiers', () => {
  it('marks exactly three themes as free', () => {
    expect(FREE_THEMES.map((theme) => theme.id).sort()).toEqual(['bazaar', 'bubble', 'soft'])
  })

  it('splits every theme into exactly one tier', () => {
    expect(FREE_THEMES.length + PRO_THEMES.length).toBe(STORE_THEMES.length)
  })

  it('keeps the default theme free so every store can render it', () => {
    expect(isThemeFree(DEFAULT_THEME_ID)).toBe(true)
  })

  it('gives every theme a tier', () => {
    for (const theme of STORE_THEMES) {
      expect(['free', 'pro']).toContain(theme.tier)
    }
  })

  it('treats an unknown id as free because it falls back to the default', () => {
    expect(isThemeFree('nonexistent-theme')).toBe(true)
  })
})

describe('resolveAllowedThemeId', () => {
  it('keeps a free theme on the free plan', () => {
    expect(resolveAllowedThemeId('bazaar', false)).toBe('bazaar')
  })

  it('drops a pro theme on the free plan', () => {
    expect(resolveAllowedThemeId('luxury', false)).toBeNull()
  })

  it('keeps a pro theme when pro themes are allowed', () => {
    expect(resolveAllowedThemeId('luxury', true)).toBe('luxury')
  })

  it('returns null when no theme is selected', () => {
    expect(resolveAllowedThemeId(null, true)).toBeNull()
    expect(resolveAllowedThemeId(undefined, false)).toBeNull()
  })
})

describe('THEMES_FREE_FIRST', () => {
  it('lists every free theme before any pro theme', () => {
    const firstProIndex = THEMES_FREE_FIRST.findIndex((theme) => theme.tier === 'pro')
    const lastFreeIndex = THEMES_FREE_FIRST.map((theme) => theme.tier).lastIndexOf('free')
    expect(lastFreeIndex).toBeLessThan(firstProIndex)
  })

  it('contains every theme exactly once', () => {
    expect(THEMES_FREE_FIRST).toHaveLength(STORE_THEMES.length)
    expect(new Set(THEMES_FREE_FIRST.map((theme) => theme.id)).size).toBe(STORE_THEMES.length)
  })

  it('opens with the default theme', () => {
    expect(THEMES_FREE_FIRST[0]?.id).toBe(DEFAULT_THEME_ID)
  })
})
