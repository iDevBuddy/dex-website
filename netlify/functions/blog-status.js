import { json } from './_lib/slack-blog.js'
import { getBlogStatus } from './_lib/env-status.js'

export async function handler() {
    return json(200, getBlogStatus(process.env))
}
