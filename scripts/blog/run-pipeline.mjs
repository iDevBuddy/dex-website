import { discoverTopics } from './discover-topics.mjs'
import { scoreTopics } from './score-topics.mjs'
import { researchTopic } from './research-topic.mjs'
import { generateArticle } from './generate-article.mjs'
import { seoOptimize } from './seo-optimize.mjs'
import { generateImage } from './generate-image.mjs'
import { generateAudio } from './generate-audio.mjs'
import { qualityCheck } from './quality-check.mjs'
import { publishPost } from './publish-post.mjs'
import { log } from './lib/logger.mjs'

export async function runPipeline() {
    const dryRun = process.argv.includes('--dry-run')
    const force = process.argv.includes('--force')
    log('pipeline_start', { dryRun, force })
    await discoverTopics()
    const scored = await scoreTopics()
    const topic = scored.find((item) => item.status === 'scored_ready') || scored[0]
    const brief = await researchTopic(topic)
    await generateArticle(topic, brief)
    const article = await seoOptimize()
    await generateImage(article)
    await generateAudio(article)
    const report = await qualityCheck(article)
    if (!report.passed && !force) {
        log('publish_failed', { reason: 'quality_check_failed', score: report.score })
        process.exitCode = 2
        return report
    }
    return publishPost({ dryRun, force })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runPipeline().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
