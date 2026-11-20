import type { Pattern } from '../lib/engine'
import { PALETTE_ID, type BeadSize, type Look, type TierId } from './config'

/** The piece being made / beaded right now. Kept in local storage so it survives restarts. */
export interface Work {
  /** Cropped photo, saved in the mini program's user folder. */
  photo: string | null
  /** Photo width / height (after cropping). */
  aspect: number
  /**
   * When the crop screen wasn't available (dev tools simulator, old WeChat): the width / height to
   * cut from the middle of the photo while generating. null = the photo is already cropped.
   */
  crop: number | null
  beadSize: BeadSize
  removeBg: boolean
  trim: boolean
  tier: TierId
  look: Look
  pattern: Pattern | null
  /** One char per cell, '1' = bead placed. */
  placed: string
  /** Draft on the account this work is saved as (null until saved). */
  draftId: string | null
  name: string
}

const KEY = 'bs-work'

const blank = (): Work => ({
  photo: null,
  aspect: 1,
  crop: null,
  beadSize: '2.6mm',
  removeBg: true,
  trim: true,
  tier: 'small',
  look: 'classic',
  pattern: null,
  placed: '',
  draftId: null,
  name: '',
})

let work: Work | null = null

export function getWork(): Work {
  if (!work) work = { ...blank(), ...(wx.getStorageSync(KEY) || {}) }
  return work!
}

export function setWork(patch: Partial<Work>) {
  work = { ...getWork(), ...patch }
  try {
    wx.setStorageSync(KEY, work)
  } catch {
    // Storage full: keep working in memory.
  }
  return work
}

/** Start over with a new photo. */
export function startWork(photo: string, aspect: number, crop: number | null = null) {
  const prev = getWork()
  return setWork({ ...blank(), beadSize: prev.beadSize, removeBg: prev.removeBg, trim: prev.trim, photo, aspect, crop })
}

/** Make `pattern` the one to bead (resets progress unless it's the same pattern). */
export function applyPattern(pattern: Pattern) {
  const w = getWork()
  const same = w.pattern && w.pattern.cells.length === pattern.cells.length && w.pattern.cells.every((c, i) => c === pattern.cells[i])
  return setWork({ pattern, placed: same ? w.placed : '0'.repeat(pattern.cells.length), ...(same ? {} : { draftId: null }) })
}

/** Draft payload, same shape as the website's drafts (so they open on both). */
export function draftData(w: Work) {
  return {
    photo: null,
    aspectId: '1:1',
    pattern: w.pattern,
    placed: w.placed,
    settings: { paletteId: PALETTE_ID, beadSize: w.beadSize, tier: w.tier, maxColors: 999, detail: 5, dithering: false, style: 'auto', removeBg: w.removeBg, trim: w.trim, look: w.look, iron: 'normal' },
  }
}

export const newDraftId = () => `mp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
