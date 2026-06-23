/**
 * ClickUp adapter — creates a task per run outcome (alert + board entry).
 * Far simpler to set up than WhatsApp: one API token + one List ID. No-op if
 * not configured. Never throws.
 *
 * Env / GitHub Secrets:
 *   CLICKUP_TOKEN    - personal API token (Settings → Apps → API Token, "pk_...")
 *   CLICKUP_LIST_ID  - the List where tasks land (from the List URL)
 */
const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

export function clickupConfigured() {
    return Boolean(env('CLICKUP_TOKEN') && env('CLICKUP_LIST_ID'))
}

/**
 * Create a ClickUp task.
 * @param {string} name   task title
 * @param {string} body   markdown description
 * @param {object} opts   { status?: 'Needs Review'|'Published'|..., tags?: string[] }
 */
export async function createTask(name, body = '', opts = {}) {
    const token = env('CLICKUP_TOKEN')
    const list = env('CLICKUP_LIST_ID')
    if (!token || !list) return false
    try {
        const payload = { name: name.slice(0, 250), markdown_description: body.slice(0, 6000) }
        if (opts.status) payload.status = opts.status
        if (Array.isArray(opts.tags) && opts.tags.length) payload.tags = opts.tags
        const res = await fetch(`https://api.clickup.com/api/v2/list/${list}/task`, {
            method: 'POST',
            headers: { Authorization: token, 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) { console.log('[clickup failed]', res.status, (await res.text()).slice(0, 160)); return false }
        return true
    } catch (e) { console.log('[clickup error]', e?.message || e); return false }
}

/**
 * Read open "request" tasks (on-demand topics) from the list — tasks whose
 * status matches `requestStatus`. Returns [{ id, topic }]. Empty on any failure.
 */
export async function readRequests(requestStatus = 'request') {
    const token = env('CLICKUP_TOKEN')
    const list = env('CLICKUP_LIST_ID')
    if (!token || !list) return []
    try {
        const res = await fetch(`https://api.clickup.com/api/v2/list/${list}/task?statuses[]=${encodeURIComponent(requestStatus)}`, {
            headers: { Authorization: token },
            signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) return []
        const data = await res.json()
        return (data.tasks || []).map((t) => ({ id: t.id, topic: t.name }))
    } catch { return [] }
}
