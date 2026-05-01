import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { analyzeTopicDuplication } from './lib/topic-deduplication.mjs'
import { log } from './lib/logger.mjs'
import { pathToFileURL } from 'node:url'

export async function checkDuplicates(options = getPipelineOptions()) {
    const topic = options.topic
        ? { topic: options.topic, keyword: options.topic.toLowerCase(), category: 'Business Automation' }
        : (await readPipelineJson('topics.json', [], options))[0]
    if (!topic) throw new Error('No topic found. Pass --topic or run topic discovery first.')
    const result = await analyzeTopicDuplication(topic)
    await writePipelineJson('duplicate-check.json', { topic, ...result }, options)
    log('duplicate_topic_check', { topic: topic.topic, duplicateStatus: result.duplicateStatus, duplicateScore: result.duplicateScore })
    return result
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    checkDuplicates(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
