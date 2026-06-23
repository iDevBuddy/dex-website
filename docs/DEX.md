# DEX — Master Project Reference & Playbook

> Single source of truth for the **DEX by Akif Saeed** website + autonomous content system.
> Read this first in any new session before changing anything. It captures what exists, why,
> how it works, and how to think about extending it. Nothing here lives only in a chat — it
> all lives in this repo.

- **Live site:** https://dexakif.com
- **Repo:** `iDevBuddy/dex-website` (PUBLIC — never commit secrets)
- **Owner:** Akif Saeed
- **Workflow:** push to `main` → auto-deploys live. Always `git pull --rebase` before pushing
  (CI workflows also push to main).

---

## 1. What DEX is
An AI-automation agency. The site sells **AI agent development** (voice/chat/decision/multi-agent/
workflow/vision agents) and runs an **autonomous AI blog** that publishes 3 research-grade posts a
week to build SEO authority and bring in clients + visitors.

---

## 2. Tech stack & architecture
- **Vite + React 18 + Tailwind CSS 3.** NOT Next.js — prompts/old notes sometimes say Next.js, they
  are WRONG. `'use client'` is a harmless no-op here. Do not migrate to Next (breaks the blog engine
  + Netlify functions).
- Client-side router in `src/App.jsx` (`window.location.pathname` switch). Routes: `/`, `/blog`,
  `/blog/:slug`, `/capabilities`, trust pages (`/privacy`, `/terms`, `/about`, `/contact`,
  `/disclaimer`).
- Libraries: framer-motion (animation), GSAP + ScrollTrigger (scroll reveals), Lenis (smooth scroll),
  lucide-react (icons), simple-icons (brand logos).
- Backend bits: Netlify functions, Hume/Retell voice chatbot ("Sarah"). **Keep the backend
  untouched** when doing visual work.
- Build: `npm run build` runs a `prebuild` (`scripts/blog/generate-static-assets.mjs` → regenerates
  `public/rss.xml`, `public/sitemap.xml` from `content/blog/*.md`) then `vite build`.

---

## 3. Design system (the "DEX look")
Editorial / premium, inspired by the Stodio agency template. Disciplined, not generic-SaaS.
- **Palette (locked):** White `#FFFFFF` (dominant base), Night `#121212` (full-dark sections like the
  hero), near-black ink `#141414` (`ghost`), muted `#6B6B6B`, Candy Apple Red `#DD0426` (`accent` —
  used sparingly: square bullets, one CTA, underlines).
- **Tailwind tokens:** `dark`=white bg, `night`, `ghost`/`ghost-dim`/`ghost-faint`=text, `accent`=red,
  `border`=`#E5E5E5`. (Note: `bg-dark` is WHITE, not dark — legacy key kept.)
- **Fonts:** Schibsted Grotesk (display) + Hanken Grotesk (body) + IBM Plex Mono.
- **Signature utilities** (`src/index.css`): `.eyebrow` (red square + uppercase label), `.dotted-rule`,
  `.text-grad-dark` / `.text-grad-red`, `.btn-grad-red`, and the **Apple "Liquid Glass" navbar**
  (`.nav-glass*` + SVG `#liquidGlass` displacement filter) — adaptive light/dark, specular rim.
- **Anti-AI-slop rules:** editorial type, left-aligned, asymmetry, no centered SaaS hero, no purple
  gradients. (The design hook flags `text-grad-*` and the blog blockquote `border-l` — those are
  intentional brand choices, leave them.)

---

## 4. Site structure
Homepage sections (in `src/App.jsx`, order): Hero → Stats → ProjectPipeline → AgentTypes (`#agents`)
→ Benefits → Services (`#services`) → IndustryStudies (`#impact`) → Industries → Demo (`#demo`) →
Process (`#process`) → Tools (`#tools`) → FAQ (`#faq`) → BlogTeaser → Footer. VoiceChatbot ("Sarah")
is global.

- **Navbar** (`Navbar.jsx`): liquid-glass adaptive bar. Two dropdowns — **Platform** (What We Build,
  Capabilities, Tech Stack, Live Demo) and **Impact** (Proven Impact, Industries, Active Pipeline,
  Our Process) — plus **Blog**, **FAQ**, and a single **"Talk with Sarah"** live-agent CTA (S avatar
  + green pulse dot → opens the voice chatbot).
- **Blog:** `BlogIndex.jsx` (featured + grid via `ArticleCard.jsx`), `BlogPost.jsx` (article page),
  `MarkdownRenderer`, `ActiveTableOfContents`, `ArticleAudioPlayer`. Blog data layer: `src/lib/blog.js`
  (parses `content/blog/*.md` frontmatter, sorts by `publishedAt`).
