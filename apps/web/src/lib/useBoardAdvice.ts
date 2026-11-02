'use client'

import { useEffect, useState } from 'react'
import { recommendBoards } from '@picobreads/pattern-engine'
import { SAMPLE_PHOTO_URL, photoPixels } from './generate'

export interface BoardAdviceResult {
  /** detailLoss of the picture at 1, 2 … boards per side (see recommendBoards). */
  imageLosses: number[]
  /** Share of the frame the subject takes (1 when there is no plain backdrop). */
  subjectShare: number
}

const cache = new Map<string, BoardAdviceResult>()

/** Picture-side measures for choosing the board count; `null` while they are being worked out. */
export function useBoardAdvice(photo: string | null, aspect: number, pegs: number, maxPerSide: number, enabled = true, trim = false): BoardAdviceResult | null {
  const src = photo ?? SAMPLE_PHOTO_URL
  const key = `${src.length}:${src.slice(-48)}:${aspect.toFixed(3)}:${pegs}:${maxPerSide}:${trim}`
  const [advice, setAdvice] = useState<{ key: string; result: BoardAdviceResult } | null>(null)

  useEffect(() => {
    if (!enabled) return
    const known = cache.get(key)
    if (known) {
      setAdvice({ key, result: known })
      return
    }
    let cancelled = false
    // The check compares each candidate grid with one twice as fine, so sample at 2× the largest grid.
    const long = (pegs * maxPerSide * 2) / 8 // photoPixels samples 8 px per cell
    const gw = aspect >= 1 ? long : Math.max(1, Math.round(long * aspect))
    const gh = aspect >= 1 ? Math.max(1, Math.round(long / aspect)) : long
    photoPixels(src, Math.ceil(gw), Math.ceil(gh), trim)
      .then((img) => {
        // maxLoss 0 → measure every candidate; the page combines them with the generated patterns.
        const { losses, subjectShare } = recommendBoards(img, pegs, aspect, maxPerSide, 0)
        const result = { imageLosses: losses, subjectShare }
        cache.set(key, result)
        if (!cancelled) setAdvice({ key, result })
      })
      .catch(() => !cancelled && setAdvice({ key, result: { imageLosses: [], subjectShare: 1 } }))
    return () => {
      cancelled = true
    }
  }, [key, src, aspect, pegs, maxPerSide, enabled, trim])

  return advice?.key === key ? advice.result : null
}
