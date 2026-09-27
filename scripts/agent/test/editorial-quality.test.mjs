import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { validateEvidence } from '../analyst.mjs'
import { qualityIssues, TOPICS, selectTopic, formatSourceLinks, validPlannedTopic } from '../lib/editorial.mjs'
import { postMetadata } from '../lib/registry.mjs'
import { buildMarkdown } from '../lib/article.mjs'
import { normalizeCover, coverPrompt, usableCover } from '../artdirector.mjs'
import { chat, safeJson } from '../lib/ai.mjs'
import { documentHtml } from '../../blog/prerender.mjs'
import { parseFrontmatter } from '../../blog/lib/content.mjs'

const material = [{ url: 'https://docs.example/a', text: 'The production webhook is registered when you publish the workflow.' }, { url: 'https://docs.example/b', text: 'The response node controls the HTTP response to an incoming webhook request.' }]
const brief = () => ({ verified: true, evidence: [
    { claim: 'Publishing registers the webhook.', url: material[0].url, quote: 'production webhook is registered when you publish' },
    { claim: 'The response node handles replies.', url: material[1].url, quote: 'response node controls the HTTP response' },
    { claim: 'The request comes from a webhook.', url: material[1].url, quote: 'to an incoming webhook request.' },
] })
test('research requires literal evidence from two retrieved sources', () => {
    assert.equal(validateEvidence(brief(), material), true)
    const invented = brief(); invented.evidence[0].quote = 'This product guarantees a booking'; assert.equal(validateEvidence(invented, material), false)
    const injected = brief(); injected.evidence[0].url = 'https://invented.example'; assert.equal(validateEvidence(injected, material), false)
    assert.equal(validateEvidence({ ...brief(), verified: false }, material), false)
})
test('thin or generic output is held, even with headings', () => {
    const issues = qualityIssues({ body: '## Benefits\nAutomation saves time.', description: 'short', faqs: [] }, { brief: { sources: [] } })
    assert.ok(issues.length >= 7)
})
test('JSON parsing preserves fenced code inside the article body', () => {
    const article = { body: '## Example\n```json\n{"status":"pending"}\n```' }
    assert.deepEqual(safeJson(JSON.stringify(article)), article)
    assert.deepEqual(safeJson('```json\n' + JSON.stringify(article) + '\n```'), article)
})
test('source citation formatting preserves code and does not invent sources', () => {
    const text = 'Claim (https://docs.example/a). Unknown (https://fake.example).\n```text\n (https://docs.example/a)\n```'
    const result = formatSourceLinks(text, [{ url: 'https://docs.example/a', text: '# Webhook' }])
    assert.match(result, /\[Webhook documentation\]\(https:\/\/docs.example\/a\)/)
    assert.ok(result.includes('Unknown (https://fake.example)'))
    assert.ok(result.includes('```text\n (https://docs.example/a)\n```'))
})
test('evidence comparison ignores formatting but still rejects changed facts', () => {
    const formatted = [{ ...material[0], text: 'The **production webhook** is registered when you publish the workflow.' }, material[1]]
    assert.equal(validateEvidence(brief(), formatted), true)
    const changed = brief(); changed.evidence[0].quote = 'production webhook is registered when you unpublish'
    assert.equal(validateEvidence(changed, formatted), false)
})
test('quality gate accepts complete structure and rejects invented link destinations', () => {
    const article = { body: '## Setup\n1. Check the input.\n## Illustrative example\n## Failure tests\n## Acceptance checklist\n' + 'implementation '.repeat(710) + '\n[guide](/blog/guide) and [services](/capabilities). [source](https://docs.example/a)', description: 'A practical workflow with clear inputs, expected outputs, verification and human review before processing requests.', faqs: [{ question: 'a', answer: 'b' }, { question: 'c', answer: 'd' }], coverConcept: 'A review desk', imageAlt: 'Cards beside a review desk' }
    const research = { brief: { sources: ['https://docs.example/a'] } }
    assert.deepEqual(qualityIssues(article, research, [{ slug: 'guide' }]), [])
    article.body += '\n[fake](https://invented.example/source) [missing](/blog/missing)'
    assert.ok(qualityIssues(article, research, [{ slug: 'guide' }]).some(x => /not retrieved/.test(x)))
    assert.ok(qualityIssues(article, research, [{ slug: 'guide' }]).some(x => /not in the site/.test(x)))
})
test('topic IDs survive frontmatter and prevent another article on the same brief', () => {
    const { markdown, slug } = buildMarkdown({ title: 'A "quoted" title', body: '## Example\nBody', description: 'line one\nline two' }, { idea: TOPICS[0], brief: { sources: [] } })
    const post = postMetadata(markdown, slug)
    assert.equal(post.title, 'A "quoted" title')
    assert.equal(post.topicId, TOPICS[0].id)
    assert.notEqual(selectTopic([post]).id, post.topicId)
    assert.equal(selectTopic(TOPICS.map(t => ({ topicId: t.id }))), undefined)
    assert.equal(parseFrontmatter(markdown).data.description, 'line one line two')
})
test('cover prompt uses article-specific objects', () => {
    const prompt = coverPrompt({ coverConcept: 'A restaurant receipt beside a kitchen order rail' })
    assert.match(prompt, /restaurant receipt/)
    assert.match(prompt, /No text/)
})
test('visual review rejects gibberish text and missing or inconclusive checks', () => {
    assert.equal(usableCover({ textFree: true, hasWatermark: false, usableComposition: true }), true)
    assert.equal(usableCover({ textFree: false, hasWatermark: false, usableComposition: true }), false)
    assert.equal(usableCover({ textFree: true, usableComposition: true }), false)
    assert.equal(usableCover(null), false)
})
test('replenished briefs cannot introduce arbitrary sources or duplicate topics', () => {
    const topic = { title: 'A distinctive enquiry workflow for field service teams', angle: 'Design a concrete intake example with required fields, honest acknowledgements and a failure checklist.', sources: TOPICS[0].sources }
    assert.equal(validPlannedTopic(topic, []), true)
    assert.equal(validPlannedTopic({ ...topic, sources: ['https://invented.example', TOPICS[0].sources[0]] }, []), false)
    assert.equal(validPlannedTopic(topic, [{ title: topic.title }]), false)
})
test('cover decoder rejects HTML and undersized raster images', async () => {
    await assert.rejects(normalizeCover(Buffer.from('<html>'.repeat(2000))))
    await assert.rejects(normalizeCover(await sharp({ create: { width: 200, height: 200, channels: 3, background: '#f00' } }).png().toBuffer()))
})
test('actual JPEG bytes are decoded and emitted as a 1280x720 PNG', async () => {
    const raw = Buffer.alloc(1216 * 832 * 3)
    for (let i = 0; i < raw.length; i++) raw[i] = (i * 17 + Math.floor(i / 1216)) % 256
    const jpeg = await sharp(raw, { raw: { width: 1216, height: 832, channels: 3 } }).jpeg().toBuffer()
    const png = await normalizeCover(jpeg), metadata = await sharp(png).metadata()
    assert.equal(metadata.format, 'png'); assert.equal(metadata.width, 1280); assert.equal(metadata.height, 720)
})
test('truncated model output cannot be mistaken for success', async () => {
    const before = globalThis.fetch, key = process.env.NVIDIA_API_KEY
    process.env.NVIDIA_API_KEY = 'test-only-key'
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ finish_reason: 'length', message: { content: '{"body":"partial"}' } }] }) })
    try { const result = await chat({ provider: 'nvidia', model: 'test', json: true, user: 'test', retries: 0 }); assert.equal(result.ok, false); assert.match(result.error, /output budget/) }
    finally { globalThis.fetch = before; if (key === undefined) delete process.env.NVIDIA_API_KEY; else process.env.NVIDIA_API_KEY = key }
})
test('initial HTML has exactly one article canonical and safely escaped metadata/schema', () => {
    const output = documentHtml('<head><title>Home</title><meta name="description" content="home"><link rel="canonical" href="https://www.dexakif.com"></head><div id="root"></div>', { html: '<article>Readable article</article>', seo: { path: '/blog/test', title: 'Title <script>', description: 'A "quote"', robots: 'index,follow', type: 'article', schema: [{ text: '</script><script>bad</script>' }] }, siteSchemas: [] })
    assert.equal((output.match(/rel="canonical"/g) || []).length, 1)
    assert.match(output, /href="https:\/\/dexakif.com\/blog\/test"/)
    assert.match(output, /Title &lt;script&gt;/)
    assert.ok(!output.includes('</script><script>bad'))
    assert.ok(output.includes('<article>Readable article</article>'))
})
test('404 initial HTML is noindex and has no homepage canonical', () => {
    const output = documentHtml('<head><link rel="canonical" href="https://dexakif.com"></head><div id="root"></div>', { html: '<h1>Page not found</h1>', seo: { path: '/404', title: 'Not found', description: '', status: 404, robots: 'noindex,follow', schema: [] }, siteSchemas: [] })
    assert.match(output, /content="noindex,follow"/); assert.ok(!output.includes('rel="canonical"'))
})
