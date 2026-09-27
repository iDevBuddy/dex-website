import test from 'node:test'
import assert from 'node:assert/strict'
import { syncReview, clickupClient, withReviewLease, syncClickupReviews } from '../lib/clickup-reviews.mjs'

function fixture() {
    const records = {}, tasks = [], calls = []
    const pr = { number: 42, title: 'Blog draft: Tested workflow', state: 'open', draft: false,
        head: { ref: 'blog-drafts/2026-09-28', sha: 'a'.repeat(40), repo: { full_name: 'iDevBuddy/dex-website' } },
        base: { ref: 'main' }, html_url: 'https://github.com/iDevBuddy/dex-website/pull/42' }
    const files = [{ filename: 'content/blog/tested-workflow.md', status: 'added' }]
    const api = async (path, method = 'GET', body) => {
        calls.push({ path, method, body })
        if (path === 'pulls/42') return structuredClone(pr)
        if (path.startsWith('pulls/42/files')) return files
        if (path.startsWith('contents/')) return { encoding: 'base64', content: Buffer.from('## Tested workflow\nArticle with sources.').toString('base64') }
        if (path === 'pulls/42/merge') { assert.equal(body.sha, pr.head.sha); pr.state = 'closed'; pr.merged = true; return { merged: true } }
        throw Error('Unexpected GitHub path ' + path)
    }
    const cu = async (path, method = 'GET', body) => {
        calls.push({ path, method, body })
        if (path.startsWith('/list/99/task?')) return { tasks }
        if (path === '/list/99/task' && method === 'POST') { const t = { ...body, id: 'task1', list: { id: '99' }, status: { status: body.status, type: 'open' }, description: body.markdown_content }; tasks.push(t); return t }
        if (path === '/task/task1' && method === 'GET') return tasks[0]
        if (path === '/task/task1' && method === 'PUT') { Object.assign(tasks[0], body); if (body.status) tasks[0].status = { status: body.status, type: 'open' }; return tasks[0] }
        throw Error('Unexpected ClickUp path ' + path)
    }
    const options = { api, cu, number: 42, records, save: async () => {}, listId: '99', userId: 7, openStatus: 'to do', completeStatuses: ['complete'] }
    return { options, records, tasks, calls, pr, files }
}

test('cloud review creates assigned ClickUp approval with article and does not publish', async () => {
    const f = fixture()
    await syncReview(f.options)
    assert.equal(f.tasks.length, 1)
    assert.deepEqual(f.tasks[0].assignees, [7])
    assert.equal(f.tasks[0].notify_all, true)
    assert.match(f.tasks[0].description, /Article with sources/)
    assert.match(f.tasks[0].description, /Complete/)
    assert.ok(!f.calls.some(c => c.path.endsWith('/merge')))
    await syncReview(f.options)
    assert.equal(f.tasks.length, 1)
})
test('Complete merges only the exact reviewed article revision', async () => {
    const f = fixture(); await syncReview(f.options)
    f.tasks[0].status = { status: 'complete', type: 'closed' }
    await syncReview(f.options)
    assert.equal(f.pr.merged, true)
    assert.match(f.tasks[0].name, /deployment pending/i)
    await syncReview(f.options)
    assert.equal(f.calls.filter(c => c.path.endsWith('/merge')).length, 1)
})
test('changed article resets Complete and requires fresh review', async () => {
    const f = fixture(); await syncReview(f.options)
    f.tasks[0].status = { status: 'complete', type: 'closed' }; f.pr.head.sha = 'b'.repeat(40)
    await syncReview(f.options)
    assert.equal(f.pr.merged, undefined)
    assert.equal(f.tasks[0].status.status, 'to do')
    assert.equal(f.records[42].sha, f.pr.head.sha)
})
test('draft with unresolved checks cannot be published by completing a task', async () => {
    const f = fixture(); f.pr.draft = true; await syncReview(f.options)
    f.tasks[0].status = { status: 'complete', type: 'closed' }
    await syncReview(f.options)
    assert.equal(f.pr.merged, undefined)
    assert.match(f.tasks[0].name, /needs correction/i)
})
test('code changes hidden in a blog branch prevent approval', async () => {
    const f = fixture(); await syncReview(f.options)
    f.files.push({ filename: 'netlify/functions/admin.js', status: 'added' })
    f.tasks[0].status = { status: 'complete', type: 'closed' }
    await assert.rejects(syncReview(f.options), /article-only/)
    assert.equal(f.pr.merged, undefined)
})
test('lost task-create response is reconciled without a duplicate', async () => {
    const f = fixture(), original = f.options.cu
    f.options.cu = async (...args) => { const r = await original(...args); if (args[1] === 'POST') throw Error('lost response'); return r }
    await assert.rejects(syncReview(f.options), /lost response/)
    f.options.cu = original
    await syncReview(f.options)
    assert.equal(f.tasks.length, 1); assert.equal(f.records[42].taskId, 'task1')
})
test('uncertain create without a discoverable task never blindly repeats POST', async () => {
    const f = fixture(), original = f.options.cu
    f.options.cu = async (...args) => { if (args[1] === 'POST') throw Error('unknown result'); return original(...args) }
    await assert.rejects(syncReview(f.options), /unknown result/)
    f.options.cu = original
    await assert.rejects(syncReview(f.options), /uncertain/)
    assert.equal(f.tasks.length, 0)
})
test('ClickUp outage or moved task cannot authorize a merge', async () => {
    const f = fixture(); await syncReview(f.options)
    f.tasks[0].status = { status: 'complete', type: 'closed' }; f.tasks[0].list.id = 'other'
    await assert.rejects(syncReview(f.options), /list/)
    f.options.cu = async () => { throw Error('outage') }
    await assert.rejects(syncReview(f.options), /outage/)
    assert.equal(f.pr.merged, undefined)
})
test('closed PR is not requeued for publication', async () => {
    const f = fixture(); f.pr.state = 'closed'; f.pr.merged = true
    await syncReview(f.options)
    assert.equal(f.tasks.length, 0)
})
test('ClickUp errors omit response bodies and credentials', async () => {
    const api = clickupClient('secret-test', async () => ({ ok: false, status: 401, text: async () => 'secret-test private body' }))
    await assert.rejects(api('/user'), e => e.message === 'ClickUp GET: HTTP 401' && !e.message.includes('secret-test'))
})

