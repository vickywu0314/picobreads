'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Eye, Palette, Ruler, Sparkles } from 'lucide-react'
import { useT } from '@/i18n'
import { V11Page } from '@/v11/Chrome'
import { V11_HERO, V11_PICKS, V11_TIERS, v11Href } from '@/v11/config'
import { useV11StartFrom } from '@/v11/start'
import { useToast } from '@/v11/Toast'

/** Four-point sparkle used as decoration. */
function Spark({ className = '', color = 'var(--sun)' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <path d="M17 2h6v13h13v6H23v13h-6V21H4v-6h13z" fill={color} />
    </svg>
  )
}

function Hero() {
  const t = useT()
  const h = V11_HERO
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-10 pt-4 sm:px-6 md:grid-cols-[1fr_1.05fr] md:pt-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--ink)] bg-white px-4 py-1.5 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-[var(--accent)]" aria-hidden /> {t.v11.hero.tag}
        </span>
        <h1 className="font-display mt-6 text-5xl leading-[1.15] sm:text-6xl">
          {t.v11.hero.title1}
          <br />
          {t.v11.hero.title2pre}
          <span className="text-[var(--accent)]">{t.v11.hero.title2}</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--muted)]">{t.v11.hero.body}</p>
        <Link href={v11Href('/create/')} className="btn-primary mt-8 h-14 rounded-2xl px-7 text-lg">
          {t.v11.hero.cta} <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
        <p className="mt-5 flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          {[t.v11.hero.check1, t.v11.hero.check2].map((c) => (
            <span key={c} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[var(--accent)]" aria-hidden /> {c}
            </span>
          ))}
        </p>
      </div>

      {/* Photo → pattern, laid out like the design (cards overlap in the same places). */}
      <div className="mx-auto w-full max-w-[500px]">
        <p className="font-display mb-2 text-center text-xl">
          {t.v11.hero.photoToPattern[0]} <span className="text-[var(--accent)]">→ {t.v11.hero.photoToPattern[1]}</span>
        </p>
        <div className="relative aspect-[50/44] w-full">
          <div className="ink-card absolute left-[1%] top-[2%] w-[42%] -rotate-6 overflow-hidden p-[1.6%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.photo} alt={t.v11.hero.photoToPattern[0]} className="block w-full rounded-[12px]" />
          </div>
          <div className="ink-card absolute left-[40%] top-[1%] w-[54%] rotate-[4deg] p-[1.6%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={h.pattern} alt={t.v11.hero.photoToPattern[1]} className="block w-full rounded-[12px]" />
            <p className="mt-1.5 flex justify-between px-1 text-xs text-[var(--muted)] sm:text-sm">
              <span>{h.size}</span>
              <span>{t.v11.hero.colors(h.colors)}</span>
            </p>
          </div>
          <span className="absolute left-[42.6%] top-[37%] grid aspect-square w-[9%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--accent)] text-white">
            <ArrowRight className="h-1/2 w-1/2" aria-hidden />
          </span>
          <Spark className="absolute right-[1%] top-[-3%] w-[9%]" />
          <div className="ink-card absolute left-[6%] top-[49%] w-[56%] -rotate-3 px-[3.5%] py-[3%]">
            <p className="text-[11px] text-[var(--muted)] sm:text-xs">{t.v11.hero.list(h.colors, h.beads)}</p>
            <ul className="mt-1.5 space-y-1 sm:space-y-1.5">
              {h.list.map((l) => (
                <li key={l.code} className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/25 sm:h-4 sm:w-4" style={{ background: l.color }} />
                  <span className="font-semibold">{l.code}</span>
                  <span className="ml-auto text-[var(--muted)]">{t.v11.hero.beads(l.count)}</span>
                </li>
              ))}
            </ul>
            <Link href={v11Href('/create/')} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] sm:text-xs">
              {t.v11.hero.more(h.colors - h.list.length)} <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const t = useT()
  const icons = [
    { Icon: Eye, bg: '#fde0ea', fg: 'var(--accent)' },
    { Icon: Ruler, bg: '#fff1c2', fg: '#c58a00' },
    { Icon: Palette, bg: '#dff0fb', fg: '#3b8fd0' },
  ]
  return (
    <section className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-4 rounded-[22px] border-2 border-[var(--ink)] bg-white px-6 py-5 sm:grid-cols-3 sm:gap-0">
        {t.v11.features.map((f, i) => {
          const { Icon, bg, fg } = icons[i]
          return (
            <div key={f.title} className={`flex items-center gap-4 ${i > 0 ? 'sm:border-l-2 sm:border-dashed sm:border-[var(--border)] sm:pl-6' : ''}`}>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: bg, color: fg }}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-semibold">{f.title}</span>
                <span className="block text-sm text-[var(--muted)]">{f.body}</span>
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function PickCard({ p, tilt }: { p: (typeof V11_PICKS)[number]; tilt: string }) {
  const t = useT()
  const start = useV11StartFrom()
  const { w, h, colors, beads } = p.stats
  return (
    <button type="button" onClick={() => start(p)} className={`ink-card group block p-4 text-left transition-transform hover:-translate-y-1 ${tilt}`}>
      <div className="overflow-hidden rounded-[16px]" style={{ background: p.tint }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={t.v11.picks.names[p.id]} className="block aspect-square w-full object-cover" />
      </div>
      <p className="font-display mt-3 text-xl">{t.v11.picks.names[p.id]}</p>
      <p className="mt-0.5 text-sm text-[var(--muted)]">{t.v11.picks.stats(w, h, colors, beads)}</p>
    </button>
  )
}

function Picks() {
  const t = useT()
  const toast = useToast((s) => s.show)
  const tilts = ['-rotate-2', 'rotate-1', 'rotate-2']
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl">
            {t.v11.picks.title1}
            <span className="text-[var(--accent)]">{t.v11.picks.title2}</span>
          </h2>
          <p className="mt-1 text-[var(--muted)]">{t.v11.picks.body}</p>
        </div>
        <button type="button" onClick={() => toast(t.v11.comingSoon)} className="flex items-center gap-1 font-semibold underline decoration-2 underline-offset-4">
          {t.v11.picks.more} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {V11_PICKS.map((p, i) => (
          <PickCard key={p.id} p={p} tilt={tilts[i]} />
        ))}
      </div>
    </section>
  )
}

function Steps() {
  const t = useT()
  const [size, setSize] = useState(1)
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
      <h2 className="font-display text-center text-3xl sm:text-4xl">
        {t.v11.steps.title1}
        <span className="text-[var(--accent)]">{t.v11.steps.title2}</span>
      </h2>
      <ol className="mt-8 grid gap-5 sm:grid-cols-3">
        {t.v11.steps.items.map((s, i) => (
          <li key={s.title} className="rounded-[22px] border-2 border-[var(--ink)] bg-white p-6">
            <span className="font-pixel text-5xl font-semibold text-[var(--accent)]">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-3 text-lg font-semibold">{s.title}</p>
            {i === 1 ? (
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={s.title}>
                {V11_TIERS.map((tier, k) => (
                  <button
                    key={tier.id}
                    type="button"
                    role="radio"
                    aria-checked={size === k}
                    onClick={() => setSize(k)}
                    className={`rounded-full border-2 border-[var(--ink)] px-3.5 py-1 text-sm ${size === k ? 'bg-[var(--accent)] text-white' : 'bg-white'}`}
                  >
                    {tier.longSide}×{tier.longSide}
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
      <div className="relative overflow-hidden rounded-[26px] border-2 border-[var(--ink)] bg-[var(--accent)] px-6 py-12 text-center text-white shadow-[6px_6px_0_var(--ink)]">
        <Spark className="absolute left-8 top-6 h-12 w-12" />
        <Spark className="absolute bottom-6 right-10 h-9 w-9" color="#ffffff" />
        <h2 className="font-display text-3xl sm:text-4xl">{t.v11.banner.title}</h2>
        <p className="mt-2 opacity-90">{t.v11.banner.body}</p>
        <Link href={v11Href('/create/')} className="btn-secondary mt-7 h-13 rounded-2xl px-7 text-lg text-[var(--fg)]">
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
        <Picks />
        <Steps />
        <Banner />
      </main>
    </V11Page>
  )
}
