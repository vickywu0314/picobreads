'use client'

import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Rgb } from '@picobreads/pattern-engine'
import { css, onColor } from '@/lib/pattern'
import { useT } from '@/i18n'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const t = useT()
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,28rem)] rounded-3xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/50"
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button type="button" className="icon-btn -m-2" onClick={onClose} aria-label={t.common.close}>
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

export function Swatch({ rgb, number, size = 28, done }: { rgb: Rgb; number?: number; size?: number; done?: boolean }) {
  return (
    <span
      aria-hidden
      className="relative inline-grid shrink-0 place-items-center rounded-full text-[11px] font-bold ring-1 ring-black/15"
      style={{ background: css(rgb), color: onColor(rgb), width: size, height: size }}
    >
      {done ? '✓' : number}
    </span>
  )
}

export function Stepper({ step }: { step: 0 | 1 | 2 }) {
  const t = useT()
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold text-muted" aria-label="Progress">
      {t.create.steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2" aria-current={i === step ? 'step' : undefined}>
          <span
            className={`grid h-6 w-6 place-items-center rounded-full ${
              i <= step ? 'bg-accent text-accent-fg' : 'bg-surface-2 text-muted'
            }`}
          >
            {i + 1}
          </span>
          <span className={i === step ? 'text-fg' : ''}>{s}</span>
          {i < 2 && <span className="h-px w-5 bg-border" aria-hidden />}
        </li>
      ))}
    </ol>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: React.ReactNode }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full rounded-full bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`h-10 flex-1 rounded-full px-3 text-sm font-semibold transition-colors ${
            value === o.value ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-border'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`}
      />
    </button>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-2"
    >
      <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  )
}
