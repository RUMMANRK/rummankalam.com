# rummankalam.com — Claude Code Instructions

## Stack
- **Framework:** Astro v5, static output
- **Package manager:** pnpm (always — never npm or yarn)
- **Styling:** Custom CSS microframework (5 layers: tokens, reset, layout, typography, utilities)
- **Fonts:** Fraunces (serif), Inter (sans), JetBrains Mono (mono) via @fontsource
- **CMS:** Sveltia CMS at `/desktop`, GitHub backend, OAuth via self-hosted proxy at `sveltia-cms-auth.rumman.workers.dev`
- **Deployment:** Cloudflare Workers + Assets (`wrangler deploy`), git-connected via `RUMMANRK/rummankalam.com`
- **Image optimisation:** Astro `<Image />` from `astro:assets` with sharp — always use this, never plain `<img>` for local images

## Commands
```bash
pnpm dev          # local dev server
pnpm build        # production build (runs image optimisation)
pnpm preview      # preview the dist/ output
```

## Content config
- Schema lives at `src/content.config.ts` (Astro v5 — NOT `src/content/config.ts`)
- JSON data files live in `src/content/data/`
- Markdown collections: `src/content/posts/`, `src/content/publications/`, `src/content/portfolio/`
- CMS config: `public/desktop/config.yml`

## Dark mode
- Toggle adds/removes `body.dark` class
- All dark mode overrides use `:global(body.dark) .selector`
- Dark mode switches all body text to JetBrains Mono
- FOUC prevention: inline `<script is:inline>` in `<body>` applies `body.dark` before first paint

## SENSITIVE — do not add under any circumstances
- **SDP (South Dhaka Post)** — must never appear anywhere on the site
- **The Monsoon Herald** — must never appear anywhere on the site
- These outlets cannot be publicly associated with Rumman. They are excluded from the publications outlet enum in the schema and CMS config.

## About page
- Three boxes: **Writer**, **Editor**, **Creative Director** (NOT Consultant)
- JSON keys: `writer`, `editor`, `creative_director`

## Key files
| File | Purpose |
|---|---|
| `src/styles/tokens.css` | CSS variables: colours, fonts, spacing, transitions |
| `src/styles/layout.css` | `.container`, `.stack`, `.cluster`, `.grid`, `.section` |
| `src/styles/typography.css` | `.text-display`, `.text-heading`, `.text-body`, `.text-label` |
| `src/components/Portrait.astro` | Hero photo — uses `<Image />` from astro:assets |
| `src/components/Typewriter.astro` | Hero rotating lines from `typewriter.json` |
| `src/components/Timeline.astro` | Career timeline SVG, current node renders in red |
| `src/components/ThreeBox.astro` | About page expand/dim behaviour |
| `src/components/SEO.astro` | All meta tags, OG, Twitter card, JSON-LD |
| `public/desktop/config.yml` | Sveltia CMS collection definitions |
| `wrangler.toml` | Cloudflare Workers deployment config |

## Deployment flow
1. Push to `main` on GitHub
2. Cloudflare Workers build triggers automatically
3. Build command: `pnpm build` — Deploy command: `npx wrangler deploy`
4. Live at `rummankalam.com` (and `www.rummankalam.com`)

## CMS workflow
1. Visit `rummankalam.com/desktop`
2. Sign in with GitHub (OAuth via `sveltia-cms-auth.rumman.workers.dev`)
3. Edit content → Publish → auto-commits to GitHub → Cloudflare redeploys

## Contact / identity
- Email: rumman@rantages.com
- LinkedIn: linkedin.com/in/rummankalam
- Goodreads: goodreads.com/author/show/19989689.Rumman_R_Kalam
- Based in Dhaka, Bangladesh
