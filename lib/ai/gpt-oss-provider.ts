import { OpenAiCompatibleProvider } from './openai-compatible-provider'

export function createGptOssProvider(env = process.env) {
    return new OpenAiCompatibleProvider({
        name: 'gpt-oss',
        url: env.LOCAL_LLM_URL,
        model: env.LOCAL_LLM_MODEL || 'gpt-oss',
        apiKey: env.OPENAI_API_KEY,
    })
}
