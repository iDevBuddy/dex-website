import path from 'node:path'
import { buildFallbackArticle, generateWithModel } from './lib/ai.mjs'
import { dataDir, readJson, writeJson } from './lib/content.mjs'
import { log, warn } from './lib/logger.mjs'

function parseJsonBlock(text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not contain JSON.')
    return JSON.parse(match[0])
}

export async function generateArticle(topicArg, briefArg) {
    const topics = await readJson(path.join(dataDir, 'topics.json'), [])
    const topic = topicArg || topics.find((item) => item.status === 'scored_ready') || topics[0]
    const brief = briefArg || await readJson(path.join(dataDir, 'research-brief.json'), null)
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

    await writeJson(path.join(dataDir, 'draft-article.json'), article)
    log('draft_generated', { slug: article.frontmatter?.slug, title: article.frontmatter?.title })
    return article
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateArticle().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
