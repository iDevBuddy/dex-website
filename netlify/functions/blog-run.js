import { json } from './_lib/slack-blog.js'
import { dispatchBlogWorkflow } from './_lib/github-dispatch.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    const body = event.body ? JSON.parse(event.body) : {}
    const dispatch = await dispatchBlogWorkflow({
        eventType: 'blog_run',
        inputs: {
            command: body.command || 'run',
            topic: body.topic || '',
            dry_run: body.dryRun === false ? 'false' : 'true',
            manual_approval: body.manualApproval === false ? 'false' : 'true',
        },
    })
    return json(202, {
        ok: true,
        message: 'Blog run request accepted.',
        dispatch,
    })
}
