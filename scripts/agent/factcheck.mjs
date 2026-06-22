/**
 * Fact-checker — verifies every factual claim in the final article is
 * grounded in the brief. Flags anything unsupported (hallucination guard).
 * Returns a verdict; the pipeline uses it to pass / hold for review.
 */
import { chat } from './lib/ai.mjs'

export async function factCheck(article, data, { model = 'gpt-5-mini' } = {}) {
    if (!article?.body) return { ok: false, error: 'no article' }

    const prompt = `Verify this article against the source brief. For EACH factual claim (numbers, names, dates, capabilities, pricing), decide if it is supported by the brief. Flag any claim NOT supported (possible hallucination). Be strict but fair — general business commentary that doesn't assert a verifiable fact is fine.\n\nBRIEF (only source of truth):\n${JSON.stringify(data?.brief, null, 2)}\n\nARTICLE:\nTitle: ${article.title}\nDirect answer: ${article.directAnswer}\nBody:\n${article.body}\n\nReturn ONLY JSON:\n{\n  "grounded": true|false,\n  "supportedCount": <number>,\n  "flagged": [{"claim":"","why":"not in brief / contradicts brief"}],\n  "verdict": "pass" | "needs_review"\n}`

    const res = await chat({
        provider: 'openai', model,
        fallback: { provider: 'openai', model: 'gpt-4.1-mini' },
        json: true, temperature: 0.1, maxTokens: 1500,
        system: 'You are a precise fact-checker. Return only valid JSON.',
        user: prompt,
    })
    if (!res.ok || !res.json) return { ok: true, grounded: null, flagged: [], verdict: 'needs_review', note: res.error || 'fact-check inconclusive — holding for review' }
    return { ok: true, ...res.json, usage: res.usage, model: res.model }
}
