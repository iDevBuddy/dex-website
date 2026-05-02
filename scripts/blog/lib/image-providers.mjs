import fs from 'node:fs/promises'

export async function generateWithImageProvider({ article, output }) {
    const provider = process.env.IMAGE_PROVIDER || 'local_comfyui'

    if (provider === 'nvidia_flux' || provider === 'nvidia') {
        return generateNvidiaFluxImage({ article, output })
    }

    if (provider === 'local_comfyui') {
        const result = await queueComfyUi({ article })
        if (result) return result
        if (process.env.USE_GPT_IMAGE === 'true' && process.env.OPENAI_API_KEY) {
            return generateOpenAiImage({ article, output })
        }
        return null
    }

    if (provider === 'gpt_image' || process.env.USE_GPT_IMAGE === 'true') {
        return generateOpenAiImage({ article, output })
    }

    return null
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
    const base = article.imagePrompt || frontmatter.imagePrompt || frontmatter.title
    return [
        base,
        `Editorial blog hero image for: ${keywords}`,
        'premium business automation style, realistic SaaS workflow scene, clean composition, warm orange accent, no readable text, no logos, no distorted UI text',
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
                seed: Number(process.env.NVIDIA_FLUX_SEED || 0),
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

async function queueComfyUi({ article }) {
    if (!process.env.COMFYUI_URL || !process.env.COMFYUI_WORKFLOW_PATH) return null
    const workflow = JSON.parse(await fs.readFile(process.env.COMFYUI_WORKFLOW_PATH, 'utf8'))
    const prompt = article.imagePrompt || article.frontmatter.imagePrompt || article.frontmatter.title
    const payload = JSON.parse(JSON.stringify(workflow).replaceAll('{{prompt}}', prompt))
    const headers = { 'Content-Type': 'application/json' }
    if (process.env.COMFYUI_AUTH_HEADER?.includes(':')) {
        const [name, ...rest] = process.env.COMFYUI_AUTH_HEADER.split(':')
        headers[name.trim()] = rest.join(':').trim()
    }
    const response = await fetch(`${process.env.COMFYUI_URL.replace(/\/$/, '')}/prompt`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: payload }),
    })
    if (!response.ok) throw new Error(`ComfyUI queue failed: ${response.status} ${await response.text()}`)
    const result = await response.json()
    return {
        provider: 'local_comfyui',
        queued: true,
        promptId: result.prompt_id,
        note: 'ComfyUI job queued. Save final image to the requested output path before publishing.',
    }
}

async function generateOpenAiImage({ article, output }) {
    if (!process.env.OPENAI_API_KEY) return null
    const prompt = article.imagePrompt || article.frontmatter.imagePrompt || article.frontmatter.title
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
            prompt,
            size: process.env.OPENAI_IMAGE_SIZE || '1536x1024',
        }),
    })
    if (!response.ok) throw new Error(`OpenAI image generation failed: ${response.status} ${await response.text()}`)
    const json = await response.json()
    const b64 = json.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI image response did not include b64_json.')
    await fs.writeFile(output, Buffer.from(b64, 'base64'))
    return {
        provider: 'gpt_image',
        path: output,
    }
}
