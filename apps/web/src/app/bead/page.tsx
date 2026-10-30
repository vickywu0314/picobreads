'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, CheckCheck, ChevronRight, Cloud, Lightbulb, Maximize, Minus, Plus, RotateCcw, Undo2 } from 'lucide-react'
import { regularColorIndices, sectionCellIndices } from '@picobreads/pattern-engine'
import { PatternCanvas, type PatternCanvasHandle } from '@/components/PatternCanvas'
import { NoPattern } from '@/components/NoPattern'
import { Modal, ProgressBar, Segmented, Swatch } from '@/components/ui'
import { BOARD_CELLS } from '@/config/site'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { usePatternData } from '@/lib/usePattern'
import { css } from '@/lib/pattern'

type Mode = 'bead' | 'fix'

export default function BeadPage() {
  const t = useT()
  const hydrated = useHydrated()
  const data = usePatternData()
  const placed = useStore((s) => s.placed)
  const activeColor = useStore((s) => s.activeColor)
  const activeSection = useStore((s) => s.activeSection)
  const canUndo = useStore((s) => s.undoStack.length > 0)
  const { setActiveColor, setActiveSection, setPlaced, recolor, undo, resetProgress } = useStore.getState()

  const canvas = useRef<PatternCanvasHandle>(null)
  const [mode, setMode] = useState<Mode>('bead')
  const [toast, setToast] = useState<string | null>(null)
  const [fixCell, setFixCell] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  const section = data?.sections.find((s) => s.id === activeSection) ?? null

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
      total.set(c, (total.get(c) ?? 0) + 1)
      if (on) done.set(c, (done.get(c) ?? 0) + 1)
    }
    return { total, done, placedAll, all: pattern.cells.length }
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
    const id = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(id)
  }, [toast])

  if (!hydrated) return null
  if (!data || !progress) return <NoPattern />

  const { pattern, palette, legend, numbers, sections } = data
  const colorsHere = legend.filter((l) => progress.total.has(l.color))
  const active = activeColor !== null ? palette.colors[activeColor] : null
  const activeTotal = activeColor !== null ? (progress.total.get(activeColor) ?? 0) : 0
  const activeDone = activeColor !== null ? (progress.done.get(activeColor) ?? 0) : 0

  const onCellTap = (i: number) => {
    const c = pattern.cells[i]
    if (mode === 'fix') return setFixCell(i)
    const x = i % pattern.width
    const y = Math.floor(i / pattern.width)
    if (section && !(x >= section.x && x < section.x + section.w && y >= section.y && y < section.y + section.h)) return
    if (activeColor === null) {
      setActiveColor(c)
      return
    }
    if (c !== activeColor) {
      setToast(t.editor.hintOther)
      navigator.vibrate?.(30)
      return
    }
    setPlaced([i], placed[i] !== '1')
  }

  const nextSection = () => {
    const idx = sections.findIndex((s) => s.id === activeSection)
    setActiveSection(sections[(idx + 1) % sections.length].id)
  }

  return (
    <div className="flex h-[calc(100dvh-1.75rem)] flex-col md:flex-row">
      {/* Canvas area */}
      <div className="relative min-h-0 flex-1">
        <PatternCanvas
          ref={canvas}
          pattern={pattern}
          palette={palette}
          numbers={numbers}
          placed={placed}
          selected={mode === 'bead' ? activeColor : null}
          section={section}
          boardCells={BOARD_CELLS}
          editMode={mode === 'fix'}
          onCellTap={onCellTap}
          label={`Bead pattern ${pattern.width} by ${pattern.height}`}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-2">
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-surface/90 p-1 shadow backdrop-blur">
            <Link href="/pattern/" className="icon-btn" aria-label={t.common.back}>
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
            <span className="pr-3 text-sm font-bold">{t.editor.title}</span>
          </div>
          <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-surface/90 p-1 shadow backdrop-blur">
            <button type="button" className="icon-btn" onClick={undo} disabled={!canUndo} aria-label={t.editor.undo}>
              <Undo2 className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn" onClick={() => canvas.current?.zoomOut()} aria-label={t.editor.zoomOut}>
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn" onClick={() => canvas.current?.zoomIn()} aria-label={t.editor.zoomIn}>
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="icon-btn" onClick={() => canvas.current?.fit()} aria-label={t.editor.fit}>
              <Maximize className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        {toast && (
          <div role="status" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg shadow-lg">
            {toast}
          </div>
        )}
      </div>

      {/* Control panel */}
      <aside className="flex max-h-[46%] flex-col gap-3 overflow-y-auto *:shrink-0 border-t border-border bg-surface p-3 md:max-h-none md:w-96 md:border-l md:border-t-0 md:p-4">
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'bead', label: t.editor.modeBead },
            { value: 'fix', label: t.editor.modeFix },
          ]}
        />

        {mode === 'bead' ? (
          <div className="rounded-2xl bg-surface-2 p-3">
            {active && activeColor !== null ? (
              <div className="flex items-center gap-3">
                <Swatch rgb={active.rgb} number={numbers.get(activeColor)} size={40} done={activeDone === activeTotal && activeTotal > 0} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-bold">
                      {active.name} <span className="font-mono text-xs text-muted">{active.code}</span>
                    </span>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {activeDone}/{activeTotal}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={activeTotal ? activeDone / activeTotal : 0} label={active.name} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted">{t.editor.hintSelect}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-muted">
              <span className="w-10 shrink-0">{t.editor.total}</span>
              <ProgressBar value={progress.placedAll / progress.all} label={t.editor.total} />
              <span className="shrink-0 tabular-nums">{Math.round((progress.placedAll / progress.all) * 100)}%</span>
            </div>
          </div>
        ) : (
          <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted">{t.editor.fixHint}</p>
        )}

        {/* Colors */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible">
          <button
            type="button"
            onClick={() => setActiveColor(null)}
            aria-pressed={activeColor === null}
            className={`flex h-12 shrink-0 items-center rounded-full border px-3 text-xs font-bold ${
              activeColor === null ? 'border-accent bg-accent-soft' : 'border-border'
            }`}
          >
            {t.editor.allColors}
          </button>
          {colorsHere.map((l) => {
            const c = palette.colors[l.color]
            const tot = progress.total.get(l.color) ?? 0
            const dn = progress.done.get(l.color) ?? 0
            const left = tot - dn
            const on = activeColor === l.color
            return (
              <button
                key={l.color}
                type="button"
                aria-pressed={on}
                aria-label={`${c.name} ${c.code}, ${t.editor.left(left)}`}
                onClick={() => {
                  setMode('bead')
                  setActiveColor(on ? null : l.color)
                }}
                className={`flex h-12 shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 ${
                  on ? 'border-accent bg-accent-soft ring-2 ring-accent' : 'border-border bg-surface'
                }`}
              >
                <Swatch rgb={c.rgb} number={l.number} size={36} done={left === 0} />
                <span className="text-left leading-tight">
                  <span className="block font-mono text-[11px] text-muted">{c.code}</span>
                  <span className="block text-xs font-bold tabular-nums">{left}</span>
                </span>
              </button>
            )
          })}
        </div>

        {/* Sections */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex flex-1 items-center gap-2">
            <span className="text-sm font-semibold">{t.editor.section}</span>
            <select
              className="input h-10 flex-1"
              value={activeSection ?? ''}
              onChange={(e) => setActiveSection(e.target.value || null)}
            >
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
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setPlaced(sectionCellIndices(section, pattern.width), true)}
            >
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
              <Lightbulb className="h-4 w-4" aria-hidden /> Light box
            </Link>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => confirm(t.editor.resetConfirm) && resetProgress()}
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> {t.editor.reset}
            </button>
          </div>
        </div>
      </aside>

      {/* Fix color picker */}
      <Modal
        open={fixCell !== null}
        onClose={() => setFixCell(null)}
        title={fixCell !== null ? t.editor.fixTitle(fixCell % pattern.width + 1, Math.floor(fixCell / pattern.width) + 1) : ''}
      >
        {fixCell !== null && (
          <>
            <p className="mb-2 text-sm font-semibold">{t.editor.current}</p>
            <div className="mb-4 flex items-center gap-2">
              <Swatch rgb={palette.colors[pattern.cells[fixCell]].rgb} />
              <span className="text-sm">
                {palette.colors[pattern.cells[fixCell]].name}{' '}
                <span className="font-mono text-muted">{palette.colors[pattern.cells[fixCell]].code}</span>
              </span>
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
                    className={`aspect-square rounded-full ring-1 ring-black/15 ${
                      ci === pattern.cells[fixCell] ? 'outline-3 outline-offset-2 outline-accent' : ''
                    }`}
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
        <Link href="/kit/" className="btn-primary mt-6 w-full">
          {t.pattern.buyKit}
        </Link>
      </Modal>
    </div>
  )
}
