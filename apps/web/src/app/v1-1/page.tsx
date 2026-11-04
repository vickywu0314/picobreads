'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, ClipboardList, Image as ImageIcon, LayoutGrid, Upload } from 'lucide-react'
import { useT } from '@/i18n'
import { V11Page } from '@/v11/Chrome'
import { V11_BEAD_SIZE, V11_HERO, V11_INSPO, V11_SAMPLE, V11_TIERS, v11Beads, v11Href, v11Size } from '@/v11/config'
import { useV11StartFrom } from '@/v11/start'
import { PixelBits } from '@/v11/PixelBits'

function Hero() {
  const t = useT()
  const start = useV11StartFrom()
  const h = V11_HERO
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--blush)] px-6 py-10 sm:px-10 md:py-12">
        <PixelBits className="absolute right-5 top-5 w-8 sm:w-10" />
        <PixelBits className="absolute bottom-6 left-5 hidden w-7 opacity-80 sm:block" flip />
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.08fr]">
          <div>
            <span className="inline-block rounded-full bg-[#f6c3cf] px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[var(--fg)]">{t.v11.hero.tag}</span>
            <h1 className="font-display mt-6 text-[2.75rem] leading-[1.08] sm:text-6xl">
              {t.v11.hero.title1}
              <br />
              {t.v11.hero.title2}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed">{t.v11.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={v11Href('/create/')} className="btn-primary h-13 rounded-2xl px-6 text-base sm:h-14 sm:px-7 sm:text-lg">
                <Upload className="h-5 w-5" aria-hidden /> {t.v11.hero.cta}
              </Link>
              <button type="button" onClick={() => start(V11_SAMPLE)} className="btn-secondary h-13 rounded-2xl px-6 text-base sm:h-14 sm:px-7 sm:text-lg">
                {t.v11.hero.sample}
              </button>
            </div>
            <p className="mt-5 text-[var(--muted)]">{t.v11.hero.points.join(' · ')}</p>
          </div>

          <div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
              {[
                { src: h.photo, label: t.v11.hero.photo },
                null,
                { src: h.pattern, label: t.v11.hero.pattern },
              ].map((c, i) =>
                c ? (
                  <figure key={i} className="card overflow-hidden p-1.5 !shadow-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.src} alt={c.label} className="block aspect-square w-full rounded-[14px] object-cover" />
                    <figcaption className="font-display py-2 text-center text-base sm:text-lg">{c.label}</figcaption>
                  </figure>
                ) : (
                  <ArrowRight key={i} className="h-6 w-6 text-[var(--fg)] sm:h-8 sm:w-8" aria-hidden />
                ),
              )}
            </div>
            <div className="card mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 !shadow-none sm:px-5 lg:flex-nowrap">
              <span className="font-display whitespace-nowrap text-base sm:border-r sm:border-[var(--border)] sm:pr-4 sm:text-lg">{t.v11.hero.list}</span>
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:flex-nowrap lg:gap-x-2.5">
                {h.list.map((l) => (
                  <li key={l.color} className="flex items-center gap-1 whitespace-nowrap text-sm font-bold">
                    <span className="h-5 w-5 rounded-md border border-black/15" style={{ background: l.color }} />×{l.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const t = useT()
  const icons = [ImageIcon, LayoutGrid, ClipboardList]
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
      <ul className="grid gap-4 sm:grid-cols-3 sm:gap-0">
        {t.v11.features.map((f, i) => {
          const Icon = icons[i]
          return (
            <li key={f} className={`flex items-center justify-center gap-4 ${i > 0 ? 'sm:border-l sm:border-[var(--border)]' : ''}`}>
              <Icon className="h-9 w-9 shrink-0 text-[var(--accent)]" strokeWidth={1.6} aria-hidden />
              <span className="font-display text-lg">{f}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Inspiration() {
  const t = useT()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-14 sm:px-6">
      <div className="flex items-center justify-center gap-4">
        <PixelBits className="hidden w-9 sm:block" />
        <h2 className="font-display text-center text-3xl sm:text-4xl">{t.v11.inspo.title}</h2>
        <PixelBits className="hidden w-7 sm:block" flip />
      </div>
      <ul className="mt-8 grid gap-5 sm:grid-cols-3">
        {V11_INSPO.map((p) => (
          <li key={p.id} className="card overflow-hidden p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={t.v11.inspo.names[p.id]} className="block aspect-[868/456] w-full rounded-[14px] object-cover" />
            <p className="font-display px-2 pb-1 pt-2 text-center">{t.v11.inspo.names[p.id]}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-center">
        <Link href={v11Href('/create/')} className="inline-flex items-center gap-1 font-bold text-[var(--accent)] underline decoration-2 underline-offset-4">
          {t.v11.inspo.cta} <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </p>
    </section>
  )
}

function Steps() {
  const t = useT()
  const [size, setSize] = useState(1)
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
      <h2 className="font-display text-center text-3xl sm:text-4xl">
        {t.v11.steps.title1}
        <span className="text-[var(--accent)]">{t.v11.steps.title2}</span>
      </h2>
      <ol className="mt-8 grid gap-5 sm:grid-cols-3">
        {t.v11.steps.items.map((s, i) => (
          <li key={s.title} className="card p-6">
            <span className="font-display text-4xl text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
            <p className="font-display mt-2 text-lg">{s.title}</p>
            {i === 1 ? (
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={s.title}>
                {V11_TIERS.map((tier, k) => (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={size === k}
                    onClick={() => setSize(k)}
                    className={`rounded-full border-[1.5px] px-3.5 py-1 text-sm font-bold ${size === k ? 'border-[var(--accent-hover)] bg-[var(--accent)] text-white' : 'border-[var(--ink)] bg-[var(--surface)]'}`}
                  >
                    ≈ {v11Size(v11Beads(tier.id, V11_BEAD_SIZE), v11Beads(tier.id, V11_BEAD_SIZE), V11_BEAD_SIZE).cm.split(' × ')[0]} cm
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">{s.body}</p>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Banner() {
  const t = useT()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--blush)] px-6 py-12 text-center">
        <PixelBits className="absolute left-6 top-6 w-9" />
        <PixelBits className="absolute bottom-6 right-8 w-7" flip />
        <h2 className="font-display text-3xl sm:text-4xl">{t.v11.banner.title}</h2>
        <p className="mt-2 text-[var(--muted)]">{t.v11.banner.body}</p>
        <Link href={v11Href('/create/')} className="btn-primary mt-7 h-14 rounded-2xl px-7 text-lg">
          {t.v11.banner.cta} <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

export default function V11Home() {
  return (
    <V11Page>
      <main>
        <Hero />
        <Features />
        <Inspiration />
        <Steps />
        <Banner />
      </main>
    </V11Page>
  )
}
