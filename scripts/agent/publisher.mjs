/**
 * Publisher — validates, then writes the finished article to
 * content/blog/<slug>.md with the generated cover (and audio) in frontmatter.
 * Validation gate: if the assembled markdown would not parse or is too thin,
 * it refuses to write (so a malformed post can never reach the build / go red).
 */
import { writeFileSync } from 'fs'
import { buildMarkdown } from './lib/article.mjs'

// Mirrors src/lib/blog.js parseFrontmatter expectations.
function validate(markdown, article) {
    if (!/^---\r?\n[\s\S]*?\r?\n---\r?\n/.test(markdown)) return 'frontmatter block missing/broken'
    if (!article?.title || article.title.length < 8) return 'title missing/too short'
    if (!article?.description || article.description.length < 20) return 'description missing/too short'
    const words = String(article.body || '').split(/\s+/).filter(Boolean).length
    if (words < 300) return `body too thin (${words} words)`
    if (!/^##\s/m.test(article.body || '')) return 'no H2 sections in body'
    return null
}

export function publish(article, data, { image, audio = '', dir = 'content/blog' } = {}) {
    try {
        const { slug, markdown } = buildMarkdown(article, data, { image: image || undefined, audio })
        const problem = validate(markdown, article)
        if (problem) return { ok: false, error: `validation failed: ${problem}` }
        const file = `${dir}/${slug}.md`
        writeFileSync(file, markdown)
        return { ok: true, file, slug }
    } catch (e) {
        return { ok: false, error: e?.message || String(e) }
    }
}
