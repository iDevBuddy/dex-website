import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { createReviewLlmProvider } from './lib/llm-providers.mjs'

export function createResearchBrief(topic) {
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
        suggestedOutline: ['Direct answer', 'Business use case', 'Step-by-step workflow', 'Examples', 'Mistakes', 'FAQ', 'Next steps'],
        sourcesToCite: [
            'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
            'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
        ],
        examplesToInclude: ['Slack intake workflow', 'CRM follow-up workflow', 'support triage workflow'],
        suggestedInternalLinks: ['/blog/ai-authority-blog-engine', '/#services', '/#contact'],
        suggestedCTA: 'Book an automation consult',
        contentFormat: 'expert guide',
        title: `How to Use ${topic.topic} in a Practical Business Automation Workflow`,
        description: `A practical guide to applying ${topic.topic} with approval steps, quality checks, and measurable business outcomes.`,
    }
}

export async function researchTopic(topicArg, options = getPipelineOptions()) {
    const topics = await readPipelineJson('topics.json', [], options)
    const topic = topicArg || topics.find((item) => item.slug === options.slug || item.topic === options.topic) || topics.find((item) => item.status === 'scored_ready') || topics[0]
    if (!topic) throw new Error('No topic found. Run discover-topics first.')
    let brief = createResearchBrief(topic)
    if (!options.dryRun) {
        try {
            const provider = createReviewLlmProvider()
            const health = await provider.healthCheck()
            if (health.configured) {
                const refined = await provider.generateJson(`Improve this research brief as JSON only. Keep the same keys and add practical examples.\n${JSON.stringify(brief)}`)
                brief = { ...brief, ...refined }
            }
        } catch (error) {
            log('research_model_fallback', { message: error.message })
        }
    }
    await writePipelineJson('research-brief.json', brief, options)
    log('research_brief_created', { topic: topic.topic, slug: topic.slug, ...modeDetails(options) })
    return brief
}

if (import.meta.url === `file://${process.argv[1]}`) {
    researchTopic(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
