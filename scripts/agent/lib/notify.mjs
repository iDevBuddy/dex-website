/**
 * Channel-agnostic notifier. Routes a run summary / alert to whatever is
 * configured — ClickUp (a task, easiest) and/or WhatsApp (Meta Cloud API).
 * If neither is configured it just logs. Never throws — a notification
 * failure must never affect the content run.
 *
 * ClickUp (recommended, 2-min setup):
 *   CLICKUP_TOKEN, CLICKUP_LIST_ID
 * WhatsApp (optional):
 *   WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_TO, WHATSAPP_TEMPLATE
 */
import { createTask, clickupConfigured } from './clickup.mjs'

const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

async function sendWhatsApp(text) {
    const token = env('WHATSAPP_TOKEN'); const phoneId = env('WHATSAPP_PHONE_ID'); const to = env('WHATSAPP_TO')
    if (!token || !phoneId || !to) return false
    const template = env('WHATSAPP_TEMPLATE')
    const body = template
        ? { messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: text.slice(0, 1000) }] }] } }
        : { messaging_product: 'whatsapp', to, type: 'text', text: { body: text.slice(0, 4000) } }
    try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) { console.log('[whatsapp failed]', res.status, (await res.text()).slice(0, 160)); return false }
        return true
    } catch (e) { console.log('[whatsapp error]', e?.message || e); return false }
}

/**
 * Send an alert. `opts.status` sets the ClickUp task status (e.g. 'Published',
 * 'Needs Review'). First line of `text` becomes the task title.
 */
export async function notify(text, opts = {}) {
    let sent = false
    if (clickupConfigured()) {
        const [title, ...rest] = String(text).split('\n')
        sent = (await createTask(title, rest.join('\n'), { status: opts.status })) || sent
    }
    sent = (await sendWhatsApp(text)) || sent
    if (!sent) console.log('[notify]', String(text).replace(/\n/g, ' | '))
    return sent
}
