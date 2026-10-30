'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { ImagePlus, Lock, Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/SiteHeader'
import { ProtoTag } from '@/components/PrototypeBanner'
import { Stepper } from '@/components/ui'
import { ASPECTS, FREE_PREVIEWS_PER_DAY, type AspectId } from '@/config/site'
import { useT } from '@/i18n'
import { previewsLeft, useHydrated, useStore } from '@/lib/store'
import { SAMPLE_PHOTO_URL } from '@/lib/generate'

const MAX_BYTES = 20 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function cropToDataUrl(src: string, area: Area, maxSide = 900): Promise<string> {
  const img = new Image()
  img.src = src
  await img.decode()
  const k = Math.min(1, maxSide / Math.max(area.width, area.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width * k)
  canvas.height = Math.round(area.height * k)
  canvas.getContext('2d')!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export default function CreatePage() {
  const t = useT()
  const router = useRouter()
  const hydrated = useHydrated()
  const setPhoto = useStore((s) => s.setPhoto)
  const storedAspect = useStore((s) => s.aspectId)
  const previews = useStore((s) => s.previews)

  const [src, setSrc] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectId, setAspectId] = useState<AspectId>(storedAspect)
  const area = useRef<Area | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const load = useCallback(
    (file: File | undefined) => {
      if (!file) return
      if (!TYPES.includes(file.type)) return setError(t.create.badType)
      if (file.size > MAX_BYTES) return setError(t.create.tooBig)
      setError(null)
      setSrc(URL.createObjectURL(file))
      setZoom(1)
    },
    [t],
  )

  const aspect = ASPECTS.find((a) => a.id === aspectId)!.value

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6">
        <Stepper step={0} />
        {!src ? (
          <section className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight">{t.create.uploadTitle}</h1>
            <p className="mt-2 text-muted">{t.create.uploadHint}</p>
            <label
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                load(e.dataTransfer.files[0])
              }}
              className={`mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
                dragging ? 'border-accent bg-accent-soft' : 'border-border bg-surface hover:bg-surface-2'
              }`}
            >
              <ImagePlus className="h-12 w-12 text-accent" aria-hidden />
              <span className="btn-primary pointer-events-none">{t.create.choose}</span>
              <span className="text-sm text-muted">{t.create.drop}</span>
              <input
                ref={input}
                type="file"
                accept={TYPES.join(',')}
                className="sr-only"
                onChange={(e) => load(e.target.files?.[0])}
              />
            </label>
            {error && (
              <p role="alert" className="mt-3 font-medium text-accent">
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="btn-ghost btn-sm" onClick={() => setSrc(SAMPLE_PHOTO_URL)}>
                <Sparkles className="h-4 w-4" aria-hidden /> {t.create.sample}
              </button>
              {hydrated && (
                <span className="flex items-center gap-2 text-sm text-muted">
                  {t.create.quota(previewsLeft(previews, FREE_PREVIEWS_PER_DAY), FREE_PREVIEWS_PER_DAY)} <ProtoTag />
                </span>
              )}
            </div>
            <p className="mt-8 flex items-start gap-2 rounded-2xl bg-surface-2 p-4 text-sm text-muted">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {t.common.privacyLine}
            </p>
          </section>
        ) : (
          <section className="mt-6">
            <h1 className="text-3xl font-extrabold tracking-tight">{t.create.cropTitle}</h1>
            <p className="mt-2 text-muted">{t.create.cropHint}</p>
            <div className="relative mt-5 h-[55vh] min-h-72 overflow-hidden rounded-3xl bg-black">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, px) => (area.current = px)}
                showGrid
              />
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <fieldset>
                <legend className="label mb-2">{t.create.aspect}</legend>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      aria-pressed={a.id === aspectId}
                      onClick={() => setAspectId(a.id)}
                      className={`flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-semibold ${
                        a.id === aspectId ? 'border-accent bg-accent-soft text-fg' : 'border-border bg-surface text-muted'
                      }`}
                    >
                      <span
                        aria-hidden
                        className="inline-block rounded-[3px] border-2 border-current"
                        style={{ width: 14 * Math.min(1, a.value), height: 14 * Math.min(1, 1 / a.value) }}
                      />
                      {a.id}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="label">{t.create.zoom}</span>
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--accent)]"
                />
              </label>
            </div>
            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <button type="button" className="btn-secondary" onClick={() => setSrc(null)}>
                {t.create.changePhoto}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={async () => {
                  if (!area.current) return
                  setPhoto(await cropToDataUrl(src, area.current), aspectId)
                  router.push('/create/settings/')
                }}
              >
                {t.create.useCrop}
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
