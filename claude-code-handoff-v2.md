# rummankalam.com — Claude Code handoff

Paste everything between the BEGIN/END markers into Claude Code. Before you start, put `rummankalam-homepage-v3.html` in the project root as `reference/homepage-v3.html` — the prompt references it repeatedly as the visual source of truth.

---BEGIN PROMPT---

You are building **rummankalam.com**, the personal website of Rumman Kalam — editor, media operator, and consultant based in Dhaka. The reference design is in `reference/homepage-v3.html`. Match it exactly on the homepage before building anything else. Every visual decision in this prompt derives from that file.

---

## Stack

- **Framework:** Astro v5 (latest stable). Static output only (`output: 'static'`). No SSR, no adapter.
- **Styling:** Plain CSS with custom properties. No Tailwind, no CSS-in-JS, no UI library. Global tokens in `src/styles/tokens.css`. Component styles in Astro `<style>` blocks.
- **Interactivity:** Vanilla JS in Astro `<script>` tags only. No React, Vue, Svelte. The only JS on the homepage is: typewriter animation, procedural portrait generation, mode toggle. Everything else is zero-JS.
- **Fonts:** Self-hosted via `@fontsource/fraunces`, `@fontsource/inter`, `@fontsource-variable/jetbrains-mono`. No Google Fonts network calls in production.
- **Images:** Astro `<Image>` from `astro:assets`. AVIF + WebP. Lazy-load below the fold.
- **Deployment:** Cloudflare Pages. Build output: `dist/`. No adapter needed.
- **CMS:** Sveltia CMS at `/admin/`. Git-based, no server. Every editable piece of content in this brief has a corresponding CMS collection or singleton.

---

## 1. Project structure

```
rummankalam-com/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .gitignore
├── wrangler.toml
├── public/
│   ├── admin/
│   │   ├── index.html           # Sveltia CMS shell
│   │   └── config.yml           # Full CMS config — see §7
│   ├── _headers                 # Cloudflare cache + security headers
│   ├── favicon.svg
│   ├── og-default.jpg
│   └── robots.txt
├── src/
│   ├── content/
│   │   ├── config.ts            # All collection schemas
│   │   ├── publications/        # .md files, one per byline
│   │   ├── portfolio/           # .md files, one per case study
│   │   ├── posts/               # .md files, blog
│   │   └── data/
│   │       ├── timeline.json    # Career timeline nodes
│   │       ├── logos.json       # "Where I've been" employer tiles
│   │       ├── achievements.json
│   │       ├── typewriter.json  # Rotating headline lines
│   │       ├── reading-current.json
│   │       ├── reading-alltime.json
│   │       ├── about.json       # Three-box content
│   │       └── consulting.json  # Service areas + engagements
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ArticleLayout.astro
│   ├── components/
│   │   ├── Masthead.astro
│   │   ├── Footer.astro
│   │   ├── ModeToggle.astro
│   │   ├── Grain.astro
│   │   ├── RegMark.astro
│   │   ├── Typewriter.astro
│   │   ├── Portrait.astro
│   │   ├── Timeline.astro       # Renders from timeline.json
│   │   ├── LogoStrip.astro      # Renders from logos.json
│   │   ├── LatestStrip.astro
│   │   ├── CaseStudyCard.astro
│   │   ├── PublicationCard.astro
│   │   ├── FilterChips.astro
│   │   ├── ThreeBox.astro
│   │   └── SEO.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── consulting.astro
│   │   ├── publications/
│   │   │   └── index.astro
│   │   ├── portfolio/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── reading.astro
│   │   ├── contact.astro
│   │   ├── rss.xml.ts
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css
│   │   └── global.css
│   └── scripts/
│       ├── typewriter.ts
│       ├── portrait.ts
│       └── mode-toggle.ts
└── README.md
```

---

## 2. Design tokens

Copy these exactly into `src/styles/tokens.css`.

