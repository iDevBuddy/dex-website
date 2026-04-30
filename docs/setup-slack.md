# Slack Setup

Slack is the command center for the AI Blog Engine.

## 1. Create a Slack app

1. Open https://api.slack.com/apps.
2. Click **Create New App**.
3. Choose **From scratch**.
4. Name it `AI Blog Engine`.
5. Pick your workspace.

## 2. Add the slash command

In **Slash Commands**, create:

```text
Command: /blog
Request URL: https://YOUR_DOMAIN/api/slack/commands
Short description: Control the AI Blog Engine
```

Supported commands:

```text
/blog status
/blog report
/blog ideas
/blog new topic: [topic]
/blog draft: [topic]
/blog publish latest
/blog improve [url]
/blog rewrite title [url]
/blog change tone [url] [tone]
/blog generate image [url]
/blog generate audio [url]
/blog pause autopublish
/blog resume autopublish
/blog update old posts
/blog help
```

`/blog report` currently returns a Phase 4 pending message until performance intelligence is built.

## 3. Enable interactivity

In **Interactivity & Shortcuts**, set:

```text
Request URL: https://YOUR_DOMAIN/api/slack/interactions
```

The draft approval buttons are:

- Approve Publish
- Request Rewrite
- Improve SEO
- Regenerate Image
- Generate Audio
- Reject

Some approval actions are intentionally safe placeholders until workflow dispatch credentials are complete.

## 4. Add Netlify environment variables

```bash
USE_SLACK=true
SLACK_SIGNING_SECRET=
SLACK_WEBHOOK_URL=
SLACK_BLOG_CHANNEL_ID=
SLACK_BOT_TOKEN=
```

The signing secret is required. The endpoint rejects unsigned or tampered Slack requests.

## 5. Test

In Slack, run:

```text
/blog status
```

Then check:

```text
https://YOUR_DOMAIN/api/blog/status
```
