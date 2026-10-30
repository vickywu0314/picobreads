'use client'

import { generatePattern, getPalette, type Pattern } from '@picobreads/pattern-engine'
import { gridSize, type AspectId, type TierId } from '@/config/site'
import { aspectValue, type Settings } from './store'

export const SAMPLE_PHOTO_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/sample-cat.jpg`

export interface GenerateRequest {
  id: number
  pixels: Uint8ClampedArray
  width: number
  height: number
  opts: {
    paletteId: string
    width: number
    height: number
    maxColors: number
    detail: number
    dithering: boolean
    style: 'auto' | 'illustration' | 'photo'
  }
}

export type GenerateResponse = { id: number; cells: number[]; error?: undefined } | { id: number; error: string; cells?: undefined }

// Source pixels per bead edge when sampling the photo; plenty for area averaging.
const SAMPLES_PER_BEAD = 8

let worker: Worker | null = null
let workerFailed = false
let nextId = 1
const pending = new Map<number, { resolve: (c: number[]) => void; reject: (e: Error) => void }>()

function getWorker(): Worker | null {
  if (workerFailed || typeof Worker === 'undefined') return null
  if (!worker) {
    try {
      worker = new Worker(new URL('../workers/pattern.worker.ts', import.meta.url))
      worker.onmessage = (e: MessageEvent<GenerateResponse>) => {
        const p = pending.get(e.data.id)
        if (!p) return
        pending.delete(e.data.id)
        if (e.data.cells) p.resolve(e.data.cells)
        else p.reject(new Error(e.data.error))
      }
      worker.onerror = () => {
        workerFailed = true
        pending.forEach((p) => p.reject(new Error('worker failed')))
        pending.clear()
        worker = null
      }
    } catch {
      workerFailed = true
      return null
    }
  }
  return worker
}

const pixelCache = new Map<string, Promise<ImageData>>()

/** Decode the (already cropped) photo and scale it to roughly SAMPLES_PER_BEAD px per bead. */
export function photoPixels(photo: string, gridW: number, gridH: number): Promise<ImageData> {
  const key = `${photo.length}:${photo.slice(-64)}:${gridW}x${gridH}`
  let p = pixelCache.get(key)
  if (!p) {
    p = (async () => {
      const img = new Image()
      img.src = photo
      await img.decode()
      const w = Math.min(img.naturalWidth, gridW * SAMPLES_PER_BEAD)
      const h = Math.min(img.naturalHeight, gridH * SAMPLES_PER_BEAD)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, w, h)
      return ctx.getImageData(0, 0, w, h)
    })()
    if (pixelCache.size > 12) pixelCache.clear()
    pixelCache.set(key, p)
  }
  return p
}

/** Generate a real pattern from the photo (in a Web Worker when available). */
export async function generateFromPhoto(
  photo: string | null,
  settings: Settings,
  /** A crop preset, or a raw width / height ratio. */
  aspectId: AspectId | number,
  tier: TierId = settings.tier,
): Promise<Pattern> {
  const { width, height } = gridSize(tier, typeof aspectId === 'number' ? aspectId : aspectValue(aspectId))
  const img = await photoPixels(photo ?? SAMPLE_PHOTO_URL, width, height)
  const opts = {
    paletteId: settings.paletteId,
    width,
    height,
    maxColors: settings.maxColors,
    detail: settings.detail,
    dithering: settings.dithering,
    style: settings.style ?? 'auto',
  }
  const w = getWorker()
  let cells: number[]
  if (w) {
    const id = nextId++
    const pixels = new Uint8ClampedArray(img.data) // copy: the cached ImageData stays usable
    cells = await new Promise<number[]>((resolve, reject) => {
      pending.set(id, { resolve, reject })
      w.postMessage({ id, pixels, width: img.width, height: img.height, opts } satisfies GenerateRequest, [pixels.buffer])
    }).catch(() => generatePattern(img, { ...opts, palette: getPalette(opts.paletteId) }).cells)
  } else {
    cells = generatePattern(img, { ...opts, palette: getPalette(opts.paletteId) }).cells
  }
  return { id: `pat_${Math.random().toString(36).slice(2, 10)}`, paletteId: settings.paletteId, width, height, cells }
}
