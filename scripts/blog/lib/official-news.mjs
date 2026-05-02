import { slugify } from './content.mjs'
import { warn } from './logger.mjs'

const defaultFeeds = [
    { source: 'OpenAI News', organization: 'OpenAI', url: 'https://openai.com/news/rss.xml' },
    { source: 'NVIDIA Technical Blog', organization: 'NVIDIA', url: 'https://developer.nvidia.com/blog/feed/' },
    { source: 'NVIDIA Blog', organization: 'NVIDIA', url: 'https://blogs.nvidia.com/feed/' },
    { source: 'Google AI Blog', organization: 'Google', url: 'https://research.google/blog/rss/' },
    { source: 'Meta Engineering', organization: 'Meta', url: 'https://engineering.fb.com/feed/' },
]

const trustedOrganizations = ['openai', 'nvidia', 'meta', 'google', 'anthropic', 'microsoft', 'hugging face']
const newsSignals = ['announces', 'announce', 'launch', 'launches', 'released', 'release', 'introduces', 'update', 'model', 'tool', 'api', 'agent', 'platform', 'product', 'developer', 'ai']
const toolSignals = ['chatgpt', 'gpt', 'sora', 'codex', 'openai', 'nvidia', 'nim', 'cuda', 'tensor', 'blackwell', 'llama', 'meta ai', 'gemini', 'vertex ai', 'notebooklm', 'claude', 'anthropic', 'hugging face', 'copilot']

function decodeXml(value = '') {
    return String(value)
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
}

function tagValue(item, tag) {
    const match = item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return decodeXml(match?.[1] || '')
}

function parseFeedItems(xml, feed) {
    const itemMatches = [...xml.matchAll(/<item[\s\S]*?<\/item>|<entry[\s\S]*?<\/entry>/gi)]
    return itemMatches.map((match) => {
        const item = match[0]
        const title = tagValue(item, 'title')
        const link = tagValue(item, 'link') || (item.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || '')
        const description = tagValue(item, 'description') || tagValue(item, 'summary') || tagValue(item, 'content:encoded')
        const publishedAt = tagValue(item, 'pubDate') || tagValue(item, 'updated') || tagValue(item, 'published')
        return { title, link, description, publishedAt, ...feed }
    }).filter((item) => item.title && item.link)
}

function feedList() {
    const custom = process.env.AI_NEWS_FEEDS
    if (!custom) return defaultFeeds
    return custom.split(',').map((entry) => {
        const [organization, url] = entry.split('|').map((part) => part.trim())
        return { source: `${organization} News`, organization, url }
    }).filter((feed) => feed.organization && feed.url)
}

export function classifyOfficialNewsItem(item) {
    const text = `${item.title} ${item.description} ${item.organization}`.toLowerCase()
    const trusted = trustedOrganizations.some((org) => String(item.organization || '').toLowerCase().includes(org))
    const signalCount = newsSignals.filter((signal) => text.includes(signal)).length
    const toolSpecific = toolSignals.some((signal) => text.includes(signal))
    const recencyMs = item.publishedAt ? Date.now() - new Date(item.publishedAt).getTime() : 0
    const recent = !item.publishedAt || Number.isNaN(recencyMs) || recencyMs < Number(process.env.AI_NEWS_RECENCY_HOURS || 168) * 60 * 60 * 1000
    return {
        trusted,
        recent,
        toolSpecific,
        signalCount,
        newsworthy: trusted && recent && signalCount >= 1,
    }
}

export async function fetchOfficialAiNews(limit = Number(process.env.AI_NEWS_SOURCE_LIMIT || 16)) {
    if (process.env.ENABLE_AI_NEWS_TRACKING === 'false') return []
    const settled = await Promise.all(feedList().map(async (feed) => {
        try {
            const response = await fetch(feed.url, {
                headers: { 'User-Agent': 'DEXBlogEngine/1.0' },
            })
            if (!response.ok) throw new Error(`${response.status}`)
            const xml = await response.text()
            return parseFeedItems(xml, feed)
        } catch (error) {
            warn('official_news_source_failed', { source: feed.source, message: error.message })
            return []
        }
    }))

    return settled.flat()
        .map((item) => {
            const classification = classifyOfficialNewsItem(item)
            return {
                topic: item.title,
                slug: slugify(item.title),
                keyword: item.title.toLowerCase(),
                category: classification.toolSpecific ? 'AI Tools' : 'AI Automation',
                source: item.source,
                officialSource: item.organization,
                officialUrl: item.link,
                officialImageRequired: classification.toolSpecific,
                contentType: classification.toolSpecific ? 'AI Tool Tutorial' : 'AI News / Trend Analysis',
                newsPublishedAt: item.publishedAt,
                newsDescription: item.description,
                trustedNewsSource: classification.trusted,
                toolSpecific: classification.toolSpecific,
                trendAnalysis: {
                    trendScore: classification.toolSpecific ? 92 : 86,
                    marketSentiment: 'positive',
                    marketSentimentScore: 78,
                    trendOverrideEligible: true,
                    trendOverrideReason: `Official ${item.organization} AI news item from ${item.source}.`,
                    realtimeSignals: [{ source: item.source, title: item.title }],
                    realtimeSources: [item.source],
                },
                status: classification.newsworthy ? 'discovered' : 'news_hold',
                createdAt: new Date().toISOString(),
            }
        })
        .filter((item) => item.status === 'discovered')
        .slice(0, limit)
}
