import { config } from './lib/config.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { draftApprovalBlocks, notifySlack } from './lib/slack.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'

const checks = [
    ['minimumWordCount', (article) => article.body.split(/\s+/).length >= 500, 12],
    ['hasClearIntro', (article) => /^##\s+/m.test(article.body), 8],
    ['hasExamples', (article) => /example|workflow|step/i.test(article.body), 10],
    ['hasFaq', (article) => Array.isArray(article.frontmatter.faqs) && article.frontmatter.faqs.length >= 2, 10],
    ['hasSources', (article) => Array.isArray(article.frontmatter.sources) && article.frontmatter.sources.length >= 1, 8],
    ['hasImagePrompt', (article) => Boolean(article.imagePrompt), 8],
    ['hasInternalLinks', (article) => /\/blog\/|\/#services|\/#contact/.test(JSON.stringify(article)), 8],
    ['hasSchemaData', (article) => Boolean(article.frontmatter.title && article.frontmatter.description && article.frontmatter.publishedAt), 8],
    ['noKeywordStuffing', (article) => !hasKeywordStuffing(article), 10],
    ['hasBusinessValue', (article) => /business|customer|workflow|automation|operator|revenue|lead/i.test(article.body), 10],
    ['hasConclusion', (article) => /what to do next|conclusion|next step/i.test(article.body), 8],
]

function hasKeywordStuffing(article) {
    const keyword = String(article.frontmatter.targetKeyword || '').toLowerCase()
    if (!keyword) return false
    const words = article.body.toLowerCase().split(/\s+/).length
    const occurrences = article.body.toLowerCase().split(keyword).length - 1
    return occurrences / Math.max(words, 1) > 0.04
}

export function qualityScore(article) {
    const results = checks.map(([name, test, points]) => ({ name, passed: test(article), points }))
    const score = results.reduce((sum, result) => sum + (result.passed ? result.points : 0), 0)
    return {
        score,
        passed: score >= config.minQualityScore,
        minQualityScore: config.minQualityScore,
        results,
    }
}

export async function qualityCheck(articleArg, options = getPipelineOptions()) {
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const report = qualityScore(article)
    await writePipelineJson('quality-report.json', report, options)
    log('quality_score', { ...report, ...modeDetails(options) })
    if (!options.dryRun) {
        await syncBlogDraft(article, {
            qualityScore: report.score,
            draftStatus: report.passed ? 'Quality Passed' : 'Quality Failed',
            approvalStatus: report.passed ? 'Needs Approval' : 'Blocked',
        })
    }
    if (!report.passed && !options.dryRun) {
        await notifySlack(`Blog quality check failed: ${article.frontmatter.title} scored ${report.score}/${report.minQualityScore}.`)
    }
    if (report.passed && !options.dryRun) {
        await notifySlack(`Blog draft ready for approval: ${article.frontmatter.title}`, draftApprovalBlocks(article, report))
    }
    return report
}

if (import.meta.url === `file://${process.argv[1]}`) {
    qualityCheck(undefined, getPipelineOptions()).then((report) => {
        if (!report.passed) process.exit(2)
    }).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
