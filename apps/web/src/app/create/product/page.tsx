'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ChevronDown, Download, FileArchive, Grid3x3, Loader2, LogIn, Package, ShoppingBag, Sparkles } from 'lucide-react'
import { beadCount, getPalette, withAllowance, type Pattern } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { NoPattern } from '@/components/NoPattern'
import { Stepper, Swatch } from '@/components/ui'
import { PICKING } from '@/config/site'
import { PRODUCT_FORMS, type ProductForm } from '@/config/catalog'
import { v11BoardGrid, v11BoardPegs, v11Boards, v11Size } from '@/v11/config'
import { downloadAllSheets, useSheetPages } from '@/v11/PatternDownload'
import { useT } from '@/i18n'
import { useHydrated, useStore, type Settings } from '@/lib/store'
import { legendOf } from '@/lib/pattern'

const ICONS = { digital: Download, kit: Package, finished: Sparkles }

/** Forms that can't be bought yet: shown with a "coming soon" mark and a disabled order button. */
const COMING_SOON: ProductForm[] = ['kit', 'finished']

/**
 * v1.1 step 4. First only the three options; picking one shows the pattern summary, the
 * (collapsed) materials list and that option's buttons.
 */
export default function ProductStep() {
  const t = useT()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const settings = useStore((s) => s.settings)
  const user = useStore((s) => s.user)
  const [form, setForm] = useState<ProductForm | null>(null)

  // "Download pattern" on the Customize step (and the return from sign-in) opens with the pattern option picked.
  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get('form')
    // Forms that aren't open yet can't be picked, not even from a link.
    if (f && (PRODUCT_FORMS as readonly string[]).includes(f) && !COMING_SOON.includes(f as ProductForm)) setForm(f as ProductForm)
  }, [])

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>
  if (!pattern)
    return (
      <V11Page>
        <NoPattern href="/create/" />
      </V11Page>
    )

  return <ProductBody pat={pattern} settings={settings} form={form} setForm={setForm} signedIn={!!user} />
}

