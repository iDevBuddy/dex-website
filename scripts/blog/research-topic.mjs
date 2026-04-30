import path from 'node:path'
import { dataDir, readJson, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

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

export async function researchTopic(topicArg) {
    const topics = await readJson(path.join(dataDir, 'topics.json'), [])
    const topic = topicArg || topics.find((item) => item.status === 'scored_ready') || topics[0]
    if (!topic) throw new Error('No topic found. Run discover-topics first.')
    const brief = createResearchBrief(topic)
    await writeJson(path.join(dataDir, 'research-brief.json'), brief)
    log('research_brief_created', { topic: topic.topic, slug: topic.slug })
    return brief
}

if (import.meta.url === `file://${process.argv[1]}`) {
    researchTopic().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
