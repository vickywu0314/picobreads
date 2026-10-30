'use client'

import { FlaskConical } from 'lucide-react'
import { useT } from '@/i18n'

export function PrototypeBanner() {
  const t = useT()
  return (
    <div className="bg-[#2b2118] px-4 py-1.5 text-center text-xs font-medium text-[#ffd9c7] print:hidden">
      <FlaskConical className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
      {t.common.prototypeBanner}
    </div>
  )
}

/** Inline marker for features that are mocked in the prototype. */
export function ProtoTag({ label }: { label?: string }) {
  const t = useT()
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-dashed border-warn/60 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warn"
      title={t.common.prototypeFake}
    >
      <FlaskConical className="h-3 w-3" aria-hidden />
      {label ?? t.common.prototype}
    </span>
  )
}
