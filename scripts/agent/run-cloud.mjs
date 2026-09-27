/** GitHub fallback shares Netlify's three weekly slots and never publishes to main. */
import { execFileSync } from 'node:child_process'
import { githubClient, runDraft } from './lib/cloud-drafts.mjs'
import { generateDraft } from './cloud-generate.mjs'
function credential() {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
    if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('Set GITHUB_TOKEN to run cloud drafts')
    // checkout@v5 persists the scoped job credential without exporting it to the environment.
    const header = execFileSync('git', ['config', '--get', 'http.https://github.com/.extraheader'], { encoding: 'utf8' }).trim()
    const encoded = header.match(/^AUTHORIZATION: basic (.+)$/i)?.[1]
    if (!encoded) throw new Error('GitHub checkout credential unavailable')
    return Buffer.from(encoded, 'base64').toString('utf8').split(':').slice(1).join(':')
}
export async function runCloud() {
    process.env.BLOG_RUN_DEADLINE = String(Date.now() + 12 * 60000)
    const result = await runDraft({ api: githubClient(credential()), generate: generateDraft, source: 'github' })
    console.log('cloud draft result', JSON.stringify(result))
}
