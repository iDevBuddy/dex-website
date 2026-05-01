const trendTerms = [
    'agent',
    'ai agent',
    'automation',
    'workflow',
    'gpt',
    'gemma',
    'open source',
    'github',
    'security',
    'finance',
    'customer support',
    'sales',
    'crm',
    'small business',
]

const positiveSignals = ['launch', 'growth', 'adoption', 'funding', 'released', 'new', 'guide', 'tool', 'workflow', 'automation', 'open source']
const riskSignals = ['lawsuit', 'ban', 'outage', 'breach', 'scam', 'fake', 'spam', 'penalty']

export function analyzeTrend(topic = {}) {
    const text = `${topic.topic || ''} ${topic.keyword || ''} ${topic.category || ''} ${topic.source || ''}`.toLowerCase()
    const matchedTerms = trendTerms.filter((term) => text.includes(term))
    const sourceBoost = /google news|hacker news|reddit|product hunt|rss/i.test(topic.source || '') ? 22 : 0
    const recencyBoost = topic.createdAt && Date.now() - new Date(topic.createdAt).getTime() < 3 * 86400000 ? 12 : 5
    const authorityBoost = /\bgithub|gpt|gemma|agent|security|finance|support|crm\b/i.test(text) ? 14 : 6
    const positive = positiveSignals.filter((term) => text.includes(term)).length
    const risky = riskSignals.filter((term) => text.includes(term)).length
    const marketSentimentScore = Math.max(0, Math.min(100, 55 + (positive * 7) - (risky * 14)))
    const trendScore = Math.max(0, Math.min(100, sourceBoost + recencyBoost + authorityBoost + (matchedTerms.length * 9)))
    const marketSentiment = marketSentimentScore >= 72 ? 'positive' : marketSentimentScore <= 42 ? 'risky' : 'neutral'

    return {
        trendScore,
        marketSentiment,
        marketSentimentScore,
        matchedTrendTerms: matchedTerms,
        trendOverrideEligible: trendScore >= Number(process.env.TREND_OVERRIDE_MIN_SCORE || 82) && marketSentiment !== 'risky',
        trendOverrideReason: matchedTerms.length
            ? `Trending signal matched: ${matchedTerms.slice(0, 5).join(', ')}. Sentiment: ${marketSentiment}.`
            : `Trend score ${trendScore}; sentiment: ${marketSentiment}.`,
    }
}

export function shouldApplyTrendQualityOverride(report = {}, topic = {}, options = {}) {
    const enabled = process.env.ENABLE_TREND_QUALITY_OVERRIDE !== 'false'
    const floor = Number(process.env.TREND_QUALITY_FLOOR || 78)
    const trend = topic.trendAnalysis || analyzeTrend(topic)
    const score = Number(report.score || 0)
    const strictMinimum = Number(report.minQualityScore || process.env.MIN_QUALITY_SCORE || 88)
    const sourceGatePassed = report.sourceGate?.passed !== false
    const applied = enabled
        && trend.trendOverrideEligible
        && score >= floor
        && score < strictMinimum
        && sourceGatePassed
        && !options.autoPublish

    return {
        enabled,
        applied,
        floor,
        strictMinimum,
        trendScore: trend.trendScore,
        marketSentiment: trend.marketSentiment,
        marketSentimentScore: trend.marketSentimentScore,
        reason: applied
            ? `Manual trend review allowed: quality ${score}/${strictMinimum}, trend ${trend.trendScore}/100, sentiment ${trend.marketSentiment}.`
            : `No trend override: quality ${score}/${strictMinimum}, trend ${trend.trendScore}/100, sentiment ${trend.marketSentiment}.`,
    }
}
