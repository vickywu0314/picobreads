'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Grid3x3, LogOut, Pencil, ShoppingBag, Trash2 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useLocale, useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'

type Tab = 'orders' | 'designs' | 'settings'

function Account() {
  const t = useT()
  const locale = useLocale()
  const router = useRouter()
  const params = useSearchParams()
  const hydrated = useHydrated()
  const user = useStore((s) => s.user)
  const orders = useStore((s) => s.orders)
  const designs = useStore((s) => s.designs)
  const pattern = useStore((s) => s.pattern)
  const currentDesignId = useStore((s) => s.currentDesignId)
  const addresses = useStore((s) => s.addresses)
  const tab = (params.get('tab') as Tab) || 'designs'
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (hydrated && !user) router.replace(`/account/login/?next=${encodeURIComponent(`/account/?tab=${tab}`)}`)
  }, [hydrated, user, router, tab])
  if (!hydrated || !user) return null

  const s = useStore.getState()
  const setTab = (v: Tab) => router.replace(`/account/?tab=${v}`, { scroll: false })
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-4xl">{t.account.title}</h1>
          <p className="mt-1 text-muted">
            {t.account.hello(user.name)} · {user.email}
          </p>
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={() => s.signOut()}>
          <LogOut className="h-4 w-4" aria-hidden /> {t.account.signOut}
        </button>
      </div>

      <div role="tablist" className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        {(['designs', 'orders', 'settings'] as const).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={tab === v}
            type="button"
            onClick={() => setTab(v)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === v ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'}`}
          >
            {t.account.tabs[v]}
          </button>
        ))}
      </div>

      {tab === 'designs' && (
        <section className="mt-6">
          {pattern && !currentDesignId && (
            <div className="card mb-4 flex items-center gap-4 border-dashed p-4">
              <div className="w-16 shrink-0">
                <Ironed pattern={pattern} />
              </div>
              <p className="flex-1 text-sm">{t.account.current}</p>
              <button type="button" className="btn-primary btn-sm" onClick={() => s.saveDesign(t.account.designName(designs.length + 1))}>
                {t.account.saveCurrent}
              </button>
            </div>
          )}
          {designs.length === 0 ? (
            <div className="card p-10 text-center text-muted">
              {t.account.noDesigns}
              <div>
                <Link href="/create/" className="btn-primary mt-4">
                  {t.home.heroCta}
                </Link>
              </div>
            </div>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((d) => (
                <li key={d.id} className="card overflow-hidden">
                  <div className="bg-surface-2 p-4">
                    <Ironed pattern={d.pattern} />
                  </div>
                  <div className="p-4">
                    <p className="font-serif text-lg">{d.name}</p>
                    <p className="text-xs text-muted">
                      {d.pattern.width} × {d.pattern.height} · {date(d.updatedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          s.openDesign(d.id)
                          router.push('/create/settings/')
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden /> {t.account.open}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          s.openDesign(d.id)
                          router.push('/bead/')
                        }}
                      >
                        <Grid3x3 className="h-3.5 w-3.5" aria-hidden /> {t.account.bead}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          s.openDesign(d.id)
                          router.push('/create/product/')
                        }}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" aria-hidden /> {t.account.buy}
                      </button>
                      <button
                        type="button"
                        className="icon-btn h-9 w-9 text-muted"
                        aria-label={t.account.remove}
                        onClick={() => confirm(t.account.removeConfirm) && s.deleteDesign(d.id)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'orders' && (
        <section className="mt-6">
          {orders.length === 0 ? (
            <div className="card p-10 text-center text-muted">{t.account.noOrders}</div>
          ) : (
            <ul className="flex flex-col gap-3">
              {orders.map((o) => (
                <li key={o.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <div className="flex -space-x-3">
                    {o.items.slice(0, 3).map((it) => (
                      <div key={it.id} className="w-14 rounded-lg border-2 border-surface bg-surface-2 p-1">
                        <Ironed pattern={it.pattern} />
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-semibold">
                      {t.account.order} #{o.id}
                    </p>
                    <p className="text-xs text-muted">
                      {date(o.date)} · {t.account.items(o.items.reduce((n, i) => n + i.qty, 0))} · {t.account.total} ${o.totalUsd}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-accent">{t.account.status[o.status]}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'settings' && (
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-bold">{t.account.addresses}</h2>
            {addresses.length === 0 && !adding && <p className="mt-2 text-sm text-muted">{t.account.noAddresses}</p>}
            <ul className="mt-3 space-y-2">
              {addresses.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2 rounded-xl bg-surface-2 p-3 text-sm">
                  <span>
                    <b>{a.name}</b>
                    <br />
                    {a.line1}, {a.city}, {a.region} {a.zip}, {a.country}
                  </span>
                  <button type="button" className="icon-btn h-8 w-8" aria-label={t.account.remove} onClick={() => s.removeAddress(a.id)}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            {adding ? (
              <form
                className="mt-3 grid grid-cols-2 gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  const f = new FormData(e.currentTarget)
                  const v = (k: string) => String(f.get(k) ?? '')
                  s.addAddress({ name: v('name'), line1: v('line1'), city: v('city'), region: v('region'), zip: v('zip'), country: v('country') })
                  setAdding(false)
                }}
              >
                {(Object.keys(t.account.fields) as (keyof typeof t.account.fields)[]).map((k) => (
                  <label key={k} className={k === 'line1' || k === 'name' ? 'col-span-2' : ''}>
                    <span className="text-xs text-muted">{t.account.fields[k]}</span>
                    <input name={k} required defaultValue={k === 'country' ? 'United States' : ''} className="input mt-1 h-10" />
                  </label>
                ))}
                <button type="submit" className="btn-primary btn-sm col-span-2 mt-1">
                  {t.account.save}
                </button>
              </form>
            ) : (
              <button type="button" className="btn-secondary btn-sm mt-3" onClick={() => setAdding(true)}>
                {t.account.addAddress}
              </button>
            )}
          </div>
          <div className="card p-5">
            <h2 className="font-bold">{t.account.profile}</h2>
            <p className="mt-2 text-sm">
              <span className="text-muted">{t.account.email}:</span> {user.email}
            </p>
            <h3 className="mt-5 font-semibold">{t.account.language}</h3>
            <div className="mt-1 flex items-center gap-2">
              <LanguageToggle className="border border-border" />
              <span className="text-xs text-muted">{t.account.languageNote}</span>
            </div>
          </div>
        </section>
      )}

      <p className="mt-10 flex items-center gap-2 text-xs text-muted">
        <ProtoTag /> {t.account.shopifyNote}
      </p>
    </main>
  )
}

export default function AccountPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <Account />
      </Suspense>
      <SiteFooter />
    </>
  )
}
