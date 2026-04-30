import path from 'node:path'
import { config } from './lib/config.mjs'
import { dataDir, readJson, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'
import { createNotionPage, numberProperty, richTextProperty, titleProperty } from './lib/notion.mjs'

const highValueTerms = ['agent', 'automation', 'crm', 'slack', 'workflow', 'lead', 'business', 'ecommerce', 'support', 'appointment']

export function scoreTopic(topic) {
    const text = `${topic.topic} ${topic.keyword}`.toLowerCase()
    const manualBoost = topic.source === 'Manual seed' ? 18 : 0
    const businessValue = highValueTerms.reduce((sum, term) => sum + (text.includes(term) ? 8 : 0), 30)
    const trendPotential = topic.source?.includes('RSS') ? 18 : 10
    const intentClarity = /\bhow|guide|examples|tools|automation|agent|workflow\b/i.test(text) ? 15 : 8
    const topicalAuthority = /\bai|automation|agent|workflow\b/i.test(text) ? 15 : 6
    const monetization = /\bbusiness|crm|lead|ecommerce|support|sales|clinic|law\b/i.test(text) ? 12 : 7
    const internalLinking = /\bagent|automation|workflow|crm|slack\b/i.test(text) ? 10 : 5
    const score = Math.min(100, businessValue + trendPotential + intentClarity + topicalAuthority + monetization + internalLinking + manualBoost)
    return {
        ...topic,
        score,
        trendScore: Math.min(100, trendPotential * 4),
        seoScore: Math.min(100, intentClarity * 5),
        businessValue: Math.min(100, businessValue),
        priority: score >= config.minQualityScore ? 'High' : score >= 70 ? 'Medium' : 'Low',
        status: score >= Number(process.env.MIN_TOPIC_SCORE || 70) ? 'scored_ready' : 'scored_hold',
        scoredAt: new Date().toISOString(),
    }
}

export async function scoreTopics() {
    const file = path.join(dataDir, 'topics.json')
    const topics = await readJson(file, [])
    const scored = topics.map(scoreTopic).sort((a, b) => b.score - a.score)
    await writeJson(file, scored)
    log('topic_scored', { count: scored.length, ready: scored.filter((topic) => topic.status === 'scored_ready').length })

    for (const topic of scored.filter((item) => item.status === 'scored_ready').slice(0, 5)) {
        await createNotionPage(process.env.NOTION_BLOG_IDEAS_DB_ID, {
            Topic: titleProperty(topic.topic),
            Source: richTextProperty(topic.source),
            Keyword: richTextProperty(topic.keyword),
            'Trend Score': numberProperty(topic.trendScore),
            'SEO Score': numberProperty(topic.seoScore),
            'Business Value': numberProperty(topic.businessValue),
            Priority: richTextProperty(topic.priority),
            Status: richTextProperty('Scored Ready'),
        })
    }

    return scored
}

if (import.meta.url === `file://${process.argv[1]}`) {
    scoreTopics().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
