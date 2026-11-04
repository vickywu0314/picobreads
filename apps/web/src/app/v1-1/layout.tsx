import type { Metadata } from 'next'
// v1.1 fonts (Nunito for Latin text and headings, pixel logo; Chinese uses the system bold sans), bundled with the site
// instead of Google Fonts so they load in mainland China too. Chinese is split by unicode-range,
// so browsers fetch only the chunks a page uses.
import '@fontsource/nunito/500.css'
import '@fontsource/nunito/700.css'
import '@fontsource/nunito/800.css'
import '@fontsource/pixelify-sans/500.css'
import '@fontsource/pixelify-sans/600.css'

export const metadata: Metadata = {
  title: { default: 'Pipixel — turn your photo into beads', template: '%s · Pipixel' },
  description: 'Free online bead pattern maker: turn pets, family and travel moments into a bead pattern with color codes.',
}

export default function V11Layout({ children }: { children: React.ReactNode }) {
  return children
}
