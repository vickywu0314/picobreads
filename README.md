# Cordelia Morrow

*Your moments, made personal.* Personalized gifts — custom fuse bead art first, storybooks coming soon. Milestone 0: clickable prototype — fully static, no backend. Commerce will run on Shopify.

**Versions:** the site is BeadSpark (v1.1, formerly "Pipixel"), served at the root `/`. v1.0 (Cordelia Morrow) is archived in `archive/v1.0/` (not built); old `/v1-1/…` links redirect. See `docs/versions.md`.

**Current status / handoff: `docs/status.md`.** See `CLAUDE.md` for the product spec, `docs/sitemap.md` for the site structure and `docs/prototype-notes.md` (中文) for what is real vs. mocked.

## Structure

```
apps/web/                  Next.js 15 (App Router, static export), Tailwind CSS 4, zustand
  src/app/                 pages at the root: home, create (upload / crop / customize / product), bead, lightbox, lab,
                           login, workbench; robots.ts, sitemap.ts; v1-1/ = redirects from the old /v1-1/ addresses
  src/components/          PatternCanvas (pan/zoom pegboard), bead editor, light box, ironing lab, UI bits
  src/v11/                 BeadSpark header / footer / toast / config, pixel decorations
  src/config/site.ts       business knobs: boards, bead sizes, limits
  src/config/seo.ts        site URL, SEO keywords, crawler allow-list
  src/i18n/                UI copy (zh-CN / en-US); locale follows the browser, switchable in the header
  public/                  images (v11/), llms.txt and ai.txt for AI crawlers
apps/api/                  Node API (Hono + SQLite): email / Google / WeChat / Apple / Facebook sign-in, drafts, share links
packages/pattern-engine/   pure TypeScript, no UI deps: generation, pixel style, palettes, sections, stats, bag picking
  palettes/                bead color charts (MARD 264 and others) — see palettes/README.md
archive/v1.0/              v1.0 (Cordelia Morrow) pages and v1.0-only code — kept for reference, not built
```

## Local development

Requires Node 22 and pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm test         # engine + API tests (vitest)
pnpm dev:api      # API on http://127.0.0.1:8787 (copy apps/api/.env.example to apps/api/.env first)
pnpm typecheck
pnpm build        # static site in apps/web/out
```

## Environment variables

Milestone 0 needs none. See `.env.example`.

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Optional sub-path when hosting under a folder (e.g. GitHub Pages). Leave empty on Vercel. |
| `NEXT_PUBLIC_SITE_URL` | Public address of the site for sitemap.xml / robots.txt / Open Graph. Defaults to `https://pd.scentby.cn`. |

## Deploy (Vercel, free)

1. Sign in at vercel.com with GitHub → **Add New… → Project** → import `vickywu0314/picobreads`.
2. **Root Directory**: `apps/web` (Vercel detects Next.js and pnpm automatically).
3. Deploy. Every push to `main` redeploys; the URL works on phone and tablet.

## Deploy to your own server

Static files only (no Node server needed): build, copy `apps/web/out/` to the server, serve with Nginx. Steps, Nginx config and mainland-China notes: `docs/deploy-server.md`.

## Color data credit

Color data: craft-color-codes by MakeBead (https://makebead.com). Perler / Artkal / Hama values from maxcleme/beadcolors (MIT). Community-measured approximations, not official manufacturer colors.
