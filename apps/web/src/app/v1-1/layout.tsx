import type { Metadata } from 'next'
// v1.1 display fonts (rounded Latin, pixel logo, rounded Chinese display), bundled with the site
// instead of Google Fonts so they load in mainland China too. Chinese is split by unicode-range,
// so browsers fetch only the chunks a page uses.
import '@fontsource/baloo-2/600.css'
import '@fontsource/baloo-2/700.css'
import '@fontsource/pixelify-sans/500.css'
import '@fontsource/pixelify-sans/600.css'
import '@fontsource/zcool-kuaile/400.css'

export const metadata: Metadata = {
  title: { default: 'Pipixel — turn your photo into beads', template: '%s · Pipixel' },
  description: 'Free online bead pattern maker: turn pets, family and travel moments into a bead pattern with color codes.',
}

export default function V11Layout({ children }: { children: React.ReactNode }) {
  return children
}
