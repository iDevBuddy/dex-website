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
