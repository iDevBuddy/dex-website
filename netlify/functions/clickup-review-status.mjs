import { authorized } from './_lib/cloud-auth.mjs'
import { clickupClient, clickupSettings } from '../../scripts/agent/lib/clickup-reviews.mjs'
import { safeFailure } from '../../scripts/agent/lib/cloud-drafts.mjs'
export async function handler(event) {
    if (event.httpMethod !== 'GET' || !authorized(event)) return { statusCode: 401 }
    try {
        const settings = await clickupSettings(process.env, clickupClient(process.env.CLICKUP_TOKEN || process.env.clickup))
        return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            body: JSON.stringify({ connected: true, listId: settings.listId, listName: settings.listName, completeStatuses: settings.completeStatuses }) }
    } catch (e) { return { statusCode: 502, body: JSON.stringify({ connected: false, error: safeFailure(e) }) } }
}
