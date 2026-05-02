import fs from 'node:fs/promises'
import { audioDir, ensureBlogDirs } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'
import { generateNvidiaTtsAudio, ttsProviderConfigured } from './lib/tts-providers.mjs'

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

    const provider = process.env.TTS_PROVIDER || 'browser_fallback'
    const providerConfigured = ttsProviderConfigured(provider)

    if (!providerConfigured || provider === 'browser_fallback') {
        if (process.env.REQUIRE_REAL_TTS === 'true') {
            const message = `TTS provider ${provider} is not configured and REQUIRE_REAL_TTS=true.`
            warn('audio_generation_failed', { message })
            await writePipelineJson('audio-result.json', { ...baseResult, failed: true, error: message }, options)
            await syncBlogDraft(article, { audioStatus: 'Failed' })
            throw new Error(message)
        }
        const result = {
            ...baseResult,
            provider: 'browser_speech_synthesis_fallback',
            note: 'No MP3 generated. Article page will use browser text-to-speech controls.',
            fallback: true,
        }
        await writePipelineJson('audio-result.json', result, options)
        log('audio_generated', result)
        await syncBlogDraft(article, { audioStatus: 'Browser Fallback' })
        return result
    }

    try {
        if (provider === 'nvidia_tts' || provider === 'nvidia_riva') {
            const ttsText = buildAudioScript(article)
            const result = await generateNvidiaTtsAudio({
                text: ttsText,
                slug: article.frontmatter.slug,
            })
            article.frontmatter.audio = result.path
            article.frontmatter.audioProvider = result.provider
            article.frontmatter.audioVoice = result.voice
            await writePipelineJson('draft-article.json', article, options)
            const output = {
                ...baseResult,
                provider: result.provider,
                path: result.path,
                voice: result.voice,
                fallback: false,
            }
            await writePipelineJson('audio-result.json', output, options)
            log('audio_generated', output)
            await syncBlogDraft(article, { audioStatus: 'Generated' })
            return output
        }

        const url = process.env.TTS_API_URL || process.env.PIPER_TTS_URL || process.env.KOKORO_TTS_URL
        if (!url) throw new Error(`Provider ${provider} needs an adapter URL for generated MP3 output.`)
        const response = await fetch(url, {
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
        await syncBlogDraft(article, { audioStatus: 'Browser Fallback' })
        return result
    } catch (error) {
        warn('audio_generation_failed', { message: error.message })
        await clearAudioOutput(article.frontmatter.slug)
        delete article.frontmatter.audio
        delete article.frontmatter.audioProvider
        delete article.frontmatter.audioVoice
        await writePipelineJson('draft-article.json', article, options)
        const result = { ...baseResult, fallback: true, error: error.message }
        await writePipelineJson('audio-result.json', result, options)
        await syncBlogDraft(article, { audioStatus: 'Failed' })
        await notifySlack(`Audio generation failed for ${article.frontmatter.title}: ${error.message}`)
        return result
    }
}

function buildAudioScript(article) {
    return [
        article.frontmatter.title,
        article.frontmatter.subtitle,
        article.directAnswer,
        article.body,
        Array.isArray(article.faqs) ? article.faqs.map((faq) => `${faq.question}. ${faq.answer}`).join(' ') : '',
    ].filter(Boolean).join('\n\n')
}

async function clearAudioOutput(slug) {
    try {
        await fs.unlink(`${audioDir}/${slug}.wav`)
    } catch {
        return
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateAudio(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
