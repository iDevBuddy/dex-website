import { json } from './_lib/slack-blog.js'
import { buildSystemReport } from './_lib/system-report.js'

export async function handler() {
    return json(200, buildSystemReport(process.env))
}
