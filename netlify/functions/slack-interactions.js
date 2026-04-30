import { json, parseSlackBody, verifySlackEvent } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    if (!verifySlackEvent(event)) return json(401, { error: 'Invalid Slack signature' })
    const body = parseSlackBody(event)
    const payload = body.payload ? JSON.parse(body.payload) : {}
    const action = payload.actions?.[0]?.action_id || 'unknown'
    return json(200, {
        response_type: 'ephemeral',
        text: `Blog action received: ${action}. GitHub Actions should handle the approved publishing workflow.`,
    })
}
