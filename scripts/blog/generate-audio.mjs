import path from 'node:path'
import { audioDir, dataDir, ensureBlogDirs, readJson } from './lib/content.mjs'
import { log, warn } from './lib/logger.mjs'

export async function generateAudio(articleArg) {
    await ensureBlogDirs()
    const article = articleArg || await readJson(path.join(dataDir, 'draft-article.json'), null)
    if (!article) throw new Error('No draft article found.')

    if (!process.env.TTS_API_URL || process.env.TTS_PROVIDER === 'browser_fallback') {
        log('audio_generated', {
            provider: 'browser_speech_synthesis_fallback',
            note: 'No MP3 generated. Article page will use browser text-to-speech controls.',
        })
        return { fallback: true, provider: 'browser_speech_synthesis', audioDir }
    }

    try {
        const response = await fetch(process.env.TTS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: article.audioScript || `${article.frontmatter.title}. ${article.frontmatter.description}`,
                slug: article.frontmatter.slug,
            }),
        })
        if (!response.ok) throw new Error(`TTS failed: ${response.status}`)
        warn('tts_api_configured_but_no_adapter', { message: 'Add provider-specific response handling here.' })
        return { fallback: true }
    } catch (error) {
        warn('audio_generation_failed', { message: error.message })
        return { fallback: true, error: error.message }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateAudio().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