```css
:root {
  --paper: #f4efe3;
  --paper-warm: #ece4d1;
  --ink: #1a1a1a;
  --ink-soft: #3a3a36;
  --muted: #5c5651;
  --red: #d62828;
  --red-soft: rgba(214, 40, 40, 0.22);
  --rule: rgba(0, 0, 0, 0.35);
  --font-serif: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

body.dark {
  --paper: #000000;
  --paper-warm: #0a0a0a;
  --ink: #e8e8e8;
  --ink-soft: #b0b0b0;
  --muted: #707070;
  --red: #ff2e2e;
  --red-soft: rgba(255, 46, 46, 0.15);
  --rule: rgba(255, 255, 255, 0.18);
}
```

All colours in component CSS must use these variables. No hardcoded hex except inside the SVG portrait renderer and the grain texture data URI (both are intentionally non-themed).

---

## 3. Content schemas

### `src/content/config.ts`

```ts
import { defineCollection, z } from 'astro:content';

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    outlet: z.enum(['UNB', 'The Daily Star', 'Substack', 'SDP', 'The Monsoon Herald', 'Other']),
    type: z.enum(['Analysis', 'Satire', 'Fiction', 'Poetry', 'Reportage', 'Essay']),
    date: z.date(),
    excerpt: z.string().max(280),
    sourceUrl: z.string().url(),
    featured: z.boolean().default(false),
  }),
});

const portfolio = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    projectType: z.enum(['Product', 'Publication', 'Strategy']),
    year: z.number(),
    heroImage: z.string().optional(),
    problem: z.string(),
    whatIDid: z.string(),
    outcome: z.string().optional(),
    liveUrl: z.string().url().optional(),
    clientText: z.string().optional(),
    order: z.number().default(999),
  }),
});

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string().max(280),
    draft: z.boolean().default(false),
  }),
});

export const collections = { publications, portfolio, posts };
```

### `src/content/data/` JSON schemas

These are plain JSON files loaded at build time with `import` or `Astro.glob`. Each has a corresponding CMS singleton or list collection in §7.

**`timeline.json`** — array of career nodes rendered in the vertical/horizontal timeline SVG:
```json
[
  { "year": 2009, "label": "Rantages", "current": false },
  { "year": 2018, "label": "SHOUT", "current": false },
  { "year": 2019, "label": "Satireday", "current": false },
  { "year": 2020, "label": "The Daily Star", "current": false },
  { "year": 2024, "label": "UNB", "current": true }
]
```
The node with `"current": true` renders in `--red` with a dashed ring. Only one node should be current at a time — add a runtime check.

**`logos.json`** — the "Where I've been" strip:
```json
[
  { "name": "Rantages", "style": "sans-bold", "order": 1 },
  { "name": "The Daily Star", "style": "serif-medium", "order": 2 },
  { "name": "SHOUT", "style": "sans-spaced", "order": 3 },
  { "name": "UNB", "style": "sans-heavy-spaced", "order": 4 }
]
```
`style` maps to the typography class applied to each tile. Valid values: `sans-bold`, `serif-medium`, `sans-spaced`, `sans-heavy-spaced`, `serif-italic`, `serif-bold-sm`, `sans-light-sm`. Add more as needed. The `LogoStrip.astro` component maps style → CSS class. Rumman can reorder tiles via `order` and change style via the CMS dropdown.

**`achievements.json`** — the bullet list in "What I do":
```json
[
  "Launched Bangladesh's first online meme community",
  "Youngest editor of SHOUT, The Daily Star",
  "Founded the Satireday section",
  "Built Rantages into a self-sustaining operation",
  "Head of Digital Experience, UNB",
  "Building The Daily Star Plus"
]
```
Plain ordered array. CMS renders as a list widget.

**`typewriter.json`** — the rotating hero lines:
```json
[
  "Building what comes after the newspaper.",
  "Natural language, in the age of AI.",
  "Somewhere between the press and the platform.",
  "Old media problems, new media solutions.",
  "Audience first. Forever.",
  "Redefining tomorrow's legacy media."
]
```

**`about.json`** — three-box content:
```json
{
  "writer": { "summary": "...", "body": "..." },
  "editor": { "summary": "...", "body": "..." },
  "consultant": { "summary": "...", "body": "..." }
}
```

**`consulting.json`** — consulting page structured content:
```json
{
  "tagline": "...",
  "serviceAreas": [
    { "title": "...", "description": "..." }
  ],
  "engagements": [
    { "description": "..." }
  ],
  "testimonials": [
    { "quote": "...", "attribution": "..." }
  ]
}
```

