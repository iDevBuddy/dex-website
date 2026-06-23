/**
 * Autonomous entry for CI. Modes:
 *   --publish        scheduled run — generate + publish one post (3x/week)
 *   --radar          frequent cheap scan — publish ONLY on a major breaking story
 *   --topic "<x>"    on-demand: research+publish a specific topic now
 *                    (also reads env TOPIC, so CI passes it safely — no shell eval)
 *
 * Flow: Scout → dedupe → rotate → (radar gate) → Analyst → Writer → Critic →
 * Fact-check → Art director → Publisher → WhatsApp summary. Never throws;
 * always exits 0. A post is committed only when it passes the fact-check gate.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'fs'
import { scout } from './scout.mjs'
import { analyze } from './analyst.mjs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { generateCover, generateVoice } from './artdirector.mjs'
import { publish } from './publisher.mjs'
import { chat, estimateCost } from './lib/ai.mjs'
import { slugify, wordCount } from './lib/article.mjs'
import { notify } from './lib/notify.mjs'

const log = (...a) => console.log(...a)
const mode = process.argv.includes('--radar') ? 'radar' : 'publish'
const topic = (() => {
    const i = process.argv.indexOf('--topic')
    return (i >= 0 ? process.argv[i + 1] : '') || (process.env.TOPIC || '').trim()
})()

const BLOG_DIR = 'content/blog'

function publishedPosts() {
    try {
        return readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).map((f) => {
            const t = readFileSync(`${BLOG_DIR}/${f}`, 'utf8')
            return {
                slug: f.replace(/\.md$/, ''),
                title: (t.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
                stream: (t.match(/^stream:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
                date: (t.match(/^publishedAt:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
            }
        })
    } catch { return [] }
}

const sig = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3)
function isDuplicate(title, posts) {
    const a = new Set(sig(title))
    if (!a.size) return false
    for (const p of posts) {
        if (slugify(title) === p.slug) return true
        const b = sig(p.title)
        if (!b.length) continue
        const overlap = b.filter((w) => a.has(w)).length / Math.max(a.size, b.length)
        if (overlap > 0.6) return true
    }
    return false
}

async function isBreaking(idea) {
    const r = await chat({
        provider: 'gemma', model: process.env.GEMMA_MODEL || 'google/gemma-4-31b-it:free',
        fallback: { provider: 'openai', model: 'gpt-5-nano' },
        json: true, maxTokens: 150,
        system: 'You judge whether a story is a MAJOR, time-sensitive launch worth an immediate out-of-schedule blog post. Be strict — most stories are not breaking.',
        user: `Story: "${idea.title}". Is this a major breaking AI tool / model / business-automation launch worth publishing right now, outside the normal schedule? Return JSON {"breaking":true|false}`,
    })
    return r.ok && r.json?.breaking === true
}

async function main() {
    log(`\n=== DEX content agent · mode=${topic ? 'on-demand' : mode} · ${new Date().toISOString()} ===`)
    const posts = publishedPosts()
    let spend = 0

    // 1) choose the topic
    let pick
    if (topic) {
        if (isDuplicate(topic, posts)) { await notify(`⏭ Skipped — "${topic}" already covered.`); log('topic already covered'); return }
        pick = { title: topic, url: '', stream: 'ai-tools', angle: '' }
        log(`on-demand topic: ${topic}`)
    } else {
        const s = await scout({ shortlist: 6 })
        if (!s.ok || !s.ideas?.length) { log('scout: nothing to work with'); return }
        log(`scout: ${s.totalFetched} items · ${s.ideas.length} ideas (${s.selector})`)
        const fresh = s.ideas.filter((i) => !isDuplicate(i.title, posts))
        if (!fresh.length) { log('all ideas already covered'); return }
        // stream rotation: push recently-used streams to the back
        const recent = posts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2).map((p) => p.stream)
        fresh.sort((a, b) => (recent.includes(a.stream) ? 1 : 0) - (recent.includes(b.stream) ? 1 : 0))
        pick = fresh[0]
        log(`pick: [${pick.stream}] ${pick.title}`)

        if (mode === 'radar') {
            if (!(await isBreaking(pick))) { log('radar: no major breaking story — exiting clean'); return }
            log('radar: BREAKING — proceeding')
        }
    }

    // 2) research → write → critique → fact-check
    const a = await analyze(pick, { reasoningEffort: 'high' })
    if (!a.ok) { await notify(`⚠️ Research failed for "${pick.title}". No post this run.`); log(`analyst failed: ${a.error}`); return }
    spend += estimateCost(a.model, a.usage || {}).usd

    const w = await writeArticle(a)
    if (!w.ok) { log(`writer failed: ${w.error}`); return }
    spend += estimateCost(w.model, w.usage || {}).usd
    const c = await critique(w.article, a)
    spend += estimateCost(c.model || '', c.usage || {}).usd
    const article = c.article
    log(`article: "${article.title}" · ${wordCount(article)} words${c.improved ? ` · critic ${c.score}/100` : ''}`)

    const f = await factCheck(article, a)
    spend += estimateCost(f.model || '', f.usage || {}).usd
    log(`fact-check: grounded=${f.grounded} verdict=${f.verdict}`)
    if (f.verdict !== 'pass') {
        try { mkdirSync('data/blog/dry-run', { recursive: true }); writeFileSync(`data/blog/dry-run/needs-review-${slugify(article.title)}.json`, JSON.stringify({ article, factcheck: f }, null, 2)) } catch {}
        await notify(`📝 Draft held for review: "${article.title}"\nReason: fact-check ${f.verdict}.`)
        log('held for review — exiting clean')
        return
    }

    // 3) cover + voice + publish
    const slug = slugify(article.title)
    const [cover, voice] = await Promise.all([generateCover(article, { slug }), generateVoice(article, { slug })])
    spend += 0.07
    log(`art: cover=${cover.ok ? cover.model : 'fallback'} voice=${voice.ok ? 'ok' : 'skipped'}`)

    const p = publish(article, a, { image: cover.image, audio: voice.audio })
    if (!p.ok) { await notify(`⚠️ Publish blocked for "${article.title}": ${p.error}`); log(`publish failed: ${p.error}`); return }

    log(`PUBLISHED → ${p.file}`)
    await notify(`✅ Published: "${article.title}"\nStream: ${pick.stream} · ${wordCount(article)} words · cover: ${cover.ok ? 'AI' : 'fallback'}\nCost ≈ $${(spend + 0.67).toFixed(2)} · /blog/${slug}`)
}

main().catch(async (e) => { try { await notify(`❌ Agent error: ${e?.message || e}`) } catch {} ; log(`[guarded] ${e?.message || e}`) })
