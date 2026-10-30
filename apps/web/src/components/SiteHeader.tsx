'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, ShoppingBag, User, X } from 'lucide-react'
import { SITE } from '@/config/site'
import { useT } from '@/i18n'
import { useHydrated, useStore } from '@/lib/store'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`} aria-label={SITE.name}>
      {/* A single fuse bead as the mark. */}
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
        <circle cx="12" cy="12" r="10" fill="var(--accent)" />
        <circle cx="12" cy="12" r="3.6" fill="var(--bg)" />
        <path d="M6.5 8.5a7 7 0 0 1 4-3.6" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-xl font-semibold tracking-tight whitespace-nowrap">{SITE.name}</span>
    </Link>
  )
}

export function SiteHeader() {
  const t = useT()
  const path = usePathname()
  const hydrated = useHydrated()
  const count = useStore((s) => s.cart.reduce((n, c) => n + c.qty, 0))
  const user = useStore((s) => s.user)
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [path])

  const links = [
    { href: '/beads/', label: t.nav.beads },
    { href: '/storybooks/', label: t.nav.storybooks },
    { href: '/about/', label: t.nav.about },
  ]
  const active = (href: string) => path?.startsWith(href.replace(/\/$/, ''))

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <button type="button" className="icon-btn -ml-2 md:hidden" onClick={() => setOpen(true)} aria-label={t.nav.menu}>
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <Logo />
        </div>
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`rounded-full px-3 py-2 hover:bg-surface-2 ${active(l.href) ? 'text-accent' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center">
          <span className="hidden items-center sm:flex">
            <LanguageToggle />
            <ThemeToggle />
          </span>
          <Link href="/account/" className="icon-btn" aria-label={user ? t.nav.account : t.nav.signIn}>
            <User className="h-5 w-5" aria-hidden />
          </Link>
          <Link href="/cart/" className="icon-btn relative" aria-label={`${t.nav.bag} (${hydrated ? count : 0})`}>
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {hydrated && count > 0 && (
              <span className="absolute right-1 top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-label={t.nav.closeMenu} />
          <div className="absolute inset-y-0 left-0 flex w-[min(85vw,20rem)] flex-col bg-bg p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label={t.nav.closeMenu}>
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-1 font-serif text-2xl">
              {links.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 hover:bg-surface-2">
                  {l.label}
                </Link>
              ))}
              <Link href="/account/" className="rounded-xl px-3 py-3 hover:bg-surface-2">
                {user ? t.nav.account : t.nav.signIn}
              </Link>
            </nav>
            <Link href="/create/" className="btn-primary mt-6">
              {t.nav.create}
            </Link>
            <div className="mt-auto flex items-center gap-1 pt-6">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export function SiteFooter() {
  const t = useT()
  const cols = [
    {
      h: t.footer.shop,
      links: [
        { href: '/beads/', label: t.nav.beads },
        { href: '/beads/patterns/', label: t.library.title },
        { href: '/beads/community/', label: t.community.title },
        { href: '/storybooks/', label: t.nav.storybooks },
      ],
    },
    {
      h: t.footer.help,
      links: [
        { href: '/faq/', label: t.footer.faq },
        { href: '/contact/', label: t.footer.contact },
        { href: '/shipping-returns/', label: t.footer.shipping },
      ],
    },
    {
      h: t.footer.company,
      links: [
        { href: '/about/', label: t.footer.about },
        { href: '/privacy/', label: t.footer.privacy },
        { href: '/terms/', label: t.footer.terms },
      ],
    },
  ]
  return (
    <footer className="mt-20 border-t border-border bg-surface-2/50 py-12 text-sm">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 font-serif text-lg italic text-muted">{t.footer.tagline}</p>
        </div>
        {cols.map((c) => (
          <nav key={c.h} aria-label={c.h}>
            <p className="mb-3 font-semibold">{c.h}</p>
            <ul className="space-y-2 text-muted">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 text-xs text-muted sm:px-6">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <span className="flex flex-wrap items-center gap-3">
          {t.footer.internal}:
          <Link href="/lab/" className="underline hover:text-fg">
            {t.lab.nav}
          </Link>
          <Link href="/admin/" className="underline hover:text-fg">
            {t.nav.admin}
          </Link>
        </span>
      </div>
    </footer>
  )
}
