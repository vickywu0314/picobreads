import type { Metadata, Viewport } from 'next'
// Fonts bundled with the site (not Google Fonts, so they load in mainland China too):
// Nunito for Latin text, headings and the BeadSpark wordmark, Pixelify Sans for pixel-style labels;
// Chinese uses the system bold sans.
import '@fontsource/nunito/500.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/pixelify-sans/500.css'
import '@fontsource/pixelify-sans/600.css'
import './globals.css'
import { LocaleSync } from '@/components/LocaleSync'
import { SEO, SITE_URL } from '@/config/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SEO.title, template: `%s · ${SEO.name}` },
  description: SEO.description,
  keywords: SEO.keywords,
  applicationName: SEO.name,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website',
    siteName: SEO.name,
    title: SEO.title,
    description: SEO.description,
    locale: 'zh_CN',
    alternateLocale: ['en_US'],
    images: [{ url: '/v11/home-pattern.jpg', alt: 'BeadSpark bead pattern' }],
  },
  twitter: { card: 'summary_large_image', title: SEO.title, description: SEO.description, images: ['/v11/home-pattern.jpg'] },
  other: { 'llms-txt': `${SITE_URL}/llms.txt` },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#fdf7f4',
}

// The static HTML is English. If the visitor will get Chinese (saved choice or browser
// language), hide the page until React has switched, so English never flashes.
// Keep in sync with detectLocale() in src/i18n/index.ts.
const localeScript = `(function(){var h=document.documentElement,l='en-US';try{var s=localStorage.getItem('pb-locale');if(s==='en-US'||s==='zh-CN')l=s;else{var a=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<a.length;i++){var v=(a[i]||'').toLowerCase();if(v.indexOf('zh')===0){l='zh-CN';break}if(v.indexOf('en')===0)break}}}catch(e){}if(l!=='en-US'){h.lang=l;h.setAttribute('data-locale-pending','');setTimeout(function(){h.removeAttribute('data-locale-pending')},2500)}})()`

// Structured data for search engines and AI assistants.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SEO.name,
  alternateName: ['BeadSpark 拼豆图纸生成器', 'BeadSpark bead pattern maker', '拼豆火花'],
  url: SITE_URL,
  description: SEO.description,
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web',
  inLanguage: ['zh-CN', 'en-US'],
  keywords: SEO.keywords.join(', '),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
  featureList: ['照片生成拼豆图纸 / Photo to bead pattern', 'MARD 264 色号 / MARD color codes', '用豆清单 / Bead list', '在线拼豆 / Bead online', '像素风 / Pixel-art style'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <link rel="alternate" type="text/plain" title="LLM-friendly summary" href="/llms.txt" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <LocaleSync />
        {children}
      </body>
    </html>
  )
}
