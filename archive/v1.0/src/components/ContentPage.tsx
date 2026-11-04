'use client'

import { SiteFooter, SiteHeader } from './SiteHeader'
import { ProtoTag } from './PrototypeBanner'
import { useT } from '@/i18n'

/** Simple text page shell for footer pages (About, FAQ, Terms…). */
export function ContentPage({ title, children, draft = true }: { title: string; children: React.ReactNode; draft?: boolean }) {
  const t = useT()
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
        {draft && (
          <p className="mt-3 flex items-center gap-2 text-xs text-muted">
            <ProtoTag /> {t.pages.draft}
          </p>
        )}
        <div className="mt-8 space-y-6 text-lg leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}
