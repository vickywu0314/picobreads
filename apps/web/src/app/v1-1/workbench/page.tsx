'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Grid3x3, Plus, Trash2, Wand2 } from 'lucide-react'
import { beadCount } from '@picobreads/pattern-engine'
import { PatternThumb } from '@/components/PatternThumb'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { V11Page } from '@/v11/Chrome'
import { v11Size } from '@/v11/config'

/** "My workspace": the signed-in user's drafts (saved from online beading). Orders come once ordering opens. */
export default function WorkbenchPage() {
  const t = useT()
  const w = t.v11.workbench
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useStore((s) => s.user)
  const designs = useStore((s) => s.designs)

  useEffect(() => {
    if (hydrated && !user) router.replace(`/v1-1/login/?next=${encodeURIComponent('/v1-1/workbench/')}`)
  }, [hydrated, user, router])

  if (!hydrated || !user) return <V11Page footer={false}>{null}</V11Page>

  const mine = designs.filter((d) => !d.owner || d.owner === user.email)
  const open = (id: string, href: string) => {
    useStore.getState().openDesign(id)
    router.push(href)
  }

  return (
    <V11Page>
      <main className="container-page py-8">
        <h1 className="font-serif text-4xl">{w.title}</h1>
        <p className="mt-1 text-muted">{t.account.hello(user.name)}</p>

        <section className="mt-8" aria-labelledby="drafts">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="drafts" className="font-display text-2xl">
              {w.drafts} <span className="text-base text-muted">({mine.length})</span>
            </h2>
            <Link href="/v1-1/create/" className="btn-secondary btn-sm">
              <Plus className="h-4 w-4" aria-hidden /> {w.newOne}
            </Link>
          </div>
          {mine.length === 0 ? (
            <p className="card mt-4 p-6 text-sm text-muted">{w.noDrafts}</p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((d) => {
                const total = beadCount(d.pattern)
                const done = [...d.placed].filter((c, i) => c === '1' && d.pattern.cells[i] >= 0).length
                const pct = total ? Math.round((done / total) * 100) : 0
                const fin = v11Size(d.pattern.width, d.pattern.height, d.settings.beadSize)
                return (
                  <li key={d.id} className="card flex flex-col p-3">
                    <div className="aspect-square overflow-hidden rounded-2xl bg-[repeating-conic-gradient(rgba(128,128,128,0.10)_0_25%,transparent_0_50%)] bg-[length:18px_18px] p-2">
                      <PatternThumb pattern={d.pattern} className="h-full w-full" />
                    </div>
                    <p className="mt-3 font-bold">{d.name}</p>
                    <p className="text-xs text-muted">
                      {d.pattern.width}×{d.pattern.height} · ≈ {fin.cm} cm · {w.updated(new Date(d.updatedAt).toLocaleString())}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{w.progress(done, total, pct)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" className="btn-primary btn-sm" onClick={() => open(d.id, '/v1-1/bead/')}>
                        <Grid3x3 className="h-4 w-4" aria-hidden /> {w.continueBead}
                      </button>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => open(d.id, '/v1-1/create/settings/')}>
                        <Wand2 className="h-4 w-4" aria-hidden /> {w.customize}
                      </button>
                      <button
                        type="button"
                        className="icon-btn ml-auto h-9 w-9"
                        aria-label={t.account.remove}
                        onClick={() => window.confirm(t.account.removeConfirm) && useStore.getState().deleteDesign(d.id)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

      </main>
    </V11Page>
  )
}
