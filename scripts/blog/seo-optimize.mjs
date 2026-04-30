import { slugify } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { createReviewLlmProvider } from './lib/llm-providers.mjs'

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
    if (!Array.isArray(frontmatter.keyTakeaways) || frontmatter.keyTakeaways.length < 3) {
        frontmatter.keyTakeaways = [
            'Start with one measurable business workflow before scaling AI automation.',
            'Use human approval for customer-facing or high-risk actions.',
            'Judge success by response time, quality, and revenue impact, not content volume.',
        ]
    }
    if (!frontmatter.expertInsight) {
        frontmatter.expertInsight = 'The strongest AI automation systems combine narrow workflow design, clear ownership, model-assisted drafting, and human review before irreversible actions.'
    }
    frontmatter.contentPersona ||= process.env.DEFAULT_CONTENT_PERSONA || 'Hybrid'
    frontmatter.businessFunction ||= 'General'
    frontmatter.authorityAngle ||= process.env.DEFAULT_AUTHORITY_ANGLE || 'practical_workflow'
    return { ...article, frontmatter }
}

export async function seoOptimize(articleArg, options = getPipelineOptions()) {
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    let optimized = seoOptimizeArticle(article)
    if (!options.dryRun) {
        try {
            const provider = createReviewLlmProvider()
            const health = await provider.healthCheck()
            if (health.configured) {
                const suggestions = await provider.generateJson(`Return JSON with improved metaTitle, metaDescription, directAnswer for this article. No extra text.\n${JSON.stringify(optimized.frontmatter)}`)
                optimized = { ...optimized, frontmatter: { ...optimized.frontmatter, ...suggestions } }
            }
        } catch (error) {
            log('seo_model_fallback', { message: error.message })
        }
    }
    await writePipelineJson('draft-article.json', optimized, options)
    log('seo_optimized', { slug: optimized.frontmatter.slug, ...modeDetails(options) })
    return optimized
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seoOptimize(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
