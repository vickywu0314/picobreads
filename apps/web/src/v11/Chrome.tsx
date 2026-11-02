'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Globe, LayoutGrid, LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { LOCALES, useLocaleStore, useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { markV11Flow } from '@/lib/flow'
import { V11, v11Href } from './config'
import { Toast, useToast } from './Toast'

/** Logo mark: a rounded square with a 3 × 3 grid of colored beads. */
export function V11Logo({ small = false }: { small?: boolean }) {
  const colors = ['#d9467a', '#ffd84d', '#d9467a', '#7cc4f2', '#d9467a', '#ffd84d', '#d9467a', '#7cc4f2', '#d9467a']
  return (
    <Link href={v11Href('/')} className="flex items-center gap-2.5" aria-label={V11.name}>
      <span className={`grid shrink-0 grid-cols-3 gap-[2px] rounded-[10px] border-2 border-[var(--ink)] bg-white p-[5px] ${small ? 'h-7 w-7' : 'h-8 w-8 sm:h-10 sm:w-10'}`} aria-hidden>
        {colors.map((c, i) => (
          <span key={i} className="rounded-full" style={{ background: c }} />
        ))}
      </span>
      <span className={`font-pixel whitespace-nowrap font-semibold tracking-wide ${small ? 'text-lg' : 'text-xl sm:text-3xl'}`}>{V11.name}</span>
    </Link>
  )
}

function LanguageMenu() {
  const t = useT()
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])
  const current = LOCALES.find((l) => l.id === locale)!
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.v11.nav.language}
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-1 whitespace-nowrap rounded-full px-2 text-sm font-medium hover:bg-white/70"
      >
        <Globe className="h-4.5 w-4.5" aria-hidden />
        <span className="hidden sm:inline">{current.id === 'zh-CN' ? '中文' : 'EN'}</span>
        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 top-11 z-40 w-36 overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-white py-1 shadow-[4px_4px_0_var(--ink)]">
          {LOCALES.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l.id === locale}
                lang={l.id}
                onClick={() => {
                  setLocale(l.id)
                  setOpen(false)
                }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-[var(--accent-soft)] ${l.id === locale ? 'font-bold text-[var(--accent)]' : ''}`}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function UserMenu({ name }: { name: string }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn-secondary btn-sm h-10 max-w-40 rounded-full px-4"
      >
        <UserRound className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </button>
      {open && (
        <ul role="menu" className="absolute right-0 top-12 z-40 w-44 overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-white py-1 shadow-[4px_4px_0_var(--ink)]">
          <li>
            <Link role="menuitem" href={v11Href('/workbench/')} onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--accent-soft)]">
              <LayoutGrid className="h-4 w-4" aria-hidden /> {t.v11.workbench.menu}
            </Link>
          </li>
          <li>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                useStore.getState().signOut()
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-[var(--accent-soft)]"
            >
              <LogOut className="h-4 w-4" aria-hidden /> {t.v11.nav.signOut}
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}

export function V11Header() {
  const t = useT()
  const path = usePathname()
  const hydrated = useHydrated()
  const user = useStore((s) => s.user)
  const bag = useStore((s) => s.cart.reduce((n, c) => n + c.qty, 0))
  const toast = useToast((s) => s.show)
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [path])
  const isHome = path === v11Href('/') || path === V11.base

  const links = [
    { label: t.v11.nav.home, href: v11Href('/'), active: isHome },
    { label: t.v11.nav.plaza, soon: true },
    { label: t.v11.nav.community, soon: true },
  ]
  const navItem = (l: (typeof links)[number], mobile = false) =>
    l.soon ? (
      <button key={l.label} type="button" onClick={() => toast(t.v11.comingSoon)} className={mobile ? 'rounded-xl px-3 py-3 text-left hover:bg-white' : 'relative px-1 py-2 text-[15px] font-medium hover:text-[var(--accent)]'}>
        {l.label}
      </button>
    ) : (
      <Link
        key={l.label}
        href={l.href!}
        aria-current={l.active ? 'page' : undefined}
        className={mobile ? 'rounded-xl px-3 py-3 hover:bg-white' : `relative px-1 py-2 text-[15px] font-semibold ${l.active ? 'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:rounded-full after:bg-[var(--accent)]' : ''}`}
      >
        {l.label}
      </Link>
    )

  return (
    <header className="relative z-30">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn -ml-2 md:hidden" onClick={() => setMenu(true)} aria-label={t.v11.nav.menu}>
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <V11Logo />
        </div>
        <nav className="hidden items-center gap-7 md:flex">{links.map((l) => navItem(l))}</nav>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageMenu />
          {hydrated && bag > 0 && (
            <Link href={v11Href('/cart/')} className="icon-btn relative" aria-label={`${t.v11.nav.bag} (${bag})`}>
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <span className="absolute right-0.5 top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">{bag}</span>
            </Link>
          )}
          {hydrated && user ? (
            <UserMenu name={user.name} />
          ) : (
            <Link href={v11Href('/login/')} className="btn-secondary h-10 whitespace-nowrap rounded-full px-4 text-[15px] sm:h-11 sm:px-5">
              {t.v11.nav.signIn}
            </Link>
          )}
        </div>
      </div>
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.v11.nav.menu}>
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setMenu(false)} aria-label={t.common.close} />
          <div className="v11 absolute inset-y-0 left-0 flex w-[min(85vw,19rem)] flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <V11Logo small />
              <button type="button" className="icon-btn" onClick={() => setMenu(false)} aria-label={t.common.close}>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="font-display mt-6 flex flex-col gap-1 text-2xl">{links.map((l) => navItem(l, true))}</nav>
          </div>
        </div>
      )}
    </header>
  )
}

export function V11Footer() {
  const t = useT()
  const toast = useToast((s) => s.show)
  return (
    <footer className="mt-16 border-t-2 border-dashed border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-[var(--muted)] sm:px-6">
        <span className="flex items-center gap-2.5">
          <V11Logo small />
          <span>{t.v11.footer.rights(new Date().getFullYear(), V11.name)}</span>
        </span>
        <span className="flex gap-5">
          <button type="button" className="hover:text-[var(--fg)]" onClick={() => toast(t.v11.comingSoon)}>
            {t.v11.nav.plaza}
          </button>
          <button type="button" className="hover:text-[var(--fg)]" onClick={() => toast(t.v11.comingSoon)}>
            {t.v11.nav.community}
          </button>
        </span>
      </div>
    </footer>
  )
}

/** Page shell for every v1.1 page: theme scope, header, footer, toast. */
export function V11Page({ children, footer = true }: { children: React.ReactNode; footer?: boolean }) {
  useEffect(() => markV11Flow(), [])
  return (
    <div className="v11 min-h-[calc(100dvh-1.75rem)]">
      <V11Header />
      {children}
      {footer && <V11Footer />}
      <Toast />
    </div>
  )
}