test('preview can deliver a task but cannot publish a completed one', async () => {
    const f = fixture(); await syncReview(f.options)
    f.tasks[0].status = { status: 'complete', type: 'closed' }
    const result = await syncReview({ ...f.options, allowPublish: false })
    assert.equal(result.status, 'approval_observed_preview_no_publish')
    assert.equal(f.pr.merged, undefined)
})
test('reopened PR requires a fresh ClickUp approval', async () => {
    const f = fixture(); await syncReview(f.options)
    f.pr.state = 'closed'; await syncReview(f.options)
    f.pr.state = 'open'; f.tasks[0].status = { status: 'complete', type: 'closed' }
    await syncReview(f.options)
    assert.equal(f.tasks[0].status.status, 'to do')
    assert.equal(f.pr.merged, undefined)
})
test('missing ClickUp configuration makes no outbound calls', async () => {
    assert.equal((await syncClickupReviews({ env: {}, api: () => { throw Error('unexpected call') } })).status, 'clickup_not_configured')
})

function journal() {
    let head = null, seq = 0
    const commits = new Map([['main', { message: '', tree: { sha: 'tree' } }]])
    const api = async (path, method = 'GET', body) => {
        if (path === 'git/ref/heads/main') return { object: { sha: 'main' } }
        if (path.startsWith('git/ref/')) { if (!head) throw Object.assign(Error('missing'), { status: 404 }); return { object: { sha: head } } }
        if (path.startsWith('git/commits/')) return commits.get(path.slice(12))
        if (path === 'git/commits') { const sha = `c${++seq}`; commits.set(sha, { ...body, tree: { sha: body.tree } }); return { sha } }
        if (path === 'git/refs') { if (head) throw Object.assign(Error('race'), { status: 422 }); head = body.sha; return {} }
        if (path.startsWith('git/refs/')) { if (commits.get(body.sha).parents[0] !== head || body.force) throw Object.assign(Error('stale'), { status: 422 }); head = body.sha; return {} }
        throw Error('unexpected journal operation')
    }
    return { api, read: () => JSON.parse(commits.get(head).message.split('DEX_CLICKUP_STATE=')[1]) }
}
test('simultaneous workers acquire only one ClickUp journal lease', async () => {
    const j = journal(); let calls = 0
    const work = async records => { calls++; records[42] = { taskId: '1' }; return { status: 'synced' } }
    const results = await Promise.all([withReviewLease(j.api, work), withReviewLease(j.api, work)])
    assert.equal(calls, 1)
    assert.deepEqual(results.map(r => r.status).sort(), ['busy', 'synced'])
    assert.equal(j.read().records[42].taskId, '1'); assert.equal(j.read().expiresAt, 0)
})
test('journal releases its lease after failure and retains reconciliation intent', async () => {
    const j = journal()
    await assert.rejects(withReviewLease(j.api, async (records, save) => { records[42] = { creating: true }; await save(); throw Error('outage') }), /outage/)
    assert.equal(j.read().records[42].creating, true); assert.equal(j.read().expiresAt, 0)
})
test('expired work cannot save or perform later approval side effects', async () => {
    const j = journal(); let time = 0
    await assert.rejects(withReviewLease(j.api, async (_records, save) => { time = 300000; await save() }, () => time), /time budget/)
    assert.equal(j.read().expiresAt, 600000)
})
