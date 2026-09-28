import { withLambda } from '@netlify/aws-lambda-compat'
import { authorized } from './_lib/cloud-auth.mjs'
import { githubClient, runDraft } from '../../scripts/agent/lib/cloud-drafts.mjs'
import { generateDraft } from '../../scripts/agent/cloud-generate.mjs'
import { handler as notifyReviews } from './clickup-reviews-schedule.mjs'
export async function handler(event) {
    if (event.httpMethod !== 'POST' || !authorized(event)) return { statusCode: 401 }
    if (process.env.BLOG_CLOUD_ENABLED !== 'true') return { statusCode: 503 }
    // Shared clients cap each network operation against this invocation's deadline.
    process.env.BLOG_RUN_DEADLINE = String(Date.now() + 12 * 60000)
    const result = await runDraft({ api: githubClient(process.env.GITHUB_TOKEN), generate: generateDraft })
    console.log('cloud draft result', JSON.stringify(result))
    // Queue a separate worker so generation's runtime never consumes the approval-sync budget.
    // The 30-minute schedule also recovers notification failures without generating another article.
    await notifyReviews()
    return { statusCode: 200 }
}

export default withLambda(handler)
export const config = { background: true }
