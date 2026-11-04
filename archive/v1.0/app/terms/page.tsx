'use client'

import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

export default function TermsPage() {
  const t = useT()
  return (
    <ContentPage title={t.pages.terms.title}>
      {t.pages.terms.sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-serif text-2xl">{s.h}</h2>
          <p className="mt-2 text-muted">{s.p}</p>
        </section>
      ))}
    </ContentPage>
  )
}
