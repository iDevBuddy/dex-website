import { config } from './lib/config.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { syncBlogIdea } from './lib/notion-dashboard.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { analyzeTrend } from './lib/trend-analysis.mjs'

const highValueTerms = ['agent', 'automation', 'crm', 'slack', 'workflow', 'lead', 'business', 'ecommerce', 'support', 'appointment']

export function scoreTopic(topic) {
    topic = enrichTopicPersona(topic)
    const text = `${topic.topic} ${topic.keyword}`.toLowerCase()
    const trendAnalysis = analyzeTrend(topic)
    const manualBoost = topic.source === 'Manual seed' || topic.source === 'Manual command' ? 24 : 0
    const authorityBucketBoost = /\btrick|tool|github|kaggle|agent|security|finance|sales|support|operations|awareness|solution\b/i.test(text) ? 12 : 0
    const businessValue = highValueTerms.reduce((sum, term) => sum + (text.includes(term) ? 8 : 0), 30)
    const trendPotential = Math.max(topic.source?.includes('RSS') ? 18 : 10, Math.round(trendAnalysis.trendScore / 4))
    const intentClarity = /\bhow|guide|examples|tools|automation|agent|workflow\b/i.test(text) ? 15 : 8
    const seoOpportunity = /\bfor|how|guide|examples|tools|best|workflow\b/i.test(text) ? 10 : 6
    const lowCompetitionAngle = /\bsmall business|service|local|clinic|agency|slack|crm|workflow\b/i.test(text) ? 8 : 4
    const topicalAuthority = /\bai|automation|agent|workflow\b/i.test(text) ? 15 : 6
    const monetization = /\bbusiness|crm|lead|ecommerce|support|sales|clinic|law\b/i.test(text) ? 12 : 7
    const aiAnswerPotential = /\bwhat|how|guide|examples|checklist|workflow|tools\b/i.test(text) ? 8 : 4
    const internalLinking = /\bagent|automation|workflow|crm|slack\b/i.test(text) ? 10 : 5
    const score = Math.min(100, businessValue + trendPotential + intentClarity + seoOpportunity + lowCompetitionAngle + topicalAuthority + monetization + aiAnswerPotential + internalLinking + manualBoost + authorityBucketBoost)
    return {
        ...topic,
        score,
        trendScore: trendAnalysis.trendScore,
        marketSentiment: trendAnalysis.marketSentiment,
        marketSentimentScore: trendAnalysis.marketSentimentScore,
        trendOverrideEligible: trendAnalysis.trendOverrideEligible,
        trendOverrideReason: trendAnalysis.trendOverrideReason,
        trendAnalysis,
        seoScore: Math.min(100, (intentClarity + seoOpportunity + lowCompetitionAngle) * 3),
        businessValue: businessValue >= 70 ? 'High' : businessValue >= 45 ? 'Medium' : 'Low',
        businessValueScore: Math.min(100, businessValue),
        searchIntent: /\bbuy|price|service|agency|software|tool\b/i.test(text) ? 'Commercial' : 'Informational',
        priority: score >= 85 ? 'Urgent' : score >= config.minTopicScore ? 'High' : score >= 65 ? 'Medium' : 'Low',
        status: score >= Number(process.env.MIN_TOPIC_SCORE || 75) ? 'scored_ready' : 'scored_hold',
        scoredAt: new Date().toISOString(),
    }
}

export async function scoreTopics(topicsArg, options = getPipelineOptions()) {
    const topics = topicsArg || await readPipelineJson('topics.json', [], options)
    const scored = topics.map((topic) => {
        const result = scoreTopic(topic)
        return {
            ...result,
            status: result.score >= options.minTopicScore ? 'scored_ready' : 'scored_hold',
        }
    }).sort((a, b) => b.score - a.score)
    await writePipelineJson('topics.json', scored, options)
    log('topic_scored', { count: scored.length, ready: scored.filter((topic) => topic.status === 'scored_ready').length, ...modeDetails(options) })

    if (options.dryRun) {
        log('dry_run_write', { file: 'data/blog/dry-run/topics.json' })
        return scored
    }

    for (const topic of scored.filter((item) => item.status === 'scored_ready').slice(0, 5)) {
        await syncBlogIdea({ ...topic, status: 'Scored', notes: `Topic score: ${topic.score}/100` })
    }

    return scored
}

if (import.meta.url === `file://${process.argv[1]}`) {
    scoreTopics(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
