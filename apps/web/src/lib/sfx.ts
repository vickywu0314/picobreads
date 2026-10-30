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

function tone(freq: number, endFreq: number, ms: number, gain: number, type: OscillatorType = 'triangle') {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx ??= new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(endFreq, t + ms / 1000)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000)
  osc.connect(g).connect(ctx.destination)
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
