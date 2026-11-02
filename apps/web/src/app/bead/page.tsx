'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCheck, ChevronRight, Cloud, Eye, Lightbulb, Maximize, Minus, Plus, RotateCcw, Save, Undo2, Volume2, VolumeX } from 'lucide-react'
import { beadCount, regularColorIndices, sectionCellIndices } from '@picobreads/pattern-engine'
import { PatternCanvas, type PatternCanvasHandle, type ToolPointerEvent } from '@/components/PatternCanvas'
import { NoPattern } from '@/components/NoPattern'
import { Modal, ProgressBar, Swatch } from '@/components/ui'
import { BeadTray } from '@/components/bead/BeadTray'
import { ToolLayer, useToolLayer, type Flight } from '@/components/bead/ToolLayer'
import { MiniPreview, ProgressPreview } from '@/components/bead/ProgressPreview'
import { PEN_CAPACITY, ToolIcon, type ToolId } from '@/components/bead/tools'
import { boardCellsFor } from '@/config/site'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { usePatternData } from '@/lib/usePattern'
import { css } from '@/lib/pattern'
import { buzz, isMuted, setMuted, sfx } from '@/lib/sfx'
import { isV11Flow } from '@/lib/flow'

type Pt = { x: number; y: number }

const TOOL_KEY = 'pb-tool'
// With a finger the tool tip sits up-left of the touch point, so the hand never hides the target.
const TOUCH_TIP_OFFSET = { x: -34, y: -52 }
const STRING_INTERVAL_MS = 80

