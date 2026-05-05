import { warn } from './logger.mjs'

export function webSearchEnabled() {
    return Boolean(process.env.TAVILY_API_KEY)
}

export async function searchWeb(query, { maxResults = 5, searchDepth = 'advanced' } = {}) {
    if (!process.env.TAVILY_API_KEY) return null
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query,
                search_depth: searchDepth,
                include_answer: true,
                include_raw_content: false,
                max_results: maxResults,
            }),
            signal: AbortSignal.timeout(15000),
        })
        if (!response.ok) throw new Error(`Tavily search failed: ${response.status}`)
        const data = await response.json()
        return {
            answer: data.answer || '',
            results: (data.results || []).map((r) => ({
                title: r.title || '',
                url: r.url || '',
                content: r.content || '',
                score: r.score || 0,
                publishedDate: r.published_date || '',
            })),
        }
    } catch (error) {
        warn('web_search_failed', { query: query.slice(0, 60), message: error.message })
        return null
    }
}

export function webResultsToSources(results, minScore = 0.5) {
    return (results || [])
        .filter((r) => r.score >= minScore && r.url && r.title)
        .map((r) => ({
            title: r.title,
            organization: new URL(r.url).hostname.replace('www.', ''),
            url: r.url,
            type: 'Web research',
            supports: r.content.slice(0, 200),
            authorityScore: Math.min(95, Math.round(r.score * 100)),
            publishedDate: r.publishedDate,
        }))
}
