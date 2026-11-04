'use client'

import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

// Phase 1: the community gallery is curated by hand (fixed examples in config/catalog.ts),
// so instead of an upload form we invite makers to email us.
export default function SharePage() {
  const t = useT()
  return (
    <ContentPage title={t.share.title} draft={false}>
      <p className="text-muted">{t.share.body}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/contact/" className="btn-primary">
          <Mail className="h-5 w-5" aria-hidden /> {t.share.cta}
        </Link>
        <Link href="/beads/community/" className="btn-secondary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {t.share.back}
        </Link>
      </div>
    </ContentPage>
  )
}
