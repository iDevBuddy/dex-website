import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { createReviewLlmProvider } from './lib/llm-providers.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { selectSourcesForTopic } from './lib/source-selector.mjs'
import { searchWeb, webResultsToSources, webSearchEnabled } from './lib/web-search.mjs'

async function fetchResearchNotes(topic) {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_DRAFTS_DB_ID) return ''
    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_BLOG_DRAFTS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                page_size: 5,
                filter: { property: 'Topic', rich_text: { contains: topic.topic.slice(0, 40) } },
            }),
        })
        if (!response.ok) return ''
        const data = await response.json()
        return (data.results || [])
            .map((page) => page.properties?.['Research Notes']?.rich_text?.map((item) => item.plain_text).join('') || '')
            .filter(Boolean)
            .join('\n\n')
    } catch {
        return ''
    }
}

export function createResearchBrief(topic) {
    topic = enrichTopicPersona(topic)
    const sourceSelection = selectSourcesForTopic(topic)
    const officialSource = topic.officialUrl ? [{
        title: `${topic.officialSource || 'Official'} announcement: ${topic.topic}`,
        organization: topic.officialSource || 'Official source',
        url: topic.officialUrl,
        type: 'Official announcement',
        supports: 'Primary source for what was announced, product naming, capabilities, availability, and official positioning.',
        authorityScore: 95,
    }] : []
    const sources = [...officialSource, ...sourceSelection.sources]
    return {
        topic: topic.topic,
        slug: topic.slug,
        targetKeyword: topic.keyword,
        secondaryKeywords: ['AI automation workflow', 'AI agents for business', 'workflow automation examples'],
        searchIntent: 'Business owner or operator looking for practical implementation guidance.',
        targetReader: 'Founder, operator, marketer, or service-business owner evaluating AI automation.',
        mainPainPoint: 'They want useful automation but do not want generic AI advice or risky SEO shortcuts.',
        competitorGaps: [
            'Most posts explain concepts but do not provide a workflow.',
            'Many posts ignore approval, logging, and failure handling.',
            'Few connect AI automation to business outcomes.',
        ],
        questionsToAnswer: [
            `What is ${topic.topic}?`,
            'When should a business use it?',
            'What workflow should be automated first?',
            'What mistakes should be avoided?',
        ],
        suggestedOutline: ['Short expert intro', 'Key takeaways', 'Direct answer', 'Practical explanation', 'Business use case', 'Step-by-step workflow', 'Tools', 'Expert insight', 'Mistakes', 'Implementation checklist', 'FAQ', 'CTA'],
        sources,
        sourcesToCite: sources.map((source) => source.url),
        sourceStatus: sourceSelection.sourceStatus,
        sourceQualityScore: sourceSelection.sourceQualityScore,
        sourceNotes: sourceSelection.sourceNotes,
        duplicateStatus: topic.duplicateStatus || topic.duplicateAnalysis?.duplicateStatus || 'unique',
        duplicateScore: topic.duplicateScore || topic.duplicateAnalysis?.duplicateScore || 0,
        duplicateMatch: topic.duplicateMatch || topic.duplicateAnalysis?.bestMatch || null,
        suggestedAngle: topic.suggestedAngle || topic.duplicateAnalysis?.suggestedAngle || '',
        suggestedTopic: topic.suggestedTopic || topic.duplicateAnalysis?.suggestedTopic || '',
        trendAnalysis: topic.trendAnalysis || null,
        examplesToInclude: ['Slack intake workflow', 'CRM follow-up workflow', 'support triage workflow'],
        suggestedInternalLinks: ['/blog/ai-authority-blog-engine', '/#services', '/#contact'],
        suggestedCTA: 'Book an automation consult',
        contentFormat: 'expert guide',
        contentPersona: topic.contentPersona,
        businessFunction: topic.businessFunction,
        authorityAngle: topic.authorityAngle,
        title: `How to Use ${topic.topic} in a Practical Business Automation Workflow`,
        description: `A practical guide to applying ${topic.topic} with approval steps, quality checks, and measurable business outcomes.`,
    }
}

async function fetchWebSources(topic) {
    if (!webSearchEnabled()) return []
    const queries = [
        `${topic.topic} latest news 2025`,
        `${topic.keyword || topic.topic} business automation guide`,
    ]
    const results = await Promise.all(queries.map((q) => searchWeb(q, { maxResults: 4 })))
    const sources = results
        .filter(Boolean)
        .flatMap((r) => webResultsToSources(r.results, 0.5))
    const seen = new Set()
    return sources.filter((s) => {
        if (seen.has(s.url)) return false
        seen.add(s.url)
        return true
    }).slice(0, 6)
}

export async function researchTopic(topicArg, options = getPipelineOptions()) {
    const topics = await readPipelineJson('topics.json', [], options)
    const topic = topicArg || topics.find((item) => item.slug === options.slug || item.topic === options.topic) || topics.find((item) => item.status === 'scored_ready') || topics[0]
    if (!topic) throw new Error('No topic found. Run discover-topics first.')
    let brief = createResearchBrief(topic)
    const researchNotes = await fetchResearchNotes(topic)
    if (researchNotes) brief.notebookLmResearchNotes = researchNotes

    const webSources = options.dryRun ? [] : await fetchWebSources(topic)
    if (webSources.length) {
        log('web_research_sources_found', { topic: topic.topic, count: webSources.length })
        brief.webResearchSources = webSources
    }

    if (!options.dryRun) {
        try {
            const provider = createReviewLlmProvider()
            const health = await provider.healthCheck()
            if (health.configured) {
                const refined = await provider.generateJson(`Improve this research brief as JSON only. Keep the same keys and add practical examples. Do not invent sources and do not replace the provided sources array.\n${JSON.stringify(brief)}`)
                brief = { ...brief, ...refined }
            }
        } catch (error) {
            log('research_model_fallback', { message: error.message })
        }
    }

    const sourceSelection = selectSourcesForTopic(topic)
    const officialSource = topic.officialUrl ? [{
        title: `${topic.officialSource || 'Official'} announcement: ${topic.topic}`,
        organization: topic.officialSource || 'Official source',
        url: topic.officialUrl,
        type: 'Official announcement',
        supports: 'Primary source for what was announced, product naming, capabilities, availability, and official positioning.',
        authorityScore: 95,
    }] : []
    brief.sources = [...officialSource, ...webSources, ...sourceSelection.sources]
        .filter((s, i, arr) => s?.url && arr.findIndex((x) => x.url === s.url) === i)
        .slice(0, Number(process.env.MAX_SOURCES_PER_ARTICLE || 6))
    brief.sourcesToCite = brief.sources.map((source) => source.url)
    brief.sourceStatus = brief.sources.length >= 2 ? 'Ready' : sourceSelection.sourceStatus
    brief.sourceQualityScore = sourceSelection.sourceQualityScore
    brief.sourceNotes = webSources.length
        ? `${webSources.length} live web sources found via Tavily. ${sourceSelection.sourceNotes}`
        : sourceSelection.sourceNotes
    await writePipelineJson('research-brief.json', brief, options)
    log('research_brief_created', {
        topic: topic.topic,
        slug: topic.slug,
        duplicateStatus: brief.duplicateStatus,
        sourceStatus: brief.sourceStatus,
        webSourcesFound: webSources.length,
        ...modeDetails(options),
    })
    return brief
}

if (import.meta.url === `file://${process.argv[1]}`) {
    researchTopic(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
