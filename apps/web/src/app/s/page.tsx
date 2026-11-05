import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SharedView } from './SharedView'

export const metadata: Metadata = { title: '作品分享 · Shared piece', robots: { index: false, follow: true } }

export default function SharePage() {
  return (
    <Suspense>
      <SharedView />
    </Suspense>
  )
}
