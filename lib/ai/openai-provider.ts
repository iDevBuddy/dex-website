import { OpenAiCompatibleProvider } from './openai-compatible-provider'

export function createOpenAiProvider(env = process.env) {
    return new OpenAiCompatibleProvider({
        name: 'openai',
        url: 'https://api.openai.com/v1/chat/completions',
        model: env.OPENAI_MODEL || 'gpt-4.1-mini',
        apiKey: env.OPENAI_API_KEY,
    })
}
