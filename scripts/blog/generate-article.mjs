import { generateWithModel } from './lib/ai.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'
import { createMainLlmProvider } from './lib/llm-providers.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { recommendMediaForArticle } from './lib/media-intelligence.mjs'

function parseJsonBlock(text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not contain JSON.')
    return JSON.parse(match[0])
}

function normalizeArticle(article, topic, brief) {
    topic = enrichTopicPersona(topic)
    const slug = article.frontmatter?.slug || topic.slug
    const today = new Date().toISOString().slice(0, 10)
    const normalized = {
        ...article,
        frontmatter: {
            title: article.frontmatter?.title || article.title || brief?.title,
            subtitle: article.frontmatter?.subtitle || article.subtitle || `A practical guide to ${topic.topic}.`,
            slug,
            metaTitle: article.frontmatter?.metaTitle || article.metaTitle || `${article.frontmatter?.title || brief?.title} | DEX by Akif Saeed`,
            description: article.frontmatter?.description || article.metaDescription || brief?.description,
            metaDescription: article.frontmatter?.metaDescription || article.metaDescription || brief?.description,
            category: article.frontmatter?.category || topic.category || 'AI Automation',
            tags: article.frontmatter?.tags || article.tags || ['AI automation', 'business automation'],
            targetKeyword: article.frontmatter?.targetKeyword || topic.keyword || topic.topic.toLowerCase(),
            tone: article.frontmatter?.tone || process.env.DEFAULT_BLOG_TONE || 'Business Owner',
            style: article.frontmatter?.style || process.env.DEFAULT_BLOG_STYLE || 'Practical Guide',
            contentPersona: article.frontmatter?.contentPersona || brief?.contentPersona || topic.contentPersona,
            businessFunction: article.frontmatter?.businessFunction || brief?.businessFunction || topic.businessFunction,
            authorityAngle: article.frontmatter?.authorityAngle || brief?.authorityAngle || topic.authorityAngle,
            contentType: article.frontmatter?.contentType || brief?.contentFormat || 'How-To Guide',
            image: article.frontmatter?.image || `/blog/images/${slug}.png`,
            imageAlt: article.frontmatter?.imageAlt || `AI automation workflow visual for ${topic.topic}`,
            audioPath: article.frontmatter?.audioPath || '',
            author: article.frontmatter?.author || process.env.AUTHOR_NAME || 'Akif Saeed',
            publishedAt: article.frontmatter?.publishedAt || today,
            updatedAt: article.frontmatter?.updatedAt || today,
            readingTime: article.frontmatter?.readingTime || '',
            directAnswer: article.frontmatter?.directAnswer || `${topic.topic} works best when it is tied to a specific business workflow, quality checks, and human approval for risky actions.`,
            faqs: article.frontmatter?.faqs || article.faqs || [],
            sources: article.frontmatter?.sources || article.sources || brief?.sourcesToCite?.map((url) => ({ title: url, url })) || [],
            related: article.frontmatter?.related || article.related || ['/blog/ai-authority-blog-engine'],
            internalLinks: article.frontmatter?.internalLinks || article.internalLinkSuggestions || brief?.suggestedInternalLinks || [],
            keyTakeaways: article.frontmatter?.keyTakeaways || article.keyTakeaways || [],
            expertInsight: article.frontmatter?.expertInsight || article.expertInsight || '',
            assetLinks: article.frontmatter?.assetLinks || {},
            schemaType: 'BlogPosting',
        },
        body: article.body || '',
        imagePrompt: article.imagePrompt || brief?.imagePrompt || `Professional realistic SaaS dashboard for ${topic.topic}, AI automation workflow, orange accents, no readable text.`,
        audioScript: article.audioScript || `${article.frontmatter?.title || brief?.title}. ${article.frontmatter?.description || brief?.description}`,
    }
    normalized.frontmatter.mediaRecommendations = article.frontmatter?.mediaRecommendations || recommendMediaForArticle(normalized)
    return normalized
}

export async function generateArticle(topicArg, briefArg, options = getPipelineOptions()) {
    const topics = await readPipelineJson('topics.json', [], options)
    const topic = topicArg || topics.find((item) => item.slug === options.slug || item.topic === options.topic) || topics.find((item) => item.status === 'scored_ready') || topics[0]
    const brief = briefArg || await readPipelineJson('research-brief.json', null, options)
    if (!topic) throw new Error('No topic available.')

    const provider = createMainLlmProvider()
    const health = await provider.healthCheck()
    if (!health.configured) {
        const message = 'No LLM is configured. Add LOCAL_LLM_URL + LOCAL_LLM_MODEL or OPENAI_API_KEY before generating blog drafts.'
        warn('llm_missing', { message })
        if (!options.dryRun) {
            await syncBlogDraft({ frontmatter: { title: topic.topic, slug: topic.slug, targetKeyword: topic.keyword } }, {
                draftStatus: 'Rewrite Needed',
                approvalStatus: 'Rewrite Needed',
                notes: message,
            })
            await notifySlack(`Blog draft failed: ${message}`)
        }
        throw new Error(message)
    }

    const prompt = `Create one SEO-ready article as JSON only.
Return exactly this JSON shape:
{
  "frontmatter": {
    "title": "",
    "subtitle": "",
    "slug": "",
    "metaTitle": "",
    "description": "",
    "metaDescription": "",
    "category": "",
    "tags": [],
    "targetKeyword": "",
    "tone": "",
    "style": "",
    "image": "",
    "imageAlt": "",
    "audioPath": "",
    "author": "",
    "publishedAt": "",
    "updatedAt": "",
    "directAnswer": "",
    "faqs": [{"question":"","answer":""}],
    "sources": [{"title":"","url":""}],
    "related": [],
    "internalLinks": [],
    "schemaType": "BlogPosting"
  },
  "body": "",
  "imagePrompt": "",
  "audioScript": ""
}
Rules: no copied content, no fake data, no keyword stuffing, practical business tone, short paragraphs, useful examples, FAQ, sources. Include keyTakeaways, expertInsight, direct answer near top, H2/H3 headings, step-by-step workflow, real business examples, mistakes, CTA, and what to do next.
Topic: ${JSON.stringify(topic)}
Research brief: ${JSON.stringify(brief)}`

    let article
    try {
        const response = await generateWithModel([
            { role: 'system', content: 'You are an expert SEO editor and AI automation architect. Return valid JSON only.' },
            { role: 'user', content: prompt },
        ])
        article = normalizeArticle(parseJsonBlock(response), topic, brief)
    } catch (error) {
        warn('ai_generation_failed', { message: error.message })
        if (!options.dryRun) {
            await syncBlogDraft({ frontmatter: { title: topic.topic, slug: topic.slug, targetKeyword: topic.keyword } }, {
                draftStatus: 'Rewrite Needed',
                approvalStatus: 'Rewrite Needed',
                notes: `AI generation failed: ${error.message}`,
            })
            await notifySlack(`Blog draft generation failed for ${topic.topic}: ${error.message}`)
        }
        throw error
    }

    await writePipelineJson('draft-article.json', article, options)
    log('draft_generated', { slug: article.frontmatter?.slug, title: article.frontmatter?.title, ...modeDetails(options) })
    if (!options.dryRun) {
        await syncBlogDraft(article, { draftStatus: 'Needs Review', approvalStatus: 'Waiting' })
    }
    return article
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateArticle(undefined, undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
