import { filterQualitySources } from './source-quality.mjs'

const sourceLibrary = [
    {
        title: 'OpenAI Platform Documentation',
        organization: 'OpenAI',
        url: 'https://platform.openai.com/docs/',
        type: 'Official documentation',
        supports: 'Useful for articles explaining LLM-assisted workflows, model integration, prompts, and AI automation architecture.',
        tags: ['ai', 'llm', 'agents', 'automation', 'workflow', 'prompt'],
    },
    {
        title: 'Microsoft Learn: Azure AI Services',
        organization: 'Microsoft',
        url: 'https://learn.microsoft.com/en-us/azure/ai-services/',
        type: 'Official documentation',
        supports: 'Supports claims about practical AI service patterns, responsible deployment, and AI workflow building blocks.',
        tags: ['ai', 'automation', 'workflow', 'business', 'agents'],
    },
    {
        title: 'IBM: What Is Workflow Automation?',
        organization: 'IBM',
        url: 'https://www.ibm.com/topics/workflow-automation',
        type: 'Industry explainer',
        supports: 'Defines workflow automation and provides business context for improving repeatable operational processes.',
        tags: ['workflow', 'automation', 'business', 'operations'],
    },
    {
        title: 'IBM: Artificial Intelligence',
        organization: 'IBM',
        url: 'https://www.ibm.com/topics/artificial-intelligence',
        type: 'Industry explainer',
        supports: 'Supports plain-language explanations of AI capabilities and practical enterprise AI use cases.',
        tags: ['ai', 'business', 'automation', 'tools'],
    },
    {
        title: 'The State of AI',
        organization: 'McKinsey & Company',
        url: 'https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai',
        type: 'Industry report',
        supports: 'Useful for business-level AI adoption context and executive framing around AI value creation.',
        tags: ['ai', 'business', 'trend', 'strategy'],
    },
    {
        title: 'NIST AI Risk Management Framework',
        organization: 'National Institute of Standards and Technology',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
        type: 'Government framework',
        supports: 'Supports articles that need risk, governance, security, or responsible AI implementation guidance.',
        tags: ['security', 'risk', 'governance', 'ai', 'compliance'],
    },
    {
        title: 'GitHub Docs: GitHub Actions',
        organization: 'GitHub',
        url: 'https://docs.github.com/en/actions',
        type: 'Official documentation',
        supports: 'Supports workflow automation, CI/CD, scheduled jobs, and repository publishing automation examples.',
        tags: ['github', 'automation', 'workflow', 'ci', 'deployment'],
    },
    {
        title: 'Google Search Central: Creating Helpful Content',
        organization: 'Google Search Central',
        url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
        type: 'Official documentation',
        supports: 'Use only for articles specifically discussing SEO, search quality, helpful content, or Google policy.',
        tags: ['seo', 'google', 'content', 'search'],
    },
    {
        title: 'Google Search Central: SEO Starter Guide',
        organization: 'Google Search Central',
        url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide',
        type: 'Official documentation',
        supports: 'Use only for SEO-specific articles that explain crawlability, metadata, search snippets, or indexing basics.',
        tags: ['seo', 'google', 'content', 'search'],
    },
]

function keywordsFor(topic = {}) {
    return `${topic.topic || ''} ${topic.keyword || ''} ${topic.category || ''} ${topic.businessFunction || ''} ${topic.contentPersona || ''}`.toLowerCase()
}

function sourceMatches(source, topicText) {
    if (/seo|search|google|adsense|content quality/.test(source.tags.join(' ')) && !/seo|search|google|adsense|content|blog/.test(topicText)) {
        return false
    }
    return source.tags.some((tag) => topicText.includes(tag)) || /automation|business|ai/.test(topicText)
}

export function selectSourcesForTopic(topic = {}, options = {}) {
    const minScore = Number(options.minScore || process.env.SOURCE_MIN_AUTHORITY_SCORE || 75)
    const minSources = Number(options.minSources || process.env.MIN_AUTHORITY_SOURCES_PER_ARTICLE || 2)
    const maxSources = Number(options.maxSources || process.env.MAX_SOURCES_PER_ARTICLE || 6)
    const topicText = keywordsFor(topic)
    const candidates = sourceLibrary.filter((source) => sourceMatches(source, topicText))
    const selected = filterQualitySources(candidates, topicText, minScore).slice(0, maxSources)
    const average = selected.length ? Math.round(selected.reduce((sum, source) => sum + source.authorityScore, 0) / selected.length) : 0
    const ready = selected.length >= minSources

    return {
        sources: selected.map(({ authority, relevance, originality, trustworthiness, directRelation, ...source }) => source),
        sourceQualityScore: average,
        sourceStatus: ready ? 'Ready' : 'Needs Research',
        sourceNotes: ready
            ? `Selected ${selected.length} authoritative source${selected.length === 1 ? '' : 's'} with average authority score ${average}.`
            : `Need at least ${minSources} authentic topic-specific sources before publishing.`,
    }
}
