import { json } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    return json(200, {
        ok: true,
        message: 'Approval received. Configure GitHub Actions or Notion webhook to publish with npm run blog:publish -- --force.',
    })
}
