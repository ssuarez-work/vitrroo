import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: ChangeFreq
  priority?: number
  imageLoc?: string
  imageTitle?: string
}

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildStaticEntries = (baseUrl: string): SitemapEntry[] => [
  { loc: `${baseUrl}/`, changefreq: 'weekly', priority: 1 },
  { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.2 },
  { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: 0.2 }
]

const renderImage = (entry: SitemapEntry): string => {
  if (!entry.imageLoc) return ''
  const titleTag = entry.imageTitle ? `<image:title>${escapeXml(entry.imageTitle)}</image:title>` : ''
  return `<image:image><image:loc>${escapeXml(entry.imageLoc)}</image:loc>${titleTag}</image:image>`
}

const renderEntry = (entry: SitemapEntry): string => {
  const parts: string[] = [`<loc>${escapeXml(entry.loc)}</loc>`]
  if (entry.lastmod) parts.push(`<lastmod>${entry.lastmod}</lastmod>`)
  if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`)
  if (entry.priority !== undefined) parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`)
  parts.push(renderImage(entry))
  return `<url>${parts.join('')}</url>`
}

const renderSitemap = (entries: SitemapEntry[]): string => {
  const body = entries.map(renderEntry).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl.replace(/\/$/, '')

  const admin = serverSupabaseServiceRole<Database>(event)
  const { data: stores } = await admin
    .from('stores')
    .select('slug, name, logo_url, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5000)

  const storeEntries: SitemapEntry[] = (stores ?? []).map((store) => ({
    loc: `${baseUrl}/${store.slug}`,
    lastmod: store.created_at?.slice(0, 10),
    changefreq: 'weekly',
    priority: 0.7,
    imageLoc: store.logo_url ?? undefined,
    imageTitle: store.name
  }))

  const body = renderSitemap([...buildStaticEntries(baseUrl), ...storeEntries])
  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=3600'
    }
  })
})
