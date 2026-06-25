/**
 * Phase 2 — brief → Writer → Critic (adversarial) → Fact-checker → markdown.
 * Loads the cached brief (data/blog/dry-run/brief.json) so we don't re-pay
 * for deep research while iterating. Writes a draft .md to dry-run/. Never
 * throws; every failure is reported.
 *
 * Run: node --env-file=.env.local scripts/agent/run-phase2.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { buildMarkdown, wordCount } from './lib/article.mjs'
import { estimateCost } from './lib/ai.mjs'

const h = (s) => console.log(`\n\x1b[1m${s}\x1b[0m`)
const BRIEF = 'data/blog/dry-run/brief.json'

async function main() {
    let data
    try { data = JSON.parse(readFileSync(BRIEF, 'utf8')) } catch (e) { console.log(`Could not load ${BRIEF}: ${e.message}`); return }
    console.log(`Loaded brief: "${data.idea?.title}"`)
    let spend = 0

    h('1 · WRITER (gpt-oss-120b)')
    const w = await writeArticle(data)
    if (!w.ok) { console.log(`  writer failed: ${w.error}`); return }
    spend += estimateCost(w.model, w.usage || {}).usd
    console.log(`  draft: "${w.article.title}" · ${wordCount(w.article)} words`)

    h('2 · CRITIC (gpt-oss-120b, adversarial)')
    const c = await critique(w.article, data)
    spend += estimateCost(c.model || '', c.usage || {}).usd
    if (c.improved) {
        console.log(`  score: ${c.score}/100 · revised`)
        if (c.issues?.length) { console.log('  issues fixed:'); c.issues.slice(0, 6).forEach((i) => console.log(`    • ${i}`)) }
    } else { console.log(`  ${c.note}`) }
    const finalArticle = c.article

    h('3 · FACT-CHECK (gpt-oss-20b vs brief)')
    const f = await factCheck(finalArticle, data)
    spend += estimateCost(f.model || '', f.usage || {}).usd
    console.log(`  grounded: ${f.grounded} · verdict: ${f.verdict} · supported claims: ${f.supportedCount ?? '—'}`)
    if (f.flagged?.length) { console.log('  flagged:'); f.flagged.forEach((x) => console.log(`    ⚠ ${x.claim} (${x.why})`)) }

    h('4 · ASSEMBLE')
    const { slug, markdown } = buildMarkdown(finalArticle, data)
    const out = `data/blog/dry-run/${slug}.md`
    writeFileSync(out, markdown)
    console.log(`  → ${out}`)
    console.log(`  title: ${finalArticle.title}`)
    console.log(`  category: ${finalArticle.category} · ${wordCount(finalArticle)} words · ${finalArticle.faqs?.length || 0} FAQs · ${(data.brief.sources || []).length} sources`)

    h('—')
    console.log(`  status: ${f.verdict === 'pass' ? '\x1b[32mPASS — publish-ready\x1b[0m' : '\x1b[33mNEEDS REVIEW\x1b[0m'}`)
    console.log(`  phase-2 cost ≈ $${spend.toFixed(3)} (writer + critic + fact-check)`)
}

main().catch((e) => console.log(`\n[guarded] unexpected: ${e?.message || e}`))
