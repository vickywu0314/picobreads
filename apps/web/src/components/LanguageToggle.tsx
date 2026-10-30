'use client'

import { Languages } from 'lucide-react'
import { LOCALES, useLocaleStore, useT } from '@/i18n'

/** Switches between the two UI languages; the choice is remembered on this device. */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const other = LOCALES.find((l) => l.id !== locale)!

  return (
    <button
      type="button"
      onClick={() => setLocale(other.id)}
      lang={other.id}
      aria-label={`${t.common.language}: ${other.label}`}
      title={other.label}
      className={`inline-flex h-11 items-center gap-1 rounded-full px-2.5 text-sm font-semibold hover:bg-surface-2 ${className}`}
    >
      <Languages className="h-4.5 w-4.5" aria-hidden />
      {other.short}
    </button>
  )
}
