'use client'

import { ContentPage } from '@/components/ContentPage'
import { useT } from '@/i18n'

export default function FaqPage() {
  const t = useT()
  return (
    <ContentPage title={t.pages.faq.title}>
      <div className="divide-y divide-border rounded-3xl border border-border bg-surface">
        {t.pages.faq.items.map((it) => (
          <details key={it.q} className="group p-5">
            <summary className="cursor-pointer list-none font-semibold marker:hidden">
              <span className="mr-2 inline-block text-accent transition-transform group-open:rotate-45">+</span>
              {it.q}
            </summary>
            <p className="mt-2 text-base text-muted">{it.a}</p>
          </details>
        ))}
      </div>
    </ContentPage>
  )
}
