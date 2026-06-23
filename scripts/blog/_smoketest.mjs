/**
 * Capability smoke test for the lean blog agent.
 * Shows exactly what OpenAI can do for us — text, image, voice — plus a
 * Notion connectivity check. Nothing is published or committed. Dev-only.
 *
 * Run:  node --env-file=.env.local scripts/blog/_smoketest.mjs
 *
 * .env.local (gitignored):
 *   OPENAI_API_KEY=sk-...
 *   OPENAI_MODEL=gpt-4o-mini            # optional (text), default shown
 *   OPENAI_IMAGE_MODEL=gpt-image-1      # optional, falls back to dall-e-3
 *   OPENAI_TTS_MODEL=gpt-4o-mini-tts    # optional, falls back to tts-1
 *   NOTION_API_KEY=ntn_...              # optional, give later
 *   NOTION_TEST_DB_ID=...               # optional
 *
 * Sample image/audio are written to data/blog/dry-run/ (gitignored).
 */
import { writeFileSync, mkdirSync } from 'fs'

const OUT = 'data/blog/dry-run'
mkdirSync(OUT, { recursive: true })
const ok = (s) => console.log(`  \x1b[32m✓\x1b[0m ${s}`)
const bad = (s) => console.log(`  \x1b[31m✗\x1b[0m ${s}`)
const line = (s = '') => console.log(s)

async function testText() {
    line('\n── OpenAI · TEXT ───────────────────────')
    const key = process.env.OPENAI_API_KEY
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
    if (!key) { bad('OPENAI_API_KEY not set'); return false }
    try {
        const t = Date.now()
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, messages: [{ role: 'user', content: 'Write one punchy 12-word blog intro about AI agents for small business.' }], max_tokens: 60, temperature: 0.6 }),
            signal: AbortSignal.timeout(20000),
        })
        if (!res.ok) { bad(`HTTP ${res.status}: ${(await res.text()).slice(0, 180)}`); return false }
        const d = await res.json()
        ok(`"${model}" in ${Date.now() - t}ms`)
        ok(`sample: ${d.choices?.[0]?.message?.content?.trim()}`)
        ok(`${d.usage?.total_tokens} tokens ≈ $${((d.usage?.total_tokens || 0) / 1e6 * 0.4).toFixed(5)}`)
        return true
    } catch (e) { bad(e.message); return false }
}

async function testImage() {
    line('\n── OpenAI · IMAGE ──────────────────────')
    const key = process.env.OPENAI_API_KEY
    if (!key) { bad('OPENAI_API_KEY not set'); return false }
    const prompt = 'Editorial 3D render, translucent glass and brushed metal abstract shapes, clean white studio background, soft light, premium tech aesthetic'
    for (const model of [process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1', 'dall-e-3']) {
        try {
            const t = Date.now()
            const body = model === 'dall-e-3'
                ? { model, prompt, size: '1024x1024', n: 1, response_format: 'b64_json' }
                : { model, prompt, size: '1024x1024', n: 1 }
            const res = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(90000),
            })
            if (!res.ok) { bad(`${model} → HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`); continue }
            const d = await res.json()
            const b64 = d.data?.[0]?.b64_json
            if (!b64) { bad(`${model} → no image data`); continue }
            const file = `${OUT}/smoketest-cover.png`
            writeFileSync(file, Buffer.from(b64, 'base64'))
            ok(`"${model}" generated in ${Date.now() - t}ms → ${file} (~$0.04)`)
            return true
        } catch (e) { bad(`${model} → ${e.message}`) }
    }
    return false
}

async function testAudio() {
    line('\n── OpenAI · VOICE (TTS) ────────────────')
    const key = process.env.OPENAI_API_KEY
    if (!key) { bad('OPENAI_API_KEY not set'); return false }
    const input = 'Welcome to DEX. Here is how AI agents quietly run your business operations around the clock.'
    for (const model of [process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts', 'tts-1']) {
        try {
            const t = Date.now()
            const res = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
                body: JSON.stringify({ model, voice: 'alloy', input, response_format: 'mp3' }),
                signal: AbortSignal.timeout(60000),
            })
            if (!res.ok) { bad(`${model} → HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`); continue }
            const buf = Buffer.from(await res.arrayBuffer())
            const file = `${OUT}/smoketest-voice.mp3`
            writeFileSync(file, buf)
            ok(`"${model}" in ${Date.now() - t}ms → ${file} (${(buf.length / 1024).toFixed(0)}KB, ~$0.002)`)
            return true
        } catch (e) { bad(`${model} → ${e.message}`) }
    }
    return false
}

async function testNotion() {
    line('\n── Notion ──────────────────────────────')
    const key = process.env.NOTION_API_KEY
    if (!key) { line('  (NOTION_API_KEY not set — skipping, give it later)'); return true }
    const get = (p) => fetch(`https://api.notion.com/v1${p}`, { headers: { Authorization: `Bearer ${key}`, 'Notion-Version': '2022-06-28' }, signal: AbortSignal.timeout(20000) })
    try {
        const r = await get('/users/me'); const b = await r.json()
        if (!r.ok) { bad(`token invalid — HTTP ${r.status}: ${b.message || ''}`); return false }
        ok(`token valid — "${b.name || 'bot'}"`)
    } catch (e) { bad(e.message); return false }
    const db = process.env.NOTION_TEST_DB_ID
    if (!db) { line('  (NOTION_TEST_DB_ID not set — skipping DB check)'); return true }
    try {
        const r = await get(`/databases/${db}`); const b = await r.json()
        if (!r.ok) { bad(`DB not accessible — HTTP ${r.status}: ${b.message || ''} (Share the DB with the integration)`); return false }
        ok(`DB "${b.title?.map((t) => t.plain_text).join('') || 'untitled'}" — cols: ${Object.keys(b.properties || {}).join(', ')}`)
        return true
    } catch (e) { bad(e.message); return false }
}

line('\n╭─ DEX blog agent · capability smoke test ─╮')
const results = {
    text: await testText(),
    image: await testImage(),
    voice: await testAudio(),
    notion: await testNotion(),
}
line('\n────────────────────────────────────────')
Object.entries(results).forEach(([k, v]) => line(`  ${v ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'}  ${k}`))
line('  (image/voice samples → data/blog/dry-run/)\n')
