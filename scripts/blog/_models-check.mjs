// Lists which premium models THIS OpenAI account can actually use. Dev-only.
// Run: node --env-file=.env.local scripts/blog/_models-check.mjs
const key = process.env.OPENAI_API_KEY
const res = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${key}` } })
const data = await res.json()
if (!res.ok) { console.error(data); process.exit(1) }
const ids = data.data.map((m) => m.id).sort()
const want = ['gpt-5', 'gpt-4.1', 'gpt-4o', 'o3', 'o4', 'gpt-image', 'tts', 'search', 'deep-research']
console.log('\nRelevant models available to this account:\n')
for (const w of want) {
    const hits = ids.filter((id) => id.includes(w))
    if (hits.length) console.log(`  ${w.padEnd(14)} → ${hits.join(', ')}`)
}
console.log(`\n(total ${ids.length} models)`)
