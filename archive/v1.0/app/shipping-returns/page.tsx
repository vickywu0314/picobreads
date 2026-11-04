'use client'

import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

export default function ShippingPage() {
  const t = useT()
  return (
    <ContentPage title={t.pages.shipping.title}>
      {t.pages.shipping.sections.map((s) => (
        <section key={s.h}>
          <h2 className="font-serif text-2xl">{s.h}</h2>
          <p className="mt-2 text-muted">{s.p}</p>
        </section>
      ))}
    </ContentPage>
  )
}
