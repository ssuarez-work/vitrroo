import type { Store } from '~/types'
import { FONT_DEFINITIONS, buildGoogleFontsUrl, findThemeById, type StoreTheme } from '~/themes'

export type ThemeVars = Record<string, string>

const THEME_VAR_NAMES = [
  '--brand-50',
  '--brand-100',
  '--brand-400',
  '--brand-500',
  '--brand-600',
  '--brand-700',
  '--store-bg',
  '--store-surface',
  '--store-text',
  '--store-text-muted',
  '--store-card-radius',
  '--store-button-radius',
  '--store-heading-font',
  '--store-body-font',
  '--store-letter-spacing',
  '--store-heading-transform'
]

export const useStoreTheme = () => {
  const { buildPalette } = useThemeColor()

  const resolveTheme = (store: Store | null | undefined): StoreTheme => {
    return findThemeById(store?.theme_id ?? null)
  }

  const buildVars = (store: Store | null | undefined): ThemeVars => {
    const theme = resolveTheme(store)
    const seed = store?.theme_color ?? theme.brandColor
    const palette = buildPalette(seed) as Record<string, string>

    return {
      ...palette,
      '--store-bg': theme.background,
      '--store-surface': theme.surface,
      '--store-text': theme.textPrimary,
      '--store-text-muted': theme.textMuted,
      '--store-card-radius': theme.cardRadius,
      '--store-button-radius': theme.buttonRadius,
      '--store-heading-font': FONT_DEFINITIONS[theme.headingFont].fontFamilyCss,
      '--store-body-font': FONT_DEFINITIONS[theme.bodyFont].fontFamilyCss,
      '--store-letter-spacing': theme.letterSpacing,
      '--store-heading-transform': theme.uppercaseHeadings ? 'uppercase' : 'none'
    }
  }

  const applyToRoot = (store: Store | null | undefined): void => {
    if (typeof document === 'undefined') return
    const vars = buildVars(store)
    const root = document.documentElement
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
    }
  }

  const resetRoot = (): void => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    for (const name of THEME_VAR_NAMES) {
      root.style.removeProperty(name)
    }
  }

  const fontsUrl = (theme: StoreTheme): string => {
    return buildGoogleFontsUrl([theme.headingFont, theme.bodyFont])
  }

  return { resolveTheme, buildVars, applyToRoot, resetRoot, fontsUrl }
}
