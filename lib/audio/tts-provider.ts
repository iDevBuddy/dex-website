export type TtsRequest = {
    text: string
    slug: string
    outputPath?: string
    voice?: string
    speed?: number
}

export type TtsResult = {
    ok: boolean
    provider: string
    path?: string
    fallback: boolean
    error?: string
}

export interface TtsProvider {
    name: string
    generateAudio(request: TtsRequest): Promise<TtsResult>
    healthCheck(): Promise<{ configured: boolean; ok: boolean; provider: string; message: string }>
}

export class BrowserFallbackTtsProvider implements TtsProvider {
    name = 'browser_fallback'
    async generateAudio(): Promise<TtsResult> {
        return { ok: true, provider: this.name, fallback: true }
    }
    async healthCheck() {
        return { configured: true, ok: true, provider: this.name, message: 'Browser SpeechSynthesis fallback available on article pages' }
    }
}
