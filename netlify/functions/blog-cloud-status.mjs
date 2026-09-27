import { authorized } from './_lib/cloud-auth.mjs'
import { githubClient, currentSlot, readState } from '../../scripts/agent/lib/cloud-drafts.mjs'
export async function handler(event) {
    if (!authorized(event)) return { statusCode: 401, body: 'Unauthorized' }
    try {
        const api = githubClient(process.env.GITHUB_TOKEN)
        const repo = await api('')
        const slot = currentSlot()
        let state = null
        try {
            const ref = await api(`git/ref/heads/blog-drafts/${slot}`)
            state = readState(await api(`git/commits/${ref.object.sha}`))
        } catch (e) { if (e.status !== 404) throw e }
        const pulls = await api(`pulls?state=all&head=iDevBuddy:blog-drafts/${slot}&base=main&per_page=10`)
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({
            enabled: process.env.BLOG_CLOUD_ENABLED === 'true', githubAccess: true, canPush: repo.permissions?.push,
            nvidiaConfigured: Boolean(process.env.NVIDIA_API_KEY), slot, state, review: pulls[0]?.html_url || null,
            clickupConfigured: Boolean((process.env.CLICKUP_TOKEN || process.env.clickup) && (process.env.CLICKUP_LIST_ID || process.env.CLICKUP_REVIEW_VIEW_ID)),
        }) }
    } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: e.message }) } }
}
