import { audioDir, ensureBlogDirs } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'

export async function generateAudio(articleArg, options = getPipelineOptions()) {
    await ensureBlogDirs()
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const baseResult = {
        slug: article.frontmatter.slug,
        provider: process.env.TTS_PROVIDER || 'browser_fallback',
        audioDir,
        script: article.audioScript || `${article.frontmatter.title}. ${article.frontmatter.description}`,
        ...modeDetails(options),
    }

    if (options.dryRun) {
        const result = { ...baseResult, fallback: true, skippedWrite: true }
        await writePipelineJson('audio-result.json', result, options)
        log('audio_dry_run', result)
        return result
    }

    if (!process.env.TTS_API_URL || process.env.TTS_PROVIDER === 'browser_fallback') {
        const result = {
            ...baseResult,
            provider: 'browser_speech_synthesis_fallback',
            note: 'No MP3 generated. Article page will use browser text-to-speech controls.',
            fallback: true,
        }
        await writePipelineJson('audio-result.json', result, options)
        log('audio_generated', result)
        return result
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
        const result = { ...baseResult, fallback: true, note: 'TTS API responded, but provider-specific MP3 adapter is not configured yet.' }
        await writePipelineJson('audio-result.json', result, options)
        warn('tts_api_configured_but_no_adapter', { message: result.note })
        return result
    } catch (error) {
        warn('audio_generation_failed', { message: error.message })
        const result = { ...baseResult, fallback: true, error: error.message }
        await writePipelineJson('audio-result.json', result, options)
        return result
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateAudio(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
