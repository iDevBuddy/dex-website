import { readPosts, slugify } from './content.mjs'

const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'best', 'blog', 'business', 'by', 'for', 'from', 'guide',
    'how', 'in', 'into', 'is', 'it', 'of', 'on', 'or', 'small', 'the', 'this', 'to', 'use', 'using', 'with',
])

function tokens(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2 && !stopWords.has(word))
}

function shingles(words = [], size = 2) {
    if (words.length <= size) return new Set(words)
    const result = new Set()
    for (let i = 0; i <= words.length - size; i += 1) {
        result.add(words.slice(i, i + size).join(' '))
    }
    return result
}

function jaccard(a = new Set(), b = new Set()) {
    if (!a.size || !b.size) return 0
    let intersection = 0
    for (const item of a) {
        if (b.has(item)) intersection += 1
    }
    return intersection / (a.size + b.size - intersection)
}

function keywordOverlap(a = [], b = []) {
    const left = new Set(a)
    const right = new Set(b)
    if (!left.size || !right.size) return 0
    let hits = 0
    for (const item of left) {
        if (right.has(item)) hits += 1
    }
    return hits / Math.min(left.size, right.size)
}

function angleFor(topic = {}, match = {}) {
    const text = `${topic.topic || ''} ${topic.category || ''} ${topic.businessFunction || ''}`.toLowerCase()
    if (/customer support|support|service/.test(text)) return 'customer support automation with approval routing, escalation, and response-quality KPIs'
    if (/finance/.test(text)) return 'finance operations automation with approval controls, audit logs, and risk checks'
    if (/sales|lead|crm/.test(text)) return 'sales and CRM automation with lead scoring, follow-up governance, and attribution'
    if (/security/.test(text)) return 'security automation with incident triage, human approval, and compliance evidence'
    if (/ecommerce|shopify/.test(text)) return 'ecommerce automation with order support, refunds, and customer retention workflows'
    if (/agent|ai agent/.test(text)) return 'implementation architecture for AI agents instead of a general beginner overview'
    const title = match.title ? `The existing post is "${match.title}". ` : ''
    return `${title}Use a narrower, business-function-specific workflow angle with concrete tools, approval gates, and measurable outcomes.`
}

function classify(score) {
    if (score >= Number(process.env.DUPLICATE_TOPIC_THRESHOLD || 0.74)) return 'duplicate'
    if (score >= Number(process.env.SIMILAR_TOPIC_THRESHOLD || 0.52)) return 'similar'
    return 'unique'
}

export async function loadPublishedTopicIndex() {
    const posts = await readPosts()
    return posts.map((post) => {
        const title = post.data?.title || post.slug || post.file
        const keyword = post.data?.targetKeyword || post.data?.keyword || ''
        const category = post.data?.category || ''
        const summary = post.data?.description || post.data?.subtitle || ''
        const text = `${title} ${keyword} ${category} ${summary} ${post.body?.slice(0, 700) || ''}`
        const words = tokens(text)
        return {
            slug: post.slug,
            file: post.file,
            title,
            keyword,
            category,
            url: `/blog/${post.slug}`,
            tokens: words,
            tokenSet: new Set(words),
            shingles: shingles(words, 2),
        }
    })
}

export function compareTopicToPublished(topic = {}, published = []) {
    const topicText = `${topic.topic || ''} ${topic.keyword || ''} ${topic.category || ''} ${topic.contentPersona || ''} ${topic.businessFunction || ''}`
    const topicTokens = tokens(topicText)
    const topicSet = new Set(topicTokens)
    const topicShingles = shingles(topicTokens, 2)
    const matches = published.map((post) => {
        const tokenScore = jaccard(topicSet, post.tokenSet)
        const shingleScore = jaccard(topicShingles, post.shingles)
        const keywordScore = keywordOverlap(topicTokens, post.tokens)
        const slugScore = slugify(topic.topic || '') === post.slug ? 1 : 0
        const similarity = Math.max(slugScore, (tokenScore * 0.35) + (shingleScore * 0.35) + (keywordScore * 0.30))
        return {
            slug: post.slug,
            title: post.title,
            url: post.url,
            similarity: Math.round(similarity * 100) / 100,
        }
    }).sort((a, b) => b.similarity - a.similarity)

    const bestMatch = matches[0] || null
    const duplicateStatus = classify(bestMatch?.similarity || 0)
    return {
        duplicateStatus,
        duplicateScore: bestMatch ? Math.round(bestMatch.similarity * 100) : 0,
        bestMatch,
        matches: matches.filter((match) => match.similarity >= 0.35).slice(0, 5),
        suggestedAngle: duplicateStatus === 'unique' ? '' : angleFor(topic, bestMatch),
        suggestedTopic: duplicateStatus === 'unique'
            ? ''
            : `${topic.topic}: ${angleFor(topic, bestMatch)}`,
    }
}

export async function analyzeTopicDuplication(topic = {}) {
    const published = await loadPublishedTopicIndex()
    return compareTopicToPublished(topic, published)
}
