import { ImageProvider, ImageRequest, ImageResult } from './image-provider'

export class ComfyUiProvider implements ImageProvider {
    name = 'local_comfyui'
    constructor(private env = process.env) {}

    async generateImage(request: ImageRequest): Promise<ImageResult> {
        if (!this.env.COMFYUI_URL || !this.env.COMFYUI_WORKFLOW_PATH) {
            return { ok: false, provider: this.name, error: 'COMFYUI_URL or COMFYUI_WORKFLOW_PATH missing.' }
        }
        return { ok: true, provider: this.name, queued: true, altText: `AI generated image for ${request.title}` }
    }

    async healthCheck() {
        const configured = Boolean(this.env.COMFYUI_URL && this.env.COMFYUI_WORKFLOW_PATH)
        return { configured, ok: configured, provider: this.name, message: configured ? 'Configured' : 'Missing ComfyUI URL or workflow path' }
    }
}
