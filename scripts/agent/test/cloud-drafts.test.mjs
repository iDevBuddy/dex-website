import test from 'node:test'
import assert from 'node:assert/strict'
import { currentSlot, claimSlot, runDraft, readState, githubClient } from '../lib/cloud-drafts.mjs'
import { authorized } from '../../../netlify/functions/_lib/cloud-auth.mjs'

const now = new Date('2026-09-28T10:00:00Z')
const sample = () => ({ title: 'A sourced workflow for business', report: { description: 'A practical workflow with sources', grounded: true, verdict: 'pass', cover: 'fallback' },
    files: [{ path: 'content/blog/a-sourced-workflow.md', content: '---\ntitle: "A sourced workflow"\n---\n\n## Article\nContent' }] })
function fakeGitHub() {
    let seq = 0
    const refs = new Map([['main', 'main0']]), commits = new Map([['main0', { sha: 'main0', tree: { sha: 'tree0' }, message: 'main' }]])
    const trees = new Map([['tree0', []]]), pulls = [], calls = []
    const error = (status) => { throw Object.assign(new Error(`HTTP ${status}`), { status }) }
    const api = async (path, method = 'GET', body) => {
        calls.push({ path, method, body })
        if (path.startsWith('pulls?')) {
            const head = new URLSearchParams(path.split('?')[1]).get('head')?.replace('iDevBuddy:', '')
            return pulls.filter(p => !head || p.head === head)
        }
        if (path === 'pulls' && method === 'POST') {
            const p = { ...body, html_url: 'https://github.com/iDevBuddy/dex-website/pull/123' }; pulls.push(p); return p
        }
        if (path.startsWith('git/ref/heads/')) {
            const sha = refs.get(path.slice(14)); if (!sha) error(404); return { object: { sha } }
        }
        if (path === 'git/refs') {
            const branch = body.ref.slice(11); if (refs.has(branch)) error(422); refs.set(branch, body.sha); return {}
        }
        if (path.startsWith('git/refs/heads/')) {
            const branch = path.slice(15), old = refs.get(branch)
            let parent = body.sha
            while (parent && parent !== old) parent = commits.get(parent)?.parents?.[0]
            if (parent !== old || body.force) error(422)
            refs.set(branch, body.sha); return {}
        }
        if (path === 'git/commits') {
            const sha = `commit${++seq}`, commit = { ...body, sha, tree: { sha: body.tree } }; commits.set(sha, commit); return commit
        }
        if (path.startsWith('git/commits/')) return commits.get(path.slice(12))
        if (path.startsWith('git/trees/')) return { tree: trees.get(path.slice(10).split('?')[0]), truncated: false }
        if (path === 'git/trees') { const sha = `tree${++seq}`; trees.set(sha, [...trees.get(body.base_tree), ...body.tree]); return { sha } }
        if (path === 'git/blobs') return { sha: `blob${++seq}` }
        throw new Error(`Unexpected ${method} ${path}`)
    }
    return { api, refs, commits, pulls, calls }
}
test('slots use UTC cutoff and only Monday, Wednesday, Friday', () => {
    assert.equal(currentSlot(new Date('2026-09-28T08:59:59Z')), '2026-09-25')
    assert.equal(currentSlot(new Date('2026-09-28T09:00:00Z')), '2026-09-28')
    assert.equal(currentSlot(new Date('2026-09-29T23:00:00Z')), '2026-09-28')
    assert.equal(currentSlot(new Date('2026-10-04T23:00:00Z')), '2026-10-02')
})
test('authorization rejects missing, short and incorrect secrets', () => {
    const secret = 'x'.repeat(48)
    assert.equal(authorized({ headers: { authorization: `Bearer ${secret}` } }, secret), true)
    assert.equal(authorized({ headers: { authorization: 'Bearer wrong' } }, secret), false)
    assert.equal(authorized({}, secret), false)
    assert.equal(authorized({ headers: { authorization: 'Bearer tiny' } }, 'tiny'), false)
})
test('simultaneous providers acquire exactly one slot', async () => {
    const g = fakeGitHub()
    const results = await Promise.all([claimSlot(g.api, '2026-09-28', now), claimSlot(g.api, '2026-09-28', now)])
    assert.deepEqual(results.map(x => x.status).sort(), ['busy', 'claimed'])
})
test('draft is saved only on its review branch; retries do not generate twice', async () => {
    const g = fakeGitHub(); let generated = 0
    const generate = async () => { generated++; return sample() }
    assert.equal((await runDraft({ api: g.api, generate, now })).status, 'awaiting_approval')
    assert.equal((await runDraft({ api: g.api, generate, now })).status, 'already_reviewed_or_queued')
    assert.equal(generated, 1); assert.equal(g.refs.get('main'), 'main0'); assert.equal(g.pulls.length, 1)
    assert.equal(g.pulls[0].base, 'main'); assert.equal(g.pulls[0].draft, false)
    assert.ok(!g.calls.some(c => c.path.includes('/merge')))
})
test('failed attempts are bounded to two, with durable failed status', async () => {
    const g = fakeGitHub(); let generated = 0
    const generate = async () => { generated++; throw new Error('provider failed') }
    for (let i = 0; i < 2; i++) await assert.rejects(runDraft({ api: g.api, generate, now }), /provider failed/)
    assert.equal((await runDraft({ api: g.api, generate, now })).status, 'attempt_limit')
    assert.equal(generated, 2)
    assert.equal(readState(g.commits.get(g.refs.get('blog-drafts/2026-09-28'))).status, 'failed')
})
test('PR permission failure leaves saved draft recoverable without another generation', async () => {
    const g = fakeGitHub(); let generated = 0
    const restricted = async (path, method, body) => { if (path === 'pulls' && method === 'POST') throw Object.assign(new Error('permission denied'), { status: 403 }); return g.api(path, method, body) }
    await assert.rejects(runDraft({ api: restricted, generate: async () => { generated++; return sample() }, now }), /permission denied/)
    const result = await runDraft({ api: g.api, generate: async () => { throw new Error('must not generate again') }, now })
    assert.equal(result.status, 'awaiting_approval'); assert.equal(generated, 1)
})
test('lost PR response is reconciled rather than creating a duplicate', async () => {
    const g = fakeGitHub()
    const uncertain = async (path, method, body) => { const r = await g.api(path, method, body); if (path === 'pulls' && method === 'POST') throw new Error('network lost'); return r }
    assert.equal((await runDraft({ api: uncertain, generate: async () => sample(), now })).status, 'awaiting_approval')
    assert.equal(g.pulls.length, 1)
})
test('stale worker cannot overwrite a recovered worker after lease expiry', async () => {
    const g = fakeGitHub(); let release, started
    const start = new Promise(r => { started = r }), hold = new Promise(r => { release = r })
    const first = runDraft({ api: g.api, now, generate: async () => { started(); await hold; return sample() } })
    await start
    const second = await runDraft({ api: g.api, now: new Date('2026-09-28T11:00:00Z'), generate: async () => sample() })
    assert.equal(second.status, 'awaiting_approval')
    const head = g.refs.get('blog-drafts/2026-09-28')
    release(); await assert.rejects(first, /422/)
    assert.equal(g.refs.get('blog-drafts/2026-09-28'), head)
})
test('manual branch edits are never overwritten', async () => {
    const g = fakeGitHub(); g.refs.set('blog-drafts/2026-09-28', 'main0')
    assert.equal((await claimSlot(g.api, '2026-09-28', now)).status, 'manual_branch_change')
})
test('generator cannot write application code or workflow files', async () => {
    const g = fakeGitHub(), draft = sample(); draft.files[0].path = '.github/workflows/evil.yml'
    await assert.rejects(runDraft({ api: g.api, generate: async () => draft, now }), /Unsafe draft file/)
    assert.equal(g.refs.get('main'), 'main0')
})
test('inconclusive source verification creates an explicitly draft PR', async () => {
    const g = fakeGitHub(), draft = sample(); draft.report.grounded = false
    await runDraft({ api: g.api, generate: async () => draft, now })
    assert.equal(g.pulls[0].draft, true)
})
test('API error messages do not expose provider response or credential', async () => {
    const api = githubClient('secret-credential', async () => ({ ok: false, status: 401 }))
    await assert.rejects(api('pulls'), e => e.status === 401 && !e.message.includes('secret'))
})
test('repository health uses the canonical API path without a trailing slash', async () => {
    let url
    const api = githubClient('test-token', async (target) => { url = target; return { ok: true, status: 200, json: async () => ({}) } })
    await api('')
    assert.equal(url, 'https://api.github.com/repos/iDevBuddy/dex-website')
})
