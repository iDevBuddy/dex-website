import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.cwd()

function hasEnv(name) {
    return Boolean(process.env[name] && String(process.env[name]).trim())
}

async function exists(file) {
    try {
        await fs.access(path.join(root, file))
        return true
    } catch {
        return false
    }
}

function status(ok, message, details = {}) {
    return { ok, message, ...details }
}

export async function phase3Check() {
    const checks = {
        slackSigning: status(hasEnv('SLACK_SIGNING_SECRET'), hasEnv('SLACK_SIGNING_SECRET') ? 'Slack request verification configured.' : 'Missing SLACK_SIGNING_SECRET.'),
        slackWebhook: status(hasEnv('SLACK_WEBHOOK_URL'), hasEnv('SLACK_WEBHOOK_URL') ? 'Slack notifications configured.' : 'Missing SLACK_WEBHOOK_URL.'),
        notionToken: status(hasEnv('NOTION_API_KEY'), hasEnv('NOTION_API_KEY') ? 'Notion API token configured.' : 'Missing NOTION_API_KEY.'),
        notionDatabases: status(
            ['NOTION_BLOG_IDEAS_DB_ID', 'NOTION_BLOG_DRAFTS_DB_ID', 'NOTION_PUBLISHED_POSTS_DB_ID', 'NOTION_REFRESH_QUEUE_DB_ID', 'NOTION_PERFORMANCE_REPORTS_DB_ID'].every(hasEnv),
            'Notion database IDs check.',
            {
                missing: ['NOTION_BLOG_IDEAS_DB_ID', 'NOTION_BLOG_DRAFTS_DB_ID', 'NOTION_PUBLISHED_POSTS_DB_ID', 'NOTION_REFRESH_QUEUE_DB_ID', 'NOTION_PERFORMANCE_REPORTS_DB_ID'].filter((name) => !hasEnv(name)),
            },
        ),
        notionWebhookSecret: status(hasEnv('NOTION_WEBHOOK_SECRET'), hasEnv('NOTION_WEBHOOK_SECRET') ? 'Notion webhook secret configured.' : 'Missing NOTION_WEBHOOK_SECRET.'),
        githubToken: status(hasEnv('GITHUB_TOKEN') || hasEnv('BLOG_GITHUB_TOKEN'), hasEnv('GITHUB_TOKEN') || hasEnv('BLOG_GITHUB_TOKEN') ? 'GitHub dispatch token configured.' : 'Missing GITHUB_TOKEN or BLOG_GITHUB_TOKEN.'),
        activeWorkflow: status(await exists('.github/workflows/blog-pipeline.yml'), 'Active GitHub workflow file check.', {
            active: await exists('.github/workflows/blog-pipeline.yml'),
            documented: await exists('docs/github-actions/blog-pipeline.yml'),
            note: 'If active=false, move docs/github-actions/*.yml into .github/workflows/ using a token with workflow scope.',
        }),
        routes: status(
            await exists('netlify/functions/slack-commands.js')
            && await exists('netlify/functions/slack-interactions.js')
            && await exists('netlify/functions/notion-webhook.js'),
            'Netlify Phase 3 routes present.',
        ),
    }

    const requiredOk = checks.slackSigning.ok
        && checks.slackWebhook.ok
        && checks.notionToken.ok
        && checks.notionDatabases.ok
        && checks.notionWebhookSecret.ok
        && checks.githubToken.ok
        && checks.activeWorkflow.ok
        && checks.routes.ok

    const result = {
        ready: requiredOk,
        publishingSource: 'GitHub Markdown/MDX in content/blog',
        notionRole: 'Editorial dashboard only',
        checks,
    }

    console.log(JSON.stringify(result, null, 2))
    return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    phase3Check().then((result) => {
        if (!result.ready) process.exitCode = 2
    }).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
