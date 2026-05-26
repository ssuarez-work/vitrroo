import { describe, expect, it } from 'vitest'
import { useThemeColor } from '../app/composables/useThemeColor'

const { buildPalette, isValidHex, defaultBrand } = useThemeColor()

describe('useThemeColor.isValidHex', () => {
  it('accepts 6-digit hex with leading #', () => {
    expect(isValidHex('#22c55e')).toBe(true)
  })

  it('accepts 6-digit hex without leading #', () => {
    expect(isValidHex('22c55e')).toBe(true)
  })

  it('rejects 3-digit shorthand', () => {
    expect(isValidHex('#abc')).toBe(false)
  })

  it('rejects non-hex characters', () => {
    expect(isValidHex('#zzzzzz')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidHex('')).toBe(false)
  })
})

describe('useThemeColor.buildPalette', () => {
  it('produces all required brand tokens', () => {
    const palette = buildPalette('#22c55e')
    expect(Object.keys(palette)).toEqual([
      '--brand-50',
      '--brand-100',
      '--brand-400',
      '--brand-500',
      '--brand-600',
      '--brand-700'
    ])
  })

  it('falls back to default brand when hex is null', () => {
    const palette = buildPalette(null)
    expect(palette['--brand-500']).toBeTruthy()
  })

  it('falls back to default brand when hex is invalid', () => {
    const palette = buildPalette('not-a-hex')
    expect(palette['--brand-500']).toBe(buildPalette(defaultBrand)['--brand-500'])
  })

  it('returns rgb space-separated tokens', () => {
    const palette = buildPalette('#000000')
    expect(palette['--brand-500']).toMatch(/^\d+ \d+ \d+$/)
  })
})
