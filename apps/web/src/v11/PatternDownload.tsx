'use client'

import { useMemo, useState } from 'react'
import { Download, FileImage, Loader2 } from 'lucide-react'
import { beadCount, getPalette, type BeadSize, type Pattern } from '@picobreads/pattern-engine'
import { BOARD_PEGS } from '@/config/site'
import { useT } from '@/i18n'
import { legendOf } from '@/lib/pattern'
import { downloadCanvas, sheetPages } from '@/lib/sheets'
import { V11, v11Boards, v11Size } from './config'

/** Testing stage: the free pattern is downloaded as PNG sheets right here instead of emailed. */
export function PatternDownload({ pattern, beadSize, className = '' }: { pattern: Pattern; beadSize: BeadSize; className?: string }) {
  const t = useT()
  const d = t.v11.download
  const [busy, setBusy] = useState<string | null>(null)
  const pages = useMemo(() => {
    const palette = getPalette(pattern.paletteId)
    const fin = v11Size(pattern.width, pattern.height, beadSize)
    return sheetPages(pattern, palette, BOARD_PEGS[beadSize], {
      title: V11.name,
      summary: d.summary(pattern.width, pattern.height, t.v11.settings.beads[beadSize].title, fin.cm, v11Boards(pattern.width, pattern.height, beadSize), legendOf(pattern).length, beadCount(pattern)),
      overview: d.overview,
      board: d.board,
      range: d.range,
      legend: d.legend,
      beads: d.beads,
      empty: d.empty,
    })
  }, [pattern, beadSize, d, t])

  const save = async (ids: string[]) => {
    for (const id of ids) {
      const page = pages.find((p) => p.id === id)!
      setBusy(id)
      // Let the spinner paint before the (synchronous) drawing.
      await new Promise((r) => setTimeout(r, 30))
      await downloadCanvas(page.render(), page.name)
      await new Promise((r) => setTimeout(r, 350))
    }
    setBusy(null)
  }

  return (
    <section className={`card p-5 ${className}`} aria-label={d.title}>
      <h2 className="flex items-center gap-2 font-display text-xl">
        <FileImage className="h-5 w-5 text-[var(--accent)]" aria-hidden /> {d.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{d.testNote}</p>
      <button type="button" className="btn-primary mt-4 w-full" disabled={busy !== null} onClick={() => save(pages.map((p) => p.id))}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Download className="h-5 w-5" aria-hidden />} {d.all}（{pages.length}）
      </button>
      <ul className="mt-3 flex flex-col gap-2">
        {pages.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => save([p.id])}
              className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-left text-sm hover:border-[var(--ink)] disabled:opacity-60"
            >
              <span>{p.label}</span>
              {busy === p.id ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : <Download className="h-4 w-4 shrink-0" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
