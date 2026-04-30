import { json } from './_lib/slack-blog.js'

export async function handler(event) {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
    return json(202, {
        ok: true,
        message: 'Blog run request accepted. For MVP, trigger the GitHub Actions blog-pipeline workflow or run npm run blog:pipeline locally.',
    })
}