function ProductBody({ pat, settings, form, setForm, signedIn }: { pat: Pattern; settings: Settings; form: ProductForm | null; setForm: (f: ProductForm) => void; signedIn: boolean }) {
  const t = useT()
  const p = t.v11.product
  const [busy, setBusy] = useState(false)
  const pages = useSheetPages(pat, settings.beadSize)
  const palette = getPalette(pat.paletteId)
  const legend = legendOf(pat)
  const iron = settings.iron ?? 'normal'
  const bead = settings.beadSize
  const fin = v11Size(pat.width, pat.height, bead)
  const grid = v11BoardGrid(pat.width, pat.height, bead)
  const physical = form !== null && form !== 'digital'
  const spare = Math.round(PICKING.allowance * 100)
  const total = beadCount(pat)
  const totalKit = legend.reduce((n, l) => n + withAllowance(l.count, PICKING.allowance), 0)

  const specs: [string, string][] = [
    [t.settings.size, `${t.v11.settings.boardsTitle(grid.cols, grid.rows)} · ${pat.width} × ${pat.height}`],
    [t.library.finishedSize, `≈ ${fin.cm} cm (${fin.inch} in)`],
    [p.board, `${t.settings.boards(grid.n)} · ${p.boardSpec(bead)}`],
    [t.settings.beadSize, t.v11.settings.beads[bead].title],
    [t.settings.palette, `${palette.brand} ${palette.colors.length}`],
    [t.pattern.stats.colors, String(legend.length)],
    [t.v11.settings.iron, t.v11.settings.irons[iron].title],
  ]

  const download = async () => {
    setBusy(true)
    await new Promise((r) => setTimeout(r, 30))
    try {
      await downloadAllSheets(pages, pat)
    } finally {
      setBusy(false)
    }
  }

  return (
    <V11Page>
      <main className="container-page py-6">
        <Stepper step={3} steps={t.v11.flowSteps} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.productTitle}</h1>

        <div role="radiogroup" aria-label={t.flow.product} className="mt-6 grid gap-3 md:grid-cols-3">
          {PRODUCT_FORMS.map((f) => {
            const Icon = ICONS[f]
            const on = form === f
            const soon = COMING_SOON.includes(f)
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                aria-disabled={soon || undefined}
                disabled={soon}
                onClick={() => !soon && setForm(f)}
                className={`card relative flex flex-col overflow-hidden p-5 text-left transition-transform ${soon ? 'cursor-not-allowed' : on ? '-translate-y-1 !border-[var(--accent)] ring-4 ring-[var(--accent)]/30' : 'hover:-translate-y-0.5'}`}
              >
                {/* Not open yet: a grey veil over the card (the "coming soon" tag stays readable on top). */}
                {soon && <span aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-[#e9e4e2]/70 backdrop-grayscale" />}
                {soon && (
                  <span className="absolute right-0 top-4 z-20 rounded-l-full border-2 border-r-0 border-[var(--ink)] bg-[var(--sun)] px-3 py-0.5 text-xs font-bold text-[var(--ink)]">
                    {p.comingSoon}
                  </span>
                )}
                <Icon className="h-7 w-7 text-accent" aria-hidden />
                <span className="mt-3 font-serif text-xl">{p.forms[f].title}</span>
                <span className="mt-1 flex-1 text-sm text-muted">{p.forms[f].body}</span>
                <span className="mt-3 flex items-center justify-between text-sm">
                  {/* Prices aren't decided: only the free pattern shows one. */}
                  <span className="text-lg font-bold">{f === 'digital' ? t.flow.free : ''}</span>
                  <span className="text-xs text-muted">{f === 'digital' ? p.digitalTime : p.comingSoonHint}</span>
                </span>
              </button>
            )
          })}
        </div>

        {form && (
          <>
            {/* The pattern decided on the Customize step */}
            <section className="card mt-8 grid gap-6 p-5 md:grid-cols-[14rem_1fr]">
              <div className="rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.10)_0_25%,transparent_0_50%)] bg-[length:18px_18px] p-2">
                <Ironed pattern={pat} iron={iron} />
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-2xl">{p.yourChoice}</h2>
                  <Link href="/create/settings/" className="text-sm font-semibold text-accent hover:underline">
                    {p.edit}
                  </Link>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                  {specs.map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-surface-2 px-3 py-2">
                      <dt className="text-xs text-muted">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            {/* Materials list, collapsed by default */}
            <details className="card group mt-6 overflow-hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span>
                  <span className="font-display block text-2xl">{p.materials}</span>
                  <span className="text-sm text-muted">
                    {t.common.colors(legend.length)} · {t.v11.custom.beads(total)} · {p.pegboards(v11Boards(pat.width, pat.height, bead), v11BoardPegs(bead))}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
                  <span className="group-open:hidden">{p.expand}</span>
                  <span className="hidden group-open:inline">{p.collapse}</span>
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                </span>
              </summary>
              <p className="px-5 text-sm text-muted">{p.materialsHint(spare)}</p>
              <table className="mt-3 w-full text-left text-sm">
                <thead className="border-y-2 border-dashed border-[var(--border)] text-xs text-muted">
                  <tr>
                    <th className="px-5 py-2 font-semibold">{p.cols.color}</th>
                    <th className="px-3 py-2 text-right font-semibold">{p.cols.beads}</th>
                    {physical && <th className="px-5 py-2 text-right font-semibold">{p.cols.kit}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {legend.map((l) => {
                    const c = palette.colors[l.color]
                    return (
                      <tr key={l.color}>
                        <td className="px-5 py-2">
                          <span className="flex items-center gap-2.5">
                            <Swatch rgb={c.rgb} number={l.number} size={24} />
                            <span className="font-mono font-semibold">{c.code}</span>
                            <span className="truncate text-muted">{c.name}</span>
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono tabular-nums">{l.count.toLocaleString()}</td>
                        {physical && <td className="px-5 py-2 text-right font-mono tabular-nums">{withAllowance(l.count, PICKING.allowance).toLocaleString()}</td>}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="border-t-2 border-dashed border-[var(--border)] font-bold">
                  <tr>
                    <td className="px-5 py-3">
                      {p.total} · {t.common.colors(legend.length)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{total.toLocaleString()}</td>
                    {physical && <td className="px-5 py-3 text-right font-mono tabular-nums">{totalKit.toLocaleString()}</td>}
                  </tr>
                </tfoot>
              </table>
            </details>
          </>
        )}

        <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex flex-wrap items-center justify-between gap-3 border-t-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
          <Link href="/create/settings/" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t.common.back}
          </Link>
          {form && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link href="/bead/" className="btn-secondary">
                <Grid3x3 className="h-4 w-4" aria-hidden /> {p.tryOnline}
              </Link>
              {form === 'digital' ? (
                signedIn ? (
                  <button type="button" className="btn-primary" disabled={busy} onClick={download}>
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <FileArchive className="h-5 w-5" aria-hidden />} {p.downloadAll}
                  </button>
                ) : (
                  <Link href={`/login/?next=${encodeURIComponent('/create/product/?form=digital')}`} className="btn-primary">
                    <LogIn className="h-5 w-5" aria-hidden /> {p.signInToDownload}
                  </Link>
                )
              ) : (
                <button type="button" className="btn-primary !border-[#b9adb2] !bg-[#ddd5d8] !text-[#7a6a70] !opacity-100 !shadow-none" disabled title={p.comingSoon}>
                  <ShoppingBag className="h-5 w-5" aria-hidden /> {p.order}
                </button>
              )}
            </div>
          )}
        </div>
        {form === 'digital' && <p className="mt-2 text-right text-xs text-muted">{t.v11.download.includes}</p>}
      </main>
    </V11Page>
  )
}
