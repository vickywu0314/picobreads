'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Download, FileArchive, FileImage, Loader2, LogIn } from 'lucide-react'
import { beadCount, getPalette, type BeadSize, type Pattern } from '@picobreads/pattern-engine'
import { BOARD_PEGS, PICKING } from '@/config/site'
import { useT } from '@/i18n'
import { legendOf } from '@/lib/pattern'
import { downloadCanvas, downloadZip, sheetPages } from '@/lib/sheets'
import { useStore } from '@/lib/store'
import { V11, v11Boards, v11Size } from './config'

/**
 * Free pattern download for signed-in users: overview, materials list and one sheet per pegboard
 * (bead code in every cell). Testing stage: downloaded here, nothing is emailed.
 */
export function PatternDownload({ pattern, beadSize, next, className = '' }: { pattern: Pattern; beadSize: BeadSize; next: string; className?: string }) {
  const t = useT()
  const d = t.v11.download
  const user = useStore((s) => s.user)
  const [busy, setBusy] = useState<string | null>(null)
  const pages = useMemo(() => {
    const palette = getPalette(pattern.paletteId)
    const fin = v11Size(pattern.width, pattern.height, beadSize)
    const boards = v11Boards(pattern.width, pattern.height, beadSize)
    return sheetPages(
      pattern,
      palette,
      BOARD_PEGS[beadSize],
      {
        title: V11.name,
        summary: d.summary(pattern.width, pattern.height, t.v11.settings.beads[beadSize].title, fin.cm, boards, legendOf(pattern).length, beadCount(pattern)),
        overview: d.overview,
        board: d.board,
        range: d.range,
        legend: d.legend,
        beads: d.beads,
        empty: d.empty,
        materials: d.materials,
        materialsNote: d.materialsNote(Math.round(PICKING.allowance * 100)),
        cols: d.cols,
        total: d.total,
      },
      { allowance: PICKING.allowance, boards: t.v11.product.pegboards(boards, BOARD_PEGS[beadSize]) },
    )
  }, [pattern, beadSize, d, t])

  const run = async (id: string, job: () => Promise<void>) => {
    setBusy(id)
    // Let the spinner paint before the (synchronous) drawing.
    await new Promise((r) => setTimeout(r, 30))
    try {
      await job()
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className={`card p-5 ${className}`} aria-label={d.title}>
      <h2 className="flex items-center gap-2 font-display text-xl">
        <FileImage className="h-5 w-5 text-[var(--accent)]" aria-hidden /> {d.title}
      </h2>
      <p className="mt-1 text-sm text-muted">{d.includes}</p>
      {!user ? (
        <>
          <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm">{d.signInFirst}</p>
          <Link href={`/v1-1/login/?next=${encodeURIComponent(next)}`} className="btn-primary mt-3 w-full">
            <LogIn className="h-5 w-5" aria-hidden /> {d.signIn}
          </Link>
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn-primary mt-4 w-full"
            disabled={busy !== null}
            onClick={() => run('zip', () => downloadZip(pages, `${V11.name}-pattern-${pattern.width}x${pattern.height}.zip`))}
          >
            {busy === 'zip' ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <FileArchive className="h-5 w-5" aria-hidden />} {d.zip(pages.length)}
          </button>
          <p className="mt-3 text-xs font-semibold text-muted">{d.single}</p>
          <ul className="mt-2 flex flex-col gap-2">
            {pages.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => run(p.id, () => downloadCanvas(p.render(), `${V11.name}-${p.name}`))}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-left text-sm hover:border-[var(--ink)] disabled:opacity-60"
                >
                  <span>{p.label}</span>
                  {busy === p.id ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : <Download className="h-4 w-4 shrink-0" aria-hidden />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
