/**
 * Analyst — takes one chosen idea and runs agentic deep research (gpt-5.5 +
 * web_search) into a grounded, cited research brief. This is the "best data"
 * engine. Returns a structured brief; on any failure returns { ok:false }.
 */
import { research, chat, safeJson } from './lib/ai.mjs'

const STREAM_FOCUS = {
    'ai-tools': 'A new AI tool for businesses. Verify it is real and current: who makes it, what it does, pricing/availability, who it is for, and the concrete business workflow it improves. Find at least 2 independent sources.',
    'claude-mcp': 'A new Claude capability, skill, or MCP server. Verify from Anthropic or the official repo. Explain what specific task it unlocks and how a business would use Claude for it, step by step.',
    'reddit-pain': 'A real business pain-point. Identify the underlying problem business owners face, then research the concrete AI/automation solution: tools, workflow, and realistic outcome.',
}

export async function analyze(idea, { reasoningEffort = 'high' } = {}) {
    if (!idea || !idea.title) return { ok: false, error: 'no idea provided' }
    const focus = STREAM_FOCUS[idea.stream] || STREAM_FOCUS['ai-tools']

    const query = [
        `Topic: ${idea.title}`,
        idea.url ? `Lead source: ${idea.url}` : '',
        idea.angle ? `Editorial angle: ${idea.angle}` : '',
        '',
        `Task: ${focus}`,
        '',
        'Do thorough web research. Use only verifiable, recent, reputable sources (prefer official vendor pages, established tech press, and primary repos). If the claim cannot be verified, say so clearly. Capture specific facts, numbers, quotes, dates, and source URLs. Note any contrarian or "what others miss" angle a sharp analyst would surface.',
    ].filter(Boolean).join('\n')

    const r = await research({
        query,
        reasoningEffort,
        system: 'You are a meticulous senior research analyst for a premium AI-automation agency. You never invent facts; every claim is grounded in a real source you found. You think adversarially about what is hype vs. genuinely useful for business owners.',
    })
    if (!r.ok) return { ok: false, error: r.error }

    // structure the prose brief into JSON (cheap mid model), fail-soft to raw text
    const structured = await chat({
        provider: 'openai', model: 'gpt-5-mini',
        fallback: { provider: 'openai', model: 'gpt-4.1-mini' },
        json: true, temperature: 0.2, maxTokens: 1400,
        system: 'You convert a research brief into clean JSON. Do not add facts not present in the brief.',
        user: `From this research brief, return ONLY JSON:\n{"verified":true|false,"headline_finding":"","key_facts":["..."],"business_angle":"","contrarian_take":"","risks_or_caveats":["..."],"sources":["url",...]}\n\nBRIEF:\n${r.text}\n\nKnown source URLs: ${(r.citations || []).join(', ') || 'none'}`,
    })

    const brief = (structured.ok && structured.json) ? structured.json : { headline_finding: r.text.slice(0, 400), key_facts: [], sources: r.citations || [] }
    if (!Array.isArray(brief.sources) || !brief.sources.length) brief.sources = r.citations || []

    return {
        ok: true,
        idea,
        brief,
        rawBrief: r.text,
        citations: r.citations || [],
        model: r.model,
        usage: r.usage,
    }
}
