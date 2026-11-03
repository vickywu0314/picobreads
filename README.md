# Cordelia Morrow

*Your moments, made personal.* Personalized gifts — custom fuse bead art first, storybooks coming soon. Milestone 0: clickable prototype — fully static, no backend. Commerce will run on Shopify.

**Versions:** v1.0 at `/` (frozen), v1.1 "Pipixel" redesign at `/v1-1/` (all new work) — see `docs/versions.md`.

**Current status / handoff: `docs/status.md`.** See `CLAUDE.md` for the product spec, `docs/sitemap.md` for the site structure and `docs/prototype-notes.md` (中文) for what is real vs. mocked.

## Structure

```
apps/web/                  Next.js 15 (App Router, static export), Tailwind CSS 4, zustand
  src/app/                 pages: home, beads (hub, patterns, community), create (6 steps), storybooks, account, cart, footer pages, bead / lightbox tools, lab, admin
  src/components/          PatternCanvas (pan/zoom editor), PatternThumb, UI bits
  src/config/site.ts       business knobs: size tiers, prices (placeholder), allowance, bag sizes, limits
  src/i18n/                UI copy: en-US.ts + zh-CN.ts; locale follows the browser, switchable in the header
  src/config/catalog.ts    PROTOTYPE content: pattern library, community posts, purchase forms
  src/app/v1-1/            v1.1 pages (home + 6-step flow, bag, login); src/v11/ = v1.1 header/footer/toast/config
  src/mock/                PROTOTYPE ONLY: sample pattern generator, fake admin orders
  public/patterns/         sample illustrations used by the library / community
packages/pattern-engine/   pure TypeScript, no UI deps: types, palettes, sections, stats, bag picking
  palettes/                bead color charts (Perler / Artkal S / Hama / MARD 221) — see palettes/README.md
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

## Deploy to your own server

Static files only (no Node server needed): build, copy `apps/web/out/` to the server, serve with Nginx. Steps, Nginx config and mainland-China notes: `docs/deploy-server.md`.

## Color data credit

Color data: craft-color-codes by MakeBead (https://makebead.com). Perler / Artkal / Hama values from maxcleme/beadcolors (MIT). Community-measured approximations, not official manufacturer colors.
