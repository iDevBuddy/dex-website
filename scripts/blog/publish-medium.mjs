import fs from 'node:fs/promises'
import path from 'node:path'
import { contentDir } from './lib/content.mjs'
import { getPipelineOptions, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log, warn } from './lib/logger.mjs'
import { notifySlack } from './lib/slack.mjs'

async function getMediumUserId(token) {
    const response = await fetch('https://api.medium.com/v1/me', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    if (!response.ok) throw new Error(`Medium auth failed: ${response.status} ${await response.text()}`)
    const data = await response.json()
    return data.data.id
}

async function postToMedium({ token, userId, title, body, tags, canonicalUrl, subtitle }) {
    const tagList = (tags || []).slice(0, 5).map((t) => String(t).slice(0, 25))
    const content = subtitle ? `*${subtitle}*\n\n${body}` : body
    const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title,
            contentFormat: 'markdown',
            content,
            canonicalUrl,
            tags: tagList,
            publishStatus: process.env.MEDIUM_PUBLISH_STATUS || 'public',
        }),
    })
    if (!response.ok) throw new Error(`Medium publish failed: ${response.status} ${await response.text()}`)
    const data = await response.json()
    return data.data
}

export async function publishToMedium(options = getPipelineOptions()) {
    const token = process.env.MEDIUM_INTEGRATION_TOKEN
    if (!token) {
        warn('medium_skip', { message: 'MEDIUM_INTEGRATION_TOKEN not set — skipping Medium cross-post.' })
        return null
    }

    const article = options.article || await readPipelineJson('draft-article.json', null, options)
    if (!article?.frontmatter?.slug) throw new Error('No published article found for Medium cross-post.')

    const slug = article.frontmatter.slug
    const siteUrl = process.env.SITE_URL || 'https://dexbyakif.com'
    const canonicalUrl = `${siteUrl}/blog/${slug}`

    const publishedPath = path.join(contentDir, `${slug}.md`)
    let body = article.body || ''
    try {
        const raw = await fs.readFile(publishedPath, 'utf8')
        body = raw.replace(/^---[\s\S]*?---\n/, '').trim()
    } catch {
        // fall back to in-memory body
    }

    const crossPostRecord = await readPipelineJson('cross-post-record.json', {}, options)
    if (crossPostRecord.medium?.[slug]) {
        log('medium_already_posted', { slug, url: crossPostRecord.medium[slug] })
        return crossPostRecord.medium[slug]
    }

    const userId = await getMediumUserId(token)
    const result = await postToMedium({
        token,
        userId,
        title: article.frontmatter.title,
        subtitle: article.frontmatter.subtitle,
        body,
        tags: article.frontmatter.tags,
        canonicalUrl,
    })

    crossPostRecord.medium = crossPostRecord.medium || {}
    crossPostRecord.medium[slug] = result.url
    await writePipelineJson('cross-post-record.json', crossPostRecord, options)

    log('medium_published', { slug, mediumUrl: result.url, canonicalUrl })
    await notifySlack(`Cross-posted to Medium: ${result.url}\nCanonical: ${canonicalUrl}`)
    return result.url
}

if (import.meta.url === `file://${process.argv[1]}`) {
    publishToMedium(getPipelineOptions()).then((url) => {
        if (url) console.log(JSON.stringify({ ok: true, mediumUrl: url }))
    }).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
