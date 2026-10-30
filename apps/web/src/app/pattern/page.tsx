'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Download, FileDown, Grid3x3, Lightbulb, Settings2, ShoppingBag } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { PatternThumb } from '@/components/PatternThumb'
import { EmailGate } from '@/components/EmailGate'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Stepper, Swatch } from '@/components/ui'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { usePatternData } from '@/lib/usePattern'
import { finishedSize } from '@/lib/pattern'

export default function PatternPage() {
  const t = useT()
  const hydrated = useHydrated()
  const data = usePatternData()
  const photo = useStore((s) => s.photo)
  const beadSize = useStore((s) => s.settings.beadSize)
  const [view, setView] = useState<'pattern' | 'original'>('pattern')
  const [gate, setGate] = useState(false)

  if (!hydrated) return <SiteHeader />
  if (!data)
    return (
      <>
        <SiteHeader />
        <NoPattern />
      </>
    )

  const { pattern, palette, legend, est } = data
  const total = pattern.width * pattern.height
  const fin = finishedSize(pattern.width, pattern.height, beadSize)

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <Stepper step={2} />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight">{t.pattern.title}</h1>
          <Link href="/create/settings/" className="btn-ghost btn-sm">
            <Settings2 className="h-4 w-4" aria-hidden /> {t.pattern.edit}
          </Link>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <section>
            <div className="card p-3">
              <div className="mb-3 max-w-xs">
                <Segmented
                  label="View"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'pattern', label: t.pattern.pattern },
                    { value: 'original', label: t.pattern.original },
                  ]}
                />
              </div>
              <div className="grid place-items-center rounded-2xl bg-[var(--board)] p-2">
                {view === 'pattern' || !photo ? (
                  <PatternThumb pattern={pattern} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Your photo" className="max-h-[70vh] w-full rounded-xl object-contain" />
                )}
              </div>
              <p className="mt-3 flex items-start gap-2 text-xs text-muted">
                <ProtoTag label="Sample" /> {t.pattern.sampleNote}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                [t.pattern.stats.size, `${pattern.width}×${pattern.height}`, `${fin.cm} cm`],
                [t.pattern.stats.beads, total.toLocaleString('en-US'), ''],
                [t.pattern.stats.colors, String(legend.length), ''],
                [t.pattern.stats.difficulty, t.common.difficulty[est.difficulty], ''],
                [t.pattern.stats.time, t.common.minutes(est.minutes), ''],
              ].map(([k, v, sub]) => (
                <div key={k} className="card p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="mt-1 text-lg font-bold">{v}</dd>
                  {sub && <dd className="text-xs text-muted">{sub}</dd>}
                </div>
              ))}
            </dl>
          </section>

          <aside className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Link href="/bead/" className="btn-primary h-14 text-lg">
                <Grid3x3 className="h-5 w-5" aria-hidden /> {t.pattern.beadOnline}
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/lightbox/" className="btn-secondary">
                  <Lightbulb className="h-5 w-5" aria-hidden /> {t.pattern.lightbox}
                </Link>
                <Link href="/kit/" className="btn-secondary">
                  <ShoppingBag className="h-5 w-5" aria-hidden /> {t.pattern.buyKit}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="btn-ghost btn-sm" onClick={() => setGate(true)}>
                  <FileDown className="h-4 w-4" aria-hidden /> {t.pattern.download}
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setGate(true)}>
                  <Download className="h-4 w-4" aria-hidden /> {t.pattern.downloadPng}
                </button>
              </div>
            </div>

            <section className="card p-4">
              <h2 className="font-bold">{t.pattern.legend}</h2>
              <p className="mt-0.5 text-xs text-muted">
                {palette.product} · {t.pattern.specialtyNote}
              </p>
              <ul className="mt-3 divide-y divide-border">
                {legend.map((l) => {
                  const c = palette.colors[l.color]
                  return (
                    <li key={l.color} className="flex items-center gap-3 py-2">
                      <Swatch rgb={c.rgb} number={l.number} />
                      <span className="flex-1">
                        <span className="font-semibold">{c.name}</span>{' '}
                        <span className="font-mono text-xs text-muted">{c.code}</span>
                      </span>
                      <span className="font-mono text-sm tabular-nums">{l.count.toLocaleString('en-US')}</span>
                    </li>
                  )
                })}
              </ul>
            </section>
          </aside>
        </div>
      </main>
      <EmailGate open={gate} onClose={() => setGate(false)} />
      <SiteFooter />
    </>
  )
}
