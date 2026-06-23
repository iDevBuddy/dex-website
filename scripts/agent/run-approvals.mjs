/**
 * Approvals poller — reconciles ClickUp with the pending drafts:
 *   • task "WRITE: <topic>"   → generate that post (on-demand), mark task done
 *   • review task → Complete  → publish the pending draft into content/blog
 *   • review task deleted      → discard the pending draft
 *
 * Runs on a schedule. Never throws; always exits 0. Safe: it will not discard
 * drafts if it cannot read the task list (treats an empty read as "unknown").
 */
import { rmSync } from 'fs'
import { listTasks, updateTask, clickupConfigured } from './lib/clickup.mjs'
import { readPending, removePending, pendingSlugs } from './lib/pending.mjs'
import { publish } from './publisher.mjs'
import { produce } from './lib/produce.mjs'
import { slugify } from './lib/article.mjs'

const log = (...a) => console.log(...a)
const slugOf = (t) => t.slug || slugify(String(t.name).replace(/^[^:]*:\s*/, ''))

async function main() {
    if (!clickupConfigured()) { log('clickup not configured — approvals skipped'); return }
    log(`\n=== DEX approvals · ${new Date().toISOString()} ===`)

    let tasks = await listTasks({})

    // 1) on-demand requests: "WRITE: <topic>" tasks (not yet complete)
    for (const t of tasks) {
        if (t.status === 'complete') continue
        const m = String(t.name).match(/^\s*write:\s*(.+)$/i)
        if (!m) continue
        const topic = m[1].trim()
        log(`request: "${topic}"`)
        await produce({ title: topic, url: '', stream: 'on-demand', angle: '' })
        await updateTask(t.id, { name: `✅ Queued: ${topic}`, status: 'complete' })
    }

    // re-read so freshly-created review tasks are visible to steps 2 & 3
    tasks = await listTasks({})

    // 2) approvals: completed review tasks that still have a pending draft
    const pend = new Set(pendingSlugs())
    for (const t of tasks) {
        if (t.status !== 'complete') continue
        const slug = slugOf(t)
        if (!slug || !pend.has(slug)) continue
        const data = readPending(slug)
        if (!data?.article) continue
        const p = publish(data.article, data.brief, { image: data.image, audio: data.audio })
        if (p.ok) {
            removePending(slug)
            await updateTask(t.id, { name: `✅ PUBLISHED: ${data.article.title}` })
            log(`PUBLISHED → ${p.file}`)
        } else { log(`publish failed for ${slug}: ${p.error}`) }
    }

    // 3) rejects: pending drafts whose review task was deleted.
    // Safety: skip entirely if we could not read any tasks (likely an API blip).
    if (tasks.length) {
        const known = new Set(tasks.map(slugOf).filter(Boolean))
        for (const slug of pendingSlugs()) {
            if (known.has(slug)) continue
            log(`discarded rejected draft: ${slug}`)
            removePending(slug)
            try { rmSync(`public/blog/images/${slug}.png`) } catch {}
            try { rmSync(`public/blog/audio/${slug}.mp3`) } catch {}
        }
    }
}

main().catch((e) => log(`[guarded] ${e?.message || e}`))
