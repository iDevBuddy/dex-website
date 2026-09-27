/**
 * Art director — uses configured provider access; quotas are provider-controlled:
 *   cover  → NVIDIA FLUX, topic-specific concept, validated PNG
 *   voice  → edge-tts (Microsoft neural voice) via `python -m edge_tts`
 * Both fail-soft: cover falls back to a default image, voice is skipped.
 */
import { writeFileSync, mkdirSync, statSync } from 'fs'
import { execFileSync } from 'child_process'
import sharp from 'sharp'

const FALLBACK_IMAGE = '/blog/images/ai-authority-blog-engine.png'
const env = (k) => (process.env[k] && String(process.env[k]).trim()) || ''

export function coverPrompt(article) {
    const concept = String(article?.coverConcept || article?.businessProblem || article?.title || 'A service enquiry moving into a review queue').slice(0, 900)
    return `Editorial concept illustration for a practical business guide. Scene: ${concept}. Show concrete objects and a single clear focal point. Tactile cut-paper and fine architectural drawing style; warm off-white background, charcoal and navy details, one restrained red accent. Wide composition with important objects inside the central 16:9 crop, clean negative space, subtle texture. No generic floating glass cubes or glowing data networks. No text, letters, logos, watermark or fake software screenshots. This is an illustration, not evidence of a real implementation.`
}

export async function normalizeCover(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 5000 || buffer.length > 20 * 1024 * 1024) throw new Error('Invalid cover size')
    const input = sharp(buffer, { limitInputPixels: 16000000, failOn: 'error' })
    const metadata = await input.metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format) || metadata.width < 1000 || metadata.height < 650) throw new Error('Cover format or resolution unsuitable')
    return input.rotate().resize(1280, 720, { fit: 'cover', position: 'centre' }).png({ compressionLevel: 9 }).toBuffer()
}

// NVIDIA FLUX.1-dev endpoint, verified during integration testing.
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

export async function generateCover(article, { slug, outDir = 'public/blog/images', timeoutMs = 90000 } = {}) {
    if (!slug) return { ok: false, image: FALLBACK_IMAGE, error: 'no slug', fallback: true }
    let seed = 7
    for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    const prompt = coverPrompt(article)
    const ladder = [['nvidia-flux.1-dev', () => nvidiaFlux(prompt, seed, timeoutMs)]]
    let lastErr
    for (const [model, gen] of ladder) {
        try {
            const buf = await normalizeCover(await gen())
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
