import { json } from './_lib/slack-blog.js'
import { createRefreshTask } from './_lib/notion-dashboard.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    const body = event.body ? JSON.parse(event.body) : {}
    const notion = await createRefreshTask({
        blogUrl: body.url || body.blogUrl || '',
        problem: body.problem || 'Manual improvement request',
        recommendedFix: body.recommendedFix || body.fix || 'Review title, meta description, FAQ, internal links, examples, and freshness.',
        priority: body.priority || 'High',
        status: 'Needs Review',
    })
    return json(200, {
        ok: true,
        message: 'Improve request accepted and routed to Refresh Queue.',
        notion,
    })
}
