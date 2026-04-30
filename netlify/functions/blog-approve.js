import { json } from './_lib/slack-blog.js'
import { createBlogDraft } from './_lib/notion-dashboard.js'
import { dispatchBlogWorkflow } from './_lib/github-dispatch.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    const body = event.body ? JSON.parse(event.body) : {}
    const notion = await createBlogDraft({
        title: body.title || body.topic || body.slug || 'Approved draft',
        slug: body.slug || '',
        topic: body.topic || '',
        draftStatus: 'Approved',
        approvalStatus: 'Approved',
        notes: 'Approved through /api/blog/approve.',
    })
    const dispatch = await dispatchBlogWorkflow({
        eventType: 'blog_approve_publish',
        inputs: {
            command: 'approve_publish',
            slug: body.slug || '',
            topic: body.topic || '',
            force_publish: 'true',
        },
    })
    return json(200, {
        ok: true,
        message: 'Approval received. Publishing remains GitHub/Markdown based.',
        notion,
        dispatch,
    })
}
