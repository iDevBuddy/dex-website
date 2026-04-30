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
    const topic = scored.find((item) => item.topic === options.topic || item.slug === options.slug) || scored.find((item) => item.status === 'scored_ready')
    if (!topic) {
        const best = scored[0]
        throw new Error(`No topic reached MIN_TOPIC_SCORE=${options.minTopicScore}. Best topic was "${best?.topic || 'none'}" with score ${best?.score || 0}. Use --force-draft for a manual draft.`)
    }
    if (topic.status !== 'scored_ready' && !options.forceDraft) {
        throw new Error(`Selected topic scored ${topic.score}/100, below MIN_TOPIC_SCORE=${options.minTopicScore}. Use --force-draft only for manual editorial testing.`)
    }
    const brief = await researchTopic(topic, options)
    const draft = await generateArticle(topic, brief, options)
    const article = await seoOptimize(draft, options)
    const report = await qualityCheck(article, options)
    if (!report.passed && !options.force) {
        log('publish_failed', { reason: 'quality_check_failed', score: report.score })
        process.exitCode = 2
        return report
    }
    await generateImage(article, options)
    await generateAudio(article, options)
    return publishPost({ ...options, article, quality: report })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runPipeline(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
