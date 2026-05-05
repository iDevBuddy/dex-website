import fs from 'node:fs/promises'

export async function generateWithImageProvider({ article, output }) {
    return generateNvidiaFluxImage({ article, output })
}

function imageDimensions() {
    const [widthRaw, heightRaw] = String(process.env.NVIDIA_IMAGE_SIZE || '1200x675').split('x')
    const requestedWidth = Number(widthRaw) || 1200
    const requestedHeight = Number(heightRaw) || 675
    const ratio = requestedWidth / requestedHeight
    let width = Math.min(1024, Math.max(64, Math.round(requestedWidth / 64) * 64))
    let height = Math.min(1024, Math.max(64, Math.round(width / ratio / 64) * 64))
    if (height > 1024) {
        height = 1024
        width = Math.min(1024, Math.max(64, Math.round(height * ratio / 64) * 64))
    }
    return { width, height, requestedWidth, requestedHeight }
}

function nvidiaDimensions() {
    const [widthRaw, heightRaw] = String(process.env.NVIDIA_IMAGE_SIZE || '1200x675').split('x')
    const requestedWidth = Number(widthRaw) || 1200
    const requestedHeight = Number(heightRaw) || 675
    const ratio = requestedWidth / requestedHeight
    const allowed = [768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344]
    let best = { width: 1024, height: 576, error: Infinity }
    for (const width of allowed) {
        for (const height of allowed) {
            const aspectError = Math.abs((width / height) - ratio)
            const sizeError = Math.abs(width - requestedWidth) / requestedWidth + Math.abs(height - requestedHeight) / requestedHeight
            const error = aspectError * 3 + sizeError
            if (error < best.error) best = { width, height, error }
        }
    }
    return { width: best.width, height: best.height, requestedWidth, requestedHeight }
}

function imagePrompt(article) {
    const frontmatter = article.frontmatter || {}
    const keywords = [
        frontmatter.title,
        frontmatter.category,
        frontmatter.targetKeyword,
        frontmatter.contentPersona,
        frontmatter.businessFunction,
    ].filter(Boolean).join(', ')
    const base = `A modern editorial hero image about ${frontmatter.title || 'AI business automation'}`
    return [
        base,
        `Editorial blog hero image for: ${keywords}`,
        'premium business automation style, realistic modern office environment, subtle abstract AI memory concept, glowing network lines, clean composition, warm orange accent, no diagrams, no interface screenshots, no text, no words, no letters, no numbers, no labels, no logos',
    ].filter(Boolean).join('. ')
}

function outputUrl(prediction) {
    const output = prediction?.output
    if (typeof output === 'string') return output
    if (Array.isArray(output)) {
        const first = output.flat(Infinity).find((item) => typeof item === 'string' && /^https?:\/\//.test(item))
        if (first) return first
    }
    return ''
}

function dataUrlToBuffer(value = '') {
    const match = String(value).match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i)
    return match ? Buffer.from(match[1], 'base64') : null
}

function extractNvidiaImage(json = {}) {
    const candidates = [
        json.image,
        json.b64_json,
        json.base64,
        json.data?.[0]?.b64_json,
        json.data?.[0]?.image,
        json.artifacts?.[0]?.base64,
        json.artifacts?.[0]?.image,
        json.images?.[0],
    ].filter(Boolean)

    for (const candidate of candidates) {
        if (typeof candidate !== 'string') continue
        if (/^https?:\/\//.test(candidate)) return { url: candidate }
        const dataBuffer = dataUrlToBuffer(candidate)
        if (dataBuffer) return { buffer: dataBuffer }
        if (/^[A-Za-z0-9+/=]+$/.test(candidate) && candidate.length > 1000) return { buffer: Buffer.from(candidate, 'base64') }
    }
    return null
}

async function generateNvidiaFluxImage({ article, output }) {
    const token = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY
    if (!token) return null
    const endpoint = process.env.NVIDIA_FLUX_URL || 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell'
    const model = process.env.NVIDIA_FLUX_MODEL || 'black-forest-labs/flux.1-schnell'
    const { width, height, requestedWidth, requestedHeight } = nvidiaDimensions()
    const prompt = imagePrompt(article)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), Number(process.env.NVIDIA_FLUX_TIMEOUT_MS || 120000))
    let json
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            signal: controller.signal,
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                width,
                height,
                cfg_scale: Number(process.env.NVIDIA_FLUX_CFG_SCALE || 0),
                mode: 'base',
                samples: 1,
                seed: process.env.NVIDIA_FLUX_SEED ? Number(process.env.NVIDIA_FLUX_SEED) : Math.floor(Math.random() * 2147483647),
                steps: Number(process.env.NVIDIA_FLUX_STEPS || 4),
            }),
        })
        if (!response.ok) throw new Error(`NVIDIA FLUX API failed: ${response.status} ${await response.text()}`)
        json = await response.json()
    } catch (error) {
        if (error.name === 'AbortError') throw new Error(`NVIDIA FLUX API timed out after ${process.env.NVIDIA_FLUX_TIMEOUT_MS || 120000}ms.`)
        throw error
    } finally {
        clearTimeout(timeout)
    }
    const image = extractNvidiaImage(json)
    if (!image) throw new Error(`NVIDIA FLUX response did not include a supported image payload. Keys: ${Object.keys(json).join(', ')}`)
    if (image.url) {
        const imageResponse = await fetch(image.url)
        if (!imageResponse.ok) throw new Error(`NVIDIA FLUX image download failed: ${imageResponse.status}`)
        await fs.writeFile(output, Buffer.from(await imageResponse.arrayBuffer()))
    } else {
        await fs.writeFile(output, image.buffer)
    }
    return {
        provider: 'nvidia_flux',
        path: output,
        sourceUrl: image.url || '',
        width,
        height,
        requestedWidth,
        requestedHeight,
        model,
        endpoint,
    }
}

