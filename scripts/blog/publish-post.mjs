import path from 'node:path'
import fs from 'node:fs/promises'
import { config } from './lib/config.mjs'
import { contentDir, dataDir, ensureBlogDirs, readJson, stringifyFrontmatter, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'
import { notifySlack } from './lib/slack.mjs'
import { createNotionPage, numberProperty, richTextProperty, titleProperty } from './lib/notion.mjs'

export async function publishPost({ force = false, dryRun = false } = {}) {
    await ensureBlogDirs()
    const article = await readJson(path.join(dataDir, 'draft-article.json'), null)
    const quality = await readJson(path.join(dataDir, 'quality-report.json'), null)
    if (!article) throw new Error('No draft article found.')
    if (!quality?.passed && !force) throw new Error(`Quality check failed. Score: ${quality?.score || 0}/${config.minQualityScore}`)

    const output = path.join(contentDir, `${article.frontmatter.slug}.md`)
    if (dryRun || (config.manualApproval && !force && !config.autoPublish)) {
        await writeJson(path.join(dataDir, 'preview-post.json'), { output, article, quality })
        await notifySlack(`Approval needed: ${article.frontmatter.title} scored ${quality.score}/${quality.minQualityScore}. Preview saved to data/blog/preview-post.json.`)
        log('publish_pending_approval', { slug: article.frontmatter.slug, output })
        return { pendingApproval: true, output }
    }

    await fs.writeFile(output, stringifyFrontmatter(article.frontmatter, article.body))
    await createNotionPage(process.env.NOTION_PUBLISHED_POSTS_DB_ID, {
        Title: titleProperty(article.frontmatter.title),
        URL: richTextProperty(`${config.siteUrl}/blog/${article.frontmatter.slug}`),
        Slug: richTextProperty(article.frontmatter.slug),
        'Target Keyword': richTextProperty(article.frontmatter.targetKeyword || ''),
        Category: richTextProperty(article.frontmatter.category || config.defaultCategory),
        'Quality Score': numberProperty(quality.score),
    })
    await notifySlack(`Blog published: ${article.frontmatter.title}\n${config.siteUrl}/blog/${article.frontmatter.slug}`)
    log('publish_success', { slug: article.frontmatter.slug, output })
    return { published: true, output }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const force = process.argv.includes('--force')
    const dryRun = process.argv.includes('--dry-run')
    publishPost({ force, dryRun }).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
