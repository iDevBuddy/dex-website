import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { scout } from './scout.mjs'
import { analyze } from './analyst.mjs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { generateCover } from './artdirector.mjs'
import { buildMarkdown, slugify } from './lib/article.mjs'
import { isDuplicate } from './lib/registry.mjs'

export async function generateDraft(known) {
    const candidates = await scout({ shortlist: 6 })
    if (!candidates.ok) throw new Error('No source candidates available')
    const pick = candidates.ideas.find(x => x.url && !isDuplicate(x.title, known))
    if (!pick) throw new Error('No new sourced topic available')
    console.log('draft stage: research')
    const research = await analyze(pick)
    if (!research.ok) throw new Error(`Research failed: ${research.error}`)
    console.log('draft stage: writing')
    const written = await writeArticle(research)
    if (!written.ok) throw new Error(`Writing failed: ${written.error}`)
    console.log('draft stage: editorial review')
    const edited = await critique(written.article, research)
    const article = edited.article
    if (!article?.title || isDuplicate(article.title, known)) throw new Error('Draft title is missing or duplicate')
    if (String(article.body || '').split(/\s+/).length < 300 || !/^##\s/m.test(article.body)) throw new Error('Draft is too thin or lacks headings')
    if (String(article.description || '').length < 20) throw new Error('Draft description is missing')
    // A line break must not escape a quoted frontmatter scalar.
    for (const key of ['title', 'description', 'directAnswer', 'businessProblem', 'category']) article[key] = String(article[key] || '').replace(/[\r\n]+/g, ' ')
    console.log('draft stage: fact check')
    const checked = await factCheck(article, research)
    const slug = slugify(article.title)
    const dir = mkdtempSync(join(tmpdir(), 'dex-cover-'))
    try {
        console.log('draft stage: cover')
        const cover = await generateCover(article, { slug, outDir: dir, timeoutMs: 45000 })
        const { markdown } = buildMarkdown(article, research, { image: cover.image })
        const files = [{ path: `content/blog/${slug}.md`, content: markdown }]
        if (cover.ok) files.push({ path: `public/blog/images/${slug}.png`, encoding: 'base64', content: readFileSync(join(dir, `${slug}.png`)).toString('base64') })
        return { title: article.title, files, report: { description: article.description, grounded: research.brief.verified,
            verdict: checked.verdict || 'needs_review', flagged: checked.flagged || [], cover: cover.ok ? 'generated' : 'existing fallback image' } }
    } finally { rmSync(dir, { recursive: true, force: true }) }
}
