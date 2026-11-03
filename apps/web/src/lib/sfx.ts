'use client'

// Tiny synthesized sound effects (no audio files). Muted state is remembered per device.

const KEY = 'pb-sound'
let ctx: AudioContext | null = null

export function isMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(KEY, muted ? 'off' : 'on')
  } catch {}
}

function audio(): AudioContext | null {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx ??= new AC()
  return ctx
}

/**
 * Phones (iOS Safari, WeChat, most Android browsers) only let a page start audio inside a tap.
 * Our first sounds play later (from timers and animations), so the audio stayed locked on phones.
 * Unlock it on the first touch anywhere: resume the context and play one silent sample.
 */
function unlockOnFirstTouch() {
  const unlock = () => {
    try {
      const c = audio()
      if (!c) return
      if (c.state === 'suspended') void c.resume()
      const src = c.createBufferSource()
      src.buffer = c.createBuffer(1, 1, 22050)
      src.connect(c.destination)
      src.start(0)
      if (c.state === 'running') {
        window.removeEventListener('pointerdown', unlock, true)
        window.removeEventListener('touchend', unlock, true)
      }
    } catch {}
  }
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('touchend', unlock, true)
}

if (typeof window !== 'undefined') unlockOnFirstTouch()

function tone(freq: number, endFreq: number, ms: number, gain: number, type: OscillatorType = 'triangle') {
  const c = audio()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + ms / 1000)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + ms / 1000 + 0.02)
}

/** drop: bead lands on a peg · string: bead slides onto the pen · pick: tweezers grab · miss: wrong spot */
export function sfx(kind: 'drop' | 'string' | 'pick' | 'miss') {
  if (typeof window === 'undefined' || isMuted()) return
  try {
    if (kind === 'drop') tone(1500 + Math.random() * 300, 700, 55, 0.12)
    else if (kind === 'string') tone(2600 + Math.random() * 400, 2200, 22, 0.05, 'sine')
    else if (kind === 'pick') tone(900, 1300, 40, 0.08)
    else tone(220, 160, 90, 0.05, 'square')
  } catch {}
}

export function buzz(ms: number) {
  try {
    navigator.vibrate?.(ms)
  } catch {}
}