**`reading-current.json`** and **`reading-alltime.json`** — book arrays:
```json
[
  { "title": "...", "author": "...", "cover": "optional-path.jpg" }
]
```

---

## 4. Homepage

**Visual reference:** `reference/homepage-v3.html`. Match it exactly. Do not interpret or improvise.

### Section order (fixed, non-negotiable)

1. **Hero**
2. **What I do**
3. **Where I've been**
4. **Latest**
5. Footer

### Hero

Two-column grid desktop (`1fr 260px`), single column mobile. Columns align to `center` vertically.

Left column:
- `<h1 class="typewriter">` — fixed height container (`height: 3.3em` desktop, `4.4em` mobile), `display: flex; align-items: center`. Contains a single `<div class="tw-inner">` wrapping `<span id="twText">` and `<span class="cursor">▍</span>`. The inner div is `display: block` so the cursor flows inline with the text and never wraps to its own line.
- Standfirst: `Media · Technology · Culture` in small-caps Inter, below a 0.5px ink rule.

Right column:
- Halftone portrait SVG (240×300 viewBox), procedurally generated, scissor-cut edge, red tape strips, slight rotation, paper shadow. Darkmode: hide SVG, show `<pre>` ASCII version. See §5b for implementation.
- Caption: `Dhaka · Filed 2026`

No "Rumman Kalam" kicker above the headline — name is in the masthead.

### What I do

Two-column desktop grid (`160px 1fr`). Single column mobile.

**Left column — vertical timeline (`Timeline.astro`):**
Renders from `timeline.json`. SVG with `overflow: visible`, viewBox `0 0 80 520`. Red vertical rule. One node per entry: year label above, name below, small circle on the rule. The `current: true` node gets a larger red filled circle + dashed ring. Node labels sit to the right of the rule (x=46). Component prop: `vertical: true`.

On mobile, hide vertical timeline. Show horizontal timeline SVG instead (same data, different layout). Horizontal viewBox `0 0 680 90`. Component prop: `vertical: false`.

**Right column — flex column (`wid-right`):**
1. `lead-line` heading: "I've been running media operations since I was *fourteen*." (italic + red on "fourteen")
2. Body paragraph
3. Mobile-only horizontal timeline (hidden on desktop via CSS)
4. Achievements list — rendered from `achievements.json`. Single column, `width: fit-content; margin: auto` so the block centres horizontally while each line stays left-aligned. Red em-dash bullets.

### Where I've been

`LogoStrip.astro` renders from `logos.json`, sorted by `order`. 4-column grid desktop, 2-column mobile. Each tile: `height: 84px`, `border: 0.5px solid rgba(0,0,0,0.55)`, centred text, `style` prop maps to typography class. Hover: invert (black bg, cream text). In dark mode: hover uses red bg, black text.

### Latest

`LatestStrip.astro` pulls the 3 most recent entries across `publications` + `posts` collections combined, sorted by date desc. 3-column desktop, 1-column mobile. Each card: outlet/source in small-caps red, title in serif, date, type tag. Card is a link to `sourceUrl` (publications) or `/blog/[slug]` (posts), `target="_blank" rel="noopener"` for external.

---

## 5. JS behaviours

### a) Typewriter (`src/scripts/typewriter.ts`)

Lines sourced from `typewriter.json`, inlined into the page as a JS array at build time via Astro's `define:vars` directive — no runtime fetch.

Animation loop: type char-by-char (42ms base + 0–40ms jitter), pause 2800ms at completion, delete at 18ms/char, 420ms gap before next line. Cursor `▍` blinks via CSS `step-end` animation, no JS involvement.

Height is fixed via CSS — no JS measurement, no resize listeners.

```css
.typewriter {
  height: 3.3em;
  display: flex;
  align-items: center;
}
.tw-inner { display: block; }
```

### b) Portrait (`src/scripts/portrait.ts`)

Port the darkness model and both renderers verbatim from `reference/homepage-v3.html`. Do not reinterpret.

