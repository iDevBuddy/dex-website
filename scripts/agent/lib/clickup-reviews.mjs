import { randomUUID } from 'node:crypto'
import { REPO, safeFailure } from './cloud-drafts.mjs'

const STATE_BRANCH = 'automation/clickup-reviews'
const MARKER = 'DEX_CLICKUP_STATE='
const id = value => encodeURIComponent(String(value))

export async function clickupSettings(env, cu) {
    let listId = String(env.CLICKUP_LIST_ID || '').trim()
    if (!listId && env.CLICKUP_REVIEW_VIEW_ID) {
        const viewId = String(env.CLICKUP_REVIEW_VIEW_ID).trim()
        if (!/^[a-zA-Z0-9-]+$/.test(viewId)) throw new Error('Invalid ClickUp view ID')
        const result = await cu(`/view/${id(viewId)}`)
        listId = String(result.view?.parent?.id || '')
    }
    if (!/^\d+$/.test(listId)) throw new Error('ClickUp list ID unavailable')
    // Confirm that the view belongs to a real List, not a Space/Folder/Everything view.
    const [list, user] = await Promise.all([cu(`/list/${listId}`), cu('/user')])
    const openStatus = list.statuses?.find(s => s.type === 'open')?.status
    const completeStatuses = (list.statuses || []).filter(s => s.type === 'closed').map(s => s.status.toLowerCase())
    if (!openStatus || !completeStatuses.length || !Number.isInteger(user.user?.id)) throw new Error('ClickUp user or list approval statuses unavailable')
    return { listId, listName: list.name, userId: user.user.id, openStatus, completeStatuses }
}

