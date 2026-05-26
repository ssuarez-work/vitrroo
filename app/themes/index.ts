export type ThemeLayout = 'grid-2' | 'grid-3' | 'single' | 'list'
export type ThemeCardVariant = 'soft' | 'flat' | 'sharp' | 'rounded' | 'overlay' | 'list' | 'polaroid' | 'minimal'
export type ThemeHeaderVariant = 'centered-circle' | 'centered-square' | 'banner-overlay' | 'left-compact' | 'editorial'
export type ThemeFontKey =
  | 'jakarta'
  | 'inter'
  | 'inter-black'
  | 'playfair'
  | 'cormorant'
  | 'dm-serif'
  | 'fredoka'
  | 'space-grotesk'

export interface FontDefinition {
  family: string
  fontFamilyCss: string
  googleParam: string
}

export const FONT_DEFINITIONS: Record<ThemeFontKey, FontDefinition> = {
  jakarta: {
    family: 'Plus Jakarta Sans',
    fontFamilyCss: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
    googleParam: 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800'
  },
  inter: {
    family: 'Inter',
    fontFamilyCss: "'Inter', ui-sans-serif, system-ui, sans-serif",
    googleParam: 'Inter:wght@400;500;600;700;800'
  },
  'inter-black': {
    family: 'Inter',
    fontFamilyCss: "'Inter', ui-sans-serif, system-ui, sans-serif",
    googleParam: 'Inter:wght@500;700;900'
  },
  playfair: {
    family: 'Playfair Display',
    fontFamilyCss: "'Playfair Display', ui-serif, Georgia, serif",
    googleParam: 'Playfair+Display:wght@500;700;800'
  },
  cormorant: {
    family: 'Cormorant Garamond',
    fontFamilyCss: "'Cormorant Garamond', ui-serif, Georgia, serif",
    googleParam: 'Cormorant+Garamond:wght@400;500;600;700'
  },
  'dm-serif': {
    family: 'DM Serif Display',
    fontFamilyCss: "'DM Serif Display', ui-serif, Georgia, serif",
    googleParam: 'DM+Serif+Display:ital@0;1'
  },
  fredoka: {
    family: 'Fredoka',
    fontFamilyCss: "'Fredoka', ui-sans-serif, system-ui, sans-serif",
    googleParam: 'Fredoka:wght@400;500;600;700'
  },
  'space-grotesk': {
    family: 'Space Grotesk',
    fontFamilyCss: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    googleParam: 'Space+Grotesk:wght@400;500;600;700'
  }
}

export interface StoreTheme {
  id: string
  name: string
  description: string
  audience: string
  brandColor: string
  background: string
  surface: string
  textPrimary: string
  textMuted: string
  isDark: boolean
  headingFont: ThemeFontKey
  bodyFont: ThemeFontKey
  layout: ThemeLayout
  cardVariant: ThemeCardVariant
  headerVariant: ThemeHeaderVariant
  cardRadius: string
  buttonRadius: string
  density: 'compact' | 'comfortable' | 'spacious'
  uppercaseHeadings: boolean
  letterSpacing: string
}

