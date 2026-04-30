# Phase 3: Slack Command Center and Notion Editorial Dashboard

Phase 3 adds Slack and Notion as control surfaces only. The final blog source remains GitHub Markdown/MDX in `content/blog`.

## Slack endpoints

- Slash command: `/api/slack/commands`
- Interactive buttons: `/api/slack/interactions`
- Blog report API: `/api/blog/report`
- Blog approval API: `/api/blog/approve`
- Blog improvement API: `/api/blog/improve`
- Blog run API: `/api/blog/run`

Slack requests are verified with `SLACK_SIGNING_SECRET`.

## Slack commands

- `/blog report`
- `/blog ideas`
- `/blog new topic: [topic]`
- `/blog draft: [topic]`
- `/blog publish latest`
- `/blog improve [url]`
- `/blog rewrite title [url]`
- `/blog change tone [url] [tone]`
- `/blog generate image [url]`
- `/blog generate audio [url]`
- `/blog pause autopublish`
- `/blog resume autopublish`
- `/blog update old posts`
- `/blog cluster [topic]`
- `/blog status`
- `/blog help`

## Slack approval buttons

Draft-ready notifications can include:

- Approve Publish
- Request Rewrite
- Improve SEO
- Change Tone
- Regenerate Image
- Generate Audio
- Reject

Button clicks route to GitHub workflow/repository dispatch when `GITHUB_TOKEN` is configured.

## Notion databases

Create five databases manually and add their IDs to Netlify/GitHub environment variables.

### Blog Ideas

- Topic
- Source
- Keyword
- Trend Score
- SEO Score
- Business Value
- Priority
- Status
- Created Date
- Slack Thread

### Blog Drafts

- Title
- Slug
- Topic
- Draft Status
- SEO Score
- Quality Score
- Image Status
- Audio Status
- Approval Status
- Preview URL
- Published URL
- Notion Notes
- Slack Thread

### Published Posts

- Title
- URL
- Slug
- Target Keyword
- Category
- Date Published
- Last Updated
- Clicks
- Impressions
- CTR
- Average Position
- Performance Score
- Recommended Action

### Refresh Queue

- Blog URL
- Problem
- Recommended Fix
- Priority
- Status
- Before Score
- After Score

### Performance Reports

- Date
- Top Blog
- Worst Blog
- Best Topic
- Best Tone
- Recommended Actions
- Summary

## Required environment variables

```bash
USE_SLACK=true
SLACK_SIGNING_SECRET=
SLACK_WEBHOOK_URL=
SLACK_BLOG_CHANNEL_ID=

USE_NOTION=true
NOTION_API_KEY=
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
```

## Readiness check

Run this locally or in CI:

```bash
npm run phase3:check
```

On the live site, check:

```text
GET /api/blog/status
```

The status endpoint reports whether Slack, Notion, GitHub dispatch, and database IDs are configured. It does not expose secret values.

## GitHub workflow activation

The workflow templates are stored in:

```text
docs/github-actions/
```

To activate GitHub Actions dispatch from Slack/Notion, move them to:

```text
.github/workflows/
```

This requires a GitHub token with `workflow` scope. Without that scope GitHub rejects pushes that create or update workflow files.

## Notion approval webhook

If you use an external Notion automation tool, send approved draft/refresh events here:

```text
POST /api/notion/webhook
Header: X-Blog-Webhook-Secret: NOTION_WEBHOOK_SECRET
```

Example body:

```json
{
  "type": "draft",
  "status": "Approved",
  "slug": "ai-crm-automation",
  "topic": "AI CRM automation"
}
```

The webhook routes the approval to GitHub workflow dispatch. Notion is not used as the final blog host.
