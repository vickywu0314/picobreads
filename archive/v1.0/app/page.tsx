'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Gift, Grid3x3 } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { COMMUNITY, LIBRARY, getLibraryPattern, type LibraryPattern, type Theme } from '@/config/catalog'
import { useT } from '@/i18n'
import { useLibraryPattern } from '@/lib/library'
import { BookCover } from '@/components/BookCover'

function LibraryIroned({ p, className = '' }: { p: LibraryPattern | undefined; className?: string }) {
  const { pattern } = useLibraryPattern(p)
  return pattern ? <Ironed pattern={pattern} className={className} /> : <div className={`aspect-square animate-pulse rounded-xl bg-surface-2 ${className}`} />
}

const GIFT_THEMES: { theme: Theme; pattern: string }[] = [
  { theme: 'couples', pattern: 'hearts' },
  { theme: 'family', pattern: 'house' },
  { theme: 'friends', pattern: 'cupcake' },
  { theme: 'pets', pattern: 'corgi' },
]

export default function HomePage() {
  const t = useT()
  const hero = getLibraryPattern('tabby-cat')
  const stories = COMMUNITY.slice(0, 3)

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pt-20">
          <div>
            <h1 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">{t.home.heroTitle}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{t.home.heroBody}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/create/" className="btn-primary h-14 px-7 text-lg">
                {t.home.heroCta} <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/beads/patterns/" className="btn-secondary h-14 px-6">
                <Gift className="h-5 w-5" aria-hidden /> {t.home.heroCta2}
              </Link>
            </div>
          </div>
          {/* Product + gifting scene (placeholder until real photography). */}
          <figure className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2rem] bg-accent-soft" aria-hidden />
            <div className="rounded-[1.75rem] border-[10px] border-[#d9c4a5] bg-[#fffaf2] p-5 shadow-2xl dark:border-[#5a4633]">
              <LibraryIroned p={hero} />
            </div>
            <div className="absolute -right-3 -top-4 rotate-[5deg] rounded-lg bg-surface px-3 py-2 font-serif text-sm italic shadow-lg">
              For Mom, with love ♥
            </div>
            <figcaption className="mt-8 flex items-center justify-center gap-2 text-xs text-muted">
              <ProtoTag label={t.common.sample} /> {t.home.heroCaption}
            </figcaption>
          </figure>
        </section>

        {/* Brand intro */}
        <section className="mx-auto w-full max-w-3xl px-4 py-12 text-center sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl">{t.home.introTitle}</h2>
          <p className="mt-4 text-lg text-muted">{t.home.introBody}</p>
          <Link href="/about/" className="mt-4 inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            {t.home.introLink} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        {/* Products */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl">{t.home.productsTitle}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Link href="/beads/" className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
              <div className="grid grid-cols-3 gap-2 bg-surface-2 p-5">
                {['corgi', 'hearts', 'sunflower'].map((id) => (
                  <LibraryIroned key={id} p={getLibraryPattern(id)} />
                ))}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="flex items-center gap-2 font-serif text-2xl">
                  <Grid3x3 className="h-6 w-6 text-accent" aria-hidden /> {t.home.beadsTitle}
                </h3>
                <p className="mt-2 flex-1 text-muted">{t.home.beadsBody}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-semibold text-accent group-hover:underline">
                  {t.home.beadsCta} <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
            <Link href="/storybooks/" className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
              <div className="grid h-full min-h-40 place-items-center bg-[#e9e4f5] p-5 dark:bg-[#2a2638]">
                <BookCover title={t.storybooks.cover} />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="flex items-center gap-2 font-serif text-2xl">
                  <BookOpen className="h-6 w-6 text-accent" aria-hidden /> {t.home.booksTitle}
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-sans text-xs font-bold text-muted">{t.home.soon}</span>
                </h3>
                <p className="mt-2 flex-1 text-muted">{t.home.booksBody}</p>
                <span className="mt-4 inline-flex items-center gap-1 font-semibold text-accent group-hover:underline">
                  {t.home.booksCta} <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl">{t.home.howTitle}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {t.home.how.map((s, i) => (
              <li key={s.title} className="card p-6">
                <span className="font-serif text-4xl text-accent">{i + 1}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <Link href="/create/" className="btn-primary mt-6">
            {t.home.howCta}
          </Link>
        </section>

        {/* Gift ideas */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl">{t.home.giftsTitle}</h2>
          <p className="mt-2 text-muted">{t.home.giftsBody}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {GIFT_THEMES.map(({ theme, pattern }) => (
              <Link key={theme} href={`/beads/patterns/?theme=${theme}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="bg-surface-2 p-4">
                  <LibraryIroned p={getLibraryPattern(pattern)} />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-xl">{t.themes[theme]}</h3>
                  <p className="mt-1 text-sm text-muted">{t.themeBlurbs[theme]}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Stories */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl">{t.home.storiesTitle}</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <ProtoTag label={t.common.sample} /> {t.home.storiesNote}
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {stories.map((s) => {
              const p = getLibraryPattern(s.patternId)
              const post = t.community.posts[s.id]
              return (
                <article key={s.id} className="card flex flex-col overflow-hidden">
                  <div className="grid grid-cols-2 gap-2 bg-surface-2 p-3">
                    <figure>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p?.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                      <figcaption className="mt-1 text-center text-[11px] text-muted">{t.home.storyOriginal}</figcaption>
                    </figure>
                    <figure>
                      <LibraryIroned p={p} />
                      <figcaption className="mt-1 text-center text-[11px] text-muted">{t.home.storyFinished}</figcaption>
                    </figure>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-serif text-xl">{post.title}</h3>
                    <p className="text-xs text-muted">{t.community.by(s.author)}</p>
                    <p className="mt-2 flex-1 text-sm text-muted">“{post.story}”</p>
                    <Link href={`/beads/community/detail/?id=${s.id}`} className="mt-3 text-sm font-semibold text-accent hover:underline">
                      {t.home.storyView} →
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <div className="rounded-[2rem] bg-accent px-6 py-14 text-center text-accent-fg">
            <h2 className="font-serif text-4xl">{t.home.finalTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl opacity-90">{t.home.finalBody}</p>
            <Link href="/create/" className="btn mt-8 h-14 bg-bg px-8 text-lg text-fg hover:bg-surface">
              {t.home.finalCta}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
