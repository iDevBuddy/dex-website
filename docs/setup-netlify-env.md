# Netlify Environment Setup

The AI Blog Engine reads all secrets from Netlify environment variables. Do not commit real secrets to GitHub.

## Required MVP variables

```bash
SITE_URL=
BRAND_NAME=
AUTHOR_NAME=

USE_SLACK=true
SLACK_SIGNING_SECRET=
SLACK_WEBHOOK_URL=
SLACK_BLOG_CHANNEL_ID=
SLACK_BOT_TOKEN=

USE_NOTION=true
NOTION_API_KEY=
NOTION_PARENT_PAGE_URL=
NOTION_WEBHOOK_SECRET=
NOTION_BLOG_IDEAS_DB_ID=
NOTION_BLOG_DRAFTS_DB_ID=
NOTION_PUBLISHED_POSTS_DB_ID=
NOTION_REFRESH_QUEUE_DB_ID=
NOTION_PERFORMANCE_REPORTS_DB_ID=

GITHUB_TOKEN=
GITHUB_REPOSITORY=iDevBuddy/dex-website
BLOG_GITHUB_REPO=iDevBuddy/dex-website
BLOG_GITHUB_REF=main
BLOG_PIPELINE_WORKFLOW=blog-pipeline.yml

USE_AUTO_PUBLISH=false
MANUAL_APPROVAL=true
MIN_QUALITY_SCORE=85
MIN_TOPIC_SCORE=75
BLOGS_PER_WEEK=4
BLOG_GENERATION_DAYS=MON,TUE,THU,SAT
BLOG_GENERATION_TIME_UTC=05:00
BLOG_TIMEZONE=Asia/Karachi
DEFAULT_BLOG_TONE=Business Owner
DEFAULT_BLOG_STYLE=Practical Guide
```

`GITHUB_TOKEN` should be a GitHub personal access token with repo access and workflow dispatch permission. Without it, Slack and Notion can record requests but cannot safely trigger publishing workflows.

## AI provider variables

```bash
LOCAL_LLM_URL=
LOCAL_LLM_MODEL=
REVIEW_LLM_URL=
REVIEW_LLM_MODEL=
USE_GPT_OSS=true
USE_GEMMA=true
OPENAI_API_KEY=
OPENAI_MODEL=
```

## Image variables

```bash
USE_IMAGE_MODEL=true
IMAGE_PROVIDER=local_comfyui
COMFYUI_URL=
COMFYUI_WORKFLOW_PATH=
USE_GPT_IMAGE=false
```

## Audio variables

```bash
USE_LOCAL_TTS=true
TTS_PROVIDER=browser_fallback
TTS_API_URL=
TTS_VOICE=
TTS_SPEED=
```

## Phase 4 placeholders

These are present but should remain disabled until Phase 4 is implemented:

```bash
ENABLE_SEARCH_CONSOLE_MONITORING=false
GOOGLE_CLIENT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_SEARCH_CONSOLE_SITE_URL=

ENABLE_GA4_MONITORING=false
GA4_PROPERTY_ID=

ENABLE_CONTENT_REFRESH=false
ENABLE_TONE_TESTING=false
ENABLE_INTERNAL_LINKING=true
ENABLE_TOPIC_CLUSTERS=true
```

## Test

After saving environment variables, redeploy Netlify and open:

```text
https://YOUR_DOMAIN/api/blog/status
```

The response shows only true/false status. It never exposes secret values.
