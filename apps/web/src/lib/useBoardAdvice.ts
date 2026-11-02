'use client'

import { useEffect, useState } from 'react'
import { recommendBoards } from '@picobreads/pattern-engine'
import { SAMPLE_PHOTO_URL, photoPixels } from './generate'

const cache = new Map<string, number>()

/**
 * How many boards per side the picture needs to stay clear (1 → one board, 2 → 2 × 2 …),
 * from recommendBoards in the engine. `null` while it is being worked out.
 */
export function useBoardAdvice(photo: string | null, aspect: number, pegs: number, maxPerSide: number, enabled = true) {
  const src = photo ?? SAMPLE_PHOTO_URL
  const key = `${src.length}:${src.slice(-48)}:${aspect.toFixed(3)}:${pegs}:${maxPerSide}`
  const [advice, setAdvice] = useState<{ key: string; perSide: number } | null>(null)

  useEffect(() => {
    if (!enabled) return
    const known = cache.get(key)
    if (known) {
      setAdvice({ key, perSide: known })
      return
    }
    let cancelled = false
    // The check compares each candidate grid with one twice as fine, so sample at 2× the largest grid.
    const long = (pegs * maxPerSide * 2) / 8 // photoPixels samples 8 px per cell
    const gw = aspect >= 1 ? long : Math.max(1, Math.round(long * aspect))
    const gh = aspect >= 1 ? Math.max(1, Math.round(long / aspect)) : long
    photoPixels(src, Math.ceil(gw), Math.ceil(gh))
      .then((img) => {
        const { perSide } = recommendBoards(img, pegs, aspect, maxPerSide)
        cache.set(key, perSide)
        if (!cancelled) setAdvice({ key, perSide })
      })
      .catch(() => !cancelled && setAdvice({ key, perSide: 1 }))
    return () => {
      cancelled = true
    }
  }, [key, src, aspect, pegs, maxPerSide, enabled])

  return advice?.key === key ? advice.perSide : null
}
