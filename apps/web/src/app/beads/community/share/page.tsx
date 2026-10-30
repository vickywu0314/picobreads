'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, ImagePlus } from 'lucide-react'
import { SiteFooter, SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Toggle } from '@/components/ui'
import { useT } from '@/i18n'

export default function SharePage() {
  const t = useT()
  const [photo, setPhoto] = useState<string | null>(null)
  const [isPublic, setPublic] = useState(true)
  const [remix, setRemix] = useState(false)
  const [done, setDone] = useState(false)

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        {done ? (
          <div className="card p-10 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-ok" aria-hidden />
            <h1 className="mt-4 font-serif text-3xl">{t.share.doneTitle}</h1>
            <p className="mt-2 text-muted">{t.share.doneBody}</p>
            <div className="mt-3">
              <ProtoTag />
            </div>
            <Link href="/beads/community/" className="btn-secondary mt-6">
              {t.share.back}
            </Link>
          </div>
        ) : (
          <form
            className="card flex flex-col gap-5 p-6"
            onSubmit={(e) => {
              e.preventDefault()
              setDone(true)
            }}
          >
            <div>
              <h1 className="font-serif text-3xl">{t.share.title}</h1>
              <p className="mt-1 text-muted">{t.share.body}</p>
            </div>
            <label className="block">
              <span className="label">{t.share.photo}</span>
              <span className="mt-2 flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface-2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex items-center gap-2 font-semibold text-muted">
                    <ImagePlus className="h-6 w-6" aria-hidden /> {t.share.choose}
                  </span>
                )}
              </span>
              <input
                type="file"
                accept="image/*"
                required
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setPhoto(URL.createObjectURL(f))
                }}
              />
            </label>
            <label className="block">
              <span className="label">{t.share.titleLabel}</span>
              <input required className="input mt-1.5" />
            </label>
            <label className="block">
              <span className="label">{t.share.story}</span>
              <textarea required rows={4} placeholder={t.share.storyPh} className="input mt-1.5 h-auto py-3" />
            </label>
            <label className="block">
              <span className="label">{t.share.name}</span>
              <input required className="input mt-1.5" />
            </label>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{t.share.allowPublic}</span>
              <Toggle label={t.share.allowPublic} checked={isPublic} onChange={setPublic} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm">{t.share.allowRemix}</span>
              <Toggle label={t.share.allowRemix} checked={remix} onChange={setRemix} />
            </div>
            <button type="submit" className="btn-primary" disabled={!isPublic}>
              {t.share.submit}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
