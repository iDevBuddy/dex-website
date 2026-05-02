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
    const seoAudit = await readPipelineJson('seo-audit-report.json', null, options)
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
            trendOverrideBlocksPublishing(quality) ? 'Trend override requires manual editorial approval before publishing.' : '',
            quality?.authenticity && !quality.authenticity.passed ? 'Authenticity/relevance review is required before publishing.' : '',
            seoAudit && !seoAudit.passed ? 'SEO audit must pass before publishing.' : '',
            imageBlocksPublishing(imageResult) ? 'Real image provider is required before publishing.' : '',
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
    if (trendOverrideBlocksPublishing(quality)) throw new Error('Publish blocked: trend override drafts require manual editorial approval.')
    if (quality?.authenticity && !quality.authenticity.passed) throw new Error('Publish blocked: authenticity/relevance review is required before publishing.')
    if (seoAudit && !seoAudit.passed && !options.force) throw new Error(`Publish blocked: SEO audit score ${seoAudit.score}/${seoAudit.minScore}.`)
    if (imageBlocksPublishing(imageResult)) {
        throw new Error(`Publish blocked: real image provider is required. ${imageProviderSetupMessage()}`)
    }

    await fs.writeFile(output, stringifyFrontmatter(article.frontmatter, article.body))
    await syncPublishedPost(article, quality)
    await notifySlack(`Blog published: ${article.frontmatter.title}\n${config.siteUrl}/blog/${article.frontmatter.slug}`)
    log('publish_success', { slug: article.frontmatter.slug, output })
    return { published: true, output }
}

function imageBlocksPublishing(imageResult) {
    if (!config.requireRealImageModel || process.env.ALLOW_FALLBACK_IN_PRODUCTION === 'true') return false
    if (imageResult?.provider === 'official_product_image') return false
    if (imageResult?.provider === 'official_image_placeholder' && process.env.ALLOW_OFFICIAL_IMAGE_PLACEHOLDER !== 'false') return false
    return !imageResult || imageResult.failed || /fallback/i.test(imageResult.provider || '')
}

function trendOverrideBlocksPublishing(quality = {}) {
    if (!quality?.trendOverride?.applied || quality?.strictPassed) return false
    return !(process.env.AI_NEWS_AUTO_PUBLISH !== 'false' && quality.trendOverride.autoNewsAllowed)
}

function imageProviderSetupMessage() {
    const provider = process.env.IMAGE_PROVIDER || 'local_comfyui'
    if (provider === 'nvidia_flux' || provider === 'nvidia') return 'Add NVIDIA_API_KEY, NVIDIA_FLUX_URL, NVIDIA_FLUX_MODEL, and NVIDIA_IMAGE_SIZE.'
    if (provider === 'gpt_image' || process.env.USE_GPT_IMAGE === 'true') return 'Add OPENAI_API_KEY and USE_GPT_IMAGE=true.'
    return 'Add COMFYUI_URL and COMFYUI_WORKFLOW_PATH.'
}

if (import.meta.url === `file://${process.argv[1]}`) {
    publishPost(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
