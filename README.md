# Picobreads

Custom fuse bead (perler bead) patterns and kits. Milestone 0: clickable prototype — fully static, no backend.

See `CLAUDE.md` for the product spec and `docs/prototype-notes.md` (中文) for what is real vs. mocked in the prototype.

## Structure

```
apps/web/                  Next.js 15 (App Router, static export), Tailwind CSS 4, zustand
  src/app/                 pages (home, create, settings, pattern, bead, lightbox, kit, cart, checkout, progress, admin)
  src/components/          PatternCanvas (pan/zoom editor), PatternThumb, UI bits
  src/config/site.ts       business knobs: size tiers, prices (placeholder), allowance, bag sizes, limits
  src/i18n/en-US.ts        all UI copy (add zh-CN later as another object of the same type)
  src/mock/                PROTOTYPE ONLY: sample pattern generator, fake orders
packages/pattern-engine/   pure TypeScript, no UI deps: types, palettes, sections, stats, bag picking
  palettes/                bead color charts (Perler / Artkal S / MARD 221) — see palettes/README.md
```

## Local development

Requires Node 22 and pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # engine unit tests (vitest)
pnpm typecheck
pnpm build        # static site in apps/web/out
```

## Environment variables

Milestone 0 needs none. See `.env.example`.

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Optional sub-path when hosting under a folder (e.g. GitHub Pages). Leave empty on Vercel. |

## Deploy (Vercel, free)

1. Sign in at vercel.com with GitHub → **Add New… → Project** → import `vickywu0314/picobreads`.
2. **Root Directory**: `apps/web` (Vercel detects Next.js and pnpm automatically).
3. Deploy. Every push to `main` redeploys; the URL works on phone and tablet.

## Color data credit

Color data: craft-color-codes by MakeBead (https://makebead.com). Perler / Artkal values from maxcleme/beadcolors (MIT). Community-measured approximations, not official manufacturer colors.
