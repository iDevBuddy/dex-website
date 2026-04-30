import { createHmac, timingSafeEqual } from 'node:crypto'

export function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }
}

export function verifySlackEvent(event) {
    const secret = process.env.SLACK_SIGNING_SECRET
    if (!secret) return false
    const timestamp = event.headers['x-slack-request-timestamp'] || event.headers['X-Slack-Request-Timestamp']
    const signature = event.headers['x-slack-signature'] || event.headers['X-Slack-Signature']
    if (!timestamp || !signature) return false
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
    if (age > 60 * 5) return false
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || ''
    const expected = `v0=${createHmac('sha256', secret).update(`v0:${timestamp}:${rawBody}`).digest('hex')}`
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export function parseSlackBody(event) {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || ''
    return Object.fromEntries(new URLSearchParams(rawBody))
}

export function helpText() {
    return [
        '*DEX Blog commands*',
        '`/blog report` - latest performance scaffold',
        '`/blog ideas` - topic discovery status',
        '`/blog new topic: [topic]` - add idea',
        '`/blog draft: [topic]` - request a draft',
        '`/blog publish latest` - publish latest approved draft',
        '`/blog improve [url]` - queue refresh',
        '`/blog generate image [url]` - regenerate image',
        '`/blog generate audio [url]` - generate/listen support',
        '`/blog pause autopublish` / `/blog resume autopublish`',
        '`/blog status` - system status',
    ].join('\n')
}
