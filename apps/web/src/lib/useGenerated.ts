'use client'

import { useEffect, useState } from 'react'
import type { Pattern } from '@picobreads/pattern-engine'
import type { AspectId, TierId } from '@/config/site'
import { generateFromPhoto } from './generate'
import type { Settings } from './store'

/**
 * Live pattern for the given inputs, regenerated (debounced) whenever they change.
 * Keeps showing the previous result while the next one is computed.
 */
export function useGeneratedPattern(
  photo: string | null,
  settings: Settings,
  aspectId: AspectId | number,
  tier: TierId | number = settings.tier,
  enabled = true,
) {
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [busy, setBusy] = useState(false)
  const key = JSON.stringify([photo?.length, photo?.slice(-48), settings, aspectId, tier])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setBusy(true)
    const timer = setTimeout(() => {
      generateFromPhoto(photo, settings, aspectId, tier)
        .then((p) => !cancelled && setPattern(p))
        .catch(() => {})
        .finally(() => !cancelled && setBusy(false))
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled])

  return { pattern, busy }
}