Single `darkness(nx, ny)` function models: head ellipse (Lambertian lighting, upper-left source), eye sockets, brow, nose shadow, lip shadow, jaw, neck, shoulders, collar V. Returns 0–1.

Light mode renderer: SVG halftone. 240×300 viewBox, 5.8px sampling grid, `<circle>` per cell where darkness > 0.09, radius proportional to darkness, ±0.3px position jitter. ClipPath from a jittered polygon gives the scissor-cut edge.

Dark mode renderer: ASCII art `<pre>`. 64×96 grid. Ramp: `' .\'` ^",:;Il!i><~+_-?][}{1)(|tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'`. `font-size: 6.5px; line-height: 0.62`. Hidden in light mode, shown in dark mode via CSS.

Both generate on page load. Fresh jitter every visit is intentional — do not cache or memoize.

### c) Mode toggle (`src/scripts/mode-toggle.ts`)

Toggle `body.dark` on click. Persist to `localStorage.theme`. On page load, restore from localStorage — but default is always light regardless of `prefers-color-scheme`. The dark mode is a surprise the user discovers by pressing the toggle, not a system-inferred state.

`aria-pressed` reflects current state. On toggle, update `aria-label` to "Switch to light mode" / "Switch to dark mode".

---

## 6. Remaining pages

### `/about`

`ThreeBox.astro` is the centrepiece. Three mini-masthead blocks side by side: **Writer | Editor | Consultant** (that order). Data from `about.json`.

Each block: small-caps label, large serif name treatment, 2-line summary visible by default. On click, the block expands in-place to show the full 80–150 word body. Other two blocks dim to 40% opacity. "← back" text link returns to default state. No routing, no URL change.

Mobile: blocks stack vertically, same expand behaviour.

### `/consulting`

Data from `consulting.json`. Sections:
- Positioning hero: tagline + "Based in Dhaka. Working across South Asia."
- Service areas: 2-column card grid from `serviceAreas` array
- Past engagements: anonymized prose blocks from `engagements` array
- Testimonials: large serif pull-quotes from `testimonials` array
- CTA: "Start a conversation" → `mailto:` link

SEO priority page. h1 must contain "digital media" or "new media". First paragraph must include "Bangladesh" or "South Asia". JSON-LD `ProfessionalService` schema with `areaServed: ["Bangladesh", "South Asia"]`.

### `/publications`

Filterable archive. All publication frontmatter bundled into a JSON object in the page at build time (no fetch). Three filter groups as chip rows: Outlet, Type, Year. Active chips red. Filters work via URL params (`?outlet=UNB&type=Satire`) for crawlability; JS hijacks clicks for client-side re-filtering without page reload.

3-col desktop, 2-col tablet, 1-col mobile card grid. Each card links to `sourceUrl`, opens in new tab.

### `/portfolio` + `/portfolio/[slug]`

Index: card grid sorted by `order` field. Each card: name, role, project type tag, halftoned hero image (CSS: `filter: grayscale(1) contrast(1.3)` + dot overlay).

Detail (one-pager): hero → name → what it was → role → problem → what I did → outcome → artifacts → client reference → live link → prev/next nav. All images get the halftone CSS treatment. No raw photos.

10 placeholder case studies at scaffold: Authr, MTS, SHOUT, Rantages, Satireday, The Monsoon Herald, SDP, UNB Editorial Calendar, The Common Interface.

### `/blog` + `/blog/[slug]`

Index: list view. Each entry: title (serif), date (small-caps), excerpt, "Read →". Thin rules between entries. No grid.

Post: large title, `date + reading-time` in small-caps, body at `max-width: 65ch`, red pull-quotes and links, footnote support via `remark-footnotes`. Prev/Next at bottom.

RSS at `/rss.xml` covering all posts.

### `/reading`

Currently reading: 1–3 books from `reading-current.json`. Cover + title + author. No notes.

All-time: 25 books from `reading-alltime.json`. 5-col desktop, 2-col mobile grid. Same tile treatment as logos strip if no cover image (typography-only tile).

### `/contact`

Footer-only link. Simple page: Email, LinkedIn, Goodreads. Red hover. No form.

### `/404`

Newspaper "Story not found" header, dateline, link home. Monospaced feel.

---

