/**
 * Critic — adversarial editor (gpt-5.5). Reads the draft against the brief,
 * argues against it (what's generic, weak, unsupported, or SEO-thin), then
 * returns a sharper REVISED article. This is the counter-thinking layer.
 * Fail-soft: if it can't improve, returns the original.
 */
import { chat } from './lib/ai.mjs'

export async function critique(article, data, { model = process.env.CRITIC_MODEL || 'gpt-5.5' } = {}) {
    if (!article?.body) return { ok: false, error: 'no article' }

    const prompt = `You are a ruthless editor-in-chief at a premium AI-automation agency. Critique this draft HARD, then rewrite it stronger.\n\nJudge against: (1) every claim must be supported by the brief — cut or soften anything not grounded; (2) kill generic/filler sentences; (3) sharpen the business-owner value and the honest contrarian take; (4) GEO: strong self-contained direct answer, clear question headings, specifics; (5) tighten the prose.\n\nBRIEF (ground truth):\n${JSON.stringify(data?.brief, null, 2)}\n\nDRAFT:\n${JSON.stringify(article, null, 2)}\n\nReturn ONLY JSON:\n{\n  "score": 0-100,\n  "issues": ["the concrete problems you found"],\n  "revised": { ...same shape as the draft (title, description, category, tags, directAnswer, keyTakeaways, body, faqs, businessProblem, directBusinessUse), improved... }\n}`

    const res = await chat({
        provider: 'openai', model, reasoningEffort: 'high',
        fallback: { provider: 'openai', model: 'gpt-5-mini' },
        json: true, temperature: 0.4, maxTokens: 5000,
        system: 'You are a demanding editor. Return only valid JSON with a fully rewritten "revised" article.',
        user: prompt,
    })
    if (!res.ok || !res.json?.revised?.body) {
        return { ok: true, article, score: null, issues: [], improved: false, note: res.error || 'critic could not improve; kept original' }
    }
    return { ok: true, article: res.json.revised, score: res.json.score ?? null, issues: res.json.issues || [], improved: true, usage: res.usage, model: res.model }
}
