interface CanonicalOptions {
  path?: string
}

const trimSlash = (value: string): string => value.replace(/\/$/, '')

const resolvePath = (route: ReturnType<typeof useRoute>, override?: string): string => {
  if (override) return override.startsWith('/') ? override : `/${override}`
  return route.path
}

export const useCanonical = (options: CanonicalOptions = {}): void => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const baseUrl = trimSlash(config.public.appUrl)
  const path = resolvePath(route, options.path)
  const href = `${baseUrl}${path}`

  useHead({
    link: [{ rel: 'canonical', href }]
  })
}

export const useNoIndex = (): void => {
  useHead({
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
  })
}

export const useSiteUrl = (): string => {
  const config = useRuntimeConfig()
  return trimSlash(config.public.appUrl)
}
