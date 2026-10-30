'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import type { LibraryPattern } from '@/config/catalog'
import { defaultSettings, useStore, type DesignSource } from './store'
import { useGeneratedPattern } from './useGenerated'

/** Settings a library design is shown with by default. */
export const librarySettings = (p: LibraryPattern) => ({
  ...defaultSettings,
  tier: p.tier,
  maxColors: p.maxColors,
  style: 'illustration' as const,
})

/** Generated (real engine) pattern for a library design. */
export function useLibraryPattern(p: LibraryPattern | undefined, tier = p?.tier) {
  return useGeneratedPattern(p?.image ?? null, p ? librarySettings(p) : defaultSettings, '1:1', tier, !!p)
}

/** "Customize this pattern" / "Make one like this": load the design and jump to step 3 (size). */
export function useStartFrom() {
  const router = useRouter()
  return useCallback(
    (p: LibraryPattern, source: DesignSource) => {
      const s = useStore.getState()
      s.setPhoto(p.image, '1:1')
      s.setSettings(librarySettings(p))
      s.setSource(source)
      router.push('/create/settings/')
    },
    [router],
  )
}
