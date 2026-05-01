import fs from 'node:fs/promises'

export async function generateWithImageProvider({ article, output }) {
    const provider = process.env.IMAGE_PROVIDER || 'local_comfyui'

    if (provider === 'replicate') {
        return generateReplicateImage({ article, output })
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
    const [widthRaw, heightRaw] = String(process.env.REPLICATE_IMAGE_SIZE || '1200x675').split('x')
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

async function replicateRequest(url, init = {}) {
    const token = process.env.REPLICATE_API_KEY
    if (!token) return null
    const response = await fetch(url, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    })
    if (!response.ok) throw new Error(`Replicate API failed: ${response.status} ${await response.text()}`)
    return response.json()
}

async function pollReplicatePrediction(prediction) {
    let current = prediction
    for (let attempt = 0; attempt < 24; attempt += 1) {
        if (['succeeded', 'failed', 'canceled'].includes(current.status)) return current
        const getUrl = current.urls?.get || `https://api.replicate.com/v1/predictions/${current.id}`
        await new Promise((resolve) => setTimeout(resolve, 5000))
        current = await replicateRequest(getUrl, { method: 'GET' })
    }
    return current
}

async function generateReplicateImage({ article, output }) {
    if (!process.env.REPLICATE_API_KEY) return null
    const model = process.env.REPLICATE_MODEL || 'stability-ai/stable-diffusion'
    const [owner, name] = model.split('/')
    if (!owner || !name) throw new Error('REPLICATE_MODEL must use owner/model format, for example stability-ai/stable-diffusion.')
    const { width, height, requestedWidth, requestedHeight } = imageDimensions()
    const prompt = imagePrompt(article)
    const modelDetails = await replicateRequest(`https://api.replicate.com/v1/models/${owner}/${name}`, { method: 'GET' })
    const version = modelDetails?.latest_version?.id
    if (!version) throw new Error(`Replicate model ${model} did not return a latest version.`)
    const prediction = await replicateRequest('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: { Prefer: 'wait=60' },
        body: JSON.stringify({
            version,
            input: {
                prompt,
                width,
                height,
                num_outputs: 1,
                negative_prompt: 'text, words, letters, watermark, logo, blurry, distorted user interface, malformed hands',
                scheduler: 'DPMSolverMultistep',
                num_inference_steps: 35,
                guidance_scale: 7.5,
            },
        }),
    })
    const completed = await pollReplicatePrediction(prediction)
    if (completed.status !== 'succeeded') {
        throw new Error(`Replicate prediction ${completed.id || ''} ended with status ${completed.status || 'unknown'}.`)
    }
    const url = outputUrl(completed)
    if (!url) throw new Error('Replicate prediction did not return an image URL.')
    const imageResponse = await fetch(url)
    if (!imageResponse.ok) throw new Error(`Replicate image download failed: ${imageResponse.status}`)
    await fs.writeFile(output, Buffer.from(await imageResponse.arrayBuffer()))
    return {
        provider: 'replicate',
        path: output,
        predictionId: completed.id,
        sourceUrl: url,
        width,
        height,
        requestedWidth,
        requestedHeight,
        model,
        version,
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
