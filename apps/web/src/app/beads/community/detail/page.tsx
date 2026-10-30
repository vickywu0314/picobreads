'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ArrowLeft, Lock, Wand2 } from 'lucide-react'
import { getPalette } from '@picobreads/pattern-engine'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { COMMUNITY, getCommunityPost, getLibraryPattern } from '@/config/catalog'
import { useT } from '@/i18n'
import { finishedSize, legendOf } from '@/lib/pattern'
import { useLibraryPattern, useStartFrom } from '@/lib/library'

function Detail() {
  const t = useT()
  const post = getCommunityPost(useSearchParams().get('id')) ?? COMMUNITY[0]
  const lib = getLibraryPattern(post.patternId)!
  const { pattern } = useLibraryPattern(lib)
  const start = useStartFrom()
  const copy = t.community.posts[post.id]

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/beads/community/" className="btn-ghost btn-sm -ml-3">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t.community.back}
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl bg-[#efe6d8] p-8 dark:bg-[#2a241f]">
          <div className="rounded-xl bg-[#fffaf2] p-4 shadow-xl">{pattern && <Ironed pattern={pattern} label={copy.title} />}</div>
        </div>
        <div>
          <ProtoTag label={t.community.sample} />
          <h1 className="mt-3 font-serif text-4xl">{copy.title}</h1>
          <p className="mt-1 text-muted">
            {t.community.by(post.author)} · {new Date(post.date).toLocaleDateString()}
          </p>
          <h2 className="mt-6 font-semibold">{t.community.story}</h2>
          <p className="mt-1 text-lg leading-relaxed">“{copy.story}”</p>
          {pattern && (
            <>
              <h2 className="mt-6 font-semibold">{t.community.specs}</h2>
              <p className="mt-1 text-sm text-muted">
                {pattern.width} × {pattern.height} · {finishedSize(pattern.width, pattern.height, '5mm').cm} cm · {t.common.colors(legendOf(pattern).length)} ·{' '}
                {getPalette(pattern.paletteId).brand}
              </p>
            </>
          )}
          {post.allowRemix ? (
            <button type="button" className="btn-primary mt-8 h-14 w-full text-lg" onClick={() => start(lib, { kind: 'community', id: post.id })}>
              <Wand2 className="h-5 w-5" aria-hidden /> {t.community.makeOne}
            </button>
          ) : (
            <p className="mt-8 flex items-start gap-2 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t.community.noRemix}{' '}
              <Link href="/create/" className="font-semibold text-accent underline">
                {t.beadsHub.uploadCta}
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CommunityDetailPage() {
  return (
    <>
      <SiteHeader />
      <Suspense>
        <Detail />
      </Suspense>
      <SiteFooter />
    </>
  )
}
