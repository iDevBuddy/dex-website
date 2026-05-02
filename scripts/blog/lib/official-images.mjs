import fs from 'node:fs/promises'

const toolSignals = /\b(chatgpt|gpt|sora|codex|openai|nvidia|nim|cuda|blackwell|llama|meta ai|gemini|vertex ai|notebooklm|claude|anthropic|hugging face|copilot|api|developer platform|product|tool)\b/i

function absolutize(value, baseUrl) {
    try {
        return new URL(value, baseUrl).toString()
    } catch {
        return ''
    }
}

function metaImage(html, pageUrl) {
    const patterns = [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
        /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    ]
    for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match?.[1]) return absolutize(match[1].replace(/&amp;/g, '&'), pageUrl)
    }
    return ''
}

function isHttpUrl(value = '') {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'https:' || parsed.protocol === 'http:'
    } catch {
        return false
    }
}

export function requiresOfficialToolImage(article = {}) {
    const frontmatter = article.frontmatter || article
    const text = [
        frontmatter.title,
        frontmatter.category,
        frontmatter.contentType,
        frontmatter.targetKeyword,
        frontmatter.officialSource,
        frontmatter.officialUrl,
        article.topic,
    ].filter(Boolean).join(' ')
    return Boolean(frontmatter.officialImageRequired || frontmatter.toolSpecific || toolSignals.test(text))
}

export async function fetchOfficialProductImage({ article, output }) {
    const frontmatter = article.frontmatter || article
    const sources = Array.isArray(frontmatter.sources) ? frontmatter.sources : []
    const pageUrls = [
        frontmatter.officialUrl,
        frontmatter.sourceUrl,
        ...sources.map((source) => source.url),
    ].filter(isHttpUrl)

    for (const pageUrl of pageUrls) {
        try {
            const pageResponse = await fetch(pageUrl, {
                headers: { 'User-Agent': 'DEXBlogEngine/1.0' },
            })
            if (!pageResponse.ok) continue
            const html = await pageResponse.text()
            const imageUrl = metaImage(html, pageUrl)
            if (!imageUrl) continue
            const imageResponse = await fetch(imageUrl, {
                headers: { 'User-Agent': 'DEXBlogEngine/1.0' },
            })
            if (!imageResponse.ok) continue
            const contentType = imageResponse.headers.get('content-type') || ''
            if (!contentType.startsWith('image/')) continue
            if (contentType.includes('svg')) continue
            await fs.writeFile(output, Buffer.from(await imageResponse.arrayBuffer()))
            return {
                provider: 'official_product_image',
                path: output,
                sourceUrl: imageUrl,
                officialPageUrl: pageUrl,
                contentType,
            }
        } catch {
            // Try the next official source.
        }
    }
    return null
}
