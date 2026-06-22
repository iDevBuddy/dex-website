/**
 * Autonomous entry for CI. Two modes:
 *   --publish : scheduled run — generate + publish one post (3x/week cron)
 *   --radar   : frequent cheap scan — publish ONLY if a major breaking story
 *
 * Flow: Scout → dedupe → (radar gate) → Analyst → Writer → Critic →
 * Fact-check → Art director → Publisher. Never throws; always exits 0 so a
 * transient failure never marks the workflow red. A post is committed only
 * when it passes the fact-check gate.
 */
import { readdirSync, mkdirSync, writeFileSync } from 'fs'
import { scout } from './scout.mjs'
import { analyze } from './analyst.mjs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { generateCover, generateVoice } from './artdirector.mjs'
import { publish } from './publisher.mjs'
import { chat, safeJson } from './lib/ai.mjs'
import { slugify, wordCount } from './lib/article.mjs'

const log = (...a) => console.log(...a)
const mode = process.argv.includes('--radar') ? 'radar' : 'publish'

function publishedSlugs() {
    try { return new Set(readdirSync('content/blog').filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))) } catch { return new Set() }
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
    log(`\n=== DEX content agent · mode=${mode} · ${new Date().toISOString()} ===`)

    const s = await scout({ shortlist: 6 })
    if (!s.ok || !s.ideas?.length) { log('scout: nothing to work with — exiting clean'); return }
    log(`scout: ${s.totalFetched} items · ${s.ideas.length} ideas (via ${s.selector})`)

    const done = publishedSlugs()
    const fresh = s.ideas.filter((i) => !done.has(slugify(i.title)))
    if (!fresh.length) { log('all shortlisted ideas already covered — exiting clean'); return }
    const pick = fresh[0]
    log(`pick: [${pick.stream}] ${pick.title}`)

    if (mode === 'radar') {
        const breaking = await isBreaking(pick)
        if (!breaking) { log('radar: no major breaking story right now — exiting clean'); return }
        log('radar: BREAKING — proceeding to publish out of schedule')
    }

    const a = await analyze(pick, { reasoningEffort: 'high' })
    if (!a.ok) { log(`analyst failed (kept clean): ${a.error}`); return }
    log(`analyst: brief ready (${a.citations?.length || 0} sources)`)

    const w = await writeArticle(a)
    if (!w.ok) { log(`writer failed: ${w.error}`); return }
    const c = await critique(w.article, a)
    const article = c.article
    log(`writer+critic: "${article.title}" · ${wordCount(article)} words${c.improved ? ` · critic ${c.score}/100` : ''}`)

    const f = await factCheck(article, a)
    log(`fact-check: grounded=${f.grounded} verdict=${f.verdict}`)
    if (f.verdict !== 'pass') {
        // hold for review — write to gitignored dry-run so CI does not commit it
        try { mkdirSync('data/blog/dry-run', { recursive: true }); writeFileSync(`data/blog/dry-run/needs-review-${slugify(article.title)}.json`, JSON.stringify({ article, factcheck: f }, null, 2)) } catch {}
        log('held for review (not published) — exiting clean')
        return
    }

    const slug = slugify(article.title)
    const [cover, voice] = await Promise.all([generateCover(article, { slug }), generateVoice(article, { slug })])
    log(`art: cover=${cover.ok ? cover.model : 'fallback'} voice=${voice.ok ? 'ok' : 'skipped'}`)

    const p = publish(article, a, { image: cover.image, audio: voice.audio })
    if (!p.ok) { log(`publish failed: ${p.error}`); return }
    log(`PUBLISHED → ${p.file}`)
}

main().catch((e) => log(`[guarded] ${e?.message || e}`))
