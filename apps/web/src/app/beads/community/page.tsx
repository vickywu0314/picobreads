'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Ironed } from '@/components/Ironed'
import { COMMUNITY, getLibraryPattern, type CommunityPost } from '@/config/catalog'
import { useT } from '@/i18n'
import { useLibraryPattern } from '@/lib/library'

function PostCard({ post }: { post: CommunityPost }) {
  const t = useT()
  const { pattern } = useLibraryPattern(getLibraryPattern(post.patternId))
  return (
    <Link href={`/beads/community/detail/?id=${post.id}`} className="card group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Stand-in for the customer's photo of their finished piece. */}
      <div className="bg-[#efe6d8] p-6 dark:bg-[#2a241f]">
        <div className="rounded-lg bg-[#fffaf2] p-3 shadow-md">{pattern ? <Ironed pattern={pattern} /> : <div className="aspect-square animate-pulse" />}</div>
      </div>
      <div className="p-4">
        <h2 className="font-serif text-lg">{t.community.posts[post.id].title}</h2>
        <p className="text-xs text-muted">{t.community.by(post.author)}</p>
      </div>
    </Link>
  )
}

export default function CommunityPage() {
  const t = useT()
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl">{t.community.title}</h1>
            <p className="mt-2 max-w-2xl text-muted">{t.community.body}</p>
          </div>
          <Link href="/beads/community/share/" className="btn-secondary">
            <Star className="h-5 w-5" aria-hidden /> {t.community.share}
          </Link>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <ProtoTag label={t.community.sample} />
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          {COMMUNITY.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
