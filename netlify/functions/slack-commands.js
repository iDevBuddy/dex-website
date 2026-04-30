import { json, parseSlackBody, routeSlackCommand, verifySlackEvent } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    if (!verifySlackEvent(event)) return json(401, { error: 'Invalid Slack signature' })

    const payload = parseSlackBody(event)
    const response = await routeSlackCommand(payload)
    return json(200, response)
}
