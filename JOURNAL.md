# Build Journal — rummankalam.com

## Session: 19 April 2026

### Brief
Build a personal website for Rumman Kalam — editor, media operator, consultant based in Dhaka. Reference design provided as `rummankalam-homepage-v3.html`. Full spec in `claude-code-handoff-v2.md`. Goal: build everything in one go, align on all decisions first.

---

### Decisions made before building

**Stack:** Astro v5 (static), pnpm, Cloudflare Workers, Sveltia CMS. No React/Vue/Svelte — vanilla JS only for interactive pieces.

**Styling:** Custom CSS microframework instead of Tailwind/Bootstrap to avoid spaghetti at scale. Five layers: tokens → reset → layout → typography → utilities.

**Hero h1:** Fixed to exactly 3 lines tall in both modes using `height: calc(3 * line-height-em)` with `overflow: hidden` and `align-items: flex-start`. Different line-height values per mode (1.05em light, 1.15em dark) to account for the font switch.

**Dark mode font:** Entire body switches to JetBrains Mono in dark mode — a deliberate editorial aesthetic decision, not just a colour swap.

**About page labels:** Writer / Editor / Creative Director. Not Consultant (that's the consulting page, which is separate).

**Sensitive exclusion:** SDP (South Dhaka Post) and The Monsoon Herald are permanently excluded from all outlet enums, CMS configs, and seed content. These cannot be publicly associated with Rumman.

**Portrait:** Initially built as a generated halftone SVG (light) and ASCII art (dark) using a `darkness()` function ported from the reference HTML. Later replaced with a real photo cutout.

**Content:** All placeholder at launch — real content to be added via CMS.

---

### Build

Scaffolded manually because `pnpm create astro@latest` requires Node 22 but Astro v5 itself supports Node 20.18. Created `package.json`, `astro.config.mjs`, `tsconfig.json` by hand, then `pnpm install`.

Built in one pass:
- 22 pages total including dynamic portfolio slugs, blog slugs, RSS feed, sitemap
- CSS microframework across 5 files
- 15 seed publications (UNB, The Daily Star, Substack, Other — no SDP/Monsoon Herald)
- 5 seed blog posts, 8 seed portfolio projects
- JSON data files for timeline, logos, achievements, typewriter, about, consulting, reading

Fixed Astro v5 deprecation warning about auto-generated `data/` collections by moving content config to `src/content.config.ts`.

---

### Deployment

**Problem 1 — `pnpm create astro` needs Node 22:** Solved by manual scaffolding.

**Problem 2 — Cloudflare UI confusion:** The new Cloudflare dashboard merged Pages into Workers. The "Create a Worker" git-connected flow creates a Workers + Assets project, not a classic Pages project. Spent several iterations sorting out the right `wrangler.toml` format (`[assets] directory = "dist"`) and deploy command (`npx wrangler deploy`). Key lesson: `pages_build_output_dir` is the old Pages format; the new Workers format uses `[assets]`.

**Problem 3 — Git buffer:** First push of the portrait PNG (1.3MB) failed with HTTP 400. Fixed with `git config http.postBuffer 524288000`.

**DNS:** Domain on Namecheap, transferred nameservers to Cloudflare. Added CNAME records pointing to `rummankalam-com.rumman.workers.dev`. Custom domain added via Workers → Settings → Domains & Routes.

---

### CMS

**Problem — PKCE auth broken:** GitHub dropped PKCE support for SPAs. `auth_type: pkce` in `config.yml` no longer works. Tried Sveltia's hosted proxy (`sveltia-cms-auth.pages.dev`) — it was down (522 error).

**Solution:** Deployed a self-hosted OAuth proxy from `github.com/sveltia/sveltia-cms-auth` to `sveltia-cms-auth.rumman.workers.dev`. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as Worker secrets. Updated GitHub OAuth app callback URL to point to the proxy. CMS now works at `rummankalam.com/admin`.

---

### Post-launch changes

**Hero kicker removed:** "Media · Technology · Culture" text above the hero h1 was removed at Rumman's request.

**Timeline:** private project (2026) node removed. UNB (2024) is now the current/red node.

**Achievements:** Fixed JSON format mismatch — file was a flat array but CMS config expected `{ "items": [...] }`. Updated both the data file and `achievements.items.map()` in `index.astro`. Content updated to Rumman's actual achievements.

**Portrait:** Replaced generated halftone/ASCII with real photo (`rumman-kalam-portrait-cutout.png`). Switched to Astro `<Image />` component for automatic WebP optimisation (949kB → 11kB). Removed the grey Polaroid-style box backing — tapes now sit directly on the cutout photo since it has a transparent background.

**SEO:** Added full meta suite — `author`, `keywords`, `robots` with `max-snippet:-1 max-image-preview:large`, Twitter creator tag, full OG image dimensions. Upgraded homepage JSON-LD Person schema with `description`, `knowsAbout` (8 topic signals), `hasOccupation`, `areaServed`, portrait `image` URL.

**robots.txt:** Explicitly allows all major AI crawlers by name — GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Gemini, cohere-ai, YouBot, OAI-SearchBot, ChatGPT-User. Strategy: make the site fully indexable by LLMs so Rumman surfaces in creative consultant queries.

**OG image:** Added `og-image.jpg` to `/public`, updated SEO component default from `og-default.jpg` to `og-image.jpg`.

---

### State at end of session
- Site is live on Cloudflare Workers at `rummankalam.com`
- CMS is live at `rummankalam.com/admin`
- All placeholder content — real content to be added via CMS
- Portrait photo in place, WebP-optimised
- SEO and AI indexing configured
- No README (not requested)
