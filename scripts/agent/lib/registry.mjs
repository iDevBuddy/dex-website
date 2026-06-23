/** Reads published posts from content/blog for dedup + stream rotation. */
import { readdirSync, readFileSync } from 'fs'
import { slugify } from './article.mjs'

const DIR = 'content/blog'

export function publishedPosts() {
    try {
        return readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => {
            const t = readFileSync(`${DIR}/${f}`, 'utf8')
            return {
                slug: f.replace(/\.md$/, ''),
                title: (t.match(/^title:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
                stream: (t.match(/^stream:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
                date: (t.match(/^publishedAt:\s*"?(.+?)"?\s*$/m) || [])[1] || '',
            }
        })
    } catch { return [] }
}

// alias kept for call sites that read the same array
export const publishedTitles = publishedPosts

const sig = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 3)

export function isDuplicate(title, posts) {
    const a = new Set(sig(title))
    if (!a.size) return false
    for (const p of posts) {
        if (slugify(title) === p.slug) return true
        const b = sig(p.title)
        if (!b.length) continue
        if (b.filter((w) => a.has(w)).length / Math.max(a.size, b.length) > 0.6) return true
    }
    return false
}

export function recentStreams(n = 2) {
    return publishedPosts().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n).map((p) => p.stream)
}
