import fs from 'node:fs/promises'

const SD_ENDPOINT = 'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3-5-large'
const SD_MODEL = 'stabilityai/stable-diffusion-3-5-large'

export async function generateWithImageProvider({ article, output }) {
    return generateStableDiffusionImage({ article, output })
}

function sdDimensions() {
    const [widthRaw, heightRaw] = String(process.env.NVIDIA_IMAGE_SIZE || '1024x576').split('x')
    const requestedWidth = Number(widthRaw) || 1024
    const requestedHeight = Number(heightRaw) || 576
    const ratio = requestedWidth / requestedHeight
    // SD3.5 supported sizes (multiples of 64, 512-1536)
    const allowed = [512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280, 1344, 1408, 1472, 1536]
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

function dataUrlToBuffer(value = '') {
    const match = String(value).match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i)
    return match ? Buffer.from(match[1], 'base64') : null
}

function extractImage(json = {}) {
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

async function generateStableDiffusionImage({ article, output }, attempt = 0) {
    const token = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY
    if (!token) return null
    const endpoint = process.env.NVIDIA_SD_URL || process.env.NVIDIA_FLUX_URL || SD_ENDPOINT
    const model = process.env.NVIDIA_SD_MODEL || process.env.NVIDIA_FLUX_MODEL || SD_MODEL
    const { width, height, requestedWidth, requestedHeight } = sdDimensions()
    const prompt = article.imagePrompt || imagePrompt(article)
    const timeoutMs = Number(process.env.NVIDIA_IMAGE_TIMEOUT_MS || process.env.NVIDIA_FLUX_TIMEOUT_MS || 180000)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
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
                negative_prompt: process.env.NVIDIA_SD_NEGATIVE_PROMPT || 'blur, low quality, watermark, text, logo, deformed, ugly, bad anatomy',
                mode: 'text-to-image',
                width,
                height,
                num_inference_steps: Number(process.env.NVIDIA_SD_STEPS || process.env.NVIDIA_FLUX_STEPS || 30),
                cfg_scale: Number(process.env.NVIDIA_SD_CFG_SCALE || process.env.NVIDIA_FLUX_CFG_SCALE || 5),
                seed: process.env.NVIDIA_SD_SEED ? Number(process.env.NVIDIA_SD_SEED) : Math.floor(Math.random() * 2147483647),
                samples: 1,
            }),
        })
        if (!response.ok) throw new Error(`Stable Diffusion API failed: ${response.status} ${await response.text()}`)
        json = await response.json()
    } catch (error) {
        clearTimeout(timeout)
        if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 12000))
            return generateStableDiffusionImage({ article, output }, attempt + 1)
        }
        if (error.name === 'AbortError') throw new Error(`Stable Diffusion API timed out after ${timeoutMs}ms (${attempt + 1} attempts).`)
        throw error
    } finally {
        clearTimeout(timeout)
    }
    const image = extractImage(json)
    if (!image) throw new Error(`Stable Diffusion response did not include a supported image payload. Keys: ${Object.keys(json).join(', ')}`)
    if (image.url) {
        const imageResponse = await fetch(image.url)
        if (!imageResponse.ok) throw new Error(`Image download failed: ${imageResponse.status}`)
        await fs.writeFile(output, Buffer.from(await imageResponse.arrayBuffer()))
    } else {
        await fs.writeFile(output, image.buffer)
    }
    return {
        provider: 'stable_diffusion_3_5',
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
