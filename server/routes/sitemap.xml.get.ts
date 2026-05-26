import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database.types'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

const STATIC_ENTRIES = (baseUrl: string): SitemapEntry[] => [
  { loc: `${baseUrl}/`, changefreq: 'weekly', priority: 1 },
  { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: 0.2 },
  { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: 0.2 }
]

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const renderEntry = (entry: SitemapEntry): string => {
  const parts: string[] = [`<loc>${escapeXml(entry.loc)}</loc>`]
  if (entry.lastmod) parts.push(`<lastmod>${entry.lastmod}</lastmod>`)
  if (entry.changefreq) parts.push(`<changefreq>${entry.changefreq}</changefreq>`)
  if (entry.priority !== undefined) parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`)
  return `<url>${parts.join('')}</url>`
}

const renderSitemap = (entries: SitemapEntry[]): string => {
  const body = entries.map(renderEntry).join('')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl.replace(/\/$/, '')

  const admin = serverSupabaseServiceRole<Database>(event)
  const { data: stores } = await admin
    .from('stores')
    .select('slug, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5000)

  const dynamicEntries: SitemapEntry[] = (stores ?? []).map((store) => ({
    loc: `${baseUrl}/${store.slug}`,
    lastmod: store.created_at?.slice(0, 10),
    changefreq: 'weekly',
    priority: 0.7
  }))

  setHeader(event, 'content-type', 'application/xml')
  setHeader(event, 'cache-control', 'public, max-age=600, s-maxage=3600')
  return renderSitemap([...STATIC_ENTRIES(baseUrl), ...dynamicEntries])
})
