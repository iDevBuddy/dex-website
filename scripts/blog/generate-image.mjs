import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { ensureBlogDirs, imageDir } from './lib/content.mjs'
import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { generateWithImageProvider } from './lib/image-providers.mjs'
import { log, warn } from './lib/logger.mjs'
import { syncBlogDraft } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'

function crc32(buffer) {
    let crc = -1
    for (const byte of buffer) {
        crc ^= byte
        for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
    return (crc ^ -1) >>> 0
}

function chunk(type, data) {
    const typeBuffer = Buffer.from(type)
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const crc = Buffer.alloc(4)
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
    return Buffer.concat([length, typeBuffer, data, crc])
}

function makePng(width = 1280, height = 720) {
    const raw = Buffer.alloc((width * 4 + 1) * height)
    for (let y = 0; y < height; y += 1) {
        const row = y * (width * 4 + 1)
        raw[row] = 0
        for (let x = 0; x < width; x += 1) {
            const i = row + 1 + x * 4
            const glow = Math.max(0, 1 - Math.hypot((x - width * 0.72) / width, (y - height * 0.32) / height) * 2.2)
            raw[i] = 17 + Math.round(120 * glow)
            raw[i + 1] = 17 + Math.round(36 * glow)
            raw[i + 2] = 17 + Math.round(22 * glow)
            raw[i + 3] = 255
        }
    }
    const ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(width, 0)
    ihdr.writeUInt32BE(height, 4)
    ihdr[8] = 8
    ihdr[9] = 6
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
    ])
}

export async function generateImage(articleArg, options = getPipelineOptions()) {
    await ensureBlogDirs()
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const slug = article.frontmatter.slug
    const output = path.join(imageDir, `${slug}.png`)
    const result = {
        slug,
        output,
        url: `/blog/images/${slug}.png`,
        alt: article.frontmatter.imageAlt || `AI automation workflow visual for ${article.frontmatter.title}`,
        provider: process.env.IMAGE_PROVIDER || 'local_comfyui',
        prompt: article.imagePrompt,
        ...modeDetails(options),
    }

    if (options.dryRun) {
        await writePipelineJson('image-result.json', { ...result, skippedWrite: true }, options)
        log('image_dry_run', result)
        return { ...result, skippedWrite: true }
    }

    try {
        const providerOutput = await generateWithImageProvider({ article, output })
        if (providerOutput?.path || providerOutput?.queued) {
            const providerResult = { ...result, ...providerOutput }
            await writePipelineJson('image-result.json', providerResult, options)
            log('image_generated', providerResult)
            await syncBlogDraft(article, { imageStatus: providerOutput.queued ? 'Generating' : 'Generated' })
            return providerResult
        }
        if (process.env.REQUIRE_REAL_IMAGE_MODEL === 'true' && process.env.ALLOW_FALLBACK_IN_PRODUCTION !== 'true') {
            const message = 'Real image model is required, but COMFYUI_URL/COMFYUI_WORKFLOW_PATH or GPT Image is not configured.'
            await syncBlogDraft(article, { imageStatus: 'Failed', notes: message })
            await notifySlack(`Image generation paused for ${article.frontmatter.title}: ${message}`)
            throw new Error(message)
        }
        const fallback = makePng()
        await fs.writeFile(output, fallback)
        article.frontmatter.image = `/blog/images/${slug}.png`
        article.frontmatter.imageAlt ||= `AI automation workflow visual for ${article.frontmatter.title}`
        const fallbackResult = { ...result, provider: 'fallback_png', path: output }
        await writePipelineJson('image-result.json', fallbackResult, options)
        log('image_generated', fallbackResult)
        await syncBlogDraft(article, { imageStatus: 'Generated' })
        return fallbackResult
    } catch (error) {
        warn('image_generation_failed', { message: error.message })
        const failed = { ...result, failed: true, error: error.message }
        await writePipelineJson('image-result.json', failed, options)
        await syncBlogDraft(article, { imageStatus: 'Failed', notes: `Image generation failed: ${error.message}` })
        await notifySlack(`Image generation failed for ${article.frontmatter.title}: ${error.message}`)
        return failed
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateImage(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
