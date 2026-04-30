import { helpText, json, parseSlackBody, verifySlackEvent } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    if (!verifySlackEvent(event)) return json(401, { error: 'Invalid Slack signature' })

    const payload = parseSlackBody(event)
    const text = String(payload.text || '').trim()
    let response = helpText()

    if (text === 'report') response = 'Performance report command received. Run `npm run blog:performance` in CI or use the scheduled workflow.'
    if (text === 'ideas') response = 'Topic discovery command received. The pipeline will collect RSS/manual/Notion ideas.'
    if (text.startsWith('new topic:')) response = `Topic captured for review: ${text.replace('new topic:', '').trim()}`
    if (text.startsWith('draft:')) response = `Draft request captured: ${text.replace('draft:', '').trim()}`
    if (text === 'publish latest') response = 'Publish request received. The system will publish only if approval and quality checks pass.'
    if (text.startsWith('improve')) response = 'Refresh request captured. A content refresh task should be created in Notion.'
    if (text === 'status') response = 'Blog engine is reachable. Check GitHub Actions for latest pipeline runs.'

    return json(200, {
        response_type: 'ephemeral',
        text: response,
    })
}
