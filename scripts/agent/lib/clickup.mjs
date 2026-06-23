/**
 * ClickUp adapter — the agent's board + alerts + approval surface.
 *
 * Flow uses ClickUp's DEFAULT statuses (no setup needed, beginner-friendly):
 *   "to do"     → 📝 draft waiting for your review
 *   "complete"  → ✅ you approved it (agent then publishes) / published
 *   delete task → ❌ reject
 *   title "WRITE: <topic>" → on-demand request
 *
 * Env: CLICKUP_TOKEN, CLICKUP_LIST_ID. No-op / empty if unset. Never throws.
 */
const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

export function clickupConfigured() {
    return Boolean(env('CLICKUP_TOKEN') && env('CLICKUP_LIST_ID'))
}

function api(path, opts = {}) {
    return fetch(`https://api.clickup.com/api/v2${path}`, {
        ...opts,
        headers: { Authorization: env('CLICKUP_TOKEN'), 'Content-Type': 'application/json', ...(opts.headers || {}) },
        signal: AbortSignal.timeout(15000),
    })
}

/** Create a task. Returns task id (or null). `slug` is embedded for later matching. */
export async function createTask(name, body = '', { status, slug } = {}) {
    if (!clickupConfigured()) return null
    try {
        const desc = slug ? `${body}\n\n[slug:${slug}]` : body
        const payload = { name: String(name).slice(0, 250), markdown_description: desc.slice(0, 6000) }
        if (status) payload.status = status
        // assign to the token owner (id is the number in `pk_<id>_...`) so the
        // ClickUp mobile app pushes a notification on every new task
        const uid = (env('CLICKUP_TOKEN').match(/^pk_(\d+)_/) || [])[1]
        if (uid) payload.assignees = [Number(uid)]
        const res = await api(`/list/${env('CLICKUP_LIST_ID')}/task`, { method: 'POST', body: JSON.stringify(payload) })
        if (!res.ok) { console.log('[clickup create]', res.status, (await res.text()).slice(0, 140)); return null }
        return (await res.json()).id || null
    } catch (e) { console.log('[clickup error]', e?.message || e); return null }
}

/** List tasks, optionally filtered by status names. Returns {id,name,status,slug}. */
export async function listTasks({ statuses = [], includeClosed = true } = {}) {
    if (!clickupConfigured()) return []
    try {
        const q = [`include_closed=${includeClosed}`, ...statuses.map((s) => `statuses[]=${encodeURIComponent(s)}`)].join('&')
        const res = await api(`/list/${env('CLICKUP_LIST_ID')}/task?${q}`)
        if (!res.ok) return []
        const data = await res.json()
        return (data.tasks || []).map((t) => {
            const desc = t.description || t.text_content || ''
            const slug = (desc.match(/\[slug:([a-z0-9-]+)\]/) || [])[1] || ''
            return { id: t.id, name: t.name || '', status: (t.status && t.status.status) || '', slug }
        })
    } catch { return [] }
}

/** Update a task's name and/or status. */
export async function updateTask(taskId, { name, status } = {}) {
    if (!clickupConfigured() || !taskId) return false
    try {
        const payload = {}
        if (name) payload.name = String(name).slice(0, 250)
        if (status) payload.status = status
        const res = await api(`/task/${taskId}`, { method: 'PUT', body: JSON.stringify(payload) })
        return res.ok
    } catch { return false }
}
