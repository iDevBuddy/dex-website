import { createHmac, timingSafeEqual } from 'node:crypto'
import { config } from './config.mjs'
import { warn } from './logger.mjs'

export function verifySlackSignature({ body, timestamp, signature, signingSecret = process.env.SLACK_SIGNING_SECRET }) {
    if (!signingSecret || !timestamp || !signature) return false
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
    if (age > 60 * 5) return false
    const base = `v0:${timestamp}:${body}`
    const expected = `v0=${createHmac('sha256', signingSecret).update(base).digest('hex')}`
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function notifySlack(text, blocks) {
    if (!config.slackEnabled || !process.env.SLACK_WEBHOOK_URL) return { skipped: true }
    try {
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, blocks }),
        })
        if (!response.ok) throw new Error(`Slack webhook failed: ${response.status}`)
        return { ok: true }
    } catch (error) {
        warn('slack_notify_failed', { message: error.message })
        return { ok: false, error: error.message }
    }
}

export function draftApprovalBlocks(article, quality) {
    const frontmatter = article.frontmatter || article
    const value = JSON.stringify({ slug: frontmatter.slug, topic: frontmatter.targetKeyword || frontmatter.title }).slice(0, 1900)
    const assets = Object.entries(frontmatter.mediaRecommendations || {})
        .filter(([, enabled]) => enabled)
        .map(([name]) => name.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()))
        .slice(0, 6)
    return [
        {
            type: 'header',
            text: { type: 'plain_text', text: 'Blog Draft Ready for Approval' },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*${frontmatter.title}*\nQuality score: *${quality.score}/${quality.minQualityScore}*\nSEO/topic review complete. Final publishing source: GitHub Markdown/MDX.\n*Recommended assets:* ${assets.length ? assets.join(', ') : 'Featured Image'}`,
            },
        },
        {
            type: 'actions',
            elements: [
                { type: 'button', text: { type: 'plain_text', text: 'Approve Publish' }, style: 'primary', action_id: 'blog_approve_publish', value },
                { type: 'button', text: { type: 'plain_text', text: 'Request Rewrite' }, action_id: 'blog_request_rewrite', value },
                { type: 'button', text: { type: 'plain_text', text: 'Improve SEO' }, action_id: 'blog_improve_seo', value },
                { type: 'button', text: { type: 'plain_text', text: 'Regenerate Image' }, action_id: 'blog_regenerate_image', value },
                { type: 'button', text: { type: 'plain_text', text: 'Reject' }, style: 'danger', action_id: 'blog_reject', value },
            ],
        },
    ]
}
