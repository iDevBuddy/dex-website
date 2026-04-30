import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { recommendMediaForArticle, mediaBrief } from './lib/media-intelligence.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'

export async function recommendMedia(options = getPipelineOptions()) {
    const article = await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const recommendations = recommendMediaForArticle(article)
    const brief = mediaBrief({ ...article, frontmatter: { ...article.frontmatter, mediaRecommendations: recommendations } })
    article.frontmatter.mediaRecommendations = recommendations
    article.frontmatter.assetBrief = brief
    await writePipelineJson('draft-article.json', article, options)
    await writePipelineJson('media-recommendations.json', { recommendations, brief }, options)
    log('media_recommendations_created', { slug: article.frontmatter.slug, recommendations })
    if (!options.dryRun) {
        await syncBlogDraft(article, { assetBrief: brief, mediaRecommendations: recommendations })
        if (recommendations.notebookLmResearch) {
            await notifySlack(`NotebookLM research recommended for: ${article.frontmatter.title}`)
        }
    }
    return { article, recommendations, brief }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    recommendMedia().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
