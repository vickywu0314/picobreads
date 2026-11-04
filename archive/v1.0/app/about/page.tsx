'use client'

import Link from 'next/link'
import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

export default function AboutPage() {
  const t = useT()
  return (
    <ContentPage title={t.pages.about.title}>
      {t.pages.about.body.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Link href="/beads/" className="btn-primary">
        {t.home.beadsCta}
      </Link>
    </ContentPage>
  )
}
