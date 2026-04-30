# DEX Website and AI Authority Blog Engine

This is the DEX by Akif Saeed website. It is a Vite + React + Tailwind app deployed on Netlify.

## Local setup

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

The build runs `scripts/blog/generate-static-assets.mjs` first, which generates:

- `public/sitemap.xml`
- `public/rss.xml`
- `public/robots.txt`
- fallback blog images in `public/blog/images`

## Blog structure

- Blog index: `/blog`
- Article route: `/blog/:slug`
- Markdown content: `content/blog/*.md`
- Blog components: `src/components/blog`
- Blog utilities: `src/lib/blog.js`
- Trust pages: `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`

Each blog post uses frontmatter for title, metadata, FAQ, sources, image alt text, tone, and target keyword.

## Run the blog pipeline

Dry run preview:

```bash
npm run blog:pipeline -- --dry-run
```

Publish after approval:

```bash
npm run blog:publish -- --force
```

Individual steps:

```bash
npm run blog:discover
npm run blog:score
npm run blog:research
npm run blog:generate
npm run blog:seo
npm run blog:image
npm run blog:audio
npm run blog:quality
npm run blog:publish
```

## Create the first manual blog post

1. Copy `content/blog/ai-authority-blog-engine.md`.
2. Rename it to a clean slug, for example `content/blog/slack-ai-automation.md`.
3. Update frontmatter fields: `title`, `metaTitle`, `description`, `slug`, `publishedAt`, `updatedAt`, `targetKeyword`, `faqs`, and `sources`.
4. Add the Markdown body.
5. Run `npm run build`.

## Slack setup

Create a Slack app with a slash command:

- Command: `/blog`
- Request URL: `https://YOUR_NETLIFY_DOMAIN/api/slack/commands`
- Interactivity URL: `https://YOUR_NETLIFY_DOMAIN/api/slack/interactions`

Set Netlify environment variables:

```bash
USE_SLACK=true
SLACK_SIGNING_SECRET=
SLACK_WEBHOOK_URL=
SLACK_BLOG_CHANNEL_ID=
```

Supported command intents include:

- `/blog report`
- `/blog ideas`
- `/blog new topic: [topic]`
- `/blog draft: [topic]`
- `/blog publish latest`
- `/blog improve [url]`
- `/blog generate image [url]`
- `/blog generate audio [url]`
- `/blog status`
- `/blog help`

Slack signature verification is enforced for Slack endpoints.

## Notion setup

Create these databases manually and store their IDs in Netlify/GitHub secrets:

- Blog Ideas
- Blog Drafts
- Published Posts
- Content Refresh Queue
- Performance Reports

Required environment variables:

```bash
USE_NOTION=true
NOTION_API_KEY=
NOTION_BLOG_IDEAS_DB_ID=
NOTION_BLOG_DRAFTS_DB_ID=
NOTION_PUBLISHED_POSTS_DB_ID=
NOTION_REFRESH_QUEUE_DB_ID=
NOTION_PERFORMANCE_REPORTS_DB_ID=
```

The scripts sync topic ideas, scoring, published posts, performance reports, and refresh recommendations when credentials are present. If Notion fails, the pipeline logs the error and continues.

## AI provider setup

The article generator supports OpenAI-compatible local endpoints.

```bash
LOCAL_LLM_URL=http://localhost:11434/v1/chat/completions
LOCAL_LLM_MODEL=gpt-oss
OPENAI_API_KEY=
```

If the endpoint is unavailable, the MVP uses a safe structured fallback draft so the pipeline can still be tested.

## Image model setup

Primary image generation is provider-based:

```bash
USE_IMAGE_MODEL=true
IMAGE_PROVIDER=local_comfyui
COMFYUI_URL=http://localhost:8188
USE_GPT_IMAGE=false
OPENAI_API_KEY=
```

For MVP reliability, if no configured image provider is available, the script creates a PNG fallback and logs the provider failure. SVG is not used as the primary image system.

## Audio setup

Every article includes a “Listen to this article” player. If an MP3 is available in frontmatter, it plays the file. Otherwise it uses browser `SpeechSynthesis`.

```bash
USE_LOCAL_TTS=true
TTS_PROVIDER=browser_fallback
TTS_API_URL=
```

## Performance intelligence

Run:

```bash
npm run blog:performance
npm run blog:recommend
npm run blog:tone
npm run blog:links
npm run blog:clusters
```

Search Console and GA4 credentials are scaffolded through environment variables. Without credentials, reports are generated with `missing_credentials` status so the workflow remains visible.

## Deployment

Netlify uses:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

API routes are mapped in `netlify.toml`, including:

- `/api/slack/commands`
- `/api/slack/interactions`
- `/api/blog/report`
- `/api/blog/approve`
- `/api/blog/improve`
- `/api/blog/run`

## Rollback

All blog publishing happens through Markdown and generated assets. Roll back by reverting the commit or closing the refresh PR. The GitHub Actions workflows are configured to avoid production changes when quality checks fail.
