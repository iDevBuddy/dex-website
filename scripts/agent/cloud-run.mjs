import { githubClient, runDraft, safeFailure } from './lib/cloud-drafts.mjs'
import { generateDraft } from './cloud-generate.mjs'
process.env.BLOG_RUN_DEADLINE = String(Date.now() + 12 * 60000)
try {
    const result = await runDraft({ api: githubClient(process.env.GITHUB_TOKEN), generate: generateDraft, source: 'github' })
    console.log(JSON.stringify(result))
    if (result.status === 'failed') process.exitCode = 1
} catch (error) { console.error(safeFailure(error)); process.exitCode = 1 }
