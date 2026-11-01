'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FlaskConical } from 'lucide-react'
import { useT } from '@/i18n'

export function PrototypeBanner() {
  const t = useT()
  const v11 = usePathname()?.startsWith('/v1-1')
  const pill = (on: boolean) => `rounded-full px-2 py-px ${on ? 'bg-[#ffd9c7] text-[#2b2118]' : 'underline-offset-2 hover:underline'}`
  return (
    <div className="flex h-7 items-center justify-center gap-3 bg-[#2b2118] px-4 text-xs font-medium text-[#ffd9c7] print:hidden">
      <span className="truncate">
        <FlaskConical className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
        {t.common.prototypeBanner}
      </span>
      {/* Version switch: v1.0 lives at the root, v1.1 under /v1-1. */}
      <span className="flex shrink-0 items-center gap-1">
        <Link href="/" className={pill(!v11)}>
          v1.0
        </Link>
        <Link href="/v1-1/" className={pill(!!v11)}>
          v1.1
        </Link>
      </span>
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
