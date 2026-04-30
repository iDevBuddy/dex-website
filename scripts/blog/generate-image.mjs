import fs from 'node:fs/promises'
import path from 'node:path'
import zlib from 'node:zlib'
import { dataDir, ensureBlogDirs, imageDir, readJson } from './lib/content.mjs'
import { log, warn } from './lib/logger.mjs'

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

async function tryComfyUi(article) {
    if (process.env.IMAGE_PROVIDER !== 'local_comfyui' || !process.env.COMFYUI_URL) return null
    warn('comfyui_not_configured_for_direct_workflow', { prompt: article.imagePrompt })
    return null
}

export async function generateImage(articleArg) {
    await ensureBlogDirs()
    const article = articleArg || await readJson(path.join(dataDir, 'draft-article.json'), null)
    if (!article) throw new Error('No draft article found.')
    const slug = article.frontmatter.slug
    const output = path.join(imageDir, `${slug}.png`)

    try {
        const providerOutput = await tryComfyUi(article)
        if (providerOutput) return providerOutput
        const fallback = makePng()
        await fs.writeFile(output, fallback)
        article.frontmatter.image = `/blog/images/${slug}.png`
        article.frontmatter.imageAlt ||= `AI automation workflow visual for ${article.frontmatter.title}`
        log('image_generated', { provider: 'fallback_png', path: output })
        return { path: output, url: article.frontmatter.image, alt: article.frontmatter.imageAlt }
    } catch (error) {
        warn('image_generation_failed', { message: error.message })
        return { failed: true, error: error.message }
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateImage().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
