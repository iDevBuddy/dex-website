/**
 * Publisher — writes the finished article to content/blog/<slug>.md with the
 * generated cover (and audio) wired into the frontmatter. Returns the path.
 * Guarded: any failure is reported, never thrown.
 */
import { writeFileSync } from 'fs'
import { buildMarkdown } from './lib/article.mjs'

export function publish(article, data, { image, audio = '', dir = 'content/blog' } = {}) {
    try {
        const { slug, markdown } = buildMarkdown(article, data, { image: image || undefined, audio })
        const file = `${dir}/${slug}.md`
        writeFileSync(file, markdown)
        return { ok: true, file, slug }
    } catch (e) {
        return { ok: false, error: e?.message || String(e) }
    }
}
