import path from 'node:path'
import fs from 'node:fs/promises'
import { config } from './lib/config.mjs'
import { contentDir, ensureBlogDirs, stringifyFrontmatter } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, shouldRequireApproval, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { notifySlack } from './lib/slack.mjs'
import { createNotionPage, numberProperty, richTextProperty, titleProperty } from './lib/notion.mjs'

export async function publishPost(options = getPipelineOptions()) {
    await ensureBlogDirs()
    const article = options.article || await readPipelineJson('draft-article.json', null, options)
    const quality = options.quality || await readPipelineJson('quality-report.json', null, options)
    if (!article) throw new Error('No draft article found.')
    if (!quality?.passed && !options.force) throw new Error(`Quality check failed. Score: ${quality?.score || 0}/${config.minQualityScore}`)

    const output = path.join(contentDir, `${article.frontmatter.slug}.md`)
    const approvalPacket = {
        output,
        article,
        quality,
        approvalRequired: shouldRequireApproval(options),
        ...modeDetails(options),
    }
    if (options.dryRun || shouldRequireApproval(options)) {
        const file = options.dryRun ? 'preview-post.json' : 'approval-post.json'
        await writePipelineJson(file, approvalPacket, options)
        if (!options.dryRun) {
            await notifySlack(`Approval needed: ${article.frontmatter.title} scored ${quality.score}/${quality.minQualityScore}. Preview saved to data/blog/${file}.`)
        }
        log('publish_pending_approval', { slug: article.frontmatter.slug, output, ...modeDetails(options) })
        return { pendingApproval: true, output, approvalPacket }
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
    publishPost(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
