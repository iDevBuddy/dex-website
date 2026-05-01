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
FIRST_MONTH_AUTHORITY_SPRINT=true
AUTHORITY_SPRINT_DAYS=30
AUTHORITY_SPRINT_START_DATE=2026-05-01
DAILY_CONTENT_MODE=true
DAILY_CONTENT_TARGET=1
MIN_QUALITY_SCORE=88
MIN_TOPIC_SCORE=78
REQUIRE_AUTHENTIC_SOURCES=true
MIN_AUTHORITY_SOURCES_PER_ARTICLE=2
MAX_SOURCES_PER_ARTICLE=6
SOURCE_MIN_AUTHORITY_SCORE=75
ENABLE_TREND_QUALITY_OVERRIDE=true
TREND_OVERRIDE_MIN_SCORE=82
TREND_QUALITY_FLOOR=78
QUALITY_FAILURE_RETRY_ENABLED=true
QUALITY_FAILURE_MAX_RETRIES=2
BLOGS_PER_WEEK=4
BLOG_GENERATION_DAYS=MON,TUE,THU,SAT
BLOG_GENERATION_TIME_UTC=05:00
BLOG_TIMEZONE=Asia/Karachi
DEFAULT_BLOG_TONE=Business Owner
DEFAULT_BLOG_STYLE=Practical Guide
DEFAULT_CONTENT_PERSONA=Hybrid
DEFAULT_AUTHORITY_ANGLE=practical_workflow
REQUIRE_REAL_LLM=true
REQUIRE_REAL_IMAGE_MODEL=true
REQUIRE_REAL_TTS=false
ALLOW_FALLBACK_IN_PRODUCTION=false
USE_GAMMA=false
GAMMA_API_KEY=
SLIDES_PROVIDER=manual
INFOGRAPHIC_PROVIDER=image_model
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
IMAGE_PROVIDER=gpt_image
COMFYUI_URL=
COMFYUI_WORKFLOW_PATH=
COMFYUI_AUTH_HEADER=
USE_GPT_IMAGE=true
```

The current production-safe default is `IMAGE_PROVIDER=gpt_image` with `USE_GPT_IMAGE=true`, because the site already has OpenAI credentials. If you want to switch to ComfyUI later, set `IMAGE_PROVIDER=local_comfyui`, then add `COMFYUI_URL` and `COMFYUI_WORKFLOW_PATH`. For protected ComfyUI servers, put the full auth header in `COMFYUI_AUTH_HEADER`, for example `Authorization: Bearer ...`.

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
