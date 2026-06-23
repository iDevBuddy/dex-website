/**
 * OpenAI native web search demo (Responses API web_search tool).
 * Proves we can do grounded, cited research with ONLY the OpenAI key —
 * no Tavily/Serp/extra API. Dev-only, nothing published.
 *
 * Run: node --env-file=.env.local scripts/blog/_websearch-test.mjs
 */
const key = process.env.OPENAI_API_KEY
if (!key) { console.error('OPENAI_API_KEY not set'); process.exit(1) }

const query = 'Find 3 of the newest AI tools genuinely useful for small businesses this month. For each: name, one-line what it does, and the source URL.'

console.log('\n── OpenAI · WEB SEARCH ─────────────────')
console.log(`query: ${query}\n`)
const t = Date.now()
const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
        model: 'gpt-4o-mini',
        tools: [{ type: 'web_search_preview' }],
        input: query,
    }),
    signal: AbortSignal.timeout(90000),
})
if (!res.ok) { console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`); process.exit(1) }
const data = await res.json()

// pull the assistant text + any URL citations
let text = data.output_text || ''
const citations = []
for (const item of data.output || []) {
    for (const c of item.content || []) {
        if (c.type === 'output_text') {
            if (!text) text = c.text
            for (const a of c.annotations || []) {
                if (a.type === 'url_citation') citations.push(a.url)
            }
        }
    }
}

console.log(text.trim() || '(no text)')
console.log(`\nsources cited (${citations.length}):`)
;[...new Set(citations)].forEach((u) => console.log('  • ' + u))
console.log(`\n⏱  ${Date.now() - t}ms · cost ≈ $0.03 (1 web search + tokens)`)
