import type { Metadata } from 'next'
import { LegacyRedirect } from '@/components/LegacyRedirect'

export const metadata: Metadata = { robots: { index: false, follow: true } }

/** Old /v1-1/ address: redirects to the same page at the site root. */
export default function Page() {
  return <LegacyRedirect />
}
