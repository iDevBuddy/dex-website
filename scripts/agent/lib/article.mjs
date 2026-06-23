/** Assemble the final article object into blog-ready markdown + frontmatter. */

export function slugify(value) {
    return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}

function hostname(url) {
    try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'source' }
}

const esc = (s) => String(s || '').replace(/"/g, '\\"')

export function buildMarkdown(article, data, { image = '/blog/images/ai-authority-blog-engine.png', audio = '' } = {}) {
    const slug = slugify(article.title)
    const today = new Date().toISOString().slice(0, 10)
    const sources = (data?.brief?.sources || []).map((u) => ({ title: hostname(u), url: u }))

    const fm = [
        '---',
        `title: "${esc(article.title)}"`,
        `slug: "${slug}"`,
        `description: "${esc(article.description)}"`,
        `publishedAt: "${today}"`,
        `category: "${esc(article.category || 'AI Automation')}"`,
        `stream: "${esc(data?.idea?.stream || '')}"`,
        `author: "Akif Saeed"`,
        `image: "${image}"`,
        `imageAlt: "${esc(article.title)}"`,
        audio ? `audio: "${audio}"` : '',
        `directAnswer: "${esc(article.directAnswer)}"`,
        `keyTakeaways: ${JSON.stringify(article.keyTakeaways || [])}`,
        `faqs: ${JSON.stringify(article.faqs || [])}`,
        `sources: ${JSON.stringify(sources)}`,
        `tags: ${JSON.stringify(article.tags || [])}`,
        article.businessProblem ? `businessProblem: "${esc(article.businessProblem)}"` : '',
        '---',
    ].filter(Boolean).join('\n')

    return { slug, markdown: `${fm}\n\n${(article.body || '').trim()}\n` }
}

export function wordCount(article) {
    return String(article?.body || '').split(/\s+/).filter(Boolean).length
}
