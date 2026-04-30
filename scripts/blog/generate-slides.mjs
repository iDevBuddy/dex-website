import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { mediaBrief, recommendMediaForArticle } from './lib/media-intelligence.mjs'
import { log } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'

export async function generateSlides(options = getPipelineOptions()) {
    const article = await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const brief = mediaBrief({ ...article, frontmatter: { ...article.frontmatter, mediaRecommendations: recommendMediaForArticle(article) } })
    const result = {
        slug: article.frontmatter.slug,
        provider: process.env.SLIDES_PROVIDER || 'manual',
        status: 'Task Created',
        brief,
        note: process.env.USE_GAMMA === 'true' && process.env.GAMMA_API_KEY
            ? 'Gamma provider hook is configured for future implementation.'
            : 'Gamma is not configured. Manual slide task created.',
    }
    await writePipelineJson('slides-task.json', result, options)
    log('slides_task_created', result)
    if (!options.dryRun) {
        await syncBlogDraft(article, { slidesStatus: result.status, assetBrief: brief })
        await notifySlack(`Slides task created for ${article.frontmatter.title}.`)
    }
    return result
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateSlides().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
