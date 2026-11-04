'use client'

import { useState } from 'react'
import { BellRing, CheckCircle2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { BookCover } from '@/components/BookCover'
import { useT } from '@/i18n'

export default function StorybooksPage() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <section className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-bold text-accent">{t.storybooks.badge}</span>
            <h1 className="mt-4 font-serif text-5xl">{t.storybooks.title}</h1>
            <p className="mt-4 text-lg text-muted">{t.storybooks.body}</p>
            <p className="mt-3 text-sm font-semibold text-muted">{t.storybooks.status}</p>
          </div>
          <div className="grid place-items-center rounded-[2rem] bg-[#e9e4f5] p-10 dark:bg-[#2a2638]">
            <BookCover title={t.storybooks.cover} className="w-48 sm:w-56" />
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl">{t.storybooks.sampleTitle}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <ProtoTag label={t.common.sample} /> {t.storybooks.sampleNote}
          </p>
          <div className="mt-6 grid overflow-hidden rounded-3xl border border-border md:grid-cols-2">
            <div className="relative aspect-[4/3] bg-gradient-to-b from-[#1e2a5a] to-[#45407e]">
              <div className="absolute right-[18%] top-[14%] h-20 w-20 rounded-full bg-[#ffe9a8] shadow-[0_0_60px_#ffe9a8]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 rounded-t-[60%] bg-[#4f8a5b]" />
              <div className="absolute bottom-[26%] left-[28%] h-16 w-10 rounded-t-full bg-[#f2c6a0]" />
              <div className="absolute bottom-[26%] left-[27%] h-8 w-12 rounded-b-xl bg-[#e5484d]" />
            </div>
            <div className="flex items-center bg-[#fffaf2] p-10 dark:bg-surface">
              <p className="font-serif text-2xl leading-relaxed">{t.storybooks.page}</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl">{t.storybooks.howTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {t.storybooks.how.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="font-serif text-4xl text-accent">{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="card mt-16 p-8 text-center">
          <BellRing className="mx-auto h-10 w-10 text-accent" aria-hidden />
          <h2 className="mt-3 font-serif text-3xl">{t.storybooks.notifyTitle}</h2>
          <p className="mt-2 text-muted">{t.storybooks.notifyBody}</p>
          {done ? (
            <p role="status" className="mt-6 flex items-center justify-center gap-2 font-semibold text-ok">
              <CheckCircle2 className="h-5 w-5" aria-hidden /> {t.storybooks.notified}
            </p>
          ) : (
            <form
              className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault()
                setDone(true)
              }}
            >
              <label className="flex-1">
                <span className="sr-only">{t.storybooks.email}</span>
                <input type="email" required placeholder="you@example.com" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
              <button type="submit" className="btn-primary">
                {t.storybooks.notify}
              </button>
            </form>
          )}
          <div className="mt-3">
            <ProtoTag />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