- All blog/site components use the editorial light theme; the article page CTA is a Night block
  "Talk with Sarah".

---

## 5. The content agent (autonomous blog) — `scripts/agent/`
A lean, OpenAI-centric pipeline built from scratch (no CrewAI / no SDK — thin custom orchestrator)
that replaced an old failing 55-script system. **Design rule: every external call is timeout + retry/
backoff + provider-fallback + safe-JSON, and the top level never throws (fail-soft, always exit 0)** —
a transient blip can never mark a CI run red.

### The "crew" (each = one module)
1. **Scout** (`scout.mjs`) — pulls free RSS/Reddit feeds (`lib/feeds.mjs`), then **Gemma 4 (free)**
   shortlists the best ideas across 4 streams: latest AI tools, Claude skills/MCPs, Reddit business
   pain-points, on-demand topics. Falls back to a heuristic if the LLM is rate-limited.
2. **Analyst** (`analyst.mjs`) — **gpt-5.5 + web_search** (Responses API, reasoning `medium`) does
   agentic deep research → a grounded, **cited** brief. This is the "best data" engine.
3. **Writer** (`writer.mjs`) — **gpt-5-mini** drafts a GEO-structured article from the brief.
4. **Critic** (`critic.mjs`) — **gpt-5.5** (adversarial, reasoning `medium`) rewrites it stronger and
   cuts any claim not grounded in the brief (hallucination guard).
5. **Fact-check** (`factcheck.mjs`) — **gpt-5-mini** verifies every claim against the brief.
6. **Art director** (`artdirector.mjs`) — cover via **NVIDIA FLUX.1-dev** (free dev tier) →
   **Pollinations** (free, no key) fallback; voice via **edge-tts** (free Microsoft neural,
   `python -m edge_tts`).
7. **Publisher** (`publisher.mjs`) — validates + writes the post to `content/blog/<slug>.md`.

### Smart model routing (smallest capable model per task)
Big model (gpt-5.5) only for **research + critic**; gpt-5-mini for draft/fact-check; Gemma 4 free for
scout. gpt-5.x/o-series reject custom `temperature` — `lib/ai.mjs` omits it for those. Research/critic
use single bounded timeouts + `retries:0` (the ladder/fallback is the only retry) so time never
compounds. A full post finishes in ~4-7 min.

### Cost = **$0**
Text on OpenAI's free **data-sharing tokens** (covers TEXT models only) / Gemma 4 free; image on
NVIDIA FLUX + Pollinations (free); voice on edge-tts (free). Image/voice are NOT covered by the free
text tokens — that is why we use the free image/voice providers instead of paid gpt-image/TTS.

### Orchestration (GitHub Actions)
- `content-publisher.yml` — schedule **Mon/Wed/Fri 09:00 UTC** (+ manual dispatch with a `topic`
  input). Generates one post → review queue.
- `content-radar.yml` — every **6 h**; publishes only on a **major breaking** story (Gemma-gated).
- `content-approvals.yml` — every **2 h**; reconciles ClickUp (see §6).
- All share `concurrency: dex-content` + `git pull --rebase` (no push races) and stage paths
  individually (`for p in …; do git add "$p" || true; done`) so a missing folder never fails the
  commit.

---

