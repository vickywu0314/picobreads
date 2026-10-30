'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { LIBRARY, THEMES, type Difficulty, type LibraryPattern } from '@/config/catalog'
import { TIERS, type TierId } from '@/config/site'
import { useT } from '@/i18n'
import { useLibraryPattern } from '@/lib/library'

function Card({ p }: { p: LibraryPattern }) {
  const t = useT()
  const { pattern } = useLibraryPattern(p)
  const tier = TIERS.find((x) => x.id === p.tier)!
  return (
    <Link href={`/beads/patterns/detail/?id=${p.id}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="bg-surface-2 p-4">
        {pattern ? <Ironed pattern={pattern} /> : <div className="aspect-square animate-pulse rounded-xl bg-surface" />}
      </div>
      <div className="p-4">
        <h2 className="font-serif text-lg">{t.library.names[p.id]}</h2>
        <p className="mt-1 text-xs text-muted">
          {tier.longSide} × {tier.longSide} · {t.common.difficulty[p.difficulty]}
        </p>
      </div>
    </Link>
  )
}

function Chips<T extends string>({ label, value, options, onChange }: { label: string; value: T | null; options: { v: T; l: string }[]; onChange: (v: T | null) => void }) {
  const t = useT()
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="w-20 shrink-0 text-sm font-semibold">{label}</span>
      {[{ v: null as T | null, l: t.library.all }, ...options].map((o) => (
        <button
          key={o.v ?? 'all'}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className={`h-9 rounded-full border px-3.5 text-sm font-medium ${value === o.v ? 'border-accent bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg'}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}

function Library() {
  const t = useT()
  const params = useSearchParams()
  const router = useRouter()
  const theme = params.get('theme') as (typeof THEMES)[number] | null
  const size = params.get('size') as TierId | null
  const diff = params.get('difficulty') as Difficulty | null
  const set = (k: string, v: string | null) => {
    const q = new URLSearchParams(params.toString())
    if (v) q.set(k, v)
    else q.delete(k)
    router.replace(`/beads/patterns/${q.size ? `?${q}` : ''}`, { scroll: false })
  }
  const list = LIBRARY.filter((p) => (!theme || p.themes.includes(theme)) && (!size || p.tier === size) && (!diff || p.difficulty === diff))

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-serif text-4xl">{t.library.title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{t.library.body}</p>
      <p className="mt-2 flex items-center gap-2 text-xs text-muted">
        <ProtoTag label={t.common.sample} /> {t.library.sampleNote}
      </p>

      <div className="card mt-6 flex flex-col gap-3 p-4">
        <Chips label={t.library.theme} value={theme} options={THEMES.map((v) => ({ v, l: t.themes[v] }))} onChange={(v) => set('theme', v)} />
        <Chips label={t.library.size} value={size} options={TIERS.map((x) => ({ v: x.id, l: `${t.tiers[x.id]} ${x.longSide}` }))} onChange={(v) => set('size', v)} />
        <Chips
          label={t.library.difficulty}
          value={diff}
          options={(['easy', 'medium', 'hard'] as const).map((v) => ({ v, l: t.common.difficulty[v] }))}
          onChange={(v) => set('difficulty', v)}
        />
      </div>

      <p className="mt-6 text-sm text-muted">{t.library.count(list.length)}</p>
      {list.length === 0 ? (
        <div className="card mt-3 p-10 text-center text-muted">
          {t.library.empty}{' '}
          <button type="button" className="font-semibold text-accent underline" onClick={() => router.replace('/beads/patterns/')}>
            {t.library.clear}
          </button>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {list.map((p) => (
            <Card key={p.id} p={p} />
          ))}
        </div>
      )}
    </main>
  )
}

export default function PatternsPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <Library />
      </Suspense>
      <SiteFooter />
    </>
  )
}
