import { GenerateTextOptions, LlmProvider, parseJsonFromText, ProviderHealth } from './llm-provider'

export class OpenAiCompatibleProvider implements LlmProvider {
    name: string
    private url?: string
    private model?: string
    private apiKey?: string

    constructor({ name, url, model, apiKey }: { name: string; url?: string; model?: string; apiKey?: string }) {
        this.name = name
        this.url = url
        this.model = model
        this.apiKey = apiKey
    }

    async generateText(prompt: string, options: GenerateTextOptions = {}) {
        if (!this.url || !this.model) throw new Error(`${this.name} is not configured.`)
        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
            },
            body: JSON.stringify({
                model: this.model,
                temperature: options.temperature ?? 0.4,
                max_tokens: options.maxTokens,
                messages: [
                    { role: 'system', content: options.system || 'You are a practical SEO and AI automation expert.' },
                    { role: 'user', content: prompt },
                ],
            }),
        })
        if (!response.ok) throw new Error(`${this.name} failed: ${response.status} ${await response.text()}`)
        const data = await response.json()
        return data.choices?.[0]?.message?.content || data.output_text || ''
    }

    async generateJson<T = unknown>(prompt: string, options: GenerateTextOptions = {}) {
        return parseJsonFromText<T>(await this.generateText(prompt, options))
    }

    async healthCheck(): Promise<ProviderHealth> {
        return {
            configured: Boolean(this.url && this.model),
            ok: Boolean(this.url && this.model),
            provider: this.name,
            message: this.url && this.model ? 'Configured' : 'Missing endpoint or model',
        }
    }
}