export const STORE_THEMES: StoreTheme[] = [
  {
    id: 'soft',
    name: 'Soft',
    description: 'El look limpio y profesional original.',
    audience: 'Cualquier negocio.',
    brandColor: '#22c55e',
    background: '#f8f8fa',
    surface: '#ffffff',
    textPrimary: '#0f0f10',
    textMuted: '#6b7280',
    isDark: false,
    headingFont: 'jakarta',
    bodyFont: 'jakarta',
    layout: 'grid-2',
    cardVariant: 'soft',
    headerVariant: 'centered-circle',
    cardRadius: '1.25rem',
    buttonRadius: '0.875rem',
    density: 'comfortable',
    uppercaseHeadings: false,
    letterSpacing: '-0.01em'
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Tipo revista: serif elegante, una columna, fotos grandes.',
    audience: 'Moda premium, fotografía, lifestyle.',
    brandColor: '#0f0f10',
    background: '#fafaf9',
    surface: '#ffffff',
    textPrimary: '#171717',
    textMuted: '#71717a',
    isDark: false,
    headingFont: 'playfair',
    bodyFont: 'inter',
    layout: 'single',
    cardVariant: 'minimal',
    headerVariant: 'editorial',
    cardRadius: '0.5rem',
    buttonRadius: '0.5rem',
    density: 'spacious',
    uppercaseHeadings: false,
    letterSpacing: '-0.02em'
  },
  {
    id: 'brutalist',
    name: 'Brutalist',
    description: 'Negro contra blanco, bordes gruesos, sin sombras.',
    audience: 'Streetwear, tatuaje, diseño underground.',
    brandColor: '#0a0a0a',
    background: '#ffffff',
    surface: '#ffffff',
    textPrimary: '#0a0a0a',
    textMuted: '#525252',
    isDark: false,
    headingFont: 'inter-black',
    bodyFont: 'inter',
    layout: 'grid-2',
    cardVariant: 'flat',
    headerVariant: 'left-compact',
    cardRadius: '0rem',
    buttonRadius: '0rem',
    density: 'compact',
    uppercaseHeadings: true,
    letterSpacing: '-0.03em'
  },
  {
    id: 'bubble',
    name: 'Bubble Pop',
    description: 'Tipografía redonda, esquinas grandes, paleta divertida.',
    audience: 'Kawaii, anime, juguetes, niños.',
    brandColor: '#ec4899',
    background: '#fdf2f8',
    surface: '#ffffff',
    textPrimary: '#2a0a1d',
    textMuted: '#8a5575',
    isDark: false,
    headingFont: 'fredoka',
    bodyFont: 'fredoka',
    layout: 'grid-2',
    cardVariant: 'rounded',
    headerVariant: 'centered-circle',
    cardRadius: '2rem',
    buttonRadius: '9999px',
    density: 'comfortable',
    uppercaseHeadings: false,
    letterSpacing: '0em'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Serif minimalista con mucho aire y líneas finas.',
    audience: 'Joyería, perfumería, regalos premium.',
    brandColor: '#92400e',
    background: '#fdf6e3',
    surface: '#fffaef',
    textPrimary: '#1c1410',
    textMuted: '#8a7259',
    isDark: false,
    headingFont: 'cormorant',
    bodyFont: 'inter',
    layout: 'grid-2',
    cardVariant: 'minimal',
    headerVariant: 'centered-square',
    cardRadius: '0.25rem',
    buttonRadius: '0.25rem',
    density: 'spacious',
    uppercaseHeadings: true,
    letterSpacing: '0.08em'
  },
  {
    id: 'bazaar',
    name: 'Bazaar',
    description: 'Grid denso, info compacta, vibe marketplace.',
    audience: 'Comida callejera, abarrotes, productos al por mayor.',
    brandColor: '#dc2626',
    background: '#fef2f2',
    surface: '#ffffff',
    textPrimary: '#1f0e0e',
    textMuted: '#7a4f4f',
    isDark: false,
    headingFont: 'inter',
    bodyFont: 'inter',
    layout: 'grid-3',
    cardVariant: 'sharp',
    headerVariant: 'left-compact',
    cardRadius: '0.5rem',
    buttonRadius: '0.5rem',
    density: 'compact',
    uppercaseHeadings: false,
    letterSpacing: '-0.01em'
  },
  {
    id: 'story',
    name: 'Story',
    description: 'Fotos a pantalla completa con texto encima, tipo stories.',
    audience: 'Pastelería, comida gourmet, eventos.',
    brandColor: '#a855f7',
    background: '#0f0a14',
    surface: '#1a121f',
    textPrimary: '#fafafa',
    textMuted: '#a1a1aa',
    isDark: true,
    headingFont: 'dm-serif',
    bodyFont: 'inter',
    layout: 'single',
    cardVariant: 'overlay',
    headerVariant: 'banner-overlay',
    cardRadius: '1.5rem',
    buttonRadius: '9999px',
    density: 'comfortable',
    uppercaseHeadings: false,
    letterSpacing: '-0.01em'
  },
  {
    id: 'list',
    name: 'List',
    description: 'Lista vertical con imagen a la izquierda e info a la derecha.',
    audience: 'Restaurantes, menús, servicios.',
    brandColor: '#0ea5e9',
    background: '#f0f9ff',
    surface: '#ffffff',
    textPrimary: '#0c1d2c',
    textMuted: '#52738a',
    isDark: false,
    headingFont: 'inter',
    bodyFont: 'inter',
    layout: 'list',
    cardVariant: 'list',
    headerVariant: 'left-compact',
    cardRadius: '1rem',
    buttonRadius: '0.75rem',
    density: 'comfortable',
    uppercaseHeadings: false,
    letterSpacing: '-0.01em'
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    description: 'Fotos con marco blanco grueso abajo, vibe analógico.',
    audience: 'Vintage, manualidades, productos artesanales.',
    brandColor: '#f59e0b',
    background: '#fffbeb',
    surface: '#ffffff',
    textPrimary: '#1c1404',
    textMuted: '#7a6334',
    isDark: false,
    headingFont: 'space-grotesk',
    bodyFont: 'inter',
    layout: 'grid-2',
    cardVariant: 'polaroid',
    headerVariant: 'centered-circle',
    cardRadius: '0.25rem',
    buttonRadius: '0.5rem',
    density: 'comfortable',
    uppercaseHeadings: false,
    letterSpacing: '0em'
  },
  {
    id: 'boutique',
    name: 'Boutique',
    description: 'Grid de 3 columnas con fotos cuadradas y texto mínimo.',
    audience: 'Ropa boutique, accesorios curados, deco minimalista.',
    brandColor: '#1c1917',
    background: '#fafaf9',
    surface: '#ffffff',
    textPrimary: '#1c1917',
    textMuted: '#78716c',
    isDark: false,
    headingFont: 'cormorant',
    bodyFont: 'inter',
    layout: 'grid-3',
    cardVariant: 'minimal',
    headerVariant: 'centered-square',
    cardRadius: '0rem',
    buttonRadius: '0.25rem',
    density: 'compact',
    uppercaseHeadings: true,
    letterSpacing: '0.1em'
  }
]

export const DEFAULT_THEME_ID = 'soft'

const DEFAULT_THEME: StoreTheme = STORE_THEMES[0]!

export const findThemeById = (id: string | null | undefined): StoreTheme => {
  if (!id) return DEFAULT_THEME
  return STORE_THEMES.find((theme) => theme.id === id) ?? DEFAULT_THEME
}

export const buildGoogleFontsUrl = (keys: ThemeFontKey[]): string => {
  const families = Array.from(new Set(keys.map((key) => FONT_DEFINITIONS[key].googleParam)))
  const query = families.map((family) => `family=${family}`).join('&')
  return `https://fonts.googleapis.com/css2?${query}&display=swap`
}
