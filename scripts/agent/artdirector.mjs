/**
 * Art director — free media, no billing:
 *   cover  → Pollinations (Flux) editorial glass render, on-brand
 *   voice  → edge-tts (Microsoft neural voice) via `python -m edge_tts`
 * Both fail-soft: cover falls back to a default image, voice is skipped.
 */
import { writeFileSync, mkdirSync, statSync } from 'fs'
import { execFileSync } from 'child_process'

const FALLBACK_IMAGE = '/blog/images/ai-authority-blog-engine.png'
const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

function coverPrompt(article) {
    const subject = article?.title || 'AI automation for business'
    return `Premium editorial 3D render for a technology blog cover. Abstract GEOMETRIC, technological metaphor for "${subject}": interlocking crystalline glass panels and brushed-aluminium architectural forms with flowing data lines and connected nodes, clean white studio cyclorama, soft cinematic lighting, gentle depth of field, one subtle candy-apple-red accent, octane render, ultra detailed, minimalist. Strictly geometric and technical — no hearts, no faces, no animals, no organic shapes, no text, no words, no letters, no logos.`
}

// NVIDIA FLUX.1-dev — top-tier, clean renders (free developer tier).
async function nvidiaFlux(prompt, seed, timeoutMs) {
    const key = env('NVIDIA_API_KEY')
    if (!key) throw new Error('no NVIDIA_API_KEY')
    const res = await fetch('https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ prompt, width: 1216, height: 832, steps: 28, cfg_scale: 3.5, seed: seed % 4000000 }),
        signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) throw new Error(`nvidia-flux HTTP ${res.status}`)
    const b64 = (await res.json())?.artifacts?.[0]?.base64
    if (!b64) throw new Error('nvidia-flux no image')
    return Buffer.from(b64, 'base64')
}

// Pollinations (free, no key) — fallback so a cover always renders.
async function pollinations(prompt, seed, timeoutMs) {
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1536&height=1024&nologo=true&enhance=true&model=flux&seed=${seed % 1000000}`
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) throw new Error(`pollinations HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 5000) throw new Error('pollinations empty')
    return buf
}

export async function generateCover(article, { slug, outDir = 'public/blog/images', timeoutMs = 90000 } = {}) {
    if (!slug) return { ok: false, image: FALLBACK_IMAGE, error: 'no slug', fallback: true }
    let seed = 7
    for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    const prompt = coverPrompt(article)
    const ladder = [
        ['nvidia-flux.1-dev', () => nvidiaFlux(prompt, seed, timeoutMs)],
        ['pollinations-flux', () => pollinations(prompt, seed, timeoutMs)],
    ]
    let lastErr
    for (const [model, gen] of ladder) {
        try {
            const buf = await gen()
            mkdirSync(outDir, { recursive: true })
            writeFileSync(`${outDir}/${slug}.png`, buf)
            return { ok: true, image: `/blog/images/${slug}.png`, model, bytes: buf.length }
        } catch (e) { lastErr = e?.message || String(e) }
    }
    return { ok: false, image: FALLBACK_IMAGE, error: lastErr, fallback: true }
}

export async function generateVoice(article, { slug, outDir = 'public/blog/audio', voice = 'en-US-AriaNeural' } = {}) {
    if (!slug) return { ok: false, audio: '', error: 'no slug' }
    const text = `${article.title}. ${article.directAnswer || article.description || ''}`.replace(/\s+/g, ' ').trim().slice(0, 3500)
    if (!text) return { ok: false, audio: '', error: 'no text' }
    try {
        mkdirSync(outDir, { recursive: true })
        const out = `${outDir}/${slug}.mp3`
        execFileSync('python', ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', out], { timeout: 60000, stdio: 'pipe' })
        const bytes = statSync(out).size
        if (bytes < 1000) throw new Error('empty audio')
        return { ok: true, audio: `/blog/audio/${slug}.mp3`, bytes }
    } catch (e) {
        return { ok: false, audio: '', error: (e?.message || String(e)).slice(0, 160) }
    }
}
