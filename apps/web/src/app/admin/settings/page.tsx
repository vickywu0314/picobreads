'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Toggle } from '@/components/ui'
import { PALETTES } from '@picobreads/pattern-engine'
import { ASSEMBLED_VARIANT_ENABLED, FREE_PREVIEWS_PER_DAY, PHOTO_RETENTION_DAYS, PICKING, TIERS, isKitBrand } from '@/config/site'
import { useT } from '@/i18n'

export default function AdminSettingsPage() {
  const t = useT()
  const [saved, setSaved] = useState(false)
  const [assembled, setAssembled] = useState(ASSEMBLED_VARIANT_ENABLED)

  return (
    <form
      className="max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }}
    >
      <h1 className="text-2xl font-bold">{t.admin.settings}</h1>

      <fieldset className="card mt-4 p-5">
        <legend className="sr-only">{t.admin.tiers}</legend>
        <p className="label">{t.admin.tiers}</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {TIERS.map((tier) => (
            <label key={tier.id} className="block">
              <span className="text-xs text-muted">{t.tiers[tier.id]}</span>
              <input type="number" min={10} max={200} defaultValue={tier.longSide} className="input mt-1" />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="card mt-4 p-5">
        <legend className="sr-only">{t.admin.kitBrands}</legend>
        <p className="label">{t.admin.kitBrands}</p>
        <p className="text-xs text-muted">{t.admin.kitBrandsHint}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {PALETTES.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={isKitBrand(p.id)} className="h-5 w-5 accent-[var(--accent)]" />
              {p.brand}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="card mt-4 grid gap-4 p-5 sm:grid-cols-2">
        <label className="block">
          <span className="label">{t.admin.allowance}</span>
          <input type="number" min={0} max={50} defaultValue={PICKING.allowance * 100} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t.admin.packSizes}</span>
          <input type="text" defaultValue={PICKING.packSizes.join(', ')} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t.admin.dailyLimit}</span>
          <input type="number" min={1} defaultValue={FREE_PREVIEWS_PER_DAY} className="input mt-1.5" />
        </label>
        <label className="block">
          <span className="label">{t.admin.retention}</span>
          <input type="number" min={1} defaultValue={PHOTO_RETENTION_DAYS} className="input mt-1.5" />
        </label>
        <div className="flex items-center justify-between gap-4 sm:col-span-2">
          <span className="label">{t.admin.assembled}</span>
          <Toggle label={t.admin.assembled} checked={assembled} onChange={setAssembled} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button type="submit" className="btn-primary">
          {t.common.save}
        </button>
        {saved && (
          <span role="status" className="flex items-center gap-1.5 text-sm text-ok">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> {t.admin.settingsSaved}
          </span>
        )}
      </div>
    </form>
  )
}
