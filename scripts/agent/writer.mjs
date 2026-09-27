/**
 * Writer — turns a cited research brief into a complete, GEO-structured
 * editorial article in the DEX voice. Grounded: uses ONLY facts from the
 * brief. Returns a structured article object (fail-soft).
 */
import { chat, NVIDIA_BIG } from './lib/ai.mjs'

const VOICE = `You write for DEX — a premium AI-automation agency. Voice: editorial, sharp, business-owner-first, concrete, no hype, no fluff, no "in today's fast-paced world" filler. Short paragraphs. You explain what a thing means for someone running a business and exactly how they'd use it. You are honest about limits.`

const GEO = `Structure for AI answer engines (Google AI Overviews / ChatGPT): lead with a direct, self-contained answer; use clear question-style H2/H3 headings; include a comparison or steps where useful; keep claims specific and source-backed.`

export async function writeArticle(data, { model = process.env.DRAFT_MODEL || NVIDIA_BIG } = {}) {
    const b = data?.brief
    if (!b) return { ok: false, error: 'no brief' }

    const prompt = `${VOICE}\n\n${GEO}\n\nWrite a complete article from this verified research brief. Use ONLY facts present in the brief — do not invent anything. Be precise only where supported. Never invent numbers, pricing, benchmarks, APIs or first-hand experience. This is a proposed implementation guide, not a tested case study. Explain who should use it and who should not. Include prerequisites, numbered implementation steps with inputs and expected outputs, an explicitly illustrative sample payload or decision table, failure/recovery cases, and an acceptance checklist. Separate documented features from your design recommendations. Place at least two relevant internal links naturally inside explanatory paragraphs, choosing only from the INTERNAL LINKS list. Cite supplied primary URLs beside factual product claims. Do not copy source text. Avoid filler, generic benefits, promotional slogans and forced contrarian takes.\n\nTOPIC: ${data.idea?.title}\nANGLE: ${data.idea?.angle || ''}\n\nBRIEF:\n${JSON.stringify(b, null, 2)}\n\nINTERNAL LINKS:\n${JSON.stringify(data.internalLinks || [])}\n\nReturn ONLY JSON:\n{\n  "title": "specific, compelling, <70 chars",\n  "description": "meta description ~150 chars",\n  "category": "AI Agents" | "AI Automation" | "Business Automation",\n  "tags": ["3-5 tags"],\n  "directAnswer": "2-3 sentence self-contained answer (GEO lift target)",\n  "keyTakeaways": ["4-5 crisp takeaways"],\n  "body": "full article in MARKDOWN: ## question-style H2 headings, short paras, a markdown table if useful, a concrete implementation and verification section. 900-1400 useful words. No H1 (title is separate). Do NOT include FAQ or Sources — those are separate fields.",\n  "faqs": [{"question":"","answer":""}],\n  "coverConcept": "concrete visual scene tied to this workflow, objects and composition, no abstract glass/data-node cliche",\n  "imageAlt": "one sentence describing that illustration, not keyword stuffing",\n  "businessProblem": "one line: the problem this addresses",\n  "directBusinessUse": "one line: concrete way a business uses it"\n}`

    const res = await chat({
        provider: 'nvidia', model, reasoningEffort: 'low',
        timeoutMs: 210000, retries: 1,
        json: true, temperature: 0.4, maxTokens: 10000,
        system: 'You are a senior editorial writer. Return only valid JSON.',
        user: prompt,
    })
    if (!res.ok || !res.json?.title || !res.json?.body) return { ok: false, error: res.error || 'writer returned incomplete article' }
    return { ok: true, article: res.json, usage: res.usage, model: res.model }
}
