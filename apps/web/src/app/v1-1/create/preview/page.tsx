'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, Check, Grid3x3 } from 'lucide-react'
import { getPalette } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { NoPattern } from '@/components/NoPattern'
import { Segmented, Stepper } from '@/components/ui'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { legendOf } from '@/lib/pattern'
import { v11Size } from '@/v11/config'
import { PatternDownload } from '@/v11/PatternDownload'
import { getLibraryPattern } from '@/config/catalog'

export default function PreviewStep() {
  const t = useT()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const photo = useStore((s) => s.photo)
  const iron = useStore((s) => s.settings.iron ?? 'normal')
  const beadSize = useStore((s) => s.settings.beadSize)
  const user = useStore((s) => s.user)
  const source = useStore((s) => s.source)
  const currentDesignId = useStore((s) => s.currentDesignId)
  const designs = useStore((s) => s.designs)
  const [view, setView] = useState<'final' | 'board'>('final')
  const [justSaved, setJustSaved] = useState(false)

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>
  if (!pattern)
    return (
      <V11Page>
        <NoPattern href="/v1-1/create/" />
      </V11Page>
    )

  const fin = v11Size(pattern.width, pattern.height, beadSize)
  const saved = justSaved || !!currentDesignId
  const save = () => {
    const name =
      source.kind === 'library'
        ? t.library.names[source.id]
        : source.kind === 'community'
          ? t.community.posts[source.id]?.title
          : t.account.designName(designs.length + 1)
    useStore.getState().saveDesign(name ?? t.account.designName(designs.length + 1))
    setJustSaved(true)
  }

  return (
    <V11Page>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        <Stepper step={3} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.previewTitle}</h1>
        <p className="mt-2 text-muted">{t.flow.previewBody}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <figure className="card p-3">
            <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo ?? (source.kind !== 'upload' ? getLibraryPattern(source.id)?.image : undefined)}
                alt={t.flow.yourPhoto}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <figcaption className="mt-2 text-center text-sm font-semibold">{t.flow.yourPhoto}</figcaption>
          </figure>
          <figure className="card p-3">
            <div className="grid aspect-square place-items-center rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.12)_0_25%,transparent_0_50%)] bg-[length:20px_20px] p-3">
              <Ironed pattern={pattern} view={view} iron={iron} />
            </div>
            <figcaption className="mt-2 flex justify-center">
              <div className="w-64">
                <Segmented
                  label={t.flow.finished}
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'final', label: t.flow.finished },
                    { value: 'board', label: t.flow.onBoard },
                  ]}
                />
              </div>
            </figcaption>
          </figure>
        </div>

        <p className="mt-4 text-center text-sm text-muted">
          {pattern.width} × {pattern.height} · ≈ {fin.cm} cm ({fin.inch} in) · {t.common.colors(legendOf(pattern).length)} · {getPalette(pattern.paletteId).brand}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <div className="flex flex-wrap gap-2">
            <Link href="/v1-1/create/settings/" className="btn-secondary">
              <ArrowLeft className="h-4 w-4" aria-hidden /> {t.flow.adjust}
            </Link>
            {user ? (
              <button type="button" className="btn-ghost" onClick={save} disabled={saved}>
                {saved ? <Check className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />} {saved ? t.flow.saved : t.flow.save}
              </button>
            ) : (
              <Link href="/v1-1/login/?next=/v1-1/create/preview/" className="btn-ghost" title={t.auth.saveNeedsAccount}>
                <Bookmark className="h-4 w-4" aria-hidden /> {t.flow.save}
              </Link>
            )}
            <Link href="/bead/" className="btn-ghost">
              <Grid3x3 className="h-4 w-4" aria-hidden /> {t.flow.tryOnline}
            </Link>
          </div>
          <Link href="/v1-1/create/product/" className="btn-primary">
            {t.flow.toProduct} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <PatternDownload pattern={pattern} beadSize={beadSize} className="mt-8" />
      </main>
    </V11Page>
  )
}