## 7. CMS — Sveltia config

`public/admin/index.html`:
```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Content Manager</title></head>
<body><script type="module" src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script></body>
</html>
```

`public/admin/config.yml` — write this in full:

```yaml
backend:
  name: github
  repo: YOUR_GITHUB_USERNAME/rummankalam-com
  branch: main
  auth_type: pkce
  app_id: YOUR_GITHUB_OAUTH_APP_ID

media_folder: src/assets/uploads
public_folder: /assets/uploads

collections:

  # ── Publications ───────────────────────────────────────────────
  - name: publications
    label: Publications
    folder: src/content/publications
    create: true
    slug: "{{year}}-{{month}}-{{slug}}"
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Outlet, name: outlet, widget: select,
          options: [UNB, The Daily Star, Substack, SDP, The Monsoon Herald, Other] }
      - { label: Type, name: type, widget: select,
          options: [Analysis, Satire, Fiction, Poetry, Reportage, Essay] }
      - { label: Date, name: date, widget: datetime }
      - { label: Excerpt, name: excerpt, widget: text }
      - { label: Source URL, name: sourceUrl, widget: string }
      - { label: Featured, name: featured, widget: boolean, default: false }

  # ── Portfolio ──────────────────────────────────────────────────
  - name: portfolio
    label: Portfolio
    folder: src/content/portfolio
    create: true
    slug: "{{slug}}"
    fields:
      - { label: Name, name: name, widget: string }
      - { label: Role, name: role, widget: string }
      - { label: Project type, name: projectType, widget: select,
          options: [Product, Publication, Strategy] }
      - { label: Year, name: year, widget: number }
      - { label: Hero image, name: heroImage, widget: image, required: false }
      - { label: Problem, name: problem, widget: text }
      - { label: What I did, name: whatIDid, widget: text }
      - { label: Outcome, name: outcome, widget: text, required: false }
      - { label: Live URL, name: liveUrl, widget: string, required: false }
      - { label: Client (text reference), name: clientText, widget: string, required: false }
      - { label: Sort order, name: order, widget: number, default: 999 }
      - { label: Body, name: body, widget: markdown }

  # ── Blog ───────────────────────────────────────────────────────
  - name: posts
    label: Blog
    folder: src/content/posts
    create: true
    slug: "{{year}}-{{month}}-{{slug}}"
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Date, name: date, widget: datetime }
      - { label: Excerpt, name: excerpt, widget: text }
      - { label: Draft, name: draft, widget: boolean, default: false }
      - { label: Body, name: body, widget: markdown }

  # ── Career timeline ────────────────────────────────────────────
  - name: timeline
    label: Career timeline
    files:
      - name: timeline
        label: Timeline nodes
        file: src/content/data/timeline.json
        fields:
          - name: nodes
            label: Nodes
            widget: list
            fields:
              - { label: Year, name: year, widget: number }
              - { label: Label, name: label, widget: string }
              - { label: Current role, name: current, widget: boolean, default: false,
                  hint: "Mark only one node as current — it renders in red." }

  # ── Logo strip ─────────────────────────────────────────────────
  - name: logos
    label: Logo strip (Where I've been)
    files:
      - name: logos
        label: Employer tiles
        file: src/content/data/logos.json
        fields:
          - name: tiles
            label: Tiles
            widget: list
            fields:
              - { label: Name, name: name, widget: string }
              - { label: Sort order, name: order, widget: number }
              - label: Typography style
                name: style
                widget: select
                options:
                  - { label: "Sans bold (e.g. Rantages)", value: sans-bold }
                  - { label: "Serif medium (e.g. The Daily Star)", value: serif-medium }
                  - { label: "Sans spaced caps (e.g. SHOUT)", value: sans-spaced }
                  - { label: "Sans heavy spaced (e.g. UNB)", value: sans-heavy-spaced }
                  - { label: "Serif italic", value: serif-italic }
                  - { label: "Serif bold small", value: serif-bold-sm }
                  - { label: "Sans light small", value: sans-light-sm }

  # ── Achievements ───────────────────────────────────────────────
  - name: achievements
    label: Achievements list
    files:
      - name: achievements
        label: Bullet points
        file: src/content/data/achievements.json
        fields:
          - name: items
            label: Items
            widget: list
            field: { label: Line, name: item, widget: string }

  # ── Typewriter lines ───────────────────────────────────────────
  - name: typewriter
    label: Hero typewriter lines
    files:
      - name: typewriter
        label: Rotating lines
        file: src/content/data/typewriter.json
        fields:
          - name: lines
            label: Lines
            widget: list
            field: { label: Line, name: line, widget: string,
                     hint: "End with a period. Keep under ~45 chars for clean wrapping." }

  # ── About (three-box) ──────────────────────────────────────────
  - name: about
    label: About page
    files:
      - name: about
        label: Three-box content
        file: src/content/data/about.json
        fields:
          - name: writer
            label: Writer
            widget: object
            fields:
              - { label: Summary (2 lines), name: summary, widget: string }
              - { label: Body (80–150 words), name: body, widget: text }
          - name: editor
            label: Editor
            widget: object
            fields:
              - { label: Summary (2 lines), name: summary, widget: string }
              - { label: Body (80–150 words), name: body, widget: text }
          - name: consultant
            label: Consultant
            widget: object
            fields:
              - { label: Summary (2 lines), name: summary, widget: string }
              - { label: Body (80–150 words), name: body, widget: text }

  # ── Consulting page ────────────────────────────────────────────
  - name: consulting
    label: Consulting page
    files:
      - name: consulting
        label: Consulting content
        file: src/content/data/consulting.json
        fields:
          - { label: Tagline, name: tagline, widget: string }
          - name: serviceAreas
            label: Service areas
            widget: list
            fields:
              - { label: Title, name: title, widget: string }
              - { label: Description, name: description, widget: text }
          - name: engagements
            label: Past engagements
            widget: list
            fields:
              - { label: Description, name: description, widget: text }
          - name: testimonials
            label: Testimonials
            widget: list
            fields:
              - { label: Quote, name: quote, widget: text }
              - { label: Attribution, name: attribution, widget: string }

  # ── Reading ────────────────────────────────────────────────────
  - name: reading
    label: Reading list
    files:
      - name: current
        label: Currently reading
        file: src/content/data/reading-current.json
        fields:
          - name: books
            label: Books
            widget: list
            fields:
              - { label: Title, name: title, widget: string }
              - { label: Author, name: author, widget: string }
              - { label: Cover image, name: cover, widget: image, required: false }
      - name: alltime
        label: All-time recommendations (25)
        file: src/content/data/reading-alltime.json
        fields:
          - name: books
            label: Books
            widget: list
            fields:
              - { label: Title, name: title, widget: string }
              - { label: Author, name: author, widget: string }
              - { label: Cover image, name: cover, widget: image, required: false }
```

