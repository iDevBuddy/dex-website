import { json } from './_lib/slack-blog.js'

function configured(name) {
    return Boolean(process.env[name] && String(process.env[name]).trim())
}

export async function handler() {
    const checks = {
        slackSigningSecret: configured('SLACK_SIGNING_SECRET'),
        slackWebhook: configured('SLACK_WEBHOOK_URL'),
        slackChannel: configured('SLACK_BLOG_CHANNEL_ID'),
        notionToken: configured('NOTION_API_KEY'),
        notionDatabases: [
            'NOTION_BLOG_IDEAS_DB_ID',
            'NOTION_BLOG_DRAFTS_DB_ID',
            'NOTION_PUBLISHED_POSTS_DB_ID',
            'NOTION_REFRESH_QUEUE_DB_ID',
            'NOTION_PERFORMANCE_REPORTS_DB_ID',
        ].every(configured),
        notionWebhookSecret: configured('NOTION_WEBHOOK_SECRET'),
        githubDispatch: configured('GITHUB_TOKEN') || configured('BLOG_GITHUB_TOKEN'),
    }

    return json(200, {
        ok: true,
        phase: 3,
        ready: Object.values(checks).every(Boolean),
        publishingSource: 'GitHub Markdown/MDX in content/blog',
        notionRole: 'Editorial dashboard only',
        checks,
    })
}
