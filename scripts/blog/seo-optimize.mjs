import path from 'node:path'
import { dataDir, readJson, slugify, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

export function seoOptimizeArticle(article) {
    const frontmatter = { ...article.frontmatter }
    frontmatter.slug = slugify(frontmatter.slug || frontmatter.title)
    frontmatter.metaTitle = String(frontmatter.metaTitle || frontmatter.title).slice(0, 62)
    frontmatter.metaDescription = String(frontmatter.metaDescription || frontmatter.description).slice(0, 155)
    frontmatter.description = String(frontmatter.description || frontmatter.metaDescription).slice(0, 180)
    if (!frontmatter.directAnswer) {
        frontmatter.directAnswer = `${frontmatter.title} is useful when it solves a clear business workflow and includes quality controls.`
    }
    if (!Array.isArray(frontmatter.faqs) || frontmatter.faqs.length < 2) {
        frontmatter.faqs = [
            ...(frontmatter.faqs || []),
            { question: 'What should I automate first?', answer: 'Start with a repetitive workflow that has clear inputs, clear owners, and measurable outcomes.' },
            { question: 'How do I avoid low-quality AI content?', answer: 'Use research briefs, examples, sources, quality checks, and human approval before publishing.' },
        ].slice(0, 4)
    }
    return { ...article, frontmatter }
}

export async function seoOptimize() {
    const file = path.join(dataDir, 'draft-article.json')
    const article = await readJson(file, null)
    if (!article) throw new Error('No draft article found.')
    const optimized = seoOptimizeArticle(article)
    await writeJson(file, optimized)
    log('seo_optimized', { slug: optimized.frontmatter.slug })
    return optimized
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seoOptimize().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
