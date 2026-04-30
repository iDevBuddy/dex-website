import path from 'node:path'
import { buildFallbackArticle, generateWithModel } from './lib/ai.mjs'
import { dataDir, readJson } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'

function parseJsonBlock(text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not contain JSON.')
    return JSON.parse(match[0])
}

export async function generateArticle(topicArg, briefArg, options = getPipelineOptions()) {
    const topics = await readPipelineJson('topics.json', [], options)
    const topic = topicArg || topics.find((item) => item.slug === options.slug || item.topic === options.topic) || topics.find((item) => item.status === 'scored_ready') || topics[0]
    const brief = briefArg || await readPipelineJson('research-brief.json', null, options)
    if (!topic) throw new Error('No topic available.')

    const prompt = `Create one SEO-ready article as JSON only. Include keys: frontmatter, body, imagePrompt, audioScript.
Rules: no copied content, no fake data, no keyword stuffing, practical business tone, short paragraphs, useful examples, FAQ, sources.
Topic: ${JSON.stringify(topic)}
Research brief: ${JSON.stringify(brief)}`

    let article
    try {
        const response = await generateWithModel([
            { role: 'system', content: 'You are an expert SEO editor and AI automation architect. Return valid JSON only.' },
            { role: 'user', content: prompt },
        ])
        article = parseJsonBlock(response)
    } catch (error) {
        warn('ai_generation_fallback', { message: error.message })
        article = buildFallbackArticle(topic, brief)
    }

    await writePipelineJson('draft-article.json', article, options)
    log('draft_generated', { slug: article.frontmatter?.slug, title: article.frontmatter?.title, ...modeDetails(options) })
    return article
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateArticle(undefined, undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
