export type GenerateTextOptions = {
    temperature?: number
    maxTokens?: number
    system?: string
}

export type ProviderHealth = {
    configured: boolean
    ok: boolean
    provider: string
    message: string
}

export interface LlmProvider {
    name: string
    generateText(prompt: string, options?: GenerateTextOptions): Promise<string>
    generateJson<T = unknown>(prompt: string, options?: GenerateTextOptions): Promise<T>
    healthCheck(): Promise<ProviderHealth>
}

export function parseJsonFromText<T = unknown>(text: string): T {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Model response did not contain JSON.')
    return JSON.parse(match[0]) as T
}
