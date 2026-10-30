'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useT } from '@/i18n'

type Mode = 'light' | 'dark' | 'system'

function apply(mode: Mode) {
  const dark = mode === 'dark' || (mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.dataset.theme = dark ? 'dark' : 'light'
}

export function ThemeToggle() {
  const t = useT()
  const [mode, setMode] = useState<Mode>('system')

  useEffect(() => {
    try {
      setMode((localStorage.getItem('pb-theme') as Mode) || 'system')
    } catch {}
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      let m: Mode = 'system'
      try {
        m = (localStorage.getItem('pb-theme') as Mode) || 'system'
      } catch {}
      if (m === 'system') apply('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const next: Record<Mode, Mode> = { system: 'light', light: 'dark', dark: 'system' }
  const Icon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Monitor

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={`${t.common.theme.label}: ${t.common.theme[mode]}`}
      title={`${t.common.theme.label}: ${t.common.theme[mode]}`}
      onClick={() => {
        const m = next[mode]
        setMode(m)
        try {
          localStorage.setItem('pb-theme', m)
        } catch {}
        apply(m)
      }}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  )
}
