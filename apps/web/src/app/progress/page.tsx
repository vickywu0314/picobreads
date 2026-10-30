'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { ProgressBar } from '@/components/ui'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'

export default function ProgressPage() {
  const t = useT()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const placed = useStore((s) => s.placed)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const done = placed ? [...placed].filter((c) => c === '1').length : 0

  return (
    <>
      <SiteHeader />
      <main className="container-page max-w-2xl py-8">
        <h1 className="text-3xl font-extrabold tracking-tight">{t.progress.title}</h1>
        <p className="mt-2 text-muted">{t.progress.body}</p>

        <section className="card mt-6 p-5">
          <h2 className="font-bold">{t.progress.current}</h2>
          {hydrated && pattern ? (
            <div className="mt-3 flex items-center gap-4">
              <div className="w-20 shrink-0 rounded-lg bg-[var(--board)] p-1">
                <PatternThumb pattern={pattern} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted">
                  {pattern.width} × {pattern.height} · {Math.round((done / pattern.cells.length) * 100)}%
                </p>
                <div className="mt-2">
                  <ProgressBar value={done / pattern.cells.length} label={t.common.progress} />
                </div>
              </div>
              <Link href="/bead/" className="btn-primary btn-sm">
                {t.progress.open}
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">{t.progress.none}</p>
          )}
        </section>

        <section className="card mt-4 p-5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold">{t.progress.magicTitle}</h2>
            <ProtoTag />
          </div>
          {sent ? (
            <p className="mt-3 flex items-center gap-2 text-sm">
              <MailCheck className="h-5 w-5 text-ok" aria-hidden /> {t.progress.sent(email)}
            </p>
          ) : (
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <label className="flex-1">
                <span className="sr-only">{t.progress.email}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-primary">
                {t.progress.send}
              </button>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
