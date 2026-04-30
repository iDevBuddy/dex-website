import { json } from './_lib/slack-blog.js'
import { dispatchBlogWorkflow } from './_lib/github-dispatch.js'

function authorized(event) {
    const secret = process.env.NOTION_WEBHOOK_SECRET
    if (!secret) return false
    const header = event.headers['x-blog-webhook-secret'] || event.headers['X-Blog-Webhook-Secret']
    return header === secret
}

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    if (!authorized(event)) return json(401, { error: 'Unauthorized' })
    const body = event.body ? JSON.parse(event.body) : {}
    const status = String(body.status || body.approvalStatus || '').toLowerCase()
    const isApproved = status === 'approved'
    const command = body.type === 'refresh' ? 'refresh_approved' : 'draft_approved'
    if (!isApproved) return json(200, { ok: true, message: 'Webhook received, no approved status detected.' })
    const dispatch = await dispatchBlogWorkflow({
        eventType: command,
        inputs: {
            command,
            slug: body.slug || '',
            url: body.url || '',
            topic: body.topic || '',
            force_publish: body.type === 'refresh' ? 'false' : 'true',
        },
    })
    return json(202, { ok: true, message: 'Approved Notion webhook routed to GitHub publishing source.', dispatch })
}
