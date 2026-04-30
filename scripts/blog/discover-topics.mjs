import path from 'node:path'
import { config, validateConfig } from './lib/config.mjs'
import { dataDir, ensureBlogDirs, readJson, slugify, writeJson } from './lib/content.mjs'
import { log, warn } from './lib/logger.mjs'
import { createNotionPage, richTextProperty, titleProperty } from './lib/notion.mjs'

const seeds = [
    'AI agents for small business',
    'Slack automation for service teams',
    'CRM automation with AI',
    'AI workflow automation examples',
    'lead generation automation with AI',
    'ecommerce customer support automation',
    'no-code AI automation stack',
    'AI appointment booking agent',
]

async function fetchFeed(url, source) {
    try {
        const response = await fetch(url, { headers: { 'User-Agent': 'DEXBlogEngine/1.0' } })
        if (!response.ok) throw new Error(`${response.status}`)
        const text = await response.text()
        return [...text.matchAll(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/g)]
            .map((match) => (match[1] || match[2] || '').replace(/&amp;/g, '&').trim())
            .filter((title) => title && !/google news|hacker news/i.test(title))
            .slice(0, 12)
            .map((topic) => ({ topic, source }))
    } catch (error) {
        warn('topic_source_failed', { source, message: error.message })
        return []
    }
}

export async function discoverTopics() {
    validateConfig()
    await ensureBlogDirs()
    log('pipeline_start', { step: 'discover-topics' })

    const feedTopics = (
        await Promise.all([
            fetchFeed('https://news.google.com/rss/search?q=AI%20automation%20business&hl=en-US&gl=US&ceid=US:en', 'Google News RSS'),
            fetchFeed('https://hnrss.org/newest?q=AI%20automation', 'Hacker News RSS'),
            fetchFeed('https://www.reddit.com/r/automation/.rss', 'Reddit r/automation RSS'),
            fetchFeed('https://www.reddit.com/r/artificial/.rss', 'Reddit r/artificial RSS'),
        ])
    ).flat()

    const manual = seeds.map((topic) => ({ topic, source: 'Manual seed' }))
    const existing = await readJson(path.join(dataDir, 'topics.json'), [])
    const seen = new Set(existing.map((item) => item.slug))
    const topics = [...feedTopics, ...manual]
        .map((item) => ({
            ...item,
            slug: slugify(item.topic),
            keyword: item.topic.toLowerCase(),
            category: config.defaultCategory,
            status: 'discovered',
            createdAt: new Date().toISOString(),
        }))
        .filter((item) => item.topic.length > 8 && !seen.has(item.slug))
        .filter((item) => !/\btop\s+\d+|companies driving|vocal\.media|sponsored\b/i.test(item.topic))

    const merged = [...existing, ...topics]
    await writeJson(path.join(dataDir, 'topics.json'), merged)
    log('topic_found', { count: topics.length, total: merged.length })

    for (const topic of topics.slice(0, 5)) {
        await createNotionPage(process.env.NOTION_BLOG_IDEAS_DB_ID, {
            Topic: titleProperty(topic.topic),
            Source: richTextProperty(topic.source),
            Keyword: richTextProperty(topic.keyword),
            Status: richTextProperty('Discovered'),
        })
    }

    return merged
}

if (import.meta.url === `file://${process.argv[1]}`) {
    discoverTopics().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
