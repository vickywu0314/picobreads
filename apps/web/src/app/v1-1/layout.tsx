import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Pipixel — turn your photo into beads', template: '%s · Pipixel' },
  description: 'Free online bead pattern maker: turn pets, family and travel moments into a bead pattern with color codes.',
}

// v1.1 display fonts (rounded Chinese display, rounded Latin, pixel logo). Falls back to system fonts offline.
const FONTS =
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Pixelify+Sans:wght@500;600&family=ZCOOL+KuaiLe&display=swap'

export default function V11Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONTS} precedence="default" />
      {children}
    </>
  )
}
