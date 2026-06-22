/**
 * Phase 1 demo — Scout → pick best idea → Analyst deep research → cited brief.
 * Proves the "best data" foundation end to end. Writes nothing, publishes
 * nothing. Top level can never throw: every failure is reported, exit 0.
 *
 * Run: node --env-file=.env.local scripts/agent/run-phase1.mjs
 */
import { scout } from './scout.mjs'
import { analyze } from './analyst.mjs'
import { estimateCost } from './lib/ai.mjs'

const h = (s) => console.log(`\n\x1b[1m${s}\x1b[0m`)

async function main() {
    h('1 · SCOUT — gathering free feeds + Reddit')
    const s = await scout({ shortlist: 6 })
    if (!s.ok) { console.log(`  scout could not run: ${s.error}`); return }
    console.log(`  fetched ${s.totalFetched} items · shortlisted by ${s.selector}`)
    s.ideas.forEach((it, i) => console.log(`  ${i + 1}. [${it.stream}] ${it.title}${it.angle ? `\n       ↳ ${it.angle}` : ''}`))

    const pick = s.ideas[0]
    if (!pick) { console.log('  no idea to research'); return }

    h(`2 · ANALYST — deep research on: "${pick.title}"`)
    console.log('  (gpt-5.5 agentic web search — may take 1–3 min)...')
    const a = await analyze(pick, { reasoningEffort: 'high' })
    if (!a.ok) { console.log(`  research failed: ${a.error}`); return }

    h('3 · CITED RESEARCH BRIEF')
    const b = a.brief
    console.log(`  verified: ${b.verified}`)
    console.log(`  finding : ${b.headline_finding}`)
    if (b.business_angle) console.log(`  angle   : ${b.business_angle}`)
    if (b.contrarian_take) console.log(`  contrarian: ${b.contrarian_take}`)
    if (Array.isArray(b.key_facts) && b.key_facts.length) { console.log('  key facts:'); b.key_facts.forEach((f) => console.log(`    • ${f}`)) }
    if (Array.isArray(b.risks_or_caveats) && b.risks_or_caveats.length) { console.log('  caveats:'); b.risks_or_caveats.forEach((f) => console.log(`    • ${f}`)) }
    console.log(`  sources (${(b.sources || []).length}):`)
    ;(b.sources || []).forEach((u) => console.log(`    • ${u}`))

    const c = estimateCost(a.model, a.usage || {})
    h('—')
    console.log(`  research model: ${a.model} · ~${c.tokens} tokens · ~$${c.usd} (est)`)
    console.log('  ✓ Phase 1 complete — grounded, cited brief ready for the Writer.')
}

main().catch((e) => { console.log(`\n[guarded] unexpected: ${e?.message || e}`) })
