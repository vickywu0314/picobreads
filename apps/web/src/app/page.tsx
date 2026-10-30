'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight, Grid3x3, Lightbulb, Lock, Package } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { PatternThumb } from '@/components/PatternThumb'
import { useT } from '@/i18n'
import { buildPattern, defaultSettings } from '@/lib/store'

export default function HomePage() {
  const t = useT()
  // Deterministic-looking hero sample (same settings every visit).
  const sample = useMemo(() => buildPattern({ ...defaultSettings, maxColors: 20, detail: 4 }, '1:1'), [])
  const featureIcons = [Grid3x3, Lightbulb, Package]

  return (
    <>
      <SiteHeader />
      <main>
        <section className="container-page grid items-center gap-10 pb-12 pt-8 md:grid-cols-[1.1fr_1fr] md:pt-16">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-accent">{t.home.eyebrow}</p>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">{t.home.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted">{t.home.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create/" className="btn-primary h-14 px-7 text-lg">
                {t.home.cta} <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a href="#how" className="btn-secondary h-14 px-6">
                {t.home.ctaSecondary}
              </a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" aria-hidden /> {t.home.freeNote} {t.common.privacyLine}
            </p>
          </div>
          <figure className="card relative mx-auto w-full max-w-md rotate-1 p-4 shadow-xl">
            <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--board)] p-2">
              <PatternThumb pattern={sample} label={t.home.sampleAria} />
            </div>
            <figcaption className="mt-3 text-center text-sm text-muted">{t.home.sampleCaption}</figcaption>
          </figure>
        </section>

        <section id="how" className="container-page scroll-mt-20 py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t.home.stepsTitle}</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.home.steps.map((s, i) => (
              <li key={s.title} className="card p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-bold text-accent">{i + 1}</span>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="container-page py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">{t.home.featuresTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {t.home.features.map((f, i) => {
              const Icon = featureIcons[i]
              return (
                <div key={f.title} className="card p-6">
                  <Icon className="h-7 w-7 text-accent" aria-hidden />
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-muted">{f.body}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="container-page py-12">
          <div className="card flex flex-col items-start gap-4 bg-accent-soft p-8 sm:flex-row sm:items-center">
            <Lock className="h-10 w-10 shrink-0 text-accent" aria-hidden />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{t.home.privacyTitle}</h2>
              <p className="mt-1 text-muted">{t.home.privacyBody}</p>
            </div>
            <Link href="/create/" className="btn-primary">
              {t.home.cta}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
