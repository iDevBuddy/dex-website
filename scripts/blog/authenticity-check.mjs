import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { evaluateAuthenticity } from './lib/authenticity-check.mjs'
import { log } from './lib/logger.mjs'
import { pathToFileURL } from 'node:url'

export async function authenticityCheck(options = getPipelineOptions()) {
    const article = await readPipelineJson('draft-article.json', null, options)
    const topics = await readPipelineJson('topics.json', [], options)
    if (!article) throw new Error('No draft article found.')
    const topic = topics.find((item) => item.slug === article.frontmatter?.slug) || article.frontmatter || {}
    const result = await evaluateAuthenticity(article, topic)
    await writePipelineJson('authenticity-report.json', result, options)
    log('authenticity_check', { score: result.score, minimum: result.minimum, passed: result.passed, provider: result.provider })
    if (!result.passed) process.exitCode = 2
    return result
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    authenticityCheck(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
