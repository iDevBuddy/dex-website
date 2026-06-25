/**
 * Writer — turns a cited research brief into a complete, GEO-structured
 * editorial article in the DEX voice. Grounded: uses ONLY facts from the
 * brief. Returns a structured article object (fail-soft).
 */
import { chat, NVIDIA_BIG, GEMMA } from './lib/ai.mjs'

const VOICE = `You write for DEX — a premium AI-automation agency. Voice: editorial, sharp, business-owner-first, concrete, no hype, no fluff, no "in today's fast-paced world" filler. Short paragraphs. You explain what a thing means for someone running a business and exactly how they'd use it. You are honest about limits.`

const GEO = `Structure for AI answer engines (Google AI Overviews / ChatGPT): lead with a direct, self-contained answer; use clear question-style H2/H3 headings; include a comparison or steps where useful; keep claims specific and source-backed.`

export async function writeArticle(data, { model = process.env.DRAFT_MODEL || NVIDIA_BIG } = {}) {
    const b = data?.brief
    if (!b) return { ok: false, error: 'no brief' }

    const prompt = `${VOICE}\n\n${GEO}\n\nWrite a complete article from this verified research brief. Use ONLY facts present in the brief — do not invent anything. Be specific (numbers, versions, pricing, names). Surface the contrarian take honestly.\n\nTOPIC: ${data.idea?.title}\nANGLE: ${data.idea?.angle || ''}\n\nBRIEF:\n${JSON.stringify(b, null, 2)}\n\nReturn ONLY JSON:\n{\n  "title": "specific, compelling, <70 chars",\n  "description": "meta description ~150 chars",\n  "category": "AI Agents" | "AI Automation" | "Business Automation",\n  "tags": ["3-5 tags"],\n  "directAnswer": "2-3 sentence self-contained answer (GEO lift target)",\n  "keyTakeaways": ["4-5 crisp takeaways"],\n  "body": "full article in MARKDOWN: ## question-style H2 headings, short paras, a markdown table if useful, a clear 'What this means for your business' section. 700-1000 words. No H1 (title is separate). Do NOT include FAQ or Sources — those are separate fields.",\n  "faqs": [{"question":"","answer":""}],\n  "businessProblem": "one line: the problem this addresses",\n  "directBusinessUse": "one line: concrete way a business uses it"\n}`

    const res = await chat({
        provider: 'nvidia', model, reasoningEffort: 'low',
        timeoutMs: 150000, retries: 1,
        fallback: { provider: 'gemma', model: GEMMA },
        json: true, temperature: 0.6, maxTokens: 6000,
        system: 'You are a senior editorial writer. Return only valid JSON.',
        user: prompt,
    })
    if (!res.ok || !res.json?.title || !res.json?.body) return { ok: false, error: res.error || 'writer returned incomplete article' }
    return { ok: true, article: res.json, usage: res.usage, model: res.model }
}
