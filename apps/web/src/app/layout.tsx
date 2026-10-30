import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SITE } from '@/config/site'
import { PrototypeBanner } from '@/components/PrototypeBanner'
import { LocaleSync } from '@/components/LocaleSync'

export const metadata: Metadata = {
  title: { default: `${SITE.name} — custom fuse bead patterns & kits`, template: `%s · ${SITE.name}` },
  description: 'Turn any photo into a fuse bead pattern, bead it online or with a light box, and order a kit with exactly the beads you need.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf7f1' },
    { media: '(prefers-color-scheme: dark)', color: '#15120f' },
  ],
}

// Applies the saved / system theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('pb-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){}})()`

// The static HTML is English. If the visitor will get Chinese (saved choice or browser
// language), hide the page until React has switched, so English never flashes.
// Keep in sync with detectLocale() in src/i18n/index.ts.
const localeScript = `(function(){var h=document.documentElement,l='en-US';try{var s=localStorage.getItem('pb-locale');if(s==='en-US'||s==='zh-CN')l=s;else{var a=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language];for(var i=0;i<a.length;i++){var v=(a[i]||'').toLowerCase();if(v.indexOf('zh')===0){l='zh-CN';break}if(v.indexOf('en')===0)break}}}catch(e){}if(l!=='en-US'){h.lang=l;h.setAttribute('data-locale-pending','');setTimeout(function(){h.removeAttribute('data-locale-pending')},2500)}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <LocaleSync />
        <PrototypeBanner />
        {children}
      </body>
    </html>
  )
}
