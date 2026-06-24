/**
 * Free, keyless content sources — RSS/Atom + Reddit public JSON.
 * Every fetch is isolated: a dead or slow feed returns [] and is skipped,
 * never breaking the run.
 */
const UA = 'Mozilla/5.0 (compatible; DEX-ContentAgent/1.0; +https://www.dexakif.com)'

async function getText(url, timeoutMs = 15000) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' }, signal: AbortSignal.timeout(timeoutMs) })
        if (!res.ok) return null
        return await res.text()
    } catch { return null }
}

async function getJson(url, timeoutMs = 15000) {
    try {
        const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(timeoutMs) })
        if (!res.ok) return null
        return await res.json()
    } catch { return null }
}

const stripTags = (s = '') => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
const pick = (block, tags) => { for (const t of tags) { const m = block.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, 'i')); if (m) return stripTags(m[1]) } return '' }
const pickLink = (block) => {
    const href = block.match(/<link[^>]*href=["']([^"']+)["']/i)
    if (href) return href[1]
    return pick(block, ['link'])
}

/** Minimal, defensive RSS/Atom parser. Returns up to `limit` recent items. */
export function parseFeed(xml, { source = '', limit = 12 } = {}) {
    if (!xml || typeof xml !== 'string') return []
    const items = []
    const blocks = xml.split(/<item[\s>]|<entry[\s>]/i).slice(1)
    for (const raw of blocks) {
        const block = raw.replace(/<\/(item|entry)>[\s\S]*$/i, '')
        const title = pick(block, ['title'])
        if (!title) continue
        items.push({
            source,
            title,
            url: pickLink(block),
            summary: pick(block, ['description', 'summary', 'content']).slice(0, 400),
            date: pick(block, ['pubDate', 'published', 'updated', 'dc:date']),
        })
        if (items.length >= limit) break
    }
    return items
}

export async function fetchRss(url, { source, limit } = {}) {
    const xml = await getText(url)
    return parseFeed(xml, { source: source || url, limit })
}

/** Reddit pain-points — public JSON, no auth. */
export async function fetchReddit(subreddit, { t = 'week', limit = 10 } = {}) {
    const data = await getJson(`https://www.reddit.com/r/${subreddit}/top.json?t=${t}&limit=${limit}`)
    const children = data?.data?.children
    if (!Array.isArray(children)) return []
    return children.map((c) => c?.data).filter(Boolean).filter((p) => !p.stickied).map((p) => ({
        source: `reddit/r/${subreddit}`,
        title: stripTags(p.title || ''),
        url: `https://www.reddit.com${p.permalink || ''}`,
        summary: stripTags((p.selftext || '').slice(0, 400)),
        score: p.score || 0,
        comments: p.num_comments || 0,
    })).filter((p) => p.title)
}

/** Default source set per content stream. */
export const SOURCES = {
    aiTools: [
        { url: 'https://www.producthunt.com/feed?category=artificial-intelligence', source: 'ProductHunt AI' },
        { url: 'https://hnrss.org/newest?q=AI+tool&points=50', source: 'Hacker News' },
        { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat' },
    ],
    claude: [
        { url: 'https://www.anthropic.com/rss.xml', source: 'Anthropic' },
        { url: 'https://hnrss.org/newest?q=Claude+OR+MCP&points=30', source: 'Hacker News' },
    ],
    reddit: ['smallbusiness', 'Entrepreneur', 'agency', 'ArtificialInteligence'],
}
