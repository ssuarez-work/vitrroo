import type { Config } from 'tailwindcss'

const brandRgb = (channel: '50' | '100' | '400' | '500' | '600' | '700') =>
  `rgb(var(--brand-${channel}) / <alpha-value>)`

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  brandRgb('50'),
          100: brandRgb('100'),
          400: brandRgb('400'),
          500: brandRgb('500'),
          600: brandRgb('600'),
          700: brandRgb('700'),
        },
        wa: {
          DEFAULT: '#25D366',
          dark:    '#128C7E',
          light:   '#dcfce7',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'card':  '0 2px 12px 0 rgba(0,0,0,0.06)',
        'modal': '0 24px 80px 0 rgba(0,0,0,0.18)',
        'wa':    '0 4px 24px 0 rgba(37,211,102,0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config
