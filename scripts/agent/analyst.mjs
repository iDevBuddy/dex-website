/**
 * Analyst — turns one chosen idea into a grounded, cited research brief.
 *
 * Strategy (free, no paid web-search API): pull real content from the idea's
 * own source (the feed summary + the fetched source page), then have the
 * reasoning model (NVIDIA gpt-oss-120b, free) distill it into a structured,
 * source-grounded brief. The model is told to use ONLY the supplied material
 * and to mark verified=false if it is too thin. For on-demand topics with no
 * source URL, it falls back to a knowledge brief (flagged unverified).
 *
 * Fail-soft everywhere: on any failure returns { ok:false }.
 */
import { chat, VERIFY_MODEL, NVIDIA_BIG } from './lib/ai.mjs'
import { fetchPageText } from './lib/feeds.mjs'

const STREAM_FOCUS = {
    'ai-tools': 'A new AI tool for businesses. Capture who makes it, what it does, pricing/availability, who it is for, and the concrete business workflow it improves.',
    'claude-mcp': 'A new Claude capability, skill, or MCP server. Explain what specific task it unlocks and how a business would use Claude for it, step by step.',
    'reddit-pain': 'A real business pain-point. Identify the underlying problem business owners face, then the concrete AI/automation solution: tools, workflow, and realistic outcome.',
}

export async function analyze(idea, { reasoningEffort = 'medium' } = {}) {
    if (!idea || !idea.title) return { ok: false, error: 'no idea provided' }
    const focus = STREAM_FOCUS[idea.stream] || STREAM_FOCUS['ai-tools']

    // Gather real grounding material from the idea's own source.
    const parts = []
    if (idea.summary) parts.push(`Feed summary:\n${idea.summary}`)
    if (idea.url) {
        const page = await fetchPageText(idea.url)
        if (page) parts.push(`Source page content (${idea.url}):\n${page}`)
    }
    const sourceText = parts.join('\n\n').trim()
    const grounded = sourceText.length > 200

    const system = grounded
        ? 'You are a meticulous senior research analyst for a premium AI-automation agency. You NEVER invent facts. Every claim must be supported by the source material provided. You think adversarially about what is hype vs. genuinely useful for business owners.'
        : 'You are a senior research analyst for a premium AI-automation agency. The user requested this specific topic but no source material was retrievable. Write a careful brief from established, well-known facts only; mark verified=false and keep claims general where you are not certain. Never fabricate specific numbers, prices, or dates.'

    const user = [
        `Topic: ${idea.title}`,
        idea.angle ? `Editorial angle: ${idea.angle}` : '',
        '',
        `Task: ${focus}`,
        '',
        grounded
            ? 'Use ONLY the SOURCE MATERIAL below. If a detail is not in it, do not invent it. If the material cannot support a factual article, set verified=false. Capture specific facts, numbers, quotes, dates. Note any contrarian "what others miss" angle.'
            : 'No source material is available. Produce a general, honest brief; set verified=false. Do not fabricate specifics.',
        grounded ? `\nSOURCE MATERIAL:\n${sourceText}` : '',
        '',
        'Return ONLY JSON:',
        '{"verified":true|false,"headline_finding":"","key_facts":["..."],"business_angle":"","contrarian_take":"","risks_or_caveats":["..."],"sources":["url",...]}',
    ].filter(Boolean).join('\n')

    // Truth-critical step → real OpenAI gpt-4.1 (GitHub, free); falls back to
    // the NVIDIA reasoning model if GitHub Models is rate-limited/down.
    const res = await chat({
        provider: 'github', model: VERIFY_MODEL,
        fallback: { provider: 'nvidia', model: NVIDIA_BIG, reasoningEffort },
        json: true, temperature: 0.3, maxTokens: 2800, timeoutMs: 120000, retries: 1,
        system, user,
    })
    if (!res.ok || !res.json) return { ok: false, error: res.error || 'analysis returned no brief' }

    const brief = res.json
    if (!Array.isArray(brief.sources) || !brief.sources.length) brief.sources = idea.url ? [idea.url] : []
    if (!grounded) brief.verified = false

    return {
        ok: true,
        idea,
        brief,
        rawBrief: typeof brief.headline_finding === 'string' ? brief.headline_finding : JSON.stringify(brief),
        citations: brief.sources,
        model: res.model,
        usage: res.usage,
    }
}
