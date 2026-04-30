import { json } from './_lib/slack-blog.js'
import { createPerformanceReport } from './_lib/notion-dashboard.js'
import { dispatchBlogWorkflow } from './_lib/github-dispatch.js'

export async function handler(event) {
    const dispatch = await dispatchBlogWorkflow({
        eventType: 'blog_report',
        inputs: { command: 'report', source: 'api' },
    })
    const notion = await createPerformanceReport({
        summary: 'Performance report requested from API.',
        recommendedActions: 'Run performance-report and recommend-updates scripts.',
    })
    return json(200, {
        ok: true,
        message: 'Performance report request routed.',
        dispatch,
        notion,
    })
}
