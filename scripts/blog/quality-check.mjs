import { config } from './lib/config.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { draftApprovalBlocks, notifySlack } from './lib/slack.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { createReviewLlmProvider } from './lib/llm-providers.mjs'
import { shouldApplyTrendQualityOverride } from './lib/trend-analysis.mjs'
import { evaluateAuthenticity } from './lib/authenticity-check.mjs'

const checks = [
    ['minimumWordCount', (article) => article.body.split(/\s+/).length >= 700, 12],
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

export function qualityScore(article, { topic, options } = {}) {
    const results = checks.map(([name, test, points]) => ({ name, passed: test(article), points }))
    const score = results.reduce((sum, result) => sum + (result.passed ? result.points : 0), 0)
    const sources = Array.isArray(article.frontmatter.sources) ? article.frontmatter.sources : []
    const qualityScores = sources.map((source) => Number(source.authorityScore || 0)).filter(Boolean)
    const sourceQualityScore = Number(article.frontmatter.sourceQualityScore || (qualityScores.length ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length) : 0))
    const sourceGate = {
        required: config.requireAuthenticSources,
        passed: !config.requireAuthenticSources || (sources.length >= config.minAuthoritySourcesPerArticle && sourceQualityScore >= config.sourceMinAuthorityScore),
        sourceCount: sources.length,
        minSources: config.minAuthoritySourcesPerArticle,
        sourceQualityScore,
        minSourceQualityScore: config.sourceMinAuthorityScore,
        status: sources.length >= config.minAuthoritySourcesPerArticle ? 'Ready' : 'Needs Research',
        notes: sources.length >= config.minAuthoritySourcesPerArticle
            ? `Source quality score ${sourceQualityScore}.`
            : `Authentic sources needed before publishing. Need at least ${config.minAuthoritySourcesPerArticle} source(s).`,
    }
    const strictPassed = score >= config.minQualityScore && sourceGate.passed
    const trendOverride = shouldApplyTrendQualityOverride({ score, minQualityScore: config.minQualityScore, sourceGate }, topic || article.frontmatter || {}, options || {})
    return {
        score,
        strictPassed,
        passed: strictPassed || trendOverride.applied,
        minQualityScore: config.minQualityScore,
        sourceGate,
        trendOverride,
        publishMode: trendOverride.applied ? 'manual_trend_review' : strictPassed ? 'standard_review' : 'rewrite_required',
        results,
    }
}

export async function qualityCheck(articleArg, options = getPipelineOptions(), topicArg) {
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const report = qualityScore(article, { topic: topicArg, options })
    const authenticity = await evaluateAuthenticity(article, topicArg || article.frontmatter || {})
    report.authenticity = authenticity
    if (!authenticity.passed) {
        report.strictPassed = false
        if (report.trendOverride.applied && authenticity.score >= Number(process.env.MIN_AUTHENTICITY_SCORE_FOR_TREND_OVERRIDE || 68)) {
            report.passed = true
            report.publishMode = 'manual_trend_authenticity_review'
            report.trendOverride.reason = `${report.trendOverride.reason} Authenticity score ${authenticity.score}/${authenticity.minimum} requires manual review but is above trend override floor.`
        } else {
            report.passed = false
            report.publishMode = 'rewrite_required'
        }
    }
    if (!options.dryRun) {
        try {
            const provider = createReviewLlmProvider()
            const health = await provider.healthCheck()
            if (health.configured) {
                const review = await provider.generateJson(`Review this blog article. Return JSON with fields helpfulContentRisk, notes, recommendedFixes.\n${JSON.stringify({ frontmatter: article.frontmatter, body: article.body })}`)
                report.review = review
            }
        } catch (error) {
            report.review = { skipped: true, reason: error.message }
        }
    }
    await writePipelineJson('quality-report.json', report, options)
    log('quality_score', { ...report, ...modeDetails(options) })
    if (!options.dryRun) {
        await syncBlogDraft(article, {
            qualityScore: report.score,
            draftStatus: report.passed ? 'Needs Review' : 'Rewrite Needed',
            approvalStatus: report.passed ? 'Waiting' : 'Rewrite Needed',
            sourcesStatus: report.sourceGate.status,
            sourceQualityScore: report.sourceGate.sourceQualityScore,
            sourceNotes: report.sourceGate.notes,
            publishReady: report.strictPassed,
            blockingIssues: report.strictPassed ? '' : report.trendOverride.applied ? 'Trend override requires manual editorial approval before publishing.' : report.sourceGate.passed ? 'Quality score below threshold.' : 'Authentic sources needed before publishing.',
            trendScore: report.trendOverride.trendScore,
            marketSentiment: report.trendOverride.marketSentiment,
            recoveryNotes: [
                report.trendOverride.reason,
                `Authenticity: ${authenticity.score}/${authenticity.minimum}. ${authenticity.notes}`,
            ].join('\n'),
        })
    }
    if (!report.passed && !options.dryRun) {
        await notifySlack(`Blog quality check failed: ${article.frontmatter.title} scored ${report.score}/${report.minQualityScore}.`)
    }
    if (report.passed && !options.dryRun) {
        const label = report.trendOverride.applied ? 'Blog draft ready for manual trend review' : 'Blog draft ready for approval'
        await notifySlack(`${label}: ${article.frontmatter.title}`, draftApprovalBlocks(article, report))
    }
    if (!report.sourceGate.passed && !options.dryRun) {
        await notifySlack(`Authentic sources needed before publishing: ${article.frontmatter.title}. Add topic-specific sources in Notion or rerun source improvement.`)
    }
    if (!authenticity.passed && !options.dryRun) {
        await notifySlack(`Authenticity review needed: ${article.frontmatter.title} scored ${authenticity.score}/${authenticity.minimum}. ${authenticity.notes}`)
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
