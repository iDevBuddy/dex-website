import path from 'node:path'
import fs from 'node:fs/promises'
import { config } from './lib/config.mjs'
import { contentDir, ensureBlogDirs, stringifyFrontmatter } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, shouldRequireApproval, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { notifySlack } from './lib/slack.mjs'
import { syncPublishedPost } from './lib/notion-dashboard.mjs'

export async function publishPost(options = getPipelineOptions()) {
    await ensureBlogDirs()
    const article = options.article || await readPipelineJson('draft-article.json', null, options)
    const quality = options.quality || await readPipelineJson('quality-report.json', null, options)
    const imageResult = await readPipelineJson('image-result.json', null, options)
    if (!article) throw new Error('No draft article found.')
    if (!quality?.passed && !options.force) throw new Error(`Quality check failed. Score: ${quality?.score || 0}/${config.minQualityScore}`)

    const output = path.join(contentDir, `${article.frontmatter.slug}.md`)
    const approvalPacket = {
        output,
        article,
        quality,
        imageResult,
        approvalRequired: shouldRequireApproval(options),
        blockingIssues: [
            config.requireAuthenticSources && !quality?.sourceGate?.passed ? 'Authentic topic-specific sources are required before publishing.' : '',
            quality?.trendOverride?.applied && !quality?.strictPassed ? 'Trend override requires manual editorial approval before publishing.' : '',
            quality?.authenticity && !quality.authenticity.passed ? 'Authenticity/relevance review is required before publishing.' : '',
            config.requireRealImageModel && process.env.ALLOW_FALLBACK_IN_PRODUCTION !== 'true' && (!imageResult || imageResult.failed || /fallback/i.test(imageResult.provider || '')) ? 'Real image provider is required before publishing.' : '',
        ].filter(Boolean),
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

    if (config.requireAuthenticSources && !quality?.sourceGate?.passed) throw new Error('Publish blocked: authentic topic-specific sources are required before publishing.')
    if (quality?.trendOverride?.applied && !quality?.strictPassed) throw new Error('Publish blocked: trend override drafts require manual editorial approval.')
    if (quality?.authenticity && !quality.authenticity.passed) throw new Error('Publish blocked: authenticity/relevance review is required before publishing.')
    if (config.requireRealImageModel && process.env.ALLOW_FALLBACK_IN_PRODUCTION !== 'true' && (!imageResult || imageResult.failed || /fallback/i.test(imageResult.provider || ''))) {
        throw new Error('Publish blocked: real image provider is required. Add COMFYUI_URL and COMFYUI_WORKFLOW_PATH.')
    }

    await fs.writeFile(output, stringifyFrontmatter(article.frontmatter, article.body))
    await syncPublishedPost(article, quality)
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
