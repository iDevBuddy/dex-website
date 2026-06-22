/**
 * Full content pipeline (from a cached brief):
 *   Writer → Critic → Fact-check → Art director (cover + voice) → Publisher.
 *
 * Publishes a real post into content/blog/. Never throws; if a stage fails it
 * degrades (fallback cover, hold-for-review) and reports. Phase-3 demo entry.
 *
 * Run: node --env-file=.env.local scripts/agent/run.mjs
 */
import { readFileSync } from 'fs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { generateCover, generateVoice } from './artdirector.mjs'
import { publish } from './publisher.mjs'
import { wordCount, slugify } from './lib/article.mjs'
import { estimateCost } from './lib/ai.mjs'

const h = (s) => console.log(`\n\x1b[1m${s}\x1b[0m`)
const BRIEF = process.argv[2] || 'data/blog/dry-run/brief.json'

async function main() {
    let data
    try { data = JSON.parse(readFileSync(BRIEF, 'utf8')) } catch (e) { console.log(`load ${BRIEF}: ${e.message}`); return }
    console.log(`Brief: "${data.idea?.title}"`)
    let spend = 0

    h('1 · WRITER')
    const w = await writeArticle(data)
    if (!w.ok) { console.log(`  failed: ${w.error}`); return }
    spend += estimateCost(w.model, w.usage || {}).usd
    console.log(`  "${w.article.title}" · ${wordCount(w.article)} words`)

    h('2 · CRITIC (adversarial)')
    const c = await critique(w.article, data)
    spend += estimateCost(c.model || '', c.usage || {}).usd
    console.log(c.improved ? `  score ${c.score}/100 · ${c.issues?.length || 0} issues fixed` : `  ${c.note}`)
    const article = c.article

    h('3 · FACT-CHECK')
    const f = await factCheck(article, data)
    spend += estimateCost(f.model || '', f.usage || {}).usd
    console.log(`  grounded: ${f.grounded} · verdict: ${f.verdict}`)
    if (f.flagged?.length) f.flagged.forEach((x) => console.log(`    ⚠ ${x.claim}`))

    const slug = slugify(article.title)

    h('4 · ART DIRECTOR (cover gpt-image-2 + voice)')
    const [cover, voice] = await Promise.all([
        generateCover(article, { slug }),
        generateVoice(article, { slug }),
    ])
    spend += 0.07 // image (fixed) + tts (~0.002)
    console.log(`  cover: ${cover.ok ? `${cover.image} (${cover.model}, ${(cover.bytes / 1024).toFixed(0)}KB)` : `fallback — ${cover.error}`}`)
    console.log(`  voice: ${voice.ok ? `${voice.audio} (${(voice.bytes / 1024).toFixed(0)}KB)` : `skipped — ${voice.error}`}`)

    h('5 · PUBLISH → content/blog')
    const p = publish(article, data, { image: cover.image, audio: voice.audio })
    if (!p.ok) { console.log(`  publish failed: ${p.error}`); return }
    console.log(`  → ${p.file}`)

    h('—')
    console.log(`  ${f.verdict === 'pass' ? '\x1b[32m✓ PUBLISHED (publish-ready)\x1b[0m' : '\x1b[33m⚠ PUBLISHED as draft — needs review\x1b[0m'}`)
    console.log(`  pipeline cost ≈ $${spend.toFixed(3)} (excludes the one-time deep research)`)
    console.log(`  slug: ${p.slug}`)
}

main().catch((e) => console.log(`\n[guarded] ${e?.message || e}`))
