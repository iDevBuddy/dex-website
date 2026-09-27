import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TOPICS, qualityIssues } from './lib/editorial.mjs'
import { analyze } from './analyst.mjs'
import { writeArticle } from './writer.mjs'
import { critique } from './critic.mjs'
import { factCheck } from './factcheck.mjs'
import { generateCover } from './artdirector.mjs'
import { buildMarkdown, slugify } from './lib/article.mjs'
import { isDuplicate } from './lib/registry.mjs'
import { NVIDIA_BIG } from './lib/ai.mjs'

export async function generateDraft(known) {
    const model = process.env.BLOG_DRAFT_MODEL || NVIDIA_BIG
    const pick = TOPICS.find(x => !known.some(p => p.topicId === x.topicId) && !isDuplicate(x.title, known))
    if (!pick) throw new Error('Editorial topic queue exhausted; add a new primary-source brief before the next draft')
    console.log('draft stage: research')
    const research = await analyze(pick, { reasoningEffort: 'low', fallbackModel: model })
    if (!research.ok) throw new Error(`Research failed: ${research.error}`)
    research.internalLinks = [{ url: '/capabilities', title: 'DEX automation implementation services' }, ...known.filter(p => p.slug && !p.redirectTo).map(p => ({ url: `/blog/${p.slug}`, title: p.title }))]
    console.log('draft stage: writing')
    const written = await writeArticle(research, { model })
    if (!written.ok) throw new Error(`Writing failed: ${written.error}`)
    console.log('draft stage: editorial review')
    const edited = await critique(written.article, research, { model })
    const article = edited.article
    const issues = qualityIssues(article, research, known)
    if (!edited.improved) issues.push('Editorial review did not complete')
    if (!article?.title || isDuplicate(article.title, known)) throw new Error('Draft title is missing or duplicate')
    if (String(article.body || '').split(/\s+/).length < 300 || !/^##\s/m.test(article.body)) throw new Error('Draft is too thin or lacks headings')
    if (String(article.description || '').length < 20) throw new Error('Draft description is missing')
    // A line break must not escape a quoted frontmatter scalar.
    for (const key of ['title', 'description', 'directAnswer', 'businessProblem', 'category']) article[key] = String(article[key] || '').replace(/[\r\n]+/g, ' ')
    console.log('draft stage: fact check')
    const checked = await factCheck(article, research)
    const flagged = [...(Array.isArray(checked.flagged) ? checked.flagged : []), ...issues.map(why => ({ claim: 'Editorial quality', why }))]
    const slug = slugify(article.title)
    const dir = mkdtempSync(join(tmpdir(), 'dex-cover-'))
    try {
        console.log('draft stage: cover')
        const cover = await generateCover(article, { slug, outDir: dir, timeoutMs: 45000 })
        const { markdown } = buildMarkdown(article, research, { image: cover.image, imageAlt: article.imageAlt })
        const files = [{ path: `content/blog/${slug}.md`, content: markdown }]
        if (cover.ok) files.push({ path: `public/blog/images/${slug}.png`, encoding: 'base64', content: readFileSync(join(dir, `${slug}.png`)).toString('base64') })
        return { title: article.title, files, report: { topicId: pick.topicId, model: written.model, description: article.description, grounded: research.brief.verified,
            verdict: checked.verdict === 'pass' && !flagged.length && cover.ok ? 'pass' : 'needs_review', flagged: [...flagged, ...(!cover.ok ? [{ claim: 'Cover', why: 'Image generation failed; supply a suitable cover before approval' }] : [])], cover: cover.ok ? `generated (${cover.model}, 1280 x 720 PNG)` : 'existing fallback image' } }
    } finally { rmSync(dir, { recursive: true, force: true }) }
}