## 6. Operations — ClickUp approval board
ClickUp "Blog Pipeline" list (id `901818965480`) is the control surface. Uses ClickUp's **default**
statuses (custom statuses can't be set via API).
- Agent finishes a post → saves a **pending draft** (`data/blog/pending/<slug>.json`, committed but
  NOT in `content/blog`, so the live site doesn't show it) → creates a **"📝 REVIEW: <title>"** task
  (assigned to you → mobile push).
- **You, in ClickUp:** mark task **Complete** = publish · **delete** task = reject · create a task
  named **"WRITE: <topic>"** = generate that post on demand.
- The 2-hourly approvals poll (`run-approvals.mjs`) then publishes approved drafts into
  `content/blog/`, discards rejected ones, and runs WRITE requests.
- Alerts also route through `lib/notify.mjs` (ClickUp task; WhatsApp adapter wired but unused).

---

## 7. SEO & AEO (Google + AI search) — automatic
Goal: rank on Google's first page + AI Overviews, and get cited by ChatGPT/Claude/Perplexity.
**All of this is baked into the code, so every page and every agent-generated post is optimized
automatically — no manual SEO per post.**

- **`src/lib/siteSchema.js`** — injects site-wide JSON-LD on every page (persists across routes):
  **Organization + WebSite + ProfessionalService** → establishes the DEX entity for Google Knowledge
  Graph + AI engines. Also exports `faqPageSchema()` and `breadcrumbSchema()` helpers. Injected from
  `App.jsx` (`injectSiteSchema()` on mount).
- **`public/llms.txt`** — structured site summary AI crawlers read (what DEX builds, key pages, blog,
  author/expertise). The modern AEO standard.
- **Per-page schema:** homepage FAQ section emits **FAQPage** (`FAQ.jsx`); blog posts emit
  **BlogPosting + FAQPage + BreadcrumbList** (`BlogPost.jsx` + `src/lib/blog.js`); blog index emits
  **BreadcrumbList + Blog**. `src/lib/seo.js` `setSeo()` handles title/meta/OG/Twitter/canonical +
  per-page schema injection.
- **AdSense readiness:** privacy/terms/about/contact/disclaimer pages exist and are linked in the
  footer; content quality is high. `ads.txt` is added only AFTER AdSense approval (with the real
  publisher id).
- **Still to do (off-page / time-based):** backlinks / link-building, content volume (the agent
  builds this over time), optional `llms.txt` auto-refresh by the agent, optional automated SEO
  health-check workflow. **Ranking takes ~2-4 weeks of Google crawl regardless — no live monitoring
  needed; the on-site work is permanent in the repo.**

---

## 8. Secrets & configuration
- **Local dev:** `.env.local` (gitignored). Keys: `OPENAI_API_KEY`, `OPENROUTER_API_KEY` (Gemma 4),
  `NVIDIA_API_KEY`, `CLICKUP_TOKEN`, `CLICKUP_LIST_ID`, plus model routing vars.
- **CI:** the same as **GitHub repo Secrets** (Settings → Secrets and variables → Actions). Workflows
  read them via `${{ secrets.* }}`.
- ⚠️ Several keys were pasted in chat during setup — **rotate them** and update the secrets. The repo
  is public; never commit a secret.

---

## 9. How to think & work on this project (principles)
1. **Read this file + the memory first.** Don't re-derive what's already decided.
2. **Push-to-main is live.** Verify (build, screenshot) before pushing; `pull --rebase` first.
3. **Fail-soft everywhere.** No agent line may hard-crash a run. Every external call: timeout + retry +
   fallback + guarded parse. Top level returns/exits 0.
4. **Smallest capable model.** Don't use gpt-5.5 where gpt-5-mini or Gemma does the job.
5. **$0 by default.** Prefer free providers (Gemma, NVIDIA FLUX, Pollinations, edge-tts, free RSS).
   Only spend where quality genuinely needs it, and say so.
6. **Brand discipline.** Stay on the locked palette/fonts; editorial, not generic. Reuse the signature
   utilities. No AI-slop.
7. **Grounded content only.** Every post starts from a real fetched source with citations; the
   fact-check gate must pass before publish.
8. **SEO/AEO is structural, not bolt-on.** New page types get their schema (Organization context +
   page-specific schema) so Google and AI engines can parse them.
9. **Confirm irreversible / outward-facing actions** (publishing, pushing, sending) unless clearly
   authorized.
10. **Keep this doc current.** When you add a feature, add a line here. This file is the permanent
    handoff — a new session or developer should be able to continue from it alone.

---

## 10. Status & roadmap
- ✅ Website redesign (editorial White/Night/Red, liquid-glass navbar, all sections + blog).
- ✅ Autonomous content agent (research → write → critic → fact-check → cover → voice → publish),
  3×/week + breaking radar, ClickUp approval + mobile push, $0 free stack.
- ✅ On-site SEO/AEO foundation (entity schema, llms.txt, FAQ/Breadcrumb/Blog schema, AdSense-ready
  legal pages).
- ⏳ Next: **backlinks / link-building strategy**, content volume (auto via agent), optional
  `llms.txt` auto-refresh + automated SEO health-check, then apply for AdSense once content volume is
  there.

---

## 11. Gotchas
- `bg-dark` token = **white**, not dark.
- Pollinations `enhance=true` + a strictly-geometric prompt avoids weird/organic covers; NVIDIA FLUX
  is primary and cleaner.
- ClickUp custom statuses can't be set via API → the flow uses default statuses.
- OpenAI free data-sharing tokens cover **text only** (not image/TTS).
- Memory files (`~/.claude/.../memory/dex-*.md`) persist across sessions and auto-load — but this repo
  doc is the canonical, shareable reference.