Auth: GitHub OAuth app, PKCE flow, no server. Callback URL: `https://rummankalam.com/admin/`. Document setup in README.

---

## 8. Cloudflare Pages

`wrangler.toml`:
```toml
name = "rummankalam-com"
pages_build_output_dir = "dist"
compatibility_date = "2026-04-01"
```

`package.json` scripts:
```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "deploy": "wrangler pages deploy dist"
}
```

`public/_headers`:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 9. SEO

`SEO.astro` outputs: `<title>`, canonical, OG tags, Twitter card, JSON-LD.

Title pattern: `{Page title} — Rumman Kalam`. Homepage: `Rumman Kalam — Media. Technology. Culture.`

Consulting page targets: "digital transformation consultant Bangladesh", "new media strategy South Asia", "audience growth publisher", "digital media consulting Dhaka". Use naturally in copy — no stuffing.

JSON-LD types: `Person` on homepage, `Article` on blog posts, `CreativeWork` on portfolio items, `ProfessionalService` on consulting (with `areaServed: ["Bangladesh", "South Asia"]`).

`@astrojs/sitemap` generates `sitemap.xml`. Add to `astro.config.mjs`.

---

## 10. Performance budget

- FCP < 1.0s on 4G
- LCP < 1.5s on 4G
- Total JS homepage: < 15kb gzipped
- Lighthouse Performance ≥ 98, Accessibility 100, Best Practices 100, SEO 100

