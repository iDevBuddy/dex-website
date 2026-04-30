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
npm run blog:draft -- --topic "AI automation for small businesses"
npm run blog:seo
npm run blog:image
npm run blog:audio
npm run blog:media
npm run blog:slides
npm run blog:infographic
npm run blog:quality
npm run blog:publish
npm run blog:schedule:test
npm run blog:adsense
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
GITHUB_TOKEN=
GITHUB_REPOSITORY=iDevBuddy/dex-website
BLOG_PIPELINE_WORKFLOW=blog-pipeline.yml
```

Supported command intents include:

- `/blog report`
- `/blog ideas`
- `/blog generate`
- `/blog sprint status`
- `/blog sprint start`
- `/blog sprint stop`
- `/blog new topic: [topic]`
- `/blog draft: [topic]`
- `/blog approve latest`
- `/blog schedule`
- `/blog reject latest`
- `/blog rewrite latest`
- `/blog change topic [topic]`
- `/blog add section [request]`
- `/blog make expert latest`
- `/blog make simple latest`
- `/blog improve seo latest`
- `/blog generate slides latest`
- `/blog generate infographic latest`
- `/blog adsense status`
- `/blog improve [url]`
- `/blog generate image [url]`
- `/blog generate audio [url]`
- `/blog status`
- `/blog help`

Slack signature verification is enforced for Slack endpoints.
Interactive draft messages support:

- Approve Publish
- Request Rewrite
- Improve SEO
- Change Tone
- Regenerate Image
- Generate Audio
- Reject

The Slack command center can dispatch GitHub workflows when `GITHUB_TOKEN` has the required repository/workflow permissions. Final content still publishes as Markdown in GitHub, never as Notion-hosted content.

Automatic draft generation is scheduled in `.github/workflows/blog-auto-draft.yml`. During the first-month authority sprint it runs daily at 10:00 AM Pakistan time with cron `0 5 * * *`. After the sprint, the workflow gates itself back to the normal Monday, Tuesday, Thursday, and Saturday cadence. Manual approval remains on by default, so scheduled drafts go to Slack/Notion for review instead of publishing directly.

Check Phase 3 readiness:

```bash
npm run phase3:check
```

Live status endpoint:

```text
/api/blog/status
```

## Notion setup

Create a Notion integration, share one parent page with it, then run:

```bash
npm run notion:setup
```

The setup script creates or reuses these databases under the parent page:

- Blog Ideas
- Blog Drafts
- Published Posts
- Refresh Queue
- Performance Reports

Required environment variables:

```bash
USE_NOTION=true
NOTION_API_KEY=
NOTION_PARENT_PAGE_URL=
NOTION_WEBHOOK_SECRET=
NOTION_BLOG_IDEAS_DB_ID=
NOTION_BLOG_DRAFTS_DB_ID=
NOTION_PUBLISHED_POSTS_DB_ID=
NOTION_REFRESH_QUEUE_DB_ID=
NOTION_PERFORMANCE_REPORTS_DB_ID=
```

The script writes generated IDs to `.env.notion.generated`. Copy those database IDs into Netlify environment variables.

The scripts sync topic ideas, drafts, published posts, performance report placeholders, and refresh recommendations when credentials are present. If Notion fails, the pipeline logs the error and continues.

Optional webhook endpoint:

```text
POST https://YOUR_NETLIFY_DOMAIN/api/notion/webhook
Header: X-Blog-Webhook-Secret: NOTION_WEBHOOK_SECRET
```

Use this from an external Notion automation service when a draft or refresh task changes to `Approved`. The webhook routes publishing work back to GitHub.

## AI provider setup

The article generator supports GPT-OSS, Gemma, and any OpenAI-compatible local endpoint. Research, SEO optimization, and quality review can use a separate review model.

```bash
LOCAL_LLM_URL=
LOCAL_LLM_MODEL=
REVIEW_LLM_URL=
REVIEW_LLM_MODEL=
OPENAI_API_KEY=
OPENAI_MODEL=
```

If no LLM is configured, draft generation fails safely and sends a clear Slack/Notion message instead of creating weak AI content.

## Authority sprint mode

First-month authority sprint mode uses stricter thresholds and daily draft generation:

```bash
FIRST_MONTH_AUTHORITY_SPRINT=true
AUTHORITY_SPRINT_DAYS=30
DAILY_CONTENT_MODE=true
DAILY_CONTENT_TARGET=1
MIN_QUALITY_SCORE=88
MIN_TOPIC_SCORE=78
```

The content strategy prioritizes AI expert topics, business automation workflows, AI tools, GPT-OSS/Gemma, GitHub repos, Kaggle datasets, and function-specific automation for finance, security, sales, support, operations, ecommerce, HR, and analytics.

## Media and assets

The media intelligence agent recommends supporting assets for each draft: featured image, infographic, slides, checklist, workflow diagram, downloadable PDF, NotebookLM research summary, and social carousel. Slides and infographic generation are provider-based; if Gamma or an image provider is missing, the engine creates Notion/Slack tasks with detailed briefs instead of pretending the asset exists.

## Image model setup

Primary image generation is provider-based:

```bash
USE_IMAGE_MODEL=true
IMAGE_PROVIDER=local_comfyui
COMFYUI_URL=
COMFYUI_WORKFLOW_PATH=
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
TTS_VOICE=
TTS_SPEED=
```

## Performance intelligence

Phase 4 is not fully implemented yet. `/blog report` returns a clear Phase 4 pending message until Search Console and GA4 intelligence are added.

Existing placeholder commands:

```bash
npm run blog:performance
npm run blog:recommend
npm run blog:tone
npm run blog:links
npm run blog:clusters
```

Search Console and GA4 environment variables are scaffolded, but the full performance engine is intentionally pending until the Phase 4 prompt.

## Detailed setup docs

- `docs/setup-netlify-env.md`
- `docs/setup-slack.md`
- `docs/setup-notion.md`
- `docs/ai-providers.md`
- `docs/image-generation.md`
- `docs/tts-audio.md`
- `docs/notebooklm-research-workflow.md`

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
