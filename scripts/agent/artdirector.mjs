/**
 * Art director — free media, no billing:
 *   cover  → Pollinations (Flux) editorial glass render, on-brand
 *   voice  → edge-tts (Microsoft neural voice) via `python -m edge_tts`
 * Both fail-soft: cover falls back to a default image, voice is skipped.
 */
import { writeFileSync, mkdirSync, statSync } from 'fs'
import { execFileSync } from 'child_process'

const FALLBACK_IMAGE = '/blog/images/ai-authority-blog-engine.png'

function coverPrompt(article) {
    const subject = article?.title || 'AI automation for business'
    return `Premium editorial 3D render for a technology blog cover. Abstract GEOMETRIC, technological metaphor for "${subject}": interlocking crystalline glass panels and brushed-aluminium architectural forms with flowing data lines and connected nodes, clean white studio cyclorama, soft cinematic lighting, gentle depth of field, one subtle candy-apple-red accent, octane render, ultra detailed, minimalist. Strictly geometric and technical — no hearts, no faces, no animals, no organic shapes, no text, no words, no letters, no logos.`
}

export async function generateCover(article, { slug, outDir = 'public/blog/images', timeoutMs = 90000 } = {}) {
    if (!slug) return { ok: false, image: FALLBACK_IMAGE, error: 'no slug', fallback: true }
    // deterministic seed from slug → same cover on re-runs
    let seed = 7
    for (const ch of slug) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
    // enhance=true runs an LLM prompt-upgrade → markedly better, cleaner renders
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(coverPrompt(article))}?width=1536&height=1024&nologo=true&enhance=true&model=flux&seed=${seed % 1000000}`
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
        if (!res.ok) throw new Error(`pollinations HTTP ${res.status}`)
        const buf = Buffer.from(await res.arrayBuffer())
        if (buf.length < 5000) throw new Error('image too small / empty')
        mkdirSync(outDir, { recursive: true })
        writeFileSync(`${outDir}/${slug}.png`, buf)
        return { ok: true, image: `/blog/images/${slug}.png`, model: 'pollinations-flux', bytes: buf.length }
    } catch (e) {
        return { ok: false, image: FALLBACK_IMAGE, error: e?.message || String(e), fallback: true }
    }
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
