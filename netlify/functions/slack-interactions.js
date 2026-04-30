import { json, parseSlackBody, routeSlackInteraction, verifySlackEvent } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    if (!verifySlackEvent(event)) return json(401, { error: 'Invalid Slack signature' })
    const body = parseSlackBody(event)
    const payload = body.payload ? JSON.parse(body.payload) : {}
    const response = await routeSlackInteraction(payload)
    return json(200, response)
}
