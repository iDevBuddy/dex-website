import { json } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    return json(200, {
        ok: true,
        message: 'Improve request accepted. Use npm run blog:recommend and npm run blog:refresh -- <slug> to create edits.',
    })
}
