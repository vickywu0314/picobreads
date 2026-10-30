/// <reference lib="webworker" />
import { generatePattern, getPalette } from '@picobreads/pattern-engine'
import type { GenerateRequest, GenerateResponse } from '@/lib/generate'

// Runs the pattern engine off the main thread so the UI never freezes.
self.onmessage = (e: MessageEvent<GenerateRequest>) => {
  const { id, pixels, width, height, opts } = e.data
  try {
    const r = generatePattern({ data: pixels, width, height }, { ...opts, palette: getPalette(opts.paletteId) })
    self.postMessage({ id, cells: r.cells } satisfies GenerateResponse)
  } catch (err) {
    self.postMessage({ id, error: String(err) } satisfies GenerateResponse)
  }
}
