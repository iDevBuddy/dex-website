import { discoverTopics } from './discover-topics.mjs'
import { scoreTopics } from './score-topics.mjs'
import { researchTopic } from './research-topic.mjs'
import { generateArticle } from './generate-article.mjs'
import { seoOptimize } from './seo-optimize.mjs'
import { generateImage } from './generate-image.mjs'
import { generateAudio } from './generate-audio.mjs'
import { qualityCheck } from './quality-check.mjs'
import { recommendMedia } from './recommend-media.mjs'
import { publishPost } from './publish-post.mjs'
import { getPipelineOptions, modeDetails } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { config } from './lib/config.mjs'
import { notifySlack } from './lib/slack.mjs'

export async function runPipeline(options = getPipelineOptions()) {
    log('pipeline_start', modeDetails(options))
    const topics = await discoverTopics(options)
    const scored = await scoreTopics(topics, options)
    const requested = scored.find((item) => item.topic === options.topic || item.slug === options.slug)
    const candidates = requested
        ? [requested, ...scored.filter((item) => item.slug !== requested.slug && item.status === 'scored_ready')]
        : scored.filter((item) => item.status === 'scored_ready')
    if (!candidates.length) {
        const best = scored[0]
        throw new Error(`No topic reached MIN_TOPIC_SCORE=${options.minTopicScore}. Best topic was "${best?.topic || 'none'}" with score ${best?.score || 0}. Use --force-draft for a manual draft.`)
    }

    const maxAttempts = config.qualityFailureRetryEnabled ? Math.max(1, config.qualityFailureMaxRetries + 1) : 1
    let lastReport
    for (const topic of candidates.slice(0, maxAttempts)) {
        if (topic.status !== 'scored_ready' && !options.forceDraft) {
            lastReport = { passed: false, reason: `Selected topic scored ${topic.score}/100, below MIN_TOPIC_SCORE=${options.minTopicScore}.` }
            continue
        }
        const result = await draftTopic(topic, options)
        if (result.report.passed || options.force) return result.publishResult
        lastReport = result.report
        log('quality_recovery_retry', {
            failedTopic: topic.topic,
            score: result.report.score,
            minQualityScore: result.report.minQualityScore,
            nextAction: 'trying_next_trending_topic',
        })
        if (!options.dryRun) {
            await notifySlack(`Draft failed quality validation for "${topic.topic}" (${result.report.score}/${result.report.minQualityScore}). Trying another high-trend topic automatically.`)
        }
    }

    log('publish_failed', { reason: 'quality_check_failed_after_retries', score: lastReport?.score || 0 })
    process.exitCode = 2
    return lastReport
}

async function draftTopic(topic, options) {
    const brief = await researchTopic(topic, options)
    const draft = await generateArticle(topic, brief, options)
    let article = await seoOptimize(draft, options)
    article = (await recommendMedia(options)).article
    const report = await qualityCheck(article, options, topic)
    if (!report.passed && !options.force) {
        log('quality_check_failed', { topic: topic.topic, score: report.score, trendOverride: report.trendOverride })
        return { report, article }
    }
    const imageResult = await generateImage(article, options)
    if (options.autoPublish && imageResult?.failed && process.env.REQUIRE_REAL_IMAGE_MODEL === 'true' && process.env.ALLOW_FALLBACK_IN_PRODUCTION !== 'true') {
        throw new Error('Auto-publish paused because a real image model is required and image generation failed.')
    }
    await generateAudio(article, options)
    const publishResult = await publishPost({ ...options, article, quality: report })
    return { report, article, publishResult }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runPipeline(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