export default function BeadPage() {
  const t = useT()
  const hydrated = useHydrated()
  const data = usePatternData()
  const placed = useStore((s) => s.placed)
  const beadSize = useStore((s) => s.settings.beadSize)
  const activeColor = useStore((s) => s.activeColor)
  const activeSection = useStore((s) => s.activeSection)
  const canUndo = useStore((s) => s.undoStack.length > 0)
  const { setActiveColor, setActiveSection, setPlaced, recolor, undo, resetProgress } = useStore.getState()

  const canvas = useRef<PatternCanvasHandle>(null)
  const [tool, setToolState] = useState<ToolId>('pen')
  const [load, setLoadState] = useState<{ color: number | null; count: number }>({ color: null, count: 0 })
  const [toast, setToast] = useState<string | null>(null)
  // Opened from v1.1: back goes to its Customize step, and drafts can be saved to the account.
  const [v11, setV11] = useState(false)
  useEffect(() => setV11(isV11Flow()), [])
  const router = useRouter()
  const saveDraft = () => {
    const s = useStore.getState()
    if (!s.user) {
      router.push(`/v1-1/login/?next=${encodeURIComponent('/bead/')}`)
      return
    }
    const mine = s.designs.filter((d) => !d.owner || d.owner === s.user!.email)
    s.saveDesign(t.v11.draft.name(mine.length + 1))
    setToast(t.v11.draft.saved)
  }
  const [fixCell, setFixCell] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [muted, setMutedState] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Refs mirror state for the pointer handlers (they run many times per frame).
  const loadRef = useRef(load)
  const toolRef = useRef(tool)
  const pending = useRef(new Set<number>())
  const gesture = useRef<{ active: boolean; last: Pt | null; lastCell: number; stringing: number | null; hideTimer: number | null; lastMiss: number }>({
    active: false,
    last: null,
    lastCell: -1,
    stringing: null,
    hideTimer: null,
    lastMiss: 0,
  })

  const setLoad = useCallback((l: { color: number | null; count: number }) => {
    loadRef.current = l
    setLoadState(l)
  }, [])
  const setTool = useCallback((id: ToolId) => {
    toolRef.current = id
    setToolState(id)
    try {
      localStorage.setItem(TOOL_KEY, id)
    } catch {}
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOOL_KEY) as ToolId | null
      if (saved && ['pen', 'tweezers', 'hand', 'fix'].includes(saved)) setTool(saved)
    } catch {}
    setMutedState(isMuted())
  }, [setTool])

  const section = data?.sections.find((s) => s.id === activeSection) ?? null
  const sectionRef = useRef(section)
  sectionRef.current = section

  // Progress per color (optionally limited to the active section).
  const progress = useMemo(() => {
    if (!data) return null
    const { pattern } = data
    const total = new Map<number, number>()
    const done = new Map<number, number>()
    let placedAll = 0
    for (let i = 0; i < pattern.cells.length; i++) {
      const x = i % pattern.width
      const y = Math.floor(i / pattern.width)
      const inSec = !section || (x >= section.x && x < section.x + section.w && y >= section.y && y < section.y + section.h)
      const on = placed[i] === '1'
      if (on) placedAll++
      if (!inSec) continue
      const c = pattern.cells[i]
      if (c < 0) continue
      total.set(c, (total.get(c) ?? 0) + 1)
      if (on) done.set(c, (done.get(c) ?? 0) + 1)
    }
    return { total, done, placedAll, all: beadCount(pattern) }
  }, [data, placed, section])

  // Celebrate once when the last bead goes in.
  const wasDone = useRef(true)
  useEffect(() => {
    if (!progress) return
    const isDone = progress.placedAll === progress.all
    if (isDone && !wasDone.current) setFinished(true)
    wasDone.current = isDone
  }, [progress])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(id)
  }, [toast])

  // ---- tool mechanics -------------------------------------------------------

  const inSection = (i: number) => {
    const s = sectionRef.current
    if (!s || !data) return true
    const x = i % data.pattern.width
    const y = Math.floor(i / data.pattern.width)
    return x >= s.x && x < s.x + s.w && y >= s.y && y < s.y + s.h
  }

  /** Can a bead of the loaded color go into cell i right now? */
  const canPlace = (i: number) => {
    const { pattern, placed: p } = useStore.getState()
    const l = loadRef.current
    return !!pattern && l.color !== null && pattern.cells[i] === l.color && p[i] !== '1' && !pending.current.has(i) && inSection(i)
  }

  const tipOf = (e: { clientX: number; clientY: number; pointerType: string }): Pt =>
    e.pointerType === 'mouse' ? { x: e.clientX, y: e.clientY } : { x: e.clientX + TOUCH_TIP_OFFSET.x, y: e.clientY + TOUCH_TIP_OFFSET.y }

  const updateRing = (tip: Pt) => {
    const i = canvas.current?.cellAt(tip.x, tip.y) ?? -1
    if (i < 0) return useToolLayer.setState({ ring: null })
    const r = canvas.current!.cellRect(i)
    useToolLayer.setState({ ring: { ...r, ok: canPlace(i) } })
  }

  const stopStringing = () => {
    if (gesture.current.stringing !== null) clearInterval(gesture.current.stringing)
    gesture.current.stringing = null
  }

  const startStringing = (color: number) => {
    stopStringing()
    if (loadRef.current.color !== color) setLoad({ color, count: 0 })
    setActiveColor(color)
    const step = () => {
      const l = loadRef.current
      if (l.count >= PEN_CAPACITY) {
        stopStringing()
        buzz(15)
        return
      }
      setLoad({ color, count: l.count + 1 })
      sfx('string')
    }
    step()
    gesture.current.stringing = window.setInterval(step, STRING_INTERVAL_MS)
  }

  /** Slide one bead off the tool into cell i (animated; committed on landing). */
  const launch = (i: number, from: Pt) => {
    const l = loadRef.current
    if (!data || l.color === null) return
    pending.current.add(i)
    const left = l.count - 1
    setLoad({ color: l.color, count: left })
    const flight: Flight = { id: Math.random(), cell: i, from, to: canvas.current!.cellRect(i), color: data.palette.colors[l.color].rgb }
    useToolLayer.setState((s) => ({ flights: [...s.flights, flight] }))
    if (left === 0 && toolRef.current === 'pen') setToast(t.editor.penEmpty)
  }

  const onLand = useCallback(
    (f: Flight) => {
      pending.current.delete(f.cell)
      useToolLayer.setState((s) => ({ flights: s.flights.filter((x) => x.id !== f.id) }))
      setPlaced([f.cell], true)
      sfx('drop')
      buzz(6)
    },
    [setPlaced],
  )

  /** Pen: drop a bead wherever the tip passes over a matching empty spot. */
  const penAt = (tip: Pt) => {
    const i = canvas.current?.cellAt(tip.x, tip.y) ?? -1
    if (i < 0 || i === gesture.current.lastCell) return
    gesture.current.lastCell = i
    if (loadRef.current.count <= 0) return
    if (canPlace(i)) launch(i, tip)
    else {
      const { pattern, placed: p } = useStore.getState()
      if (pattern && p[i] !== '1' && pattern.cells[i] !== loadRef.current.color && Date.now() - gesture.current.lastMiss > 350) {
        gesture.current.lastMiss = Date.now()
        sfx('miss')
      }
    }
  }

  /** Pen sweep: sample along the segment so fast strokes don't skip cells. */
  const penSweep = (from: Pt, to: Pt) => {
    const size = canvas.current ? Math.max(2, canvas.current.cellRect(0).size * 0.4) : 4
    const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / size))
    for (let k = 1; k <= steps; k++) penAt({ x: from.x + ((to.x - from.x) * k) / steps, y: from.y + ((to.y - from.y) * k) / steps })
  }

  const overTray = (e: { clientX: number; clientY: number }) =>
    (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest('[data-well]') as HTMLElement | null

  const showTool = (tip: Pt, pressed: boolean) => {
    if (gesture.current.hideTimer) clearTimeout(gesture.current.hideTimer)
    useToolLayer.setState({ tip, visible: true, pressed })
    updateRing(tip)
  }

  const hideToolSoon = (pointerType: string) => {
    if (pointerType === 'mouse') return
    gesture.current.hideTimer = window.setTimeout(() => useToolLayer.setState({ visible: false, ring: null }), 900)
  }

  const pointerDown = (e: { clientX: number; clientY: number; pointerType: string }, wellColor?: number) => {
    if (!data) return
    const tip = tipOf(e)
    const g = gesture.current
    g.active = true
    g.last = tip
    g.lastCell = -1
    showTool(tip, true)
    const tl = toolRef.current

    if (wellColor !== undefined) {
      if (tl === 'pen') startStringing(wellColor)
      else if (tl === 'tweezers') {
        const l = loadRef.current
        if (!(l.color === wellColor && l.count > 0)) {
          setLoad({ color: wellColor, count: 1 })
          setActiveColor(wellColor)
          sfx('pick')
        }
      }
      return
    }

    if (tl === 'pen') penAt(tip)
    else if (tl === 'tweezers' && loadRef.current.count === 0) {
      // Empty tweezers on a placed bead: take it back out.
      const i = canvas.current?.cellAt(tip.x, tip.y) ?? -1
      const { pattern, placed: p } = useStore.getState()
      if (i >= 0 && pattern && p[i] === '1' && inSection(i)) {
        setPlaced([i], false)
        setLoad({ color: pattern.cells[i], count: 1 })
        setActiveColor(pattern.cells[i])
        sfx('pick')
        buzz(8)
      }
    }
  }

  const pointerMove = (e: { clientX: number; clientY: number; pointerType: string }) => {
    const tip = tipOf(e)
    const g = gesture.current
    showTool(tip, g.active)
    if (!g.active) return
    if (g.stringing !== null) {
      // Keep stringing only while the finger stays on the same well.
      const well = overTray(e)
      if (!well || Number(well.dataset.well) !== loadRef.current.color) stopStringing()
    }
    if (toolRef.current === 'pen' && g.last) penSweep(g.last, tip)
    g.last = tip
  }

  const pointerUp = (e: { clientX: number; clientY: number; pointerType: string }, cancelled = false) => {
    const tip = tipOf(e)
    const g = gesture.current
    stopStringing()
    g.active = false
    useToolLayer.setState({ pressed: false })
    if (!cancelled && toolRef.current === 'tweezers' && loadRef.current.count > 0) {
      const i = canvas.current?.cellAt(tip.x, tip.y) ?? -1
      if (i >= 0 && canPlace(i)) launch(i, tip)
      else if (overTray(e)) setLoad({ color: loadRef.current.color, count: 0 })
      else if (i >= 0) sfx('miss')
    }
    hideToolSoon(e.pointerType)
  }

  const onTool = (e: ToolPointerEvent) => {
    if (e.type === 'down') pointerDown(e)
    else if (e.type === 'move') pointerMove(e)
    else if (e.type === 'up') pointerUp(e)
    else if (e.type === 'cancel') pointerUp(e, true)
    else if (e.type === 'hover') showTool(tipOf(e), false)
    else if (e.type === 'leave') useToolLayer.setState({ visible: false, ring: null })
  }

  const onWellPointer = (type: 'down' | 'move' | 'up' | 'cancel', color: number, e: React.PointerEvent) => {
    if (type === 'down') {
      if (toolRef.current === 'hand' || toolRef.current === 'fix') setTool('pen')
      pointerDown(e, color)
    } else if (type === 'move') pointerMove(e)
    else pointerUp(e, type === 'cancel')
  }

  useEffect(() => () => stopStringing(), [])

  if (!hydrated) return null
  if (!data || !progress) return <NoPattern />

  const { pattern, palette, legend, numbers, sections } = data
  const wells = legend
    .filter((l) => progress.total.has(l.color))
    .map((l) => ({ color: l.color, number: l.number, left: (progress.total.get(l.color) ?? 0) - (progress.done.get(l.color) ?? 0) }))
  const focusColor = load.color ?? activeColor
  const focus = focusColor !== null ? palette.colors[focusColor] : null
  const focusTotal = focusColor !== null ? (progress.total.get(focusColor) ?? 0) : 0
  const focusDone = focusColor !== null ? (progress.done.get(focusColor) ?? 0) : 0
  const toolActive = tool === 'pen' || tool === 'tweezers'

  const nextSection = () => {
    const idx = sections.findIndex((s) => s.id === activeSection)
    setActiveSection(sections[(idx + 1) % sections.length].id)
  }

  const toolStatus =
    tool === 'pen'
      ? load.count > 0
        ? t.editor.penLoad(load.count, PEN_CAPACITY)
        : t.editor.penEmptyState
      : tool === 'tweezers'
        ? load.count > 0 && load.color !== null
          ? t.editor.holding(palette.colors[load.color].name)
          : t.editor.tweezersEmpty
        : null

  return (
    <div className="flex h-[calc(100dvh-1.75rem)] flex-col md:flex-row">
      {/* Board */}
      <div className="relative min-h-0 flex-1">
        <PatternCanvas
          ref={canvas}
          pattern={pattern}
          palette={palette}
          numbers={numbers}
          placed={placed}
          selected={tool === 'fix' ? null : focusColor}
          section={section}
          boardCells={boardCellsFor(pattern.paletteId, beadSize)}
          editMode={tool === 'fix'}
          toolMode={toolActive}
          onTool={onTool}
          onCellTap={(i) => tool === 'fix' && setFixCell(i)}
          label={t.common.patternAria(pattern.width, pattern.height)}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-surface/90 p-1 shadow backdrop-blur">
            <Link href={v11 ? '/v1-1/create/settings/' : '/pattern/'} className="icon-btn" aria-label={t.common.back}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
            <span className="pr-1 text-sm font-bold">{t.editor.title}</span>
            {v11 && (
              <button
                type="button"
                onClick={saveDraft}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-bold"
              >
                <Save className="h-4 w-4" aria-hidden /> {t.v11.draft.save}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="ml-1 inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3 text-sm font-bold text-accent-fg"
            >
              <Eye className="h-4 w-4" aria-hidden /> {t.editor.preview.open}
            </button>
          </div>
          <div className="pointer-events-auto flex items-center gap-0.5 rounded-full bg-surface/90 p-1 shadow backdrop-blur">
            <button type="button" className="icon-btn" onClick={undo} disabled={!canUndo} aria-label={t.editor.undo}>
              <Undo2 className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn hidden sm:inline-flex" onClick={() => canvas.current?.zoomOut()} aria-label={t.editor.zoomOut}>
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn hidden sm:inline-flex" onClick={() => canvas.current?.zoomIn()} aria-label={t.editor.zoomIn}>
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn" onClick={() => canvas.current?.fit()} aria-label={t.editor.fit}>
              <Maximize className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <MiniPreview
          pattern={pattern}
          palette={palette}
          placed={placed}
          onOpen={() => setPreviewOpen(true)}
          className="absolute bottom-2 left-2"
        />
        {toolActive && (
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-3 py-1 text-[11px] text-white">
            {t.editor.twoFingers}
          </p>
        )}
        {toast && (
          <div role="status" className="absolute bottom-10 left-1/2 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg shadow-lg">
            {toast}
          </div>
        )}
      </div>

      {/* Workbench */}
      <aside className="flex max-h-[50%] flex-col gap-3 overflow-y-auto border-t border-border bg-surface p-3 *:shrink-0 md:max-h-none md:w-[26rem] md:border-l md:border-t-0 md:p-4">
        {/* Tools */}
        <div role="radiogroup" aria-label={t.editor.toolLabel} className="grid grid-cols-4 gap-1.5">
          {(['pen', 'tweezers', 'hand', 'fix'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={tool === id}
              onClick={() => {
                // Switching tools puts whatever was held back into the tray.
                setTool(id)
                setLoad({ color: null, count: 0 })
                useToolLayer.setState({ visible: false, ring: null })
              }}
              className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl border text-[11px] font-bold ${
                tool === id ? 'border-accent bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg'
              }`}
            >
              <ToolIcon tool={id} />
              {t.editor.tools[id]}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="rounded-2xl bg-surface-2 p-3">
          <div className="flex items-start gap-3">
            {focus && focusColor !== null ? (
              <Swatch rgb={focus.rgb} number={numbers.get(focusColor)} size={36} done={focusDone === focusTotal && focusTotal > 0} />
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-muted">
                <ToolIcon tool={tool} className="h-4.5 w-4.5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              {toolStatus && <p className="text-sm font-bold">{toolStatus}</p>}
              {tool === 'pen' && (
                <div className="mt-1 flex gap-0.5" aria-hidden>
                  {Array.from({ length: PEN_CAPACITY }, (_, i) => (
                    <span
                      key={i}
                      className="h-2 flex-1 rounded-sm"
                      style={{ background: i < load.count && load.color !== null ? css(palette.colors[load.color].rgb) : 'var(--border)' }}
                    />
                  ))}
                </div>
              )}
              <p className="mt-1 text-xs text-muted">{t.editor.toolHints[tool]}</p>
            </div>
            <button
              type="button"
              className="icon-btn -m-1.5 h-9 w-9"
              onClick={() => {
                setMuted(!muted)
                setMutedState(!muted)
              }}
              aria-label={t.editor.sound}
              aria-pressed={!muted}
            >
              {muted ? <VolumeX className="h-4.5 w-4.5" aria-hidden /> : <Volume2 className="h-4.5 w-4.5" aria-hidden />}
            </button>
          </div>
          {focus && focusColor !== null && (
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted">
              <span className="w-28 shrink-0 truncate">
                {focus.name} {focusDone}/{focusTotal}
              </span>
              <ProgressBar value={focusTotal ? focusDone / focusTotal : 0} label={focus.name} />
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-muted">
            <span className="w-28 shrink-0">{t.editor.total}</span>
            <ProgressBar value={progress.placedAll / progress.all} label={t.editor.total} />
            <span className="shrink-0 tabular-nums">{Math.round((progress.placedAll / progress.all) * 100)}%</span>
          </div>
        </div>

        {/* Tray */}
        <BeadTray
          wells={wells}
          palette={palette}
          active={focusColor}
          label={t.editor.tray}
          wellLabel={(w) => t.editor.wellLabel(palette.colors[w.color].name, palette.colors[w.color].code, w.left)}
          onWellPointer={onWellPointer}
        />

        {/* Boards */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-1 items-center gap-2">
            <span className="text-sm font-semibold">{t.editor.section}</span>
            <select className="input h-10 flex-1" value={activeSection ?? ''} onChange={(e) => setActiveSection(e.target.value || null)}>
              <option value="">{t.editor.allSections}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.w}×{s.h})
                </option>
              ))}
            </select>
          </label>
          {sections.length > 1 && (
            <button type="button" className="btn-secondary btn-sm" onClick={nextSection}>
              {t.editor.nextSection} <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          )}
          {section && (
            <button type="button" className="btn-secondary btn-sm" onClick={() => setPlaced(sectionCellIndices(section, pattern.width), true)}>
              <CheckCheck className="h-4 w-4" aria-hidden /> {t.editor.sectionDone}
            </button>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Cloud className="h-4 w-4" aria-hidden /> {t.editor.saved}
          </span>
          <div className="flex gap-1">
            <Link href="/lightbox/" className="btn-ghost btn-sm">
              <Lightbulb className="h-4 w-4" aria-hidden /> {t.pattern.lightbox}
            </Link>
            <button type="button" className="btn-ghost btn-sm" onClick={() => confirm(t.editor.resetConfirm) && resetProgress()}>
              <RotateCcw className="h-4 w-4" aria-hidden /> {t.editor.reset}
            </button>
          </div>
        </div>
      </aside>

      <ToolLayer
        tool={toolActive ? (tool as 'pen' | 'tweezers') : null}
        color={load.color !== null ? palette.colors[load.color].rgb : null}
        count={load.count}
        onLand={onLand}
      />

      <ProgressPreview open={previewOpen} onClose={() => setPreviewOpen(false)} pattern={pattern} palette={palette} placed={placed} />

      {/* Fix color picker */}
      <Modal
        open={fixCell !== null}
        onClose={() => setFixCell(null)}
        title={fixCell !== null ? t.editor.fixTitle((fixCell % pattern.width) + 1, Math.floor(fixCell / pattern.width) + 1) : ''}
      >
        {fixCell !== null && (
          <>
            <p className="mb-2 text-sm font-semibold">{t.editor.current}</p>
            <div className="mb-4 flex items-center gap-2">
              {pattern.cells[fixCell] >= 0 ? (
                <>
                  <Swatch rgb={palette.colors[pattern.cells[fixCell]].rgb} />
                  <span className="text-sm">
                    {palette.colors[pattern.cells[fixCell]].name} <span className="font-mono text-muted">{palette.colors[pattern.cells[fixCell]].code}</span>
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted">—</span>
              )}
            </div>
            <div className="grid max-h-[45vh] grid-cols-6 gap-2 overflow-y-auto p-1 sm:grid-cols-8">
              {regularColorIndices(palette).map((ci) => {
                const c = palette.colors[ci]
                return (
                  <button
                    key={ci}
                    type="button"
                    title={`${c.name} ${c.code}`}
                    aria-label={`${c.name} ${c.code}`}
                    onClick={() => {
                      recolor(fixCell, ci)
                      setFixCell(null)
                    }}
                    className={`aspect-square rounded-full ring-1 ring-black/15 ${ci === pattern.cells[fixCell] ? 'outline-3 outline-offset-2 outline-accent' : ''}`}
                    style={{ background: css(c.rgb) }}
                  />
                )
              })}
            </div>
          </>
        )}
      </Modal>

      <Modal open={finished} onClose={() => setFinished(false)} title={t.editor.finishedTitle}>
        <p className="text-muted">{t.editor.finishedBody}</p>
        <Link href="/create/product/" className="btn-primary mt-6 w-full">
          {t.pattern.buyKit}
        </Link>
      </Modal>
    </div>
  )
}
