/**
 * Art director — generates an on-brand cover (gpt-image-2, tkxel-style glass/
 * metal render) and optional voice narration. Fully fail-soft: if image or
 * audio generation fails, it returns a fallback so the post still ships.
 */
import { writeFileSync, mkdirSync } from 'fs'

const FALLBACK_IMAGE = '/blog/images/ai-authority-blog-engine.png'

function coverPrompt(article) {
    const subject = article?.title || 'artificial intelligence for business'
    return `Editorial 3D render for a premium technology blog cover. Subject: an abstract visual metaphor for "${subject}". Style: translucent frosted glass panels and brushed aluminium forms arranged as a clean minimal sculpture, soft studio lighting, off-white seamless background, gentle depth of field, one small candy-apple-red (#DD0426) accent element. Premium, editorial, minimalist. Absolutely no text, no words, no letters, no logos.`
}

async function imageCall(model, prompt, key, timeoutMs) {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, prompt, size: '1536x1024', n: 1 }),
        signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) throw new Error(`${model} HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`)
    const b64 = (await res.json())?.data?.[0]?.b64_json
    if (!b64) throw new Error(`${model} returned no image`)
    return Buffer.from(b64, 'base64')
}

export async function generateCover(article, { slug, outDir = 'public/blog/images', timeoutMs = 120000 } = {}) {
    const key = (process.env.OPENAI_API_KEY || '').trim()
    if (!key || !slug) return { ok: false, image: FALLBACK_IMAGE, error: 'no key/slug', fallback: true }
    const prompt = coverPrompt(article)
    let lastErr
    for (const model of ['gpt-image-2', 'gpt-image-1']) {
        try {
            const buf = await imageCall(model, prompt, key, timeoutMs)
            mkdirSync(outDir, { recursive: true })
            writeFileSync(`${outDir}/${slug}.png`, buf)
            return { ok: true, image: `/blog/images/${slug}.png`, model, bytes: buf.length }
        } catch (e) { lastErr = e?.message }
    }
    return { ok: false, image: FALLBACK_IMAGE, error: lastErr, fallback: true }
}

export async function generateVoice(article, { slug, outDir = 'public/blog/audio', timeoutMs = 90000 } = {}) {
    const key = (process.env.OPENAI_API_KEY || '').trim()
    if (!key || !slug) return { ok: false, audio: '', error: 'no key/slug' }
    const input = `${article.title}. ${article.directAnswer || article.description || ''}`.slice(0, 3500)
    try {
        const res = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'alloy', input, response_format: 'mp3' }),
            signal: AbortSignal.timeout(timeoutMs),
        })
        if (!res.ok) throw new Error(`tts HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        mkdirSync(outDir, { recursive: true })
        writeFileSync(`${outDir}/${slug}.mp3`, buf)
        return { ok: true, audio: `/blog/audio/${slug}.mp3`, bytes: buf.length }
    } catch (e) { return { ok: false, audio: '', error: e?.message } }
}
