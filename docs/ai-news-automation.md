# AI News Automation

The AI news monitor watches trusted official sources and creates fast, SEO-checked blog posts when a major AI product, tool, model, API, or platform update appears.

## What It Tracks

Default official sources:

- OpenAI News
- NVIDIA Developer Blog
- NVIDIA Blog
- Google AI Blog
- Meta Engineering

You can override or add feeds with:

```env
AI_NEWS_FEEDS=OpenAI|https://openai.com/news/rss.xml,NVIDIA|https://developer.nvidia.com/blog/feed/
```

## Schedule

The workflow lives at:

```text
.github/workflows/ai-news-monitor.yml
```

It runs every 2 hours and can also be started manually from GitHub Actions.

## Publishing Rules

AI news posts can auto-publish only when the safety gates pass:

- Topic comes from a trusted official source
- SEO audit passes
- Authentic sources are present
- Quality check passes, or the trusted-news trend override is allowed
- Build passes after the post is generated

The trend override is designed for fast-moving official AI news. It does not allow weak or irrelevant content to bypass all checks.

## Tool-Specific Images

For posts about a specific tool, product, model, API, or platform:

- The system does not use AI-generated images.
- It tries to fetch an official product image from the official source page.
- It prefers OpenGraph or Twitter card images from the official announcement or product page.
- If no official image is available, it uses the placeholder image and marks the image status so Slack/Notion show that review is needed.

This keeps tool posts visually accurate and avoids fake screenshots or incorrect branding.

## SEO Audit

Every AI-news draft runs through:

```bash
npm run blog:seo-audit
```

The current implementation uses a local SEO audit bridge so CI can run non-interactively. It checks title, meta description, slug, headings, FAQ, sources, image alt text, internal links, and article depth.

The external SEO Audit skill can still be installed for manual audits:

```bash
npx skills add https://github.com/coreyhaines31/marketingskills --skill seo-audit
```

## Important Environment Variables

```env
ENABLE_AI_NEWS_TRACKING=true
AI_NEWS_AUTO_PUBLISH=true
AI_NEWS_FORCE_DRAFT=true
AI_NEWS_SOURCE_LIMIT=16
AI_NEWS_RECENCY_HOURS=168
ALLOW_OFFICIAL_IMAGE_PLACEHOLDER=true
SEO_AUDIT_MIN_SCORE=82
SEO_AUDIT_SKILL=local_seo_audit_bridge
```

## Manual Test

Run discovery only:

```bash
npm run blog:discover -- --dry-run --source-limit 2
```

Run the news pipeline without publishing:

```bash
npm run blog:news -- --dry-run --force-draft
```

Run a specific topic:

```bash
npm run blog:news -- --topic "OpenAI launches new AI automation tool" --dry-run
```
