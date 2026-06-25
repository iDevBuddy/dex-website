/**
 * Scout — gathers candidate stories from free feeds + Reddit, then uses the
 * free Gemma model to shortlist the most blog-worthy ideas across the four
 * DEX streams. Fully fail-soft: any dead source is skipped, and if the LLM
 * shortlist fails we fall back to a deterministic heuristic ranking.
 */
import { fetchRss, fetchReddit, SOURCES } from './lib/feeds.mjs'
import { chat, NVIDIA_SMALL, GEMMA } from './lib/ai.mjs'

export async function gatherCandidates({ perFeed = 8, redditLimit = 8 } = {}) {
    const jobs = []
    for (const s of SOURCES.aiTools) jobs.push(fetchRss(s.url, { source: s.source, limit: perFeed }).then((x) => x.map((i) => ({ ...i, stream: 'ai-tools' }))))
    for (const s of SOURCES.claude) jobs.push(fetchRss(s.url, { source: s.source, limit: perFeed }).then((x) => x.map((i) => ({ ...i, stream: 'claude-mcp' }))))
    for (const sub of SOURCES.reddit) jobs.push(fetchReddit(sub, { limit: redditLimit }).then((x) => x.map((i) => ({ ...i, stream: 'reddit-pain' }))))

    const settled = await Promise.allSettled(jobs)
    const items = []
    const seen = new Set()
    for (const r of settled) {
        if (r.status !== 'fulfilled' || !Array.isArray(r.value)) continue
        for (const it of r.value) {
            const key = (it.title || '').toLowerCase().slice(0, 80)
            if (!key || seen.has(key)) continue
            seen.add(key)
            items.push(it)
        }
    }
    return items
}

function heuristicShortlist(items, n) {
    return [...items]
        .sort((a, b) => (b.score || 0) + (b.comments || 0) - ((a.score || 0) + (a.comments || 0)))
        .slice(0, n)
        .map((it) => ({ title: it.title, url: it.url, stream: it.stream, source: it.source, angle: '', why: 'heuristic' }))
}

export async function scout({ shortlist = 6 } = {}) {
    const items = await gatherCandidates()
    if (!items.length) return { ok: false, error: 'no candidates fetched from any source', items: [], ideas: [] }

    const compact = items.slice(0, 60).map((it, i) => `${i}. [${it.stream}] ${it.title}${it.score ? ` (score ${it.score}/${it.comments}c)` : ''}`).join('\n')
    const res = await chat({
        provider: 'gemma',
        model: GEMMA,
        fallback: { provider: 'nvidia', model: NVIDIA_SMALL },
        json: true,
        temperature: 0.3,
        maxTokens: 900,
        system: 'You are an editorial scout for a premium AI-automation agency blog. Pick the most valuable, non-generic, business-relevant stories.',
        user: `From this list, choose the ${shortlist} best blog ideas for business owners. Prefer concrete new AI tools, real Claude/MCP capabilities, and genuine business pain-points. Avoid hype/duplicate/thin items.\n\n${compact}\n\nReturn ONLY JSON: {"ideas":[{"index":<number>,"stream":"ai-tools|claude-mcp|reddit-pain","angle":"<one-line editorial angle>","why":"<why it matters to business owners>"}]}`,
    })

    let ideas
    if (res.ok && Array.isArray(res.json?.ideas)) {
        ideas = res.json.ideas.map((d) => {
            const it = items[d.index]
            if (!it) return null
            return { title: it.title, url: it.url, stream: d.stream || it.stream, source: it.source, angle: d.angle || '', why: d.why || '' }
        }).filter(Boolean)
    }
    if (!ideas || !ideas.length) ideas = heuristicShortlist(items, shortlist)

    return { ok: true, totalFetched: items.length, ideas, selector: res.ok ? (res.model || 'gemma') : 'heuristic' }
}
