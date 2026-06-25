/**
 * Resilient model client for the DEX content agent.
 *
 * Design rule: NOTHING here throws to the caller un-guarded. Every network
 * call has a timeout, exponential backoff retries, and a provider/model
 * fallback. Callers get { ok, data/text, error } and decide — the pipeline
 * never dies on a transient blip.
 *
 * Providers: OpenAI (chat + Responses API w/ web_search) and OpenRouter
 * (free Gemma), both OpenAI-compatible.
 */

const OPENAI = 'https://api.openai.com/v1'
const OPENROUTER = 'https://openrouter.ai/api/v1'
const NVIDIA = 'https://integrate.api.nvidia.com/v1'
const GITHUB = 'https://models.github.ai/inference'
const env = (k, d = '') => (process.env[k] && String(process.env[k]).trim()) || d

// Primary text models — OpenAI's open-weight reasoning models, hosted FREE on
// NVIDIA NIM (OpenAI-compatible). These carry the writing; Gemma (OpenRouter
// free) is the cross-provider fallback. No paid OpenAI dependency for text.
export const NVIDIA_BIG = env('NVIDIA_BIG_MODEL', 'openai/gpt-oss-120b')   // writer, critic
export const NVIDIA_SMALL = env('NVIDIA_SMALL_MODEL', 'openai/gpt-oss-20b') // light judgers
export const GEMMA = env('GEMMA_MODEL', 'google/gemma-4-31b-it:free')

// Truth/verify brain — real OpenAI model via GitHub Models (FREE, OpenAI-compat).
// gpt-4.1 is the strongest model free on GitHub's tier (gpt-5 is paid-only there).
// Used for research synthesis + fact-check; falls back to the NVIDIA models if
// GitHub Models is rate-limited or down.
export const VERIFY_MODEL = env('VERIFY_MODEL', 'openai/gpt-4.1')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** fetch with timeout + retry on network errors, 429 and 5xx. Never hangs. */
async function fetchResilient(url, options = {}, { retries = 3, timeoutMs = 60000, label = 'request' } = {}) {
    let lastErr
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) })
            if (res.status === 429 || res.status >= 500) {
                lastErr = new Error(`${label}: HTTP ${res.status}`)
            } else {
                return res // 2xx or non-retryable 4xx — caller inspects
            }
        } catch (e) {
            lastErr = new Error(`${label}: ${e?.message || e}`)
        }
        if (attempt < retries) await sleep(Math.min(20000, 700 * 2 ** attempt) + Math.floor(Math.random() * 400))
    }
    throw lastErr || new Error(`${label}: exhausted retries`)
}

/** Pull JSON out of an LLM reply even if it is fenced or wrapped in prose. */
export function safeJson(text) {
    if (!text || typeof text !== 'string') return null
    const cleaned = text.replace(/```json|```/gi, '').trim()
    const tryParse = (s) => { try { return JSON.parse(s) } catch { return undefined } }
    let v = tryParse(cleaned)
    if (v !== undefined) return v
    const first = cleaned.search(/[[{]/)
    const last = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'))
    if (first !== -1 && last > first) {
        v = tryParse(cleaned.slice(first, last + 1))
        if (v !== undefined) return v
    }
    return null
}

/** Low-level chat call (OpenAI or OpenRouter). Returns text or throws (guarded by callers). */
async function rawChat({ provider, model, system, user, temperature = 0.5, maxTokens, reasoningEffort, timeoutMs = 60000, retries = 3 }) {
    const isOR = provider === 'gemma' || provider === 'openrouter'
    const isNV = provider === 'nvidia'
    const isGH = provider === 'github'
    const key = isGH ? env('GH_MODELS_TOKEN') : isNV ? env('NVIDIA_API_KEY') : isOR ? env('OPENROUTER_API_KEY') : env('OPENAI_API_KEY')
    if (!key) throw new Error(`${provider}: API key not set`)
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
    if (isOR) { headers['HTTP-Referer'] = 'https://www.dexakif.com'; headers['X-Title'] = 'DEX Content Agent' }

    const body = { model, messages: [] }
    // gpt-5.x and o-series reasoning models only accept the default temperature;
    // gpt-oss, gpt-4.1/4o and Gemma accept a custom one.
    const supportsTemp = !/gpt-5|^o\d|\/o\d/.test(model)
    if (supportsTemp && temperature != null) body.temperature = temperature
    if (system) body.messages.push({ role: 'system', content: system })
    body.messages.push({ role: 'user', content: user })
    if (maxTokens) body.max_completion_tokens = maxTokens
    // reasoning_effort only for reasoning models (gpt-5.x, o-series, gpt-oss);
    // gpt-4.1/4o (GitHub) and Gemma reject it.
    const supportsReasoning = /gpt-5|^o\d|\/o\d|gpt-oss/.test(model)
    if (reasoningEffort && supportsReasoning) body.reasoning_effort = reasoningEffort

    const base = isGH ? GITHUB : isNV ? NVIDIA : isOR ? OPENROUTER : OPENAI
    const res = await fetchResilient(`${base}/chat/completions`, {
        method: 'POST', headers, body: JSON.stringify(body),
    }, { timeoutMs, retries, label: `${provider}:${model}` })

    if (!res.ok) throw new Error(`${provider}:${model} HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error(`${provider}:${model} returned empty content`)
    return { text, usage: data.usage }
}

/**
 * chat() — guarded, with a fallback model. Always resolves to a result object.
 * @returns {{ ok:boolean, text?:string, json?:any, usage?:object, model?:string, error?:string }}
 */
export async function chat(opts) {
    const { json = false, fallback, ...rest } = opts
    const attempts = [rest, ...(fallback ? [{ ...rest, ...fallback }] : [])]
    let error
    for (const a of attempts) {
        try {
            const { text, usage } = await rawChat(a)
            if (json) {
                const parsed = safeJson(text)
                if (parsed == null) { error = `${a.provider}:${a.model} did not return valid JSON`; continue }
                return { ok: true, json: parsed, text, usage, model: a.model }
            }
            return { ok: true, text, usage, model: a.model }
        } catch (e) {
            error = e?.message || String(e)
        }
    }
    return { ok: false, error }
}

/** rough USD cost from token usage (estimates; refine once billing confirms). */
export function estimateCost(model = '', usage = {}) {
    const t = (usage.total_tokens) || ((usage.prompt_tokens || usage.input_tokens || 0) + (usage.completion_tokens || usage.output_tokens || 0))
    // gpt-oss (NVIDIA free) and Gemma (OpenRouter free) cost $0 — tracked as ~0 for reporting.
    const rate = /gpt-oss|gemma/.test(model) ? 0 : /gpt-5\.5|gpt-5-pro/.test(model) ? 12 : /gpt-5-mini|gpt-4\.1\b/.test(model) ? 2 : /nano|mini/.test(model) ? 0.3 : 5
    return { tokens: t, usd: Number((t / 1e6 * rate).toFixed(4)) }
}
