'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Wand2 } from 'lucide-react'
import { getPalette } from '@picobreads/pattern-engine'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { Swatch } from '@/components/ui'
import { LIBRARY, getLibraryPattern } from '@/config/catalog'
import { PICKING } from '@/config/site'
import { useT } from '@/i18n'
import { boardCount, finishedSize, legendOf } from '@/lib/pattern'
import { useLibraryPattern, useStartFrom } from '@/lib/library'
import { withAllowance } from '@picobreads/pattern-engine'

function Detail() {
  const t = useT()
  const id = useSearchParams().get('id')
  const p = getLibraryPattern(id) ?? LIBRARY[0]
  const { pattern } = useLibraryPattern(p)
  const start = useStartFrom()
  const legend = pattern ? legendOf(pattern) : []
  const palette = pattern ? getPalette(pattern.paletteId) : null
  const fin = pattern ? finishedSize(pattern.width, pattern.height, '5mm') : null

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link href="/beads/patterns/" className="btn-ghost btn-sm -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t.library.back}
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <figure className="card overflow-hidden p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={t.library.names[p.id]} className="aspect-square w-full rounded-xl object-cover" />
            <figcaption className="mt-2 text-center text-xs text-muted">{t.library.design}</figcaption>
          </figure>
          <figure className="card overflow-hidden p-3">
            <div className="grid aspect-square place-items-center rounded-xl bg-surface-2 p-2">{pattern && <Ironed pattern={pattern} />}</div>
            <figcaption className="mt-2 text-center text-xs text-muted">{t.library.finished}</figcaption>
          </figure>
        </div>

        <div>
          <p className="flex flex-wrap gap-2">
            {p.themes.map((th) => (
              <Link key={th} href={`/beads/patterns/?theme=${th}`} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
                {t.themes[th]}
              </Link>
            ))}
            <ProtoTag label={t.common.sample} />
          </p>
          <h1 className="mt-3 font-serif text-4xl">{t.library.names[p.id]}</h1>
          {pattern && fin && (
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                [t.pattern.stats.size, `${pattern.width} × ${pattern.height}`],
                [t.library.finishedSize, `${fin.cm} cm`],
                [t.pattern.stats.colors, String(legend.length)],
                [t.pattern.stats.difficulty, t.common.difficulty[p.difficulty]],
                [t.pattern.stats.beads, (pattern.width * pattern.height).toLocaleString()],
                [t.library.materials, t.library.boards(boardCount(pattern.width, pattern.height))],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-surface-2 p-3">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="mt-0.5 font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {palette && (
            <div className="mt-5">
              <p className="text-sm font-semibold">{t.library.materials}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {legend.map((l) => {
                  const c = palette.colors[l.color]
                  return (
                    <li key={l.color} className="flex items-center gap-1.5 rounded-full border border-border py-1 pl-1 pr-2.5 text-xs" title={c.name}>
                      <Swatch rgb={c.rgb} number={l.number} size={22} />
                      <span className="font-mono">{c.code}</span>
                      <span className="text-muted">×{withAllowance(l.count, PICKING.allowance)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <button type="button" className="btn-primary mt-8 h-14 w-full text-lg" onClick={() => start(p, { kind: 'library', id: p.id })}>
            <Wand2 className="h-5 w-5" aria-hidden /> {t.library.customize}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function PatternDetailPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <Detail />
      </Suspense>
      <SiteFooter />
    </>
  )
}
