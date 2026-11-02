'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { defaultSettings, useStore } from '@/lib/store'
import type { LibraryPattern } from '@/config/catalog'
import { v11Href } from './config'

/** Open a sample design in the v1.1 flow at step 3 (size). */
export function useV11StartFrom() {
  const router = useRouter()
  return useCallback(
    (p: LibraryPattern) => {
      const s = useStore.getState()
      s.setPhoto(p.image, '1:1')
      s.setSettings({ ...defaultSettings, maxColors: p.maxColors })
      s.setSource({ kind: 'library', id: p.id })
      router.push(v11Href('/create/settings/'))
    },
    [router],
  )
}
