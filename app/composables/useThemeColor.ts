const HEX_REGEX = /^#?([a-f\d]{6})$/i
const DEFAULT_BRAND = '#22c55e'

interface Rgb {
  r: number
  g: number
  b: number
}

const parseHex = (hex: string): Rgb | null => {
  const match = HEX_REGEX.exec(hex.trim())
  const value = match?.[1]
  if (!value) return null
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  }
}

const mixWithWhite = (rgb: Rgb, ratio: number): Rgb => ({
  r: Math.round(rgb.r + (255 - rgb.r) * ratio),
  g: Math.round(rgb.g + (255 - rgb.g) * ratio),
  b: Math.round(rgb.b + (255 - rgb.b) * ratio)
})

const mixWithBlack = (rgb: Rgb, ratio: number): Rgb => ({
  r: Math.round(rgb.r * (1 - ratio)),
  g: Math.round(rgb.g * (1 - ratio)),
  b: Math.round(rgb.b * (1 - ratio))
})

const toRgbString = (rgb: Rgb): string => `${rgb.r} ${rgb.g} ${rgb.b}`

export const useThemeColor = () => {
  const buildPalette = (hex: string | null) => {
    const base = parseHex(hex ?? DEFAULT_BRAND) ?? parseHex(DEFAULT_BRAND)!
    return {
      '--brand-50':  toRgbString(mixWithWhite(base, 0.92)),
      '--brand-100': toRgbString(mixWithWhite(base, 0.82)),
      '--brand-400': toRgbString(mixWithWhite(base, 0.18)),
      '--brand-500': toRgbString(base),
      '--brand-600': toRgbString(mixWithBlack(base, 0.16)),
      '--brand-700': toRgbString(mixWithBlack(base, 0.32))
    }
  }

  const isValidHex = (value: string): boolean => HEX_REGEX.test(value.trim())

  return { buildPalette, isValidHex, defaultBrand: DEFAULT_BRAND }
}
