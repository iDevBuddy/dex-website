import { config } from './lib/config.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { syncBlogIdea } from './lib/notion-dashboard.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { analyzeTrend, fetchRealTimeTrendSignals, mergeRealTimeTrendAnalysis } from './lib/trend-analysis.mjs'
import { loadPublishedTopicIndex, compareTopicToPublished } from './lib/topic-deduplication.mjs'

const highValueTerms = ['agent', 'automation', 'crm', 'slack', 'workflow', 'lead', 'business', 'ecommerce', 'support', 'appointment']

function isServiceTopic(text) {
    return /\b(service|agency|customer support|support|crm|sales|lead|finance|security|operations|ecommerce|appointment|clinic|law|real estate|local business)\b/i.test(text)
}

export function scoreTopic(topic, context = {}) {
    topic = enrichTopicPersona(topic)
    const text = `${topic.topic} ${topic.keyword}`.toLowerCase()
    const duplicateAnalysis = context.duplicateAnalysis || topic.duplicateAnalysis || { duplicateStatus: 'unique', duplicateScore: 0 }
    const trendAnalysis = context.trendAnalysis || topic.trendAnalysis || analyzeTrend(topic)
    const manualBoost = topic.source === 'Manual seed' || topic.source === 'Manual command' ? 24 : 0
    const authorityBucketBoost = /\btrick|tool|github|kaggle|agent|security|finance|sales|support|operations|awareness|solution\b/i.test(text) ? 12 : 0
    const businessValue = highValueTerms.reduce((sum, term) => sum + (text.includes(term) ? 8 : 0), 30)
    const trendPotential = Math.max(topic.source?.includes('RSS') ? 18 : 10, Math.round(trendAnalysis.trendScore / 3.5))
    const intentClarity = /\bhow|guide|examples|tools|automation|agent|workflow\b/i.test(text) ? 15 : 8
    const seoOpportunity = /\bfor|how|guide|examples|tools|best|workflow\b/i.test(text) ? 10 : 6
    const lowCompetitionAngle = /\bsmall business|service|local|clinic|agency|slack|crm|workflow\b/i.test(text) ? 8 : 4
    const topicalAuthority = /\bai|automation|agent|workflow\b/i.test(text) ? 15 : 6
    const monetization = /\bbusiness|crm|lead|ecommerce|support|sales|clinic|law\b/i.test(text) ? 12 : 7
    const aiAnswerPotential = /\bwhat|how|guide|examples|checklist|workflow|tools\b/i.test(text) ? 8 : 4
    const internalLinking = /\bagent|automation|workflow|crm|slack\b/i.test(text) ? 10 : 5
    const duplicatePenalty = duplicateAnalysis.duplicateStatus === 'duplicate' ? 28 : duplicateAnalysis.duplicateStatus === 'similar' ? 10 : 0
    const businessTrendBoost = isServiceTopic(text) && trendAnalysis.trendScore >= 70 && trendAnalysis.marketSentiment !== 'risky' ? 10 : 0
    const score = Math.max(0, Math.min(100, businessValue + trendPotential + intentClarity + seoOpportunity + lowCompetitionAngle + topicalAuthority + monetization + aiAnswerPotential + internalLinking + manualBoost + authorityBucketBoost + businessTrendBoost - duplicatePenalty))
    const duplicateHold = duplicateAnalysis.duplicateStatus === 'duplicate' && !trendAnalysis.trendOverrideEligible
    return {
        ...topic,
        score,
        trendScore: trendAnalysis.trendScore,
        marketSentiment: trendAnalysis.marketSentiment,
        marketSentimentScore: trendAnalysis.marketSentimentScore,
        trendOverrideEligible: trendAnalysis.trendOverrideEligible,
        trendOverrideReason: trendAnalysis.trendOverrideReason,
        trendAnalysis,
        duplicateStatus: duplicateAnalysis.duplicateStatus,
        duplicateScore: duplicateAnalysis.duplicateScore,
        duplicateMatch: duplicateAnalysis.bestMatch,
        suggestedAngle: duplicateAnalysis.suggestedAngle,
        suggestedTopic: duplicateAnalysis.suggestedTopic,
        seoScore: Math.min(100, (intentClarity + seoOpportunity + lowCompetitionAngle) * 3),
        businessValue: businessValue >= 70 ? 'High' : businessValue >= 45 ? 'Medium' : 'Low',
        businessValueScore: Math.min(100, businessValue),
        searchIntent: /\bbuy|price|service|agency|software|tool\b/i.test(text) ? 'Commercial' : 'Informational',
        priority: score >= 85 ? 'Urgent' : score >= config.minTopicScore ? 'High' : score >= 65 ? 'Medium' : 'Low',
        status: duplicateHold ? 'duplicate_hold' : score >= Number(process.env.MIN_TOPIC_SCORE || 75) ? 'scored_ready' : 'scored_hold',
        scoredAt: new Date().toISOString(),
    }
}

