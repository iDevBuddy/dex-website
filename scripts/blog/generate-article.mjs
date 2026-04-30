import { generateWithModel } from './lib/ai.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'
import { createMainLlmProvider } from './lib/llm-providers.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { recommendMediaForArticle } from './lib/media-intelligence.mjs'
import { selectSourcesForTopic } from './lib/source-selector.mjs'

function parseJsonBlock(text) {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('AI response did not contain JSON.')
    return JSON.parse(match[0])
}

function normalizeArticle(article, topic, brief) {
    topic = enrichTopicPersona(topic)
    const slug = article.frontmatter?.slug || topic.slug
    const today = new Date().toISOString().slice(0, 10)
    const sourceSelection = brief?.sources?.length ? {
        sources: brief.sources,
        sourceStatus: brief.sourceStatus || 'Ready',
        sourceQualityScore: brief.sourceQualityScore || 0,
        sourceNotes: brief.sourceNotes || '',
    } : selectSourcesForTopic(topic)
    const sources = (sourceSelection.sources?.length ? sourceSelection.sources : (article.frontmatter?.sources || article.sources || []))
        .filter((source) => source?.title && source?.url)
        .map((source) => ({
            title: source.title,
            organization: source.organization || '',
            url: source.url,
            type: source.type || 'Source',
            supports: source.supports || source.reason || '',
            authorityScore: source.authorityScore,
        }))
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
            targetReader: article.frontmatter?.targetReader || brief?.targetReader || 'Business owner or operator',
            searchIntent: article.frontmatter?.searchIntent || brief?.searchIntent || 'Informational',
            practicalUseCase: article.frontmatter?.practicalUseCase || brief?.examplesToInclude?.[0] || 'Approval-based business workflow automation',
            implementationDifficulty: article.frontmatter?.implementationDifficulty || 'Medium',
            estimatedTimeToImplement: article.frontmatter?.estimatedTimeToImplement || '1-2 weeks for an MVP workflow',
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
            sources,
            sourcesStatus: article.frontmatter?.sourcesStatus || sourceSelection.sourceStatus,
            sourceQualityScore: article.frontmatter?.sourceQualityScore || sourceSelection.sourceQualityScore,
            sourceNotes: article.frontmatter?.sourceNotes || sourceSelection.sourceNotes,
            publishReady: article.frontmatter?.publishReady ?? sourceSelection.sourceStatus === 'Ready',
            blockingIssues: article.frontmatter?.blockingIssues || (sourceSelection.sourceStatus === 'Ready' ? '' : 'Authentic sources needed before publishing.'),
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
    "contentPersona": "",
    "businessFunction": "",
    "authorityAngle": "",
    "targetReader": "",
    "searchIntent": "",
    "practicalUseCase": "",
    "implementationDifficulty": "",
    "estimatedTimeToImplement": "",
    "image": "",
    "imageAlt": "",
    "audioPath": "",
    "author": "",
    "publishedAt": "",
    "updatedAt": "",
    "directAnswer": "",
    "faqs": [{"question":"","answer":""}],
    "sources": [{"title":"","organization":"","url":"","type":"","supports":""}],
    "related": [],
    "internalLinks": [],
    "schemaType": "BlogPosting"
  },
  "body": "",
  "imagePrompt": "",
  "audioScript": ""
}
Writing structure: strong title, clear subtitle, short expert intro, key takeaways, direct answer block, practical explanation, real business use case, step-by-step workflow, tool recommendations if relevant, expert insight, common mistakes, implementation checklist, FAQ, CTA.
Source rules: use only the provided research sources for claims. Do not invent sources. Do not add generic Google SEO docs unless this topic is actually about SEO or Google policy. Do not put a References, Sources, or Research Sources section in the body; sources belong only in frontmatter.sources.
Quality rules: no copied content, no fake data, no keyword stuffing, no "AI is transforming the world" intro, no repeated filler phrases, practical business tone, short paragraphs, useful examples, FAQ, and clear next steps.
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
