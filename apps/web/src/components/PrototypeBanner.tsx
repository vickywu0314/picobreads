'use client'

import { FlaskConical } from 'lucide-react'
import { useT } from '@/i18n'

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