export function clickupClient(token, fetcher = fetch) {
    if (!token) throw new Error('ClickUp credential missing')
    return async (path, method = 'GET', body) => {
        const res = await fetcher(`https://api.clickup.com/api/v2${path}`, {
            method, headers: { Authorization: token, 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(12000),
        })
        if (!res.ok) throw Object.assign(new Error(`ClickUp ${method}: HTTP ${res.status}`), { status: res.status })
        return res.json()
    }
}

async function findTask(cu, listId, marker) {
    const matches = []
    for (let page = 0; page < 20; page++) {
        const data = await cu(`/list/${id(listId)}/task?include_closed=true&page=${page}`)
        if (!Array.isArray(data.tasks)) throw new Error('ClickUp task list response invalid')
        matches.push(...data.tasks.filter(t => String(t.description || t.text_content || '').includes(marker)))
        if (matches.length > 1) throw new Error('Duplicate ClickUp reviews require reconciliation')
        if (data.tasks.length < 100) return matches[0]
    }
    throw new Error('ClickUp task search incomplete; refusing duplicate creation')
}

export async function ensureConnectionNotice({ cu, records, save, listId, userId, completeStatuses }) {
    const marker = '[DEX_BLOG_CLICKUP_CONNECTION:v1]'
    let record = records._connection
    if (record && record.listId !== listId) throw new Error('ClickUp list changed; explicit review migration required')
    if (record?.taskId) {
        const task = await cu(`/task/${id(record.taskId)}`)
        if (String(task.list?.id) !== listId) throw new Error('Connection notice moved outside configured list')
        return { taskId: task.id, status: 'connected' }
    }
    let task = await findTask(cu, listId, marker)
    if (!task) {
        if (record?.creating) throw new Error('ClickUp connection notice uncertain; reconcile before retrying')
        records._connection = record = { listId, creating: true }
        await save()
        try {
            task = await cu(`/list/${id(listId)}/task`, 'POST', {
                name: 'DEX blog approvals connected — setup check', status: completeStatuses[0], assignees: [userId], notify_all: true,
                markdown_content: '# Netlify → ClickUp connection verified\n\nThis is a setup notification, not an article approval. No article is published by this task.\n\nNew drafts will arrive in this list, assigned to you, with their full article and review report. Read them and mark the review task Complete when you approve publication. Approvals are checked every 30 minutes. Drafts with unresolved checks remain on hold.\n\nDraft generation: Monday, Wednesday and Friday, 2:30 PM Pakistan time. Notification delivery to your phone/email follows your ClickUp preferences.\n\n' + marker,
            })
        } catch (e) {
            if ([400, 401, 403, 404, 422, 429].includes(e.status)) { record.creating = false; await save() }
            throw e
        }
        if (!task?.id) throw new Error('ClickUp connection notice uncertain: missing task ID')
    }
    records._connection = { listId, taskId: task.id, terminal: true }
    await save()
    return { taskId: task.id, status: 'connected' }
}

async function articleSnapshot(api, pr) {
    const files = await api(`pulls/${pr.number}/files?per_page=100`)
    if (!Array.isArray(files) || !files.length || files.length > 2 || files.some(f => f.status !== 'added'
        || !/^(content\/blog\/[a-z0-9-]+\.md|public\/blog\/images\/[a-z0-9-]+\.png)$/.test(f.filename))) {
        throw new Error('Review is not an article-only addition; manual repair required')
    }
    const articles = files.filter(f => f.filename.startsWith('content/blog/'))
    if (articles.length !== 1) throw new Error('Review must contain exactly one article')
    const file = await api(`contents/${articles[0].filename}?ref=${pr.head.sha}`)
    if (file.encoding !== 'base64') throw new Error('Article content unavailable')
    const text = Buffer.from(file.content, 'base64').toString('utf8')
    if (text.length > 45000) throw new Error('Article too large for complete ClickUp review; manual review required')
    return text
}

function reviewBody(pr, article, marker) {
    return `# Article approval\n\n${pr.draft ? '**NEEDS CORRECTION:** Research/fact checks remain unresolved. Completing this task will NOT publish while the GitHub PR is a draft. Correct the article and mark the PR ready first.\n\n' : ''}`
        + 'Read the article and sources below. To approve publication, change this task to **Complete**. Netlify checks approvals every 30 minutes. Leave it open to hold. Deleting this task does not publish or delete the article.\n\n'
        + 'If the article changes, this task reopens for a fresh review. Editing this ClickUp description does not edit the website article.\n\n'
        + `Review reference: ${pr.html_url}\n\n${pr.body || ''}\n\n---\n\n# Full article\n\n${article}\n\n---\n${marker}\nReviewed revision: ${pr.head.sha}`
}

// Only IDs/revision bindings are stored. Credentials and article text never enter the state log.
export async function syncReview({ api, cu, number, records, save, listId, userId, openStatus, completeStatuses, allowPublish = true }) {
    const pr = await api(`pulls/${number}`)
    let record = records[number]
    const title = String(pr.title || '').replace(/^Blog draft:\s*/, '').slice(0, 180)
    const update = (taskId, body) => cu(`/task/${id(taskId)}`, 'PUT', body)
    if (pr.state !== 'open') {
        if (record?.taskId && !record.terminal) {
            await update(record.taskId, { name: `${pr.merged ? 'Approved — deployment pending' : 'Closed without publishing'}: ${title}` })
            record.terminal = true; await save()
        }
        return { number, status: pr.merged ? 'merged' : 'closed' }
    }
    if (pr.base?.ref !== 'main' || pr.head?.repo?.full_name !== REPO || !/^blog-drafts\/\d{4}-\d{2}-\d{2}$/.test(pr.head.ref)
        || !/^[a-f0-9]{40}$/.test(pr.head.sha)) throw new Error('Unexpected review branch')
    if (record && record.listId !== String(listId)) throw new Error('ClickUp list changed; explicit review migration required')
    const marker = `[DEX_BLOG_REVIEW:${number}]`
    const name = `${pr.draft ? 'Needs correction' : 'Review and approve'}: ${title}`
    let task
    if (!record?.taskId) {
        // Search before creating, including after a lost response. Never blindly retry an uncertain POST.
        task = await findTask(cu, listId, marker)
        if (!task) {
            if (record?.creating) throw new Error('ClickUp task creation uncertain; reconcile before retrying')
            const article = await articleSnapshot(api, pr)
            records[number] = record = { listId: String(listId), sha: pr.head.sha, creating: true }
            await save()
            try {
                task = await cu(`/list/${id(listId)}/task`, 'POST', { name, markdown_content: reviewBody(pr, article, marker),
                    status: openStatus, assignees: [userId], notify_all: true })
            } catch (e) {
                // A rejected request is known not to have created a task. Network/5xx outcomes stay uncertain.
                if ([400, 401, 403, 404, 422, 429].includes(e.status)) { record.creating = false; await save() }
                throw e
            }
            if (!task?.id) throw new Error('ClickUp task creation uncertain: missing task ID')
        }
        records[number] = record = { ...record, listId: String(listId), taskId: task.id, sha: record?.sha || pr.head.sha, creating: false }
        // An untracked/recovered task might already be complete; always reopen it before it can authorize publishing.
        await update(task.id, { name, status: openStatus, markdown_content: reviewBody(pr, await articleSnapshot(api, pr), marker) })
        record.sha = pr.head.sha
        await save()
        return { number, status: 'awaiting_clickup_approval', taskId: task.id }
    }
    task = await cu(`/task/${id(record.taskId)}`)
    if (String(task.list?.id) !== String(listId)) throw new Error('Review task moved outside configured ClickUp list')
    if (record.sha !== pr.head.sha || record.terminal) {
        await update(task.id, { name, status: openStatus, markdown_content: reviewBody(pr, await articleSnapshot(api, pr), marker) })
        record.sha = pr.head.sha; record.terminal = false; await save()
        return { number, status: 'changed_requires_new_approval', taskId: task.id }
    }
    const completed = completeStatuses.includes(String(task.status?.status || '').toLowerCase())
    if (!completed) return { number, status: 'awaiting_clickup_approval', taskId: task.id }
    if (pr.draft) {
        await update(task.id, { name, status: openStatus })
        return { number, status: 'correction_required', taskId: task.id }
    }
    if (!allowPublish) return { number, status: 'approval_observed_preview_no_publish', taskId: task.id }
    await articleSnapshot(api, pr)
    // Persist the lease/fence immediately before the external side effect. SHA is GitHub's atomic precondition.
    await save()
    let merged
    try { merged = await api(`pulls/${number}/merge`, 'PUT', { sha: record.sha, merge_method: 'merge' }) }
    catch (error) {
        const current = await api(`pulls/${number}`)
        if (!current.merged) throw error
        merged = { merged: true }
    }
    if (merged?.merged !== true) throw new Error('GitHub did not confirm merge; article not reported as published')
    await update(task.id, { name: `Approved — deployment pending: ${title}` })
    record.terminal = true; await save()
    return { number, status: 'merged_deployment_pending', taskId: task.id }
}

// Empty Git commits provide a durable journal and compare-and-swap lease without another database.
export async function withReviewLease(api, work, now = () => Date.now()) {
    let head, exists = true
    try { head = (await api(`git/ref/heads/${STATE_BRANCH}`)).object.sha }
    catch (e) { if (e.status !== 404) throw e; exists = false; head = (await api('git/ref/heads/main')).object.sha }
    const parent = await api(`git/commits/${head}`)
    let state = { records: {} }
    if (exists) {
        try { state = JSON.parse(parent.message.split(MARKER)[1]) } catch { throw new Error('Invalid ClickUp review journal; manual reconciliation required') }
        if (state.expiresAt > now()) return { status: 'busy' }
    }
    state.owner = randomUUID(); state.expiresAt = now() + 10 * 60000
    const deadline = now() + 4 * 60000
    const save = async () => {
        if (now() > deadline) throw new Error('ClickUp review time budget exhausted')
        const commit = await api('git/commits', 'POST', { message: `chore: ClickUp review state [skip ci]\n\n${MARKER}${JSON.stringify(state)}`,
            tree: parent.tree.sha, parents: [head] })
        try {
            if (exists) await api(`git/refs/heads/${STATE_BRANCH}`, 'PATCH', { sha: commit.sha, force: false })
            else await api('git/refs', 'POST', { ref: `refs/heads/${STATE_BRANCH}`, sha: commit.sha })
        } catch (e) {
            const actual = await api(`git/ref/heads/${STATE_BRANCH}`)
            if (actual.object.sha !== commit.sha) throw e
        }
        head = commit.sha; exists = true
    }
    try { await save() } catch (e) { if ([409, 422].includes(e.status)) return { status: 'busy' }; throw e }
    try { return await work(state.records, save, deadline) }
    finally { state.expiresAt = 0; if (now() <= deadline) await save() }
}

export async function syncClickupReviews({ api, env = process.env, cu, allowPublish = false }) {
    // Support the owner's existing Netlify variable spelling without copying or exposing its secret.
    const token = env.CLICKUP_TOKEN || env.clickup
    if (!token || !(env.CLICKUP_LIST_ID || env.CLICKUP_REVIEW_VIEW_ID)) return { status: 'clickup_not_configured' }
    cu ||= clickupClient(token)
    const settings = await clickupSettings(env, cu)
    return withReviewLease(api, async (records, save, deadline) => {
        const connection = await ensureConnectionNotice({ cu, records, save, ...settings })
        const pulls = await api('pulls?state=open&base=main&per_page=100')
        if (pulls.length >= 100) throw new Error('Review queue requires pagination')
        const numbers = [...new Set([...Object.keys(records).filter(n => /^\d+$/.test(n) && !records[n].terminal).map(Number),
            ...pulls.filter(p => /^blog-drafts\/\d{4}-\d{2}-\d{2}$/.test(p.head?.ref)).map(p => p.number)])]
        const results = []
        for (const number of numbers.slice(0, 10)) {
            if (Date.now() > deadline - 45000) break
            try { results.push(await syncReview({ api, cu, number, records, save, ...settings, allowPublish })) }
            catch (e) { results.push({ number, status: 'needs_attention', error: safeFailure(e, env) }) }
        }
        return { status: 'synced', connection, results, completeStatuses: settings.completeStatuses }
    })
}
