import fs from 'node:fs/promises'

export async function generateWithImageProvider({ article, output }) {
    const provider = process.env.IMAGE_PROVIDER || 'local_comfyui'

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
