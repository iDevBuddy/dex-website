const postModules = import.meta.glob('../../content/blog/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
})

const siteUrl = import.meta.env.VITE_SITE_URL || 'https://dexbyakif.com'
const defaultAuthor = import.meta.env.VITE_AUTHOR_NAME || 'Akif Saeed'

function parseValue(value) {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1)
    }
    if (trimmed === 'true') return true
    if (trimmed === 'false') return false
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
            return JSON.parse(trimmed)
        } catch {
            return trimmed
        }
    }
    return trimmed
}

export function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) return { data: {}, body: raw }

    const data = {}
    match[1].split(/\r?\n/).forEach((line) => {
        const separator = line.indexOf(':')
        if (separator === -1) return
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1)
        data[key] = parseValue(value)
    })

    return { data, body: match[2].trim() }
}

function minutesToRead(body) {
    const words = body.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 220))
}

function extractHeadings(body) {
    return body
        .split(/\r?\n/)
        .filter((line) => /^#{2,3}\s+/.test(line))
        .map((line) => {
            const depth = line.startsWith('###') ? 3 : 2
            const text = line.replace(/^#{2,3}\s+/, '').trim()
            return { depth, text, id: slugify(text) }
        })
}

export function slugify(value) {
    return String(value)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export const blogPosts = Object.entries(postModules)
    .map(([path, raw]) => {
        const { data, body } = parseFrontmatter(raw)
        const fileSlug = path.split('/').pop().replace(/\.md$/, '')
        const slug = data.slug || fileSlug
        const url = `${siteUrl}/blog/${slug}`

        return {
            ...data,
            slug,
            url,
            author: data.author || defaultAuthor,
            body,
            readingTime: data.readingTime || `${minutesToRead(body)} min read`,
            headings: extractHeadings(body),
            image: data.image || '/blog/images/ai-authority-blog-engine.png',
            imageAlt: data.imageAlt || data.title,
            category: data.category || 'AI Automation',
            faqs: Array.isArray(data.faqs) ? data.faqs : [],
            sources: Array.isArray(data.sources) ? data.sources : [],
            related: Array.isArray(data.related) ? data.related : [],
            keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [],
            expertInsight: data.expertInsight || '',
            assetLinks: data.assetLinks && typeof data.assetLinks === 'object' ? data.assetLinks : {},
            mediaRecommendations: data.mediaRecommendations && typeof data.mediaRecommendations === 'object' ? data.mediaRecommendations : {},
            contentPersona: data.contentPersona || 'Hybrid',
            businessFunction: data.businessFunction || 'General',
            authorityAngle: data.authorityAngle || 'practical_workflow',
        }
    })
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

export function getPostBySlug(slug) {
    return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(post, limit = 3) {
    const explicit = post.related
        .map((slug) => getPostBySlug(slug))
        .filter(Boolean)

    const categoryMatches = blogPosts.filter(
        (candidate) => candidate.slug !== post.slug && candidate.category === post.category && !explicit.includes(candidate),
    )

    const others = blogPosts.filter(
        (candidate) => candidate.slug !== post.slug && candidate.category !== post.category && !explicit.includes(candidate),
    )

    return [...explicit, ...categoryMatches, ...others].slice(0, limit)
}

export function formatDate(value) {
    if (!value) return ''
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export function buildBlogPostingSchema(post) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        image: post.image?.startsWith('http') ? post.image : `${siteUrl}${post.image}`,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: {
            '@type': 'Person',
            name: post.author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'DEX by Akif Saeed',
        },
        mainEntityOfPage: post.url,
    }
}

export function buildFaqSchema(post) {
    if (!post.faqs?.length) return null
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: post.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}