export async function scoreTopics(topicsArg, options = getPipelineOptions()) {
    const topics = topicsArg || await readPipelineJson('topics.json', [], options)
    const published = await loadPublishedTopicIndex()
    const realtimeLimit = Number(process.env.TREND_REALTIME_MAX_TOPICS || 12)
    const enriched = await Promise.all(topics.map(async (topic, index) => {
        const duplicateAnalysis = compareTopicToPublished(topic, published)
        let trendAnalysis = analyzeTrend(topic)
        const shouldFetchRealtime = process.env.ENABLE_REALTIME_TRENDS !== 'false'
            && index < realtimeLimit
            && (topic.source !== 'Manual seed' || options.topic)
        if (shouldFetchRealtime) {
            try {
                const realtime = await fetchRealTimeTrendSignals(topic)
                trendAnalysis = mergeRealTimeTrendAnalysis({ ...topic, trendAnalysis }, realtime)
            } catch (error) {
                trendAnalysis = {
                    ...trendAnalysis,
                    realtimeUnavailableSources: [`real-time trends: ${error.message}`],
                }
            }
        }
        return { topic, duplicateAnalysis, trendAnalysis }
    }))
    const scored = enriched.map(({ topic, duplicateAnalysis, trendAnalysis }) => {
        const result = scoreTopic(topic, { duplicateAnalysis, trendAnalysis })
        return {
            ...result,
            status: result.status === 'duplicate_hold' ? 'duplicate_hold' : result.score >= options.minTopicScore ? 'scored_ready' : 'scored_hold',
        }
    }).sort((a, b) => b.score - a.score)
    await writePipelineJson('topics.json', scored, options)
    log('topic_scored', {
        count: scored.length,
        ready: scored.filter((topic) => topic.status === 'scored_ready').length,
        duplicateHold: scored.filter((topic) => topic.status === 'duplicate_hold').length,
        realtimeTrends: process.env.ENABLE_REALTIME_TRENDS !== 'false',
        ...modeDetails(options),
    })

    if (options.dryRun) {
        log('dry_run_write', { file: 'data/blog/dry-run/topics.json' })
        return scored
    }

    for (const topic of scored.filter((item) => item.status === 'scored_ready').slice(0, 5)) {
        await syncBlogIdea({
            ...topic,
            status: 'Scored',
            notes: [
                `Topic score: ${topic.score}/100`,
                topic.duplicateStatus && topic.duplicateStatus !== 'unique' ? `Duplicate check: ${topic.duplicateStatus} (${topic.duplicateScore}/100). Suggested angle: ${topic.suggestedAngle}` : '',
                topic.trendAnalysis?.trendOverrideReason || '',
            ].filter(Boolean).join('\n'),
        })
    }

    return scored
}

if (import.meta.url === `file://${process.argv[1]}`) {
    scoreTopics(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
