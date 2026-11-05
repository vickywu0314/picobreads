'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Download, Instagram, Loader2, LogIn, MessageCircle, Share2, Sparkles } from 'lucide-react'
import { beadCount, getPalette, type BeadSize, type Pattern } from '@picobreads/pattern-engine'
import { Modal } from '@/components/ui'
import { drawWork, type IronStyle } from '@/components/bead/ProgressPreview'
import { useT } from '@/i18n'
import { api, ApiError } from '@/lib/api'
import { legendOf } from '@/lib/pattern'
import { useStore } from '@/lib/store'

export interface ShareInput {
  name: string
  pattern: Pattern
  placed?: string
  beadSize: BeadSize
  iron?: IronStyle
}

type Target = 'wechat' | 'moments' | 'instagram'

/**
 * Share a piece: makes a public link (saved on the server), a QR code for WeChat, and a share
 * image (the finished piece + QR code) for WeChat Moments and Instagram. Web pages can't post to
 * Moments or Instagram directly, so those go through the saved image / the phone's share sheet.
 */
export function ShareDialog({ open, onClose, input }: { open: boolean; onClose: () => void; input: ShareInput | null }) {
  const t = useT()
  const s = t.v11.share
  const user = useStore((st) => st.user)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [poster, setPoster] = useState<{ blob: Blob; href: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [target, setTarget] = useState<Target>('wechat')
  const made = useRef<string | null>(null)
  const inputRef = useRef(input)
  inputRef.current = input
  const key = useMemo(() => (input ? `${input.name}:${input.pattern.cells.join(',')}:${input.placed ?? ''}` : ''), [input])

  // Make the link once per piece while the dialog is open.
  useEffect(() => {
    if (!open || !input || !user || made.current === key) return
    made.current = key
    setUrl(null)
    setError(null)
    setPoster(null)
    api<{ id: string; url: string }>('/shares', { body: { name: input.name, pattern: input.pattern, placed: input.placed, beadSize: input.beadSize, iron: input.iron } })
      // The link points at this site even when the API answers for another address.
      .then((r) => setUrl(`${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/s/?id=${r.id}`))
      .catch((e) => {
        made.current = null
        setError(t.v11.login.errors[e instanceof ApiError ? e.code : 'server_error'] ?? s.failed)
      })
  }, [open, input, user, key, s.failed, t.v11.login.errors])

  useEffect(() => {
    const input = inputRef.current
    if (!url || !input) return
    let cancelled = false
    void QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#4a2620', light: '#ffffff' } }).then(async (q) => {
      if (cancelled) return
      setQr(q)
      const blob = await makePoster(input, q, s.posterTitle(input.name), s.posterLine, s.posterScan)
      if (!cancelled && blob) setPoster((old) => (old && URL.revokeObjectURL(old.href), { blob, href: URL.createObjectURL(blob) }))
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key])

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt(s.link, url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  const file = () => (poster ? new File([poster.blob], 'beadspark.png', { type: 'image/png' }) : null)
  const canShareFiles = () => {
    const f = file()
    return !!f && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [f] })
  }
  const shareImage = async () => {
    const f = file()
    if (f && canShareFiles()) {
      try {
        await navigator.share({ files: [f], text: input ? s.text(input.name) : undefined })
        return
      } catch {}
    }
    download()
  }
  const download = () => {
    if (!poster) return
    const a = document.createElement('a')
    a.href = poster.href
    a.download = `beadspark-${(input?.name ?? 'share').replace(/[^\w一-龥-]+/g, '')}.png`
    a.click()
  }
  const systemShare = async () => {
    if (!url || !input) return
    try {
      await navigator.share({ title: input.name, text: s.text(input.name), url })
    } catch {}
  }

  const targets: { id: Target; label: string; icon: React.ReactNode; hint: string }[] = [
    { id: 'wechat', label: s.wechatFriend, icon: <MessageCircle className="h-5 w-5 text-[#07C160]" aria-hidden />, hint: s.wechatFriendHint },
    { id: 'moments', label: s.moments, icon: <Sparkles className="h-5 w-5 text-[#07C160]" aria-hidden />, hint: s.momentsHint },
    { id: 'instagram', label: s.instagram, icon: <Instagram className="h-5 w-5 text-[#E1306C]" aria-hidden />, hint: s.instagramHint },
  ]
  const tg = targets.find((x) => x.id === target)!

  return (
    <Modal open={open} onClose={onClose} title={s.title}>
      {!user ? (
        <Link href={`/login/?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/')}`} className="btn-primary w-full">
          <LogIn className="h-5 w-5" aria-hidden /> {s.needLogin}
        </Link>
      ) : error ? (
        <p className="rounded-xl bg-[var(--accent-soft)] p-3 text-sm font-semibold text-[var(--accent-hover)]">{error}</p>
      ) : !url ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {s.making}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <span className="label">{s.link}</span>
            <div className="mt-1.5 flex gap-2">
              <input readOnly value={url} className="input min-w-0 flex-1 text-sm" onFocus={(e) => e.currentTarget.select()} />
              <button type="button" className="btn-primary btn-motion shrink-0 px-4 text-sm" onClick={copy}>
                {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />} {copied ? s.copied : s.copy}
              </button>
            </div>
          </div>

          <div role="tablist" className="grid grid-cols-3 gap-2">
            {targets.map((x) => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={target === x.id}
                onClick={() => setTarget(x.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-[1.5px] px-2 py-2.5 text-xs font-bold transition-colors ${target === x.id ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--ink)]'}`}
              >
                {x.icon}
                {x.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted">{tg.hint}</p>

          {target === 'wechat' ? (
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr ? <img src={qr} alt="QR" className="h-48 w-48 rounded-xl border border-[var(--border)]" /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {poster ? <img src={poster.href} alt={s.title} className="max-h-72 rounded-xl border border-[var(--border)] shadow-sm" /> : <Loader2 className="h-6 w-6 animate-spin text-muted" aria-hidden />}
              <div className="flex w-full flex-wrap justify-center gap-2">
                <button type="button" className="btn-primary btn-motion" disabled={!poster} onClick={target === 'instagram' ? shareImage : download}>
                  {target === 'instagram' ? <Share2 className="h-4 w-4" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />} {target === 'instagram' ? s.shareImage : s.saveImage}
                </button>
                {target === 'instagram' && (
                  <button type="button" className="btn-secondary btn-motion" disabled={!poster} onClick={download}>
                    <Download className="h-4 w-4" aria-hidden /> {s.saveImage}
                  </button>
                )}
              </div>
            </div>
          )}

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button type="button" className="btn-secondary btn-motion w-full" onClick={systemShare}>
              <Share2 className="h-4 w-4" aria-hidden /> {s.systemShare}
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}

/** Share image, 1080 × 1350 (4:5 works for Moments and Instagram): the piece, its name, stats, QR code. */
async function makePoster(
  input: ShareInput,
  qrDataUrl: string,
  title: string,
  line: (w: number, h: number, colors: number) => string,
  scan: string,
): Promise<Blob | null> {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) return null
  const font = (weight: number, px: number) => `${weight} ${px}px Nunito, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif`
  g.fillStyle = '#fdf7f4'
  g.fillRect(0, 0, W, H)
  // Pink panel with the finished piece.
  g.fillStyle = '#f9dfe4'
  g.beginPath()
  g.roundRect(60, 60, W - 120, 880, 48)
  g.fill()
  const art = document.createElement('canvas')
  art.width = 840
  art.height = 800
  const ag = art.getContext('2d')!
  drawWork(ag, 840, 800, input.pattern, getPalette(input.pattern.paletteId), '', 'final', input.iron ?? 'normal')
  g.drawImage(art, 120, 100)
  // Pixel decoration.
  ;[
    [W - 140, 90, '#f4a7bd'],
    [W - 116, 90, '#e8799b'],
    [W - 116, 114, '#f9c6d4'],
    [W - 92, 114, '#f4a7bd'],
  ].forEach(([x, y, col]) => {
    g.fillStyle = col as string
    g.fillRect(x as number, y as number, 22, 22)
  })
  // Title + stats.
  g.fillStyle = '#4a2620'
  g.font = font(800, 60)
  g.fillText(title.length > 16 ? `${title.slice(0, 15)}…` : title, 80, 1040)
  g.fillStyle = '#7d5f58'
  g.font = font(600, 32)
  const colors = legendOf(input.pattern).length
  g.fillText(`${line(input.pattern.width, input.pattern.height, colors)} · ${beadCount(input.pattern).toLocaleString()}`, 80, 1095)
  // Brand.
  g.font = font(800, 46)
  g.fillStyle = '#4a2620'
  g.fillText('Bead', 80, 1250)
  const bw = g.measureText('Bead').width
  g.fillStyle = '#d93d72'
  g.fillText('Spark', 80 + bw, 1250)
  g.fillStyle = '#7d5f58'
  g.font = font(600, 26)
  g.fillText(scan, 80, 1295)
  // QR code.
  const qr = new Image()
  qr.src = qrDataUrl
  await qr.decode().catch(() => {})
  g.fillStyle = '#ffffff'
  g.beginPath()
  g.roundRect(W - 330, 1000, 250, 250, 24)
  g.fill()
  g.drawImage(qr, W - 315, 1015, 220, 220)
  return new Promise((resolve) => c.toBlob((b) => resolve(b), 'image/png'))
}
