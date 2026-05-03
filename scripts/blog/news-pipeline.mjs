import { runPipeline } from './run-pipeline.mjs'
import { getPipelineOptions, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { notifySlack } from './lib/slack.mjs'

export async function runNewsPipeline(options = getPipelineOptions()) {
    const autoPublish = options.autoPublish || process.env.AI_NEWS_AUTO_PUBLISH === 'true'
    const pipelineOptions = {
        ...options,
        autoPublish,
        manualApproval: !autoPublish,
        forceDraft: options.forceDraft || process.env.AI_NEWS_FORCE_DRAFT !== 'false',
    }
    try {
        const result = await runPipeline(pipelineOptions)
        await writePipelineJson('news-pipeline-status.json', { ok: true, result }, options)
        return result
    } catch (error) {
        const message = summarizeNewsPipelineError(error)
        const status = {
            ok: false,
            failSoft: process.env.AI_NEWS_FAIL_SOFT !== 'false',
            message,
            nextAction: 'Draft artifacts were preserved when available. Improve SEO/content or approve manually after review.',
            generatedAt: new Date().toISOString(),
        }
        warn('ai_news_pipeline_needs_review', status)
        await writePipelineJson('news-pipeline-status.json', status, options)
        await notifySlack(`AI News Monitor needs review: ${message}`)
        if (process.env.AI_NEWS_FAIL_SOFT === 'false') throw error
        log('ai_news_pipeline_completed_with_review_needed', status)
        return status
    }
}

function summarizeNewsPipelineError(error) {
    const raw = String(error?.message || error || '')
    const firstLine = raw.split('\n').find((line) => line.trim()) || 'AI news pipeline needs review.'
    if (/SEO audit score/i.test(firstLine)) return `${firstLine} Draft saved for SEO improvement instead of failing the workflow.`
    if (/Quality check failed/i.test(firstLine)) return `${firstLine} Draft saved for rewrite/review instead of failing the workflow.`
    if (/real image provider/i.test(firstLine)) return `${firstLine} Draft saved; image provider review needed.`
    return firstLine.slice(0, 300)
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runNewsPipeline(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
