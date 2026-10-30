'use client'

import { useEffect } from 'react'
import { detectLocale, useLocaleStore } from '@/i18n'

/** Applies the browser / saved locale after hydration, then reveals the page. */
export function LocaleSync() {
  const ready = useLocaleStore((s) => s.ready)

  useEffect(() => {
    useLocaleStore.getState().setLocale(detectLocale(), false)
  }, [])

  // Runs after the re-render in the new locale, so there is no flash of English.
  useEffect(() => {
    if (ready) document.documentElement.removeAttribute('data-locale-pending')
  }, [ready])

  return null
}
