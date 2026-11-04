import type { MetadataRoute } from 'next'
import { ALLOWED_BOTS, NOINDEX_PATHS, SITE_URL } from '@/config/seo'

export const dynamic = 'force-static'

// Everyone may crawl; search engines and AI crawlers are also listed by name so it's explicit.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: NOINDEX_PATHS },
      { userAgent: ALLOWED_BOTS, allow: ['/', '/llms.txt', '/ai.txt'], disallow: NOINDEX_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
