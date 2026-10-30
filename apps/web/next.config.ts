import type { NextConfig } from 'next'

// Milestone 0 is a fully static site (no server): `next build` writes ./out.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const config: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  transpilePackages: ['@picobreads/pattern-engine'],
}

export default config
