import { ImageProvider, ImageRequest, ImageResult } from './image-provider'

export class GptImageProvider implements ImageProvider {
    name = 'gpt_image'
    constructor(private env = process.env) {}

    async generateImage(request: ImageRequest): Promise<ImageResult> {
        if (!this.env.OPENAI_API_KEY || this.env.USE_GPT_IMAGE !== 'true') {
            return { ok: false, provider: this.name, error: 'OPENAI_API_KEY missing or USE_GPT_IMAGE is not true.' }
        }
        return { ok: false, provider: this.name, error: 'Use scripts/blog/lib/image-providers.mjs runtime adapter for actual generation.', altText: `AI generated image for ${request.title}` }
    }

    async healthCheck() {
        const configured = Boolean(this.env.OPENAI_API_KEY && this.env.USE_GPT_IMAGE === 'true')
        return { configured, ok: configured, provider: this.name, message: configured ? 'Configured' : 'Missing OpenAI image configuration' }
    }
}
