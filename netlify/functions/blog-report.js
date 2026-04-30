import { json } from './_lib/slack-blog.js'

export async function handler(event) {
    return json(200, {
        ok: true,
        message: 'Performance intelligence is not fully enabled yet. Phase 4 is pending.',
    })
}
