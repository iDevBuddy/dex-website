/**
 * Channel-agnostic notifier. Sends a run summary / alert to WhatsApp (Meta
 * Cloud API) when configured; otherwise it is a no-op that just logs. Never
 * throws — a notification failure must never affect the content run.
 *
 * Configure via env / GitHub Secrets:
 *   WHATSAPP_TOKEN     - Meta WhatsApp Cloud API access token
 *   WHATSAPP_PHONE_ID  - the sender phone-number ID
 *   WHATSAPP_TO        - recipient number in international format (e.g. 9234...)
 *   WHATSAPP_TEMPLATE  - (optional) approved template name for proactive sends
 *
 * Note: free-form text only delivers inside the 24h customer-service window
 * (i.e. after you message the bot). For always-on proactive alerts, set an
 * approved WHATSAPP_TEMPLATE.
 */
const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

export async function notify(text) {
    const token = env('WHATSAPP_TOKEN')
    const phoneId = env('WHATSAPP_PHONE_ID')
    const to = env('WHATSAPP_TO')
    if (!token || !phoneId || !to) { console.log('[notify]', text.replace(/\n/g, ' | ')); return false }

    const template = env('WHATSAPP_TEMPLATE')
    const body = template
        ? { messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: text.slice(0, 1000) }] }] } }
        : { messaging_product: 'whatsapp', to, type: 'text', text: { body: text.slice(0, 4000) } }

    try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(15000),
        })
        if (!res.ok) { console.log('[notify failed]', res.status, (await res.text()).slice(0, 160)); return false }
        return true
    } catch (e) { console.log('[notify error]', e?.message || e); return false }
}
