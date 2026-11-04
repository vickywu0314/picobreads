import type { MetadataRoute } from 'next'
import { SITEMAP_PATHS, SITE_URL } from '@/config/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return SITEMAP_PATHS.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: 'weekly', priority }))
}
