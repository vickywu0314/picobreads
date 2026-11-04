'use client'

import Link from 'next/link'
import { ArrowRight, ImagePlus, LayoutGrid, Users } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { Ironed } from '@/components/Ironed'
import { BEAD_PITCH_MM, TIERS } from '@/config/site'
import { getLibraryPattern } from '@/config/catalog'
import { useT } from '@/i18n'
import { useLibraryPattern } from '@/lib/library'

function Preview({ id }: { id: string }) {
  const { pattern } = useLibraryPattern(getLibraryPattern(id))
  return pattern ? <Ironed pattern={pattern} /> : <div className="aspect-square animate-pulse rounded-xl bg-surface-2" />
}

export default function BeadsPage() {
  const t = useT()
  const paths = [
    { href: '/create/', icon: ImagePlus, title: t.beadsHub.uploadTitle, body: t.beadsHub.uploadBody, cta: t.beadsHub.uploadCta, preview: 'tabby-cat' },
    { href: '/beads/patterns/', icon: LayoutGrid, title: t.beadsHub.patternsTitle, body: t.beadsHub.patternsBody, cta: t.beadsHub.patternsCta, preview: 'sunflower' },
    { href: '/beads/community/', icon: Users, title: t.beadsHub.communityTitle, body: t.beadsHub.communityBody, cta: t.beadsHub.communityCta, preview: 'corgi' },
  ]
  const cm = (cells: number, mm: number) => ((cells * mm) / 10).toFixed(cells * mm >= 1000 ? 0 : 1)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-sm font-bold uppercase tracking-widest text-accent">{t.beadsHub.eyebrow}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{t.beadsHub.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t.beadsHub.body}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {paths.map((p) => (
            <Link key={p.href} href={p.href} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
              <div className="bg-surface-2 p-6">
                <Preview id={p.preview} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="flex items-center gap-2 font-serif text-2xl">
                  <p.icon className="h-6 w-6 text-accent" aria-hidden /> {p.title}
                </h2>
                <p className="mt-2 flex-1 text-muted">{p.body}</p>
                <span className="btn-primary mt-5 self-start">
                  {p.cta} <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="font-serif text-3xl">{t.beadsHub.sizesTitle}</h2>
          <p className="mt-2 max-w-2xl text-muted">{t.beadsHub.sizesBody}</p>
          <div className="card mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t.beadsHub.colGrid}</th>
                  <th className="px-5 py-3 font-semibold">{t.beadsHub.colMidi}</th>
                  <th className="px-5 py-3 font-semibold">{t.beadsHub.colMini}</th>
                  <th className="px-5 py-3 font-semibold">{t.beadsHub.colBest}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TIERS.map((tier) => (
                  <tr key={tier.id}>
                    <td className="px-5 py-4">
                      <span className="font-bold">{t.tiers[tier.id]}</span> · {tier.longSide} × {tier.longSide}
                    </td>
                    <td className="px-5 py-4">≈ {cm(tier.longSide, BEAD_PITCH_MM['5mm'])} cm</td>
                    <td className="px-5 py-4">≈ {cm(tier.longSide, BEAD_PITCH_MM['2.6mm'])} cm</td>
                    <td className="px-5 py-4 text-muted">{t.beadsHub.best[tier.id]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
