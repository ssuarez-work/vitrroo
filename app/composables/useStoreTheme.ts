import type { Store } from '~/types'
import { FONT_DEFINITIONS, buildGoogleFontsUrl, findThemeById, type StoreTheme } from '~/themes'

export type ThemeVars = Record<string, string>

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

  const styleString = (store: Store | null | undefined): string => {
    return Object.entries(buildVars(store))
      .map(([name, value]) => `${name}:${value}`)
      .join(';')
  }

  const fontsUrl = (theme: StoreTheme): string => {
    return buildGoogleFontsUrl([theme.headingFont, theme.bodyFont])
  }

  return { resolveTheme, buildVars, styleString, fontsUrl }
}