How to hit it:
- Preload Fraunces 400 + Inter 500 only above the fold. Others `font-display: swap`.
- Inline critical CSS (masthead + hero) in `<head>`.
- Portrait and grain have no image files — both are generated/data-URI.
- Typewriter lines inlined at build time via `define:vars`, no runtime JSON fetch.
- All data JSON files imported at build time in `.astro` components, never fetched at runtime.

---

## 11. Accessibility

- One `<h1>` per page.
- `<article>` for publications/posts/case studies, `<nav>` for masthead + footer, `<main>` for page content, `<time datetime="...">` for all dates.
- Halftone SVG: `role="img" aria-label="Rumman Kalam, halftoned portrait"`.
- ASCII `<pre>`: `aria-hidden="true"`.
- Mode toggle: `aria-label`, `aria-pressed`.
- Focus ring: visible, red, on all interactive elements.
- `prefers-reduced-motion`: disable typewriter animation (show first line statically), disable scanline animation in dark mode, disable portrait hover rotation.

---

## 12. Seed content

Create enough placeholder content for the site to render fully:
- 15 publications across outlets + types
- 9 portfolio case studies (Authr, MTS, SHOUT, Rantages, Satireday, The Monsoon Herald, SDP, UNB Editorial Calendar, The Common Interface)
- 5 blog posts
- `timeline.json` seeded with the 5 nodes above
- `logos.json` seeded with the 4 tiles above
- `achievements.json` seeded with the 6 items above
- `typewriter.json` seeded with the 6 lines above
- `about.json` seeded with 80–150 words per box
- `consulting.json` seeded with 4 service areas, 2 engagements, 1 testimonial placeholder
- `reading-current.json`: 2 books
- `reading-alltime.json`: 25 books

Write seed copy in Rumman's voice — direct, dry, no em-dash overuse, no "game-changing" vocabulary. He will replace.

---

## 13. Do not

- No Tailwind, shadcn, or any component library.
- No React, Vue, or Svelte.
- No Google Analytics, GTM, or any tracking. If analytics are needed later: Plausible or self-hosted Umami.
- No newsletter modals, scroll-triggered popups, or subscription prompts.
- No AI stock imagery. Placeholder case studies use styled text tiles until real images are supplied.
- No Title Case. Sentence case everywhere including nav, section labels, and CMS field labels.
- No emoji anywhere in the site UI.
- Do not cache or memoize the portrait generator. Fresh jitter per load is intentional.
- Do not use `prefers-color-scheme` to set initial theme. Default is always light. Dark is a user-discovered toggle.
- Do not add a "Rumman Kalam" kicker above the hero headline — the name is in the masthead.
- Do not put the satirical work front-and-centre. It is a filter chip under `/publications`, nothing more.

---

## 14. Build order

Follow this sequence. Verify each step renders correctly before proceeding.

1. Scaffold Astro project, install all deps (`@fontsource/*`, `@astrojs/sitemap`, `remark-footnotes`)
2. `tokens.css`, `global.css`, font loading + preloads
3. `BaseLayout.astro` — grain, masthead, footer, mode toggle wired up
4. Homepage — port pixel-for-pixel from `reference/homepage-v3.html`. Include all three JS behaviours. Verify in browser before moving on.
5. Seed all `data/` JSON files
6. `content/config.ts` schemas
7. Publications archive with filters
8. Portfolio index + detail pages
9. Blog index + detail + RSS
10. About page (three-box)
11. Consulting page
12. Reading page
13. Contact page + 404
14. `SEO.astro` + sitemap + robots
15. Sveltia CMS — write full `config.yml` covering every collection above, verify each widget type renders correctly in `/admin/`
16. `_headers`, `wrangler.toml`
17. `README.md` — local dev, build, Cloudflare deploy, GitHub OAuth setup for CMS

## 15. Done when

- `npm run dev` runs without errors, all pages reachable
- `npm run build` produces zero warnings
- Homepage matches `reference/homepage-v3.html` visually
- Every CMS collection in §7 is editable in `/admin/` without touching code
- Lighthouse scores hit the §10 budget
- README covers everything someone needs to clone, run, deploy, and edit content

---END PROMPT---
