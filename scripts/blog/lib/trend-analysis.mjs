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

function cleanTitle(value = '') {
    return String(value)
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
}

async function fetchText(url, headers = {}) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), Number(process.env.TREND_FETCH_TIMEOUT_MS || 9000))
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'DEXBlogEngine/1.0', ...headers },
            signal: controller.signal,
        })
        if (!response.ok) throw new Error(`${response.status}`)
        return await response.text()
    } finally {
        clearTimeout(timeout)
    }
}

async function fetchGoogleNewsSignals(query) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
    const text = await fetchText(url)
    return [...text.matchAll(/<title>(.*?)<\/title>/g)]
        .map((match) => cleanTitle(match[1]))
        .filter((title) => title && !/google news/i.test(title))
        .slice(0, 12)
        .map((title) => ({ source: 'Google News', title }))
}

async function fetchRedditSignals(query) {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=12`
    const text = await fetchText(url)
    const data = JSON.parse(text)
    return (data.data?.children || [])
        .map((item) => item.data?.title)
        .filter(Boolean)
        .slice(0, 12)
        .map((title) => ({ source: 'Reddit', title }))
}

async function fetchHackerNewsSignals(query) {
    const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=12`
    const text = await fetchText(url)
    const data = JSON.parse(text)
    return (data.hits || [])
        .map((item) => item.title || item.story_title)
        .filter(Boolean)
        .slice(0, 12)
        .map((title) => ({ source: 'Hacker News', title }))
}

async function fetchTwitterSignals(query) {
    if (!process.env.TWITTER_BEARER_TOKEN) return []
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(`${query} lang:en -is:retweet`)}&max_results=10`
    const text = await fetchText(url, { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` })
    const data = JSON.parse(text)
    return (data.data || [])
        .map((item) => item.text)
        .filter(Boolean)
        .slice(0, 10)
        .map((title) => ({ source: 'Twitter/X', title }))
}

export async function fetchRealTimeTrendSignals(topic = {}) {
    if (process.env.ENABLE_REALTIME_TRENDS === 'false') {
        return { enabled: false, signals: [], unavailableSources: [] }
    }
    const query = String(topic.keyword || topic.topic || '').replace(/[:|]/g, ' ').slice(0, 90)
    if (!query) return { enabled: true, signals: [], unavailableSources: ['empty_query'] }
    const fetchers = [
        ['Google News', fetchGoogleNewsSignals],
        ['Reddit', fetchRedditSignals],
        ['Hacker News', fetchHackerNewsSignals],
        ['Twitter/X', fetchTwitterSignals],
    ]
    const settled = await Promise.all(fetchers.map(async ([source, fn]) => {
        try {
            return { source, signals: await fn(query) }
        } catch (error) {
            return { source, error: error.message, signals: [] }
        }
    }))
    return {
        enabled: true,
        query,
        signals: settled.flatMap((item) => item.signals),
        unavailableSources: settled.filter((item) => item.error).map((item) => `${item.source}: ${item.error}`),
        fetchedAt: new Date().toISOString(),
    }
}

export function mergeRealTimeTrendAnalysis(topic = {}, realtime = {}) {
    const base = topic.trendAnalysis || analyzeTrend(topic)
    const topicWords = String(`${topic.topic || ''} ${topic.keyword || ''}`).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3)
    const signalText = (realtime.signals || []).map((item) => item.title).join(' ').toLowerCase()
    const relevanceHits = topicWords.filter((word) => signalText.includes(word)).length
    const sourceCount = new Set((realtime.signals || []).map((item) => item.source)).size
    const volumeBoost = Math.min(22, (realtime.signals || []).length * 2)
    const relevanceBoost = Math.min(22, relevanceHits * 4)
    const sourceBoost = Math.min(12, sourceCount * 4)
    const positive = positiveSignals.filter((term) => signalText.includes(term)).length
    const risky = riskSignals.filter((term) => signalText.includes(term)).length
    const marketSentimentScore = Math.max(0, Math.min(100, Math.round((base.marketSentimentScore + 50 + positive * 6 - risky * 12) / 2)))
    const marketSentiment = marketSentimentScore >= 72 ? 'positive' : marketSentimentScore <= 42 ? 'risky' : 'neutral'
    const trendScore = Math.max(base.trendScore, Math.min(100, Math.round(base.trendScore + volumeBoost + relevanceBoost + sourceBoost)))

    return {
        ...base,
        trendScore,
        marketSentiment,
        marketSentimentScore,
        realtimeSignals: (realtime.signals || []).slice(0, 8),
        realtimeSources: [...new Set((realtime.signals || []).map((item) => item.source))],
        realtimeUnavailableSources: realtime.unavailableSources || [],
        trendOverrideEligible: trendScore >= Number(process.env.TREND_OVERRIDE_MIN_SCORE || 82) && marketSentiment !== 'risky',
        trendOverrideReason: realtime.signals?.length
            ? `Real-time trend validation found ${realtime.signals.length} signal(s) from ${sourceCount} source(s). Sentiment: ${marketSentiment}.`
            : base.trendOverrideReason,
    }
}

export function shouldApplyTrendQualityOverride(report = {}, topic = {}, options = {}) {
    const enabled = process.env.ENABLE_TREND_QUALITY_OVERRIDE !== 'false'
    const floor = Number(process.env.TREND_QUALITY_FLOOR || 78)
    const trend = topic.trendAnalysis || analyzeTrend(topic)
    const score = Number(report.score || 0)
    const strictMinimum = Number(report.minQualityScore || process.env.MIN_QUALITY_SCORE || 88)
    const sourceGatePassed = report.sourceGate?.passed !== false
    const topicText = `${topic.topic || ''} ${topic.keyword || ''} ${topic.category || ''} ${topic.businessFunction || ''} ${topic.targetKeyword || ''}`.toLowerCase()
    const serviceTopic = /\b(service|agency|customer support|support|crm|sales|lead|finance|security|operations|ecommerce|appointment|clinic|law|real estate|local business)\b/.test(topicText)
    const businessTrendEligible = serviceTopic
        && trend.trendScore >= Number(process.env.BUSINESS_TREND_OVERRIDE_MIN_SCORE || 72)
        && trend.marketSentiment !== 'risky'
    const finalApplied = enabled
        && (trend.trendOverrideEligible || businessTrendEligible)
        && score >= floor
        && score < strictMinimum
        && sourceGatePassed
        && !options.autoPublish

    return {
        enabled,
        applied: finalApplied,
        floor,
        strictMinimum,
        trendScore: trend.trendScore,
        marketSentiment: trend.marketSentiment,
        marketSentimentScore: trend.marketSentimentScore,
        serviceTopic,
        businessTrendEligible,
        reason: finalApplied
            ? `Manual trend review allowed: quality ${score}/${strictMinimum}, trend ${trend.trendScore}/100, sentiment ${trend.marketSentiment}${serviceTopic ? ', service/business topic' : ''}.`
            : `No trend override: quality ${score}/${strictMinimum}, trend ${trend.trendScore}/100, sentiment ${trend.marketSentiment}.`,
    }
}
