const SLUG_MAX_LENGTH = 40
const RANDOM_SUFFIX_MAX = 9999
const COMBINING_DIACRITICS = /[̀-ͯ]/g
const NON_ALPHANUM = /[^a-z0-9]+/g
const TRIM_DASHES = /(^-|-$)+/g
const VALID_SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/

const RESERVED_SLUGS = new Set([
  'admin', 'api', 'app', 'auth', 'blog', 'billing', 'catalog',
  'dashboard', 'docs', 'forgot-password', 'help', 'home', 'index',
  'login', 'logout', 'mail', 'me', 'new', 'pricing', 'privacy',
  'public', 'register', 'reset-password', 'root', 'settings',
  'signin', 'signup', 'static', 'status', 'store', 'support',
  'system', 'terms', 'test', 'user', 'vitrroo', 'webhooks', 'www'
])

export const useSlug = () => {
  const normalize = (raw: string): string => {
    return raw
      .toLowerCase()
      .normalize('NFD')
      .replace(COMBINING_DIACRITICS, '')
      .replace(NON_ALPHANUM, '-')
      .replace(TRIM_DASHES, '')
      .slice(0, SLUG_MAX_LENGTH)
  }

  const withRandomSuffix = (base: string): string => {
    const safeBase = normalize(base) || 'tienda'
    const suffix = Math.floor(Math.random() * RANDOM_SUFFIX_MAX) + 1
    return `${safeBase}-${suffix}`
  }

  const isReserved = (slug: string): boolean => RESERVED_SLUGS.has(slug)

  const isValid = (slug: string): boolean => {
    return VALID_SLUG.test(slug) && slug.length <= SLUG_MAX_LENGTH && !isReserved(slug)
  }

  return { normalize, withRandomSuffix, isValid, isReserved }
}
