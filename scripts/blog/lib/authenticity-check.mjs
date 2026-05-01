import { config } from './config.mjs'
import { analyzeTrend } from './trend-analysis.mjs'

const fillerPatterns = [
    /ai is transforming (the )?world/gi,
    /in today's (fast-paced|digital) world/gi,
    /game[- ]changer/gi,
    /revolutionize/gi,
    /unlock (the )?power/gi,
    /seamless(ly)?/gi,
]

const businessSignals = [
    'approval', 'audit', 'customer', 'crm', 'escalation', 'follow-up', 'kpi', 'lead', 'logging',
    'operations', 'owner', 'revenue', 'risk', 'sales', 'service', 'support', 'workflow',
]

const implementationSignals = [
    'step', 'checklist', 'example', 'tools', 'workflow', 'trigger', 'review', 'approval',
    'fallback', 'measure', 'route', 'assign', 'log', 'monitor',
]

function countMatches(text, terms) {
    const lower = text.toLowerCase()
    return terms.filter((term) => lower.includes(term)).length
}

function repeatedPhrasePenalty(text) {
    const phrases = text.toLowerCase().match(/\b[a-z][a-z0-9-]+(?:\s+[a-z][a-z0-9-]+){2,4}\b/g) || []
    const counts = new Map()
    for (const phrase of phrases) counts.set(phrase, (counts.get(phrase) || 0) + 1)
    const repeated = [...counts.values()].filter((count) => count >= 4).length
    return Math.min(25, repeated * 5)
}

function sourceAlignment(article = {}) {
    const sources = article.frontmatter?.sources || []
    if (!sources.length) return 35
    const body = `${article.frontmatter?.title || ''} ${article.frontmatter?.targetKeyword || ''} ${article.body || ''}`.toLowerCase()
    const aligned = sources.filter((source) => {
        const sourceText = `${source.title || ''} ${source.organization || ''} ${source.supports || ''}`.toLowerCase()
        return sourceText.split(/[^a-z0-9]+/).filter((word) => word.length > 4).some((word) => body.includes(word))
    }).length
    return Math.min(100, 45 + Math.round((aligned / Math.max(sources.length, 1)) * 55))
}

async function huggingFaceAuthenticity(article = {}) {
    if ((process.env.AUTHENTICITY_PROVIDER || '').toLowerCase() !== 'huggingface') return null
    if (!process.env.HUGGINGFACE_API_TOKEN || !process.env.HUGGINGFACE_MODEL) return null
    const input = `${article.frontmatter?.title || ''}\n\n${article.body || ''}`.slice(0, 3500)
    const response = await fetch(`https://api-inference.huggingface.co/models/${process.env.HUGGINGFACE_MODEL}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: input }),
    })
    if (!response.ok) throw new Error(`Hugging Face authenticity check failed: ${response.status}`)
    const data = await response.json()
    return {
        provider: 'huggingface',
        raw: data,
        note: 'Hugging Face model response captured. Heuristic validation still controls publishing gates for deterministic CI behavior.',
    }
}

export async function evaluateAuthenticity(article = {}, topic = {}) {
    const text = `${article.frontmatter?.title || ''}\n${article.frontmatter?.subtitle || ''}\n${article.body || ''}`
    const wordCount = text.split(/\s+/).filter(Boolean).length
    const fillerHits = fillerPatterns.reduce((sum, pattern) => sum + ((text.match(pattern) || []).length), 0)
    const specificity = Math.min(100, 35 + countMatches(text, implementationSignals) * 8 + Math.min(20, Math.floor(wordCount / 120)))
    const businessRelevance = Math.min(100, 30 + countMatches(text, businessSignals) * 7)
    const sourceScore = sourceAlignment(article)
    const trend = topic.trendAnalysis || analyzeTrend(topic || article.frontmatter || {})
    const duplicate = topic.duplicateAnalysis || {}
    const duplicatePenalty = duplicate.duplicateStatus === 'duplicate' ? 22 : duplicate.duplicateStatus === 'similar' ? 9 : 0
    const fillerPenalty = Math.min(30, fillerHits * 8 + repeatedPhrasePenalty(text))
    const bodyTooThinPenalty = wordCount < 700 ? 12 : 0
    const score = Math.max(0, Math.min(100, Math.round(
        (specificity * 0.26)
        + (businessRelevance * 0.24)
        + (sourceScore * 0.22)
        + (trend.marketSentimentScore * 0.16)
        + (Math.min(100, wordCount / 12) * 0.12)
        - duplicatePenalty
        - fillerPenalty
        - bodyTooThinPenalty,
    )))

    let modelResult = null
    try {
        modelResult = await huggingFaceAuthenticity(article)
    } catch (error) {
        modelResult = { provider: 'huggingface', error: error.message }
    }

    const minimum = Number(process.env.MIN_AUTHENTICITY_SCORE || 72)
    return {
        score,
        passed: score >= minimum,
        minimum,
        provider: modelResult?.provider || process.env.AUTHENTICITY_PROVIDER || 'heuristic_nlp',
        modelResult,
        signals: {
            specificity,
            businessRelevance,
            sourceAlignment: sourceScore,
            marketSentimentScore: trend.marketSentimentScore,
            duplicateStatus: duplicate.duplicateStatus || 'unknown',
            duplicateScore: duplicate.duplicateScore || 0,
            fillerHits,
            wordCount,
        },
        notes: score >= minimum
            ? 'Authenticity check passed: article has enough specificity, business relevance, source alignment, and trend support.'
            : 'Authenticity check needs review: improve specificity, add real examples, strengthen sources, or choose a more distinct market angle.',
        blockingIssue: config.requireAuthenticSources && score < minimum
            ? 'Authenticity score below publishing threshold.'
            : '',
    }
}
