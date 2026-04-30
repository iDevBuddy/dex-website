import { discoverTopics } from './discover-topics.mjs'
import { scoreTopics } from './score-topics.mjs'
import { researchTopic } from './research-topic.mjs'
import { generateArticle } from './generate-article.mjs'
import { seoOptimize } from './seo-optimize.mjs'
import { generateImage } from './generate-image.mjs'
import { generateAudio } from './generate-audio.mjs'
import { qualityCheck } from './quality-check.mjs'
import { publishPost } from './publish-post.mjs'
import { getPipelineOptions, modeDetails } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'

export async function runPipeline(options = getPipelineOptions()) {
    log('pipeline_start', modeDetails(options))
    const topics = await discoverTopics(options)
    const scored = await scoreTopics(topics, options)
    const topic = scored.find((item) => item.topic === options.topic || item.slug === options.slug) || scored.find((item) => item.status === 'scored_ready') || scored[0]
    const brief = await researchTopic(topic, options)
    const draft = await generateArticle(topic, brief, options)
    const article = await seoOptimize(draft, options)
    await generateImage(article, options)
    await generateAudio(article, options)
    const report = await qualityCheck(article, options)
    if (!report.passed && !options.force) {
        log('publish_failed', { reason: 'quality_check_failed', score: report.score })
        process.exitCode = 2
        return report
    }
    return publishPost({ ...options, article, quality: report })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runPipeline(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
