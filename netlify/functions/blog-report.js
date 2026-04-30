import { json } from './_lib/slack-blog.js'

export async function handler() {
    return json(200, {
        ok: true,
        message: 'Run npm run blog:performance to generate data/blog/performance-report.json.',
    })
}
