import path from 'node:path'
import { config, validateConfig } from './lib/config.mjs'
import { dataDir, ensureBlogDirs, readJson, slugify } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { syncBlogIdea } from './lib/notion-dashboard.mjs'
import { enrichTopicPersona } from './lib/persona.mjs'
import { fetchOfficialAiNews } from './lib/official-news.mjs'

const seeds = [
    'GPT-OSS automation tricks for business workflows',
    'Gemma AI agents for small business operations',
    'best GitHub AI automation repos for business owners',
    'Kaggle datasets for AI business automation projects',
    'finance automation with AI agents',
    'security automation workflows for small teams',
    'AI customer support automation playbook',
    'AI reporting automation for operations teams',
    'AI agents for small business',
    'Slack automation for service teams',
    'CRM automation with AI',
    'AI workflow automation examples',
    'lead generation automation with AI',
    'ecommerce customer support automation',
    'no-code AI automation stack',
    'AI appointment booking agent',
]

const sourceLabels = {
    'Google News RSS': 'Google News',
    'Hacker News RSS': 'Hacker News',
    'Reddit r/automation RSS': 'Reddit',
    'Reddit r/artificial RSS': 'Reddit',
    'Manual seed': 'Manual',
    'Manual command': 'Slack',
    'Notion': 'Notion',
}

function mapCategory(topic) {
    const text = topic.toLowerCase()
    if (/agent/.test(text)) return 'AI Agents'
    if (/workflow|process|operations/.test(text)) return 'Workflow Automation'
    if (/tool|software|stack/.test(text)) return 'AI Tools'
    if (/lead|sales|crm/.test(text)) return 'Lead Generation'
    if (/ecommerce|shopify|store/.test(text)) return 'Ecommerce Automation'
    if (/how|guide|tutorial|setup/.test(text)) return 'Tutorials'
    if (/business|small business/.test(text)) return 'Business Automation'
    return config.defaultCategory
}

async function fetchFeed(url, source, limit = 12) {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'DEXBlogEngine/1.0' } })
        if (!response.ok) throw new Error(`${response.status}`)
        const text = await response.text()
        return [...text.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g)]
            .map((match) => (match[1] || match[2] || '').replace(/&amp;/g, '&').trim())
            .filter((title) => title && !/google news|hacker news/i.test(title))
            .slice(0, limit)
            .map((topic) => ({ topic, source }))
    } catch (error) {
        warn('topic_source_failed', { source, message: error.message })
        return []
    }
}

async function fetchNotionIdeas(limit = 20) {
    if (!config.notionEnabled || !process.env.NOTION_API_KEY || !process.env.NOTION_BLOG_IDEAS_DB_ID) return []
    try {
        const response = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_BLOG_IDEAS_DB_ID}/query`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                page_size: limit,
                filter: {
                    property: 'Status',
                    select: { does_not_equal: 'Published' },
                },
            }),
        })
        if (!response.ok) throw new Error(`${response.status} ${await response.text()}`)
        const data = await response.json()
        return (data.results || []).map((page) => {
            const title = page.properties?.Topic?.title?.map((item) => item.plain_text).join('') || ''
            const keyword = page.properties?.Keyword?.rich_text?.map((item) => item.plain_text).join('') || title
            return title ? { topic: title, keyword, source: 'Notion', notionPageId: page.id } : null
        }).filter(Boolean)
    } catch (error) {
        warn('notion_topic_fetch_failed', { message: error.message })
        return []
    }
}

export async function discoverTopics(options = getPipelineOptions()) {
    validateConfig()
    await ensureBlogDirs()
    log('pipeline_start', { step: 'discover-topics', ...modeDetails(options) })

    const topicOverride = options.topic
        ? [{ topic: options.topic, source: 'Manual command' }]
        : []

    const feedTopics = (
        await Promise.all([
            fetchOfficialAiNews(options.sourceLimit),
            fetchFeed('https://news.google.com/rss/search?q=AI%20automation%20business&hl=en-US&gl=US&ceid=US:en', 'Google News RSS', options.sourceLimit),
            fetchFeed('https://hnrss.org/newest?q=AI%20automation', 'Hacker News RSS', options.sourceLimit),
            fetchFeed('https://www.reddit.com/r/automation/.rss', 'Reddit r/automation RSS', options.sourceLimit),
            fetchFeed('https://www.reddit.com/r/artificial/.rss', 'Reddit r/artificial RSS', options.sourceLimit),
            fetchFeed('https://www.producthunt.com/feed', 'Product Hunt', options.sourceLimit),
        ])
    ).flat()

    const notionTopics = await fetchNotionIdeas(options.sourceLimit)
    const manual = seeds.map((topic) => ({ topic, source: 'Manual seed' }))
    const existing = await readJson(path.join(dataDir, 'topics.json'), [])
    const seen = new Set(existing.map((item) => item.slug))
    const topics = [...topicOverride, ...notionTopics, ...feedTopics, ...manual]
        .map((item) => ({
            ...item,
            slug: slugify(item.topic),
            keyword: item.topic.toLowerCase(),
            category: item.category || mapCategory(item.topic),
            status: 'discovered',
            createdAt: new Date().toISOString(),
        }))
        .map(enrichTopicPersona)
        .filter((item) => item.topic.length > 8 && !seen.has(item.slug))
        .filter((item) => !/\btop\s+\d+|companies driving|earnings|ceo says|barron|vocal\.media|sponsored\b/i.test(item.topic))

    const merged = [...existing, ...topics]
    await writePipelineJson('topics.json', merged, options)
    log('topic_found', { count: topics.length, total: merged.length })

    if (options.dryRun) {
        log('dry_run_write', { file: 'data/blog/dry-run/topics.json' })
        return merged
    }

    for (const topic of topics.slice(0, 5)) {
        await syncBlogIdea({ ...topic, source: sourceLabels[topic.source] || 'Manual', status: 'New' })
    }

    return merged
}

if (import.meta.url === `file://${process.argv[1]}`) {
    discoverTopics(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
