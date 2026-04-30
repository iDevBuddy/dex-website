import { OpenAiCompatibleProvider } from './openai-compatible-provider'

export function createGemmaProvider(env = process.env) {
    return new OpenAiCompatibleProvider({
        name: 'gemma',
        url: env.LOCAL_LLM_URL,
        model: env.LOCAL_LLM_MODEL || 'gemma',
        apiKey: env.OPENAI_API_KEY,
    })
}
