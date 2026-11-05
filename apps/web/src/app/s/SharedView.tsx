'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Eye, Grid3x3, Loader2, Upload } from 'lucide-react'
import { beadCount, getPalette, type BeadSize, type Pattern } from '@picobreads/pattern-engine'
import { Ironed } from '@/components/Ironed'
import { Segmented } from '@/components/ui'
import type { IronStyle } from '@/components/bead/ProgressPreview'
import { useT } from '@/i18n'
import { api } from '@/lib/api'
import { css, legendOf } from '@/lib/pattern'
import { useStore } from '@/lib/store'
import { V11Page } from '@/v11/Chrome'
import { v11Size } from '@/v11/config'

interface Shared {
  id: string
  name: string
  author: string
  views: number
  createdAt: number
  pattern: Omit<Pattern, 'id'>
  placed?: string
  beadSize: BeadSize
  iron?: IronStyle
}

/** Public page for a share link: the finished piece, its size and bead list, and ways to make it. */
export function SharedView() {
  const t = useT()
  const sh = t.v11.shared
  const router = useRouter()
  const id = useSearchParams().get('id') ?? ''
  const [data, setData] = useState<Shared | null | 'missing'>(null)
  const [view, setView] = useState<'final' | 'board'>('final')

  useEffect(() => {
    if (!id) return setData('missing')
    api<Shared>(`/shares/${encodeURIComponent(id)}`)
      .then(setData)
      .catch(() => setData('missing'))
  }, [id])

  const beadThis = (d: Shared) => {
    const s = useStore.getState()
    s.setSettings({ beadSize: d.beadSize, paletteId: d.pattern.paletteId, ...(d.iron ? { iron: d.iron } : {}) })
    s.applyPattern({ ...d.pattern, id: `share_${d.id}` })
    router.push('/bead/')
  }

  return (
    <V11Page>
      <main className="container-page py-8">
        {data === null ? (
          <p className="flex items-center gap-2 text-muted">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> {sh.loading}
          </p>
        ) : data === 'missing' ? (
          <div className="card mx-auto max-w-md p-6 text-center">
            <p>{sh.notFound}</p>
            <Link href="/create/" className="btn-primary btn-motion mt-5">
              <Upload className="h-5 w-5" aria-hidden /> {sh.makeMine}
            </Link>
          </div>
        ) : (
          (() => {
            const pattern: Pattern = { ...data.pattern, id: data.id }
            const legend = legendOf(pattern)
            const palette = getPalette(pattern.paletteId)
            return (
              <div className="grid items-start gap-8 md:grid-cols-[1.1fr_1fr]">
                <section className="card p-3">
                  <div className="flex justify-end px-1 pb-3">
                    <div className="w-full max-w-60">
                      <Segmented
                        label={sh.title}
                        value={view}
                        onChange={setView}
                        options={[
                          { value: 'final', label: t.flow.finished },
                          { value: 'board', label: t.flow.onBoard },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-[var(--blush)] p-4">
                    <Ironed pattern={pattern} view={view} iron={data.iron ?? 'normal'} label={data.name} />
                  </div>
                </section>
                <section>
                  <p className="text-sm font-bold uppercase tracking-wide text-[var(--accent)]">{sh.title}</p>
                  <h1 className="font-display mt-1 text-4xl">{data.name}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                    <span>{sh.by(data.author)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" aria-hidden /> {sh.views(data.views)}
                    </span>
                  </p>
                  <p className="mt-4 font-bold">
                    {sh.stats(pattern.width, pattern.height, legend.length, beadCount(pattern))} · ≈ {v11Size(pattern.width, pattern.height, data.beadSize).cm} cm
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" className="btn-primary btn-motion h-12 px-6" onClick={() => beadThis(data)}>
                      <Grid3x3 className="h-5 w-5" aria-hidden /> {sh.beadThis}
                    </button>
                    <Link href="/create/" className="btn-secondary btn-motion h-12 px-6">
                      <Upload className="h-5 w-5" aria-hidden /> {sh.makeMine}
                    </Link>
                  </div>
                  <h2 className="font-display mt-8 text-xl">{sh.list}</h2>
                  <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {legend.map((l) => {
                      const c = palette.colors[l.color]
                      return (
                        <li key={l.color} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm">
                          <span className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/15" style={{ background: css(c.rgb) }} />
                          <span className="font-bold">{c.code}</span>
                          <span className="ml-auto text-muted">×{l.count}</span>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              </div>
            )
          })()
        )}
      </main>
    </V11Page>
  )
}
