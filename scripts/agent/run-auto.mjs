/**
 * Autonomous entry for CI. Modes:
 *   --publish        scheduled run — generate one post (3x/week)
 *   --radar          frequent cheap scan — only acts on a major breaking story
 *   --topic "<x>"    on-demand: research a specific topic now (also env TOPIC)
 *
 * With ClickUp configured a finished post is queued for REVIEW; otherwise it
 * auto-publishes. Never throws; always exits 0.
 */
import { scout } from './scout.mjs'
import { chat, NVIDIA_SMALL, GEMMA } from './lib/ai.mjs'
import { notify } from './lib/notify.mjs'
import { produce } from './lib/produce.mjs'
import { publishedPosts, isDuplicate, recentStreams } from './lib/registry.mjs'

const log = (...a) => console.log(...a)
const mode = process.argv.includes('--radar') ? 'radar' : 'publish'
const topic = (() => { const i = process.argv.indexOf('--topic'); return (i >= 0 ? process.argv[i + 1] : '') || (process.env.TOPIC || '').trim() })()

async function isBreaking(idea) {
    const r = await chat({
        provider: 'gemma', model: GEMMA,
        fallback: { provider: 'nvidia', model: NVIDIA_SMALL }, json: true, maxTokens: 600,
        system: 'You judge whether a story is a MAJOR, time-sensitive launch worth an immediate post. Be strict — most are not.',
        user: `Story: "${idea.title}". Major breaking AI/tool/business-automation launch worth publishing right now? JSON {"breaking":true|false}`,
    })
    return r.ok && r.json?.breaking === true
}

async function main() {
    log(`\n=== DEX agent · ${topic ? 'on-demand' : mode} · ${new Date().toISOString()} ===`)
    const posts = publishedPosts()

    if (topic) {
        if (isDuplicate(topic, posts)) { log('topic already covered'); return }
        await produce({ title: topic, url: '', stream: 'ai-tools', angle: '' })
        return
    }

    const s = await scout({ shortlist: 6 })
    if (!s.ok || !s.ideas?.length) { log('scout: nothing to work with'); return }
    log(`scout: ${s.totalFetched} items · ${s.ideas.length} ideas (${s.selector})`)
    const fresh = s.ideas.filter((i) => !isDuplicate(i.title, posts))
    if (!fresh.length) { log('all ideas already covered'); return }
    const recent = recentStreams(2)
    fresh.sort((x, y) => (recent.includes(x.stream) ? 1 : 0) - (recent.includes(y.stream) ? 1 : 0))
    const pick = fresh[0]
    log(`pick: [${pick.stream}] ${pick.title}`)

    if (mode === 'radar' && !(await isBreaking(pick))) { log('radar: no major breaking story — exiting clean'); return }
    await produce(pick)
}

main().catch(async (e) => { try { await notify(`❌ Agent error: ${e?.message || e}`) } catch {} ; log(`[guarded] ${e?.message || e}`) })
