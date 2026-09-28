import { withLambda } from '@netlify/aws-lambda-compat'
import { authorized } from './_lib/cloud-auth.mjs'
import { githubClient, safeFailure } from '../../scripts/agent/lib/cloud-drafts.mjs'
import { syncClickupReviews } from '../../scripts/agent/lib/clickup-reviews.mjs'

export async function handler(event) {
    if (event.httpMethod !== 'POST' || !authorized(event)) return { statusCode: 401 }
    if (process.env.BLOG_CLOUD_ENABLED !== 'true') return { statusCode: 503 }
    try {
        const result = await syncClickupReviews({ api: githubClient(process.env.GITHUB_TOKEN),
            allowPublish: process.env.CONTEXT === 'production' })
        console.log('ClickUp review sync', JSON.stringify(result))
        return { statusCode: 200 }
    } catch (error) {
        console.error('ClickUp review sync failed', safeFailure(error))
        throw new Error('ClickUp review sync failed; inspect the redacted diagnostic above')
    }
}

export default withLambda(handler)
export const config = { background: true }
