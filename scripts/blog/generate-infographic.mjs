import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { mediaBrief, recommendMediaForArticle } from './lib/media-intelligence.mjs'
import { log } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'

export async function generateInfographic(options = getPipelineOptions()) {
    const article = await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const brief = mediaBrief({ ...article, frontmatter: { ...article.frontmatter, mediaRecommendations: recommendMediaForArticle(article) } })
    const result = {
        slug: article.frontmatter.slug,
        provider: process.env.INFOGRAPHIC_PROVIDER || 'image_model',
        status: process.env.COMFYUI_URL || process.env.USE_GPT_IMAGE === 'true' ? 'Ready for Image Provider' : 'Task Created',
        brief: `${brief}\nInfographic prompt: show the core workflow, 3-5 steps, one business outcome, and one warning box. No tiny unreadable text.`,
    }
    await writePipelineJson('infographic-task.json', result, options)
    log('infographic_task_created', result)
    if (!options.dryRun) {
        await syncBlogDraft(article, { infographicStatus: result.status, assetBrief: result.brief })
        await notifySlack(`Infographic task created for ${article.frontmatter.title}.`)
    }
    return result
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateInfographic().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
