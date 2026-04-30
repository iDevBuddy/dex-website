import { config } from './config.mjs'

function configured(value) {
    return Boolean(value && String(value).trim())
}

class OpenAiCompatibleRuntimeProvider {
    constructor({ name, url, model, apiKey }) {
        this.name = name
        this.url = url
        this.model = model
        this.apiKey = apiKey
    }

    async generateText(prompt, options = {}) {
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
                messages: [
                    { role: 'system', content: options.system || 'You are a practical AI automation and SEO expert.' },
                    { role: 'user', content: prompt },
                ],
            }),
        })
        if (!response.ok) throw new Error(`${this.name} failed: ${response.status} ${await response.text()}`)
        const data = await response.json()
        return data.choices?.[0]?.message?.content || data.output_text || ''
    }

    async generateJson(prompt, options = {}) {
        const text = await this.generateText(prompt, options)
        const match = text.match(/\{[\s\S]*\}/)
        if (!match) throw new Error(`${this.name} response did not contain JSON.`)
        return JSON.parse(match[0])
    }

    async healthCheck() {
        return {
            provider: this.name,
            configured: configured(this.url) && configured(this.model),
            ok: configured(this.url) && configured(this.model),
            model: this.model || null,
        }
    }
}

export function createMainLlmProvider(env = process.env) {
    if (env.USE_GPT_OSS === 'true') {
        return new OpenAiCompatibleRuntimeProvider({
            name: 'gpt-oss',
            url: env.LOCAL_LLM_URL || config.localLlmUrl,
            model: env.LOCAL_LLM_MODEL || config.localLlmModel || 'gpt-oss',
            apiKey: env.OPENAI_API_KEY,
        })
    }
    if (env.USE_GEMMA === 'true') {
        return new OpenAiCompatibleRuntimeProvider({
            name: 'gemma',
            url: env.LOCAL_LLM_URL || config.localLlmUrl,
            model: env.LOCAL_LLM_MODEL || 'gemma',
            apiKey: env.OPENAI_API_KEY,
        })
    }
    if (configured(env.OPENAI_API_KEY)) {
        return new OpenAiCompatibleRuntimeProvider({
            name: 'openai',
            url: 'https://api.openai.com/v1/chat/completions',
            model: env.OPENAI_MODEL || 'gpt-4.1-mini',
            apiKey: env.OPENAI_API_KEY,
        })
    }
    return new OpenAiCompatibleRuntimeProvider({ name: 'unconfigured', url: '', model: '' })
}

export function createReviewLlmProvider(env = process.env) {
    if (configured(env.REVIEW_LLM_URL) && configured(env.REVIEW_LLM_MODEL)) {
        return new OpenAiCompatibleRuntimeProvider({
            name: 'review-openai-compatible',
            url: env.REVIEW_LLM_URL,
            model: env.REVIEW_LLM_MODEL,
            apiKey: env.OPENAI_API_KEY,
        })
    }
    return createMainLlmProvider(env)
}

export async function llmStatus(env = process.env) {
    const main = await createMainLlmProvider(env).healthCheck()
    const review = await createReviewLlmProvider(env).healthCheck()
    return {
        mainConfigured: main.configured,
        reviewConfigured: review.configured,
        mainProvider: main.provider,
        reviewProvider: review.provider,
        mainModel: main.model,
        reviewModel: review.model,
    }
}
