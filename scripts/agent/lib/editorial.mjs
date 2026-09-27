import { chat, NVIDIA_BIG } from './ai.mjs'
import { isDuplicate } from './registry.mjs'
import { slugify } from './article.mjs'

// Primary-source briefs seed the schedule; subsequent ideas use only this source catalogue.
const webhook = 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook.md'
const respond = 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.respondtowebhook.md'
const errors = 'https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md'
const ocr = 'https://docs.mistral.ai/studio/document-processing/basic_ocr'
const ocrModel = 'https://docs.mistral.ai/models/ocr-4-0'
export const TOPICS = [
    { id: 'n8n-service-enquiry-intake', title: 'Build a service enquiry intake workflow with n8n webhooks', angle: 'A website enquiry becomes a validated review item. Show an illustrative payload, validation branches and a test checklist; never claim a booking was confirmed.', sources: [webhook, respond, errors] },
    { id: 'n8n-reliable-webhook-responses', title: 'Stop a failed automation from telling customers it succeeded', angle: 'Design honest webhook responses for a quote-request form. Distinguish accepted, rejected and completed; show expected HTTP responses and failure tests.', sources: [webhook, respond, errors] },
    { id: 'n8n-failed-lead-alerts', title: 'Design a failure-review queue for missed service enquiries', angle: 'Set up an error workflow and a human owner. Explain what to log, what to redact, and why an alert is not a recovered enquiry.', sources: [errors, webhook, respond] },
    { id: 'ocr-invoice-review-pilot', title: 'Plan an invoice extraction pilot with human review', angle: 'Separate OCR extraction from invoice approval. Use an explicitly illustrative invoice field mapping and acceptance checklist; no invented API parameters, accuracy or ROI.', sources: [ocr, ocrModel] },
    { id: 'n8n-test-to-production-handoff', title: 'Move a service enquiry webhook from testing to production', angle: 'A handoff checklist: test vs production URLs, publication, credentials, execution inspection and rollback ownership.', sources: [webhook, respond, errors] },
    { id: 'n8n-quote-request-validation', title: 'Validate quote requests before they reach your team', angle: 'Design required-field and format checks for an illustrative service form. Explain accepted vs rejected data, safe messages, and failure cases without inventing product nodes.', sources: [webhook, respond, errors] },
    { id: 'ocr-search-citation-checks', title: 'Keep document search answers traceable to the original page', angle: 'Design an OCR-to-search handoff contract and human verification checklist. Clearly label proposed architecture; extraction is not verified truth.', sources: [ocr, ocrModel] },
    { id: 'n8n-webhook-launch-checklist', title: 'A launch checklist for customer-facing n8n webhooks', angle: 'Acceptance review covering authentication, bad payloads, duplicate submissions, provider failure and truthful success messages. Identify controls requiring custom implementation.', sources: [webhook, respond, errors] },
].map(topic => ({ ...topic, topicId: topic.id, stream: 'practical-workflows', url: topic.sources[0] }))

export function selectTopic(known) {
    return TOPICS.find(topic => !known.some(p => p.topicId === topic.id))
}

export function validPlannedTopic(topic, known) {
    const allowed = new Set(TOPICS.flatMap(t => t.sources))
    return typeof topic?.title === 'string' && topic.title.length >= 20 && topic.title.length <= 90
        && typeof topic.angle === 'string' && topic.angle.length >= 60
        && Array.isArray(topic.sources) && new Set(topic.sources).size >= 2 && topic.sources.length <= 3
        && topic.sources.every(url => allowed.has(url)) && !isDuplicate(topic.title, known)
        && !known.some(p => p.topicId === slugify(topic.title))
}

export async function nextTopic(known, model = NVIDIA_BIG) {
    const seed = TOPICS.find(t => !known.some(p => p.topicId === t.id) && !isDuplicate(t.title, known))
    if (seed) return seed
    const result = await chat({ provider: 'nvidia', model, json: true, maxTokens: 3500, timeoutMs: 90000, retries: 0, temperature: 0.4,
        system: 'You are a practical implementation editor. Return one genuinely different article brief as JSON, or null if nothing useful remains. No invented product announcements or case-study results.',
        user: `Existing topics (do not rephrase or repeat): ${JSON.stringify(known.map(p => ({ title: p.title, topicId: p.topicId })))}\nAvailable primary documentation and earlier brief examples: ${JSON.stringify(TOPICS)}\nPropose a distinct service-business workflow, with its reader question, a concrete illustrative example and acceptance tests in the angle. Select exactly 2-3 URLs from this catalogue; never invent URLs. Return {"title":"...","angle":"...","sources":["..."]}. The source content will be fetched and validated separately; if it cannot support the idea, the draft will be held.` })
    if (!result.ok || !validPlannedTopic(result.json, known)) throw new Error('No distinct primary-source brief available; editorial review required')
    return { ...result.json, topicId: slugify(result.json.title), stream: 'practical-workflows', url: result.json.sources[0] }
}

export function formatSourceLinks(body, material = []) {
    // Some models cite an exact retrieved URL in parentheses. Turn that into a
    // clickable citation without changing facts, accepting invented URLs or touching code.
    return String(body || '').split(/(```[\s\S]*?```)/g).map(part => {
        if (part.startsWith('```')) return part
        for (const source of material) {
            const heading = source.text?.match(/^#\s+(.+)$/m)?.[1]?.replace(/[\[\]]/g, '') || new URL(source.url).hostname
            part = part.replaceAll(` (${source.url})`, ` [${heading} documentation](${source.url})`)
        }
        return part
    }).join('')
}

export function qualityIssues(article, research, known = []) {
    const issues = [], body = String(article?.body || '')
    if (body.split(/\s+/).filter(Boolean).length < 700) issues.push('Body needs at least 700 useful words')
    if ((body.match(/^## /gm) || []).length < 4) issues.push('Missing a useful section structure')
    if (!/^\d+\.\s/m.test(body)) issues.push('Missing concrete numbered implementation steps')
    if (!/\b(example|illustrative|sample)\b/i.test(body)) issues.push('Missing an explicitly labelled example')
    if (!/\b(test|verify|validation|checklist)\b/i.test(body) || !/\b(fail|risk|limit|error)/i.test(body)) issues.push('Missing verification or failure handling')
    if (!Array.isArray(article?.faqs) || article.faqs.length < 2) issues.push('Missing useful FAQs')
    if (String(article?.description || '').length < 70) issues.push('Meta description is too thin')
    const allowed = new Set(['/capabilities', ...known.filter(p => p.slug && !p.redirectTo).map(p => `/blog/${p.slug}`)])
    const local = [...body.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)].map(m => m[1])
    if (new Set(local.filter(url => allowed.has(url))).size < 2) issues.push('Add two relevant contextual internal links')
    if (local.some(url => !allowed.has(url))) issues.push('Internal link target is not in the site catalogue')
    const allowedSources = new Set(research?.brief?.sources || [])
    const external = [...body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].map(m => m[1])
    if (!external.some(url => allowedSources.has(url))) issues.push('Link factual guidance to an actual research source')
    if (external.some(url => !allowedSources.has(url))) issues.push('An external citation was not retrieved for this brief')
    if (!article?.coverConcept || !article?.imageAlt) issues.push('Missing topic-specific cover concept or descriptive alt text')
    return issues
}
