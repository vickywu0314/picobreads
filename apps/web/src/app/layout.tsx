import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SITE } from '@/config/site'
import { PrototypeBanner } from '@/components/PrototypeBanner'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <PrototypeBanner />
        {children}
      </body>
    </html>
  )
}
