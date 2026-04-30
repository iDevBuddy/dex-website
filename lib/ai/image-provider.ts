export type ImageRequest = {
    title: string
    category?: string
    prompt: string
    brandStyle?: string
    outputPath: string
}

export type ImageResult = {
    ok: boolean
    provider: string
    path?: string
    altText?: string
    error?: string
    queued?: boolean
}

export interface ImageProvider {
    name: string
    generateImage(request: ImageRequest): Promise<ImageResult>
    healthCheck(): Promise<{ configured: boolean; ok: boolean; provider: string; message: string }>
}
