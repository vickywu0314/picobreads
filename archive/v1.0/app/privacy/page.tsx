'use client'

import { ShieldCheck } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { useT } from '@/i18n'

export default function PrivacyPage() {
  const t = useT()
  return (
    <>
      <SiteHeader />
      <main className="container-page max-w-2xl py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.privacy.title}</h1>
        <ul className="mt-6 space-y-3">
          {t.privacy.points.map((p) => (
            <li key={p} className="card flex gap-3 p-4">
              <ShieldCheck className="h-5 w-5 shrink-0 text-ok" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
