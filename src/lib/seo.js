const defaultTitle = 'DEX by Akif Saeed - AI Agent Services for Smarter Business Automation'
const defaultDescription = 'End-to-end AI agent development services. We build intelligent voice agents, chatbots, and workflow automation that run your business 24/7.'
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://dexbyakif.com'

function upsertMeta(selector, createTag, attributes) {
    let tag = document.head.querySelector(selector)
    if (!tag) {
        tag = document.createElement(createTag)
        document.head.appendChild(tag)
    }
    Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value))
}

export function setSeo({
    title = defaultTitle,
    description = defaultDescription,
    path = '/',
    image = '/blog/images/ai-authority-blog-engine.png',
    type = 'website',
    schema = [],
} = {}) {
    const canonical = `${siteUrl}${path}`
    const absoluteImage = image?.startsWith('http') ? image : `${siteUrl}${image}`

    document.title = title
    upsertMeta('meta[name="description"]', 'meta', { name: 'description', content: description })
    upsertMeta('link[rel="canonical"]', 'link', { rel: 'canonical', href: canonical })
    upsertMeta('meta[property="og:title"]', 'meta', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', 'meta', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', 'meta', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:url"]', 'meta', { property: 'og:url', content: canonical })
    upsertMeta('meta[property="og:image"]', 'meta', { property: 'og:image', content: absoluteImage })
    upsertMeta('meta[name="twitter:card"]', 'meta', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', 'meta', { name: 'twitter:image', content: absoluteImage })

    document.querySelectorAll('script[data-blog-schema="true"]').forEach((tag) => tag.remove())
    schema.filter(Boolean).forEach((item) => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.dataset.blogSchema = 'true'
        script.textContent = JSON.stringify(item)
        document.head.appendChild(script)
    })
}
