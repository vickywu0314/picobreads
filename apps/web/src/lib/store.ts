'use client'

import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { DEFAULT_PALETTE_ID, type BeadSize, type Pattern } from '@picobreads/pattern-engine'
import { ASPECTS, COLOR_LIMITS, getTier, gridSize, type AspectId, type TierId } from '@/config/site'
import { generateSamplePattern } from '@/mock/samplePattern'

export interface Settings {
  paletteId: string
  beadSize: BeadSize
  tier: TierId
  maxColors: number
  detail: number
  dithering: boolean
}

export interface CartItem {
  id: string
  tier: TierId
  beadSize: BeadSize
  priceUsd: number
  qty: number
  pattern: Pattern
}

type UndoAction =
  | { kind: 'placed'; changes: { i: number; prev: '0' | '1' }[] }
  | { kind: 'recolor'; i: number; prev: number }

interface State {
  photo: string | null
  aspectId: AspectId
  settings: Settings
  pattern: Pattern | null
  /** One char per cell: '1' = bead placed. */
  placed: string
  activeColor: number | null
  activeSection: string | null
  /** Light box calibration: screen CSS pixels per millimetre. */
  pxPerMm: number | null
  cart: CartItem[]
  previews: { day: string; used: number }
  undoStack: UndoAction[]

  setPhoto: (photo: string | null, aspectId?: AspectId) => void
  setSettings: (s: Partial<Settings>) => void
  generate: () => void
  setActiveColor: (c: number | null) => void
  setActiveSection: (id: string | null) => void
  setPlaced: (indices: number[], value: boolean) => void
  recolor: (i: number, color: number) => void
  undo: () => void
  resetProgress: () => void
  setPxPerMm: (v: number) => void
  addToCart: (item: Omit<CartItem, 'id' | 'qty'>) => void
  setQty: (id: string, qty: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      // Quota or private mode: keep working in memory.
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {}
  },
}

export const defaultSettings: Settings = {
  paletteId: DEFAULT_PALETTE_ID,
  beadSize: '5mm',
  tier: 'standard',
  maxColors: COLOR_LIMITS.default,
  detail: 3,
  dithering: false,
}

export const aspectValue = (id: AspectId) => ASPECTS.find((a) => a.id === id)?.value ?? 1

export function buildPattern(settings: Settings, aspectId: AspectId, tier: TierId = settings.tier): Pattern {
  const { width, height } = gridSize(tier, aspectValue(aspectId))
  return generateSamplePattern({ ...settings, width, height })
}

const today = () => new Date().toISOString().slice(0, 10)

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      photo: null,
      aspectId: '1:1',
      settings: defaultSettings,
      pattern: null,
      placed: '',
      activeColor: null,
      activeSection: null,
      pxPerMm: null,
      cart: [],
      previews: { day: today(), used: 0 },
      undoStack: [],

      setPhoto: (photo, aspectId) => set((s) => ({ photo, aspectId: aspectId ?? s.aspectId })),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      generate: () => {
        const { settings, aspectId, previews } = get()
        const pattern = buildPattern(settings, aspectId)
        const used = previews.day === today() ? previews.used + 1 : 1
        set({
          pattern,
          placed: '0'.repeat(pattern.cells.length),
          activeColor: null,
          activeSection: null,
          undoStack: [],
          previews: { day: today(), used },
        })
      },
      setActiveColor: (activeColor) => set({ activeColor }),
      setActiveSection: (activeSection) => set({ activeSection }),
      setPlaced: (indices, value) => {
        const { placed, undoStack } = get()
        const chars = placed.split('')
        const v = value ? '1' : '0'
        const changes: { i: number; prev: '0' | '1' }[] = []
        for (const i of indices) {
          if (chars[i] !== v) {
            changes.push({ i, prev: chars[i] as '0' | '1' })
            chars[i] = v
          }
        }
        if (!changes.length) return
        set({ placed: chars.join(''), undoStack: [...undoStack.slice(-199), { kind: 'placed', changes }] })
      },
      recolor: (i, color) => {
        const { pattern, undoStack } = get()
        if (!pattern || pattern.cells[i] === color) return
        const cells = pattern.cells.slice()
        const prev = cells[i]
        cells[i] = color
        set({ pattern: { ...pattern, cells }, undoStack: [...undoStack.slice(-199), { kind: 'recolor', i, prev }] })
      },
      undo: () => {
        const { undoStack, placed, pattern } = get()
        const last = undoStack[undoStack.length - 1]
        if (!last) return
        const rest = undoStack.slice(0, -1)
        if (last.kind === 'placed') {
          const chars = placed.split('')
          for (const c of last.changes) chars[c.i] = c.prev
          set({ placed: chars.join(''), undoStack: rest })
        } else if (pattern) {
          const cells = pattern.cells.slice()
          cells[last.i] = last.prev
          set({ pattern: { ...pattern, cells }, undoStack: rest })
        }
      },
      resetProgress: () => {
        const { pattern } = get()
        set({ placed: pattern ? '0'.repeat(pattern.cells.length) : '', undoStack: [] })
      },
      setPxPerMm: (pxPerMm) => set({ pxPerMm }),
      addToCart: (item) =>
        set((s) => ({ cart: [...s.cart, { ...item, id: Math.random().toString(36).slice(2, 9), qty: 1 }] })),
      setQty: (id, qty) => set((s) => ({ cart: s.cart.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)) })),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'picobreads-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ undoStack: _u, ...rest }) => {
        const out: Partial<State> = {}
        for (const [k, v] of Object.entries(rest)) if (typeof v !== 'function') (out as Record<string, unknown>)[k] = v
        return out
      },
    },
  ),
)

/** True once persisted state has loaded (avoids flashing empty states). */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true))
    setHydrated(useStore.persist.hasHydrated())
    return unsub
  }, [])
  return hydrated
}

export function previewsLeft(previews: State['previews'], perDay: number) {
  return Math.max(0, perDay - (previews.day === today() ? previews.used : 0))
}

export { getTier }
