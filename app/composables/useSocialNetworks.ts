import type { SocialNetwork } from '~/types'

export type NetworkInputType = 'handle' | 'url'

export interface NetworkDefinition {
  key: SocialNetwork
  label: string
  icon: string
  brandColor: string
  inputType: NetworkInputType
  inputPlaceholder: string
  hostPatterns: string[]
  urlTemplate: (value: string) => string
  allowMultiple: boolean
  maxPerType: number
}

const handleFromInstagramUrl = (url: URL): string | null => {
  const segments = url.pathname.split('/').filter(Boolean)
  return segments[0] ?? null
}

const handleFromTiktokUrl = (url: URL): string | null => {
  const segments = url.pathname.split('/').filter(Boolean)
  const first = segments[0] ?? ''
  return first.startsWith('@') ? first.slice(1) : first || null
}

const handleFromTwitterUrl = (url: URL): string | null => {
  const segments = url.pathname.split('/').filter(Boolean)
  return segments[0] ?? null
}

const NETWORKS: NetworkDefinition[] = [
  {
    key: 'instagram',
    label: 'Instagram',
    icon: 'bi:instagram',
    brandColor: '#E4405F',
    inputType: 'handle',
    inputPlaceholder: '@tu_usuario',
    hostPatterns: ['instagram.com', 'www.instagram.com', 'm.instagram.com', 'instagr.am'],
    urlTemplate: (value) => `https://instagram.com/${value}`,
    allowMultiple: false,
    maxPerType: 1
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    icon: 'bi:tiktok',
    brandColor: '#000000',
    inputType: 'handle',
    inputPlaceholder: '@tu_usuario',
    hostPatterns: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com'],
    urlTemplate: (value) => `https://tiktok.com/@${value}`,
    allowMultiple: false,
    maxPerType: 1
  },
  {
    key: 'facebook',
    label: 'Facebook',
    icon: 'bi:facebook',
    brandColor: '#1877F2',
    inputType: 'url',
    inputPlaceholder: 'facebook.com/tu-pagina',
    hostPatterns: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com'],
    urlTemplate: (value) => value,
    allowMultiple: false,
    maxPerType: 1
  },
  {
    key: 'twitter',
    label: 'X (Twitter)',
    icon: 'bi:twitter-x',
    brandColor: '#000000',
    inputType: 'handle',
    inputPlaceholder: '@tu_usuario',
    hostPatterns: ['x.com', 'twitter.com', 'www.x.com', 'www.twitter.com', 'mobile.twitter.com'],
    urlTemplate: (value) => `https://x.com/${value}`,
    allowMultiple: false,
    maxPerType: 1
  },
  {
    key: 'website',
    label: 'Sitio web',
    icon: 'lucide:globe',
    brandColor: '#0f0f10',
    inputType: 'url',
    inputPlaceholder: 'https://tu-sitio.com',
    hostPatterns: [],
    urlTemplate: (value) => value,
    allowMultiple: true,
    maxPerType: 3
  }
]

const NETWORK_BY_KEY: Record<SocialNetwork, NetworkDefinition> = NETWORKS.reduce((acc, network) => {
  acc[network.key] = network
  return acc
}, {} as Record<SocialNetwork, NetworkDefinition>)

const HANDLE_HOST_NETWORKS = NETWORKS.filter(
  (network) => network.hostPatterns.length > 0 && network.key !== 'facebook'
)

export const detectNetworkFromUrl = (url: URL): SocialNetwork | null => {
  const host = url.hostname.toLowerCase()
  for (const network of NETWORKS) {
    if (network.hostPatterns.includes(host)) return network.key
  }
  return null
}

export const extractHandleFromUrl = (network: SocialNetwork, url: URL): string | null => {
  if (network === 'instagram') return handleFromInstagramUrl(url)
  if (network === 'tiktok') return handleFromTiktokUrl(url)
  if (network === 'twitter') return handleFromTwitterUrl(url)
  return null
}

export const handleHostNetworks = (): NetworkDefinition[] => HANDLE_HOST_NETWORKS

export const useSocialNetworks = () => {
  const definitions = NETWORKS
  const byKey = (key: SocialNetwork): NetworkDefinition => NETWORK_BY_KEY[key]
  const exists = (key: string): key is SocialNetwork => key in NETWORK_BY_KEY

  const buildAbsoluteUrl = (link: { type: SocialNetwork, value: string }): string => {
    return byKey(link.type).urlTemplate(link.value)
  }

  return { definitions, byKey, exists, buildAbsoluteUrl }
}
