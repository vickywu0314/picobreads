'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Download, Info, Package, Sparkles } from 'lucide-react'
import { getPalette, withAllowance } from '@picobreads/pattern-engine'
import { V11Page } from '@/v11/Chrome'
import { Ironed } from '@/components/Ironed'
import { NoPattern } from '@/components/NoPattern'
import { Stepper, Swatch } from '@/components/ui'
import { ASSEMBLED_VARIANT_ENABLED, KIT_PALETTE_IDS, PICKING, V11_PALETTE_ID, isKitBrand } from '@/config/site'
import { PRODUCT_FORMS, type ProductForm } from '@/config/catalog'
import { v11Boards, v11Price as priceOf, v11Size, v11Tier } from '@/v11/config'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { generateFromPhoto } from '@/lib/generate'
import { legendOf } from '@/lib/pattern'

const ICONS = { digital: Download, kit: Package, finished: Sparkles }

/**
 * v1.1 step 5: just pick the product form. Everything else was decided at step 3,
 * so below the options we only summarize that pattern and list its materials.
 */
export default function ProductStep() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const pattern = useStore((s) => s.pattern)
  const settings = useStore((s) => s.settings)
  const aspectId = useStore((s) => s.aspectId)
  const photo = useStore((s) => s.photo)
  const draft = useStore((s) => s.draft)
  const [form, setForm] = useState<ProductForm>(draft?.form ?? 'kit')

  if (!hydrated) return <V11Page footer={false}>{null}</V11Page>
  if (!pattern)
    return (
      <V11Page>
        <NoPattern href="/v1-1/create/" />
      </V11Page>
    )

  const palette = getPalette(pattern.paletteId)
  const legend = legendOf(pattern)
  const tier = settings.tier
  const iron = settings.iron ?? 'normal'
  const fin = v11Size(pattern.width, pattern.height)
  const physical = form !== 'digital'
  const sellable = !physical || pattern.paletteId === V11_PALETTE_ID || isKitBrand(pattern.paletteId)
  const available = (f: ProductForm) => f !== 'finished' || ASSEMBLED_VARIANT_ENABLED
  const spare = Math.round(PICKING.allowance * 100)
  const total = pattern.width * pattern.height
  const totalKit = legend.reduce((n, l) => n + withAllowance(l.count, PICKING.allowance), 0)
  const price = (f: ProductForm) => (f === 'digital' ? t.flow.free : `$${priceOf(f, tier)}`)

  const specs: [string, string][] = [
    [t.settings.size, `${t.v11.settings.tierTitle(v11Tier(tier).perSide)} · ${pattern.width} × ${pattern.height}`],
    [t.library.finishedSize, `≈ ${fin.cm} cm (${fin.inch} in)`],
    [t.v11.product.board, `${t.settings.boards(v11Boards(pattern.width, pattern.height))} · ${t.v11.product.boardSpec}`],
    [t.settings.palette, `${palette.brand} ${palette.colors.length}`],
    [t.pattern.stats.colors, String(legend.length)],
    [t.v11.settings.iron, t.v11.settings.irons[iron].title],
  ]

  return (
    <V11Page>
      <main className="container-page py-6">
        <Stepper step={4} />
        <h1 className="mt-6 font-serif text-4xl">{t.flow.productTitle}</h1>

        <div role="radiogroup" aria-label={t.flow.product} className="mt-6 grid gap-3 md:grid-cols-3">
          {PRODUCT_FORMS.map((f) => {
            const Icon = ICONS[f]
            const on = form === f
            const ok = available(f)
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={!ok}
                onClick={() => setForm(f)}
                className={`card relative flex flex-col p-5 text-left transition-transform disabled:opacity-55 ${on ? '-translate-y-1 !border-[var(--accent)] ring-4 ring-[var(--accent)]/30' : 'hover:-translate-y-0.5'}`}
              >
                {!ok && <span className="absolute right-3 top-3 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-muted">{t.flow.unavailable}</span>}
                <Icon className="h-7 w-7 text-accent" aria-hidden />
                <span className="mt-3 font-serif text-xl">{t.flow.forms[f].title}</span>
                <span className="mt-1 flex-1 text-sm text-muted">{t.flow.forms[f].body}</span>
                <span className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-lg font-bold">{price(f)}</span>
                  <span className="text-xs text-muted">{t.flow.forms[f].time}</span>
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-xs text-muted">{t.flow.placeholderPrices}</p>

        {physical && !sellable && (
          <div role="alert" className="mt-6 rounded-2xl border-2 border-warn/40 bg-warn/10 p-4">
            <p className="flex items-center gap-2 font-bold">
              <Info className="h-5 w-5 text-warn" aria-hidden /> {t.kit.unavailableTitle(palette.brand)}
            </p>
            <p className="mt-1 text-sm text-muted">{t.kit.unavailableBody}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {KIT_PALETTE_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={async () => {
                    const s = useStore.getState()
                    s.setSettings({ paletteId: id })
                    s.applyPattern(await generateFromPhoto(photo, { ...settings, paletteId: id, style: 'auto' }, aspectId, pattern.width >= pattern.height ? pattern.width : pattern.height))
                  }}
                >
                  {t.kit.switchTo(getPalette(id).brand)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* What was decided at step 3 */}
        <section className="card mt-8 grid gap-6 p-5 md:grid-cols-[14rem_1fr]">
          <div className="rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.10)_0_25%,transparent_0_50%)] bg-[length:18px_18px] p-2">
            <Ironed pattern={pattern} iron={iron} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">{t.v11.product.yourChoice}</h2>
              <Link href="/v1-1/create/settings/" className="text-sm font-semibold text-accent hover:underline">
                {t.v11.product.edit}
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

        {/* Materials list */}
        <section className="card mt-6 overflow-hidden">
          <div className="px-5 pt-5">
            <h2 className="font-display text-2xl">{t.v11.product.materials}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {t.v11.product.materialsHint(spare)} · {t.v11.product.pegboards(v11Boards(pattern.width, pattern.height))}
            </p>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="border-y-2 border-dashed border-[var(--border)] text-xs text-muted">
              <tr>
                <th className="px-5 py-2 font-semibold">{t.v11.product.cols.color}</th>
                <th className="px-3 py-2 text-right font-semibold">{t.v11.product.cols.beads}</th>
                {physical && <th className="px-5 py-2 text-right font-semibold">{t.v11.product.cols.kit}</th>}
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
                  {t.v11.product.total} · {t.common.colors(legend.length)}
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{total.toLocaleString()}</td>
                {physical && <td className="px-5 py-3 text-right font-mono tabular-nums">{totalKit.toLocaleString()}</td>}
              </tr>
            </tfoot>
          </table>
        </section>

        <div className="sticky bottom-0 z-20 -mx-4 mt-8 flex items-center justify-between gap-4 border-t-2 border-[var(--ink)] bg-[var(--bg)] px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
          <div>
            <p className="font-bold">
              {t.flow.forms[form].title} · {t.v11.settings.tierTitle(v11Tier(tier).perSide)}
            </p>
            <p className="text-sm text-muted">
              {price(form)} · {palette.brand}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!sellable || !available(form)}
            onClick={() => {
              useStore.getState().setDraft({ form, tier, beadSize: settings.beadSize, priceUsd: priceOf(form, tier), pattern })
              router.push('/v1-1/create/confirm/')
            }}
          >
            {t.flow.continue} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </main>
    </V11Page>
  )
}
