import { runPipeline } from './run-pipeline.mjs'
import { getPipelineOptions } from './lib/cli.mjs'

export async function runNewsPipeline(options = getPipelineOptions()) {
    const autoPublish = options.autoPublish || process.env.AI_NEWS_AUTO_PUBLISH !== 'false'
    return runPipeline({
        ...options,
        autoPublish,
        manualApproval: !autoPublish,
        forceDraft: options.forceDraft || process.env.AI_NEWS_FORCE_DRAFT === 'true',
    })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runNewsPipeline(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
