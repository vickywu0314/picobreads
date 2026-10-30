'use client'

import { create } from 'zustand'
import { enUS, type Messages } from './en-US'
import { zhCN } from './zh-CN'

export type Locale = 'en-US' | 'zh-CN'

export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: 'en-US', label: 'English', short: 'EN' },
  { id: 'zh-CN', label: '简体中文', short: '中文' },
]

const messages: Record<Locale, Messages> = { 'en-US': enUS, 'zh-CN': zhCN }

export const LOCALE_KEY = 'pb-locale'

/**
 * Saved choice first, otherwise the first browser language we support.
 * Keep in sync with `localeScript` in app/layout.tsx.
 */
export function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_KEY)
    if (saved === 'en-US' || saved === 'zh-CN') return saved
  } catch {}
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const l of langs) {
    const v = (l || '').toLowerCase()
    if (v.startsWith('zh')) return 'zh-CN'
    if (v.startsWith('en')) return 'en-US'
  }
  return 'en-US'
}

interface LocaleState {
  locale: Locale
  /** True once the browser locale has been applied (after hydration). */
  ready: boolean
  setLocale: (l: Locale, persist?: boolean) => void
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: 'en-US',
  ready: false,
  setLocale: (locale, persist = true) => {
    if (persist) {
      try {
        localStorage.setItem(LOCALE_KEY, locale)
      } catch {}
    }
    document.documentElement.lang = locale
    set({ locale, ready: true })
  },
}))

export function useT(): Messages {
  return messages[useLocaleStore((s) => s.locale)]
}

export function useLocale() {
  return useLocaleStore((s) => s.locale)
}
