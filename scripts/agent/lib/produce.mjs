/**
 * produce() — the shared generation pipeline: research → write → critique →
 * fact-check → cover + voice → queue for review (ClickUp) or auto-publish.
 * Used by both the scheduled run and on-demand ClickUp requests.
 */
import { analyze } from '../analyst.mjs'
import { writeArticle } from '../writer.mjs'
import { critique } from '../critic.mjs'
import { factCheck } from '../factcheck.mjs'
import { generateCover, generateVoice } from '../artdirector.mjs'
import { publish } from '../publisher.mjs'
import { estimateCost } from './ai.mjs'
import { slugify, wordCount } from './article.mjs'
import { notify } from './notify.mjs'
import { clickupConfigured, createTask } from './clickup.mjs'
import { savePending } from './pending.mjs'

const log = (...a) => console.log(...a)

export async function produce(pick) {
    let spend = 0
    const a = await analyze(pick, { reasoningEffort: 'medium' })
    if (!a.ok) { await notify(`⚠️ Research failed for "${pick.title}". No post.`); log(`analyst failed: ${a.error}`); return false }
    spend += estimateCost(a.model, a.usage || {}).usd

    const w = await writeArticle(a)
    if (!w.ok) { log(`writer failed: ${w.error}`); return false }
    spend += estimateCost(w.model, w.usage || {}).usd
    const c = await critique(w.article, a)
    spend += estimateCost(c.model || '', c.usage || {}).usd
    const article = c.article
    const f = await factCheck(article, a)
    spend += estimateCost(f.model || '', f.usage || {}).usd
    log(`article: "${article.title}" · ${wordCount(article)} words${c.improved ? ` · critic ${c.score}/100` : ''} · factcheck ${f.verdict}`)

    const slug = slugify(article.title)
    const [cover, voice] = await Promise.all([generateCover(article, { slug }), generateVoice(article, { slug })])
    spend += 0.07
    const costStr = `$${(spend + 0.67).toFixed(2)}`

    if (clickupConfigured()) {
        savePending(slug, { article, brief: a, image: cover.image, audio: voice.audio })
        const flag = f.verdict === 'pass' ? '' : ' (⚠ check facts)'
        const preview = `*${article.description}*\n\n${article.directAnswer || ''}\n\n— ${wordCount(article)} words · stream: ${pick.stream || 'on-demand'} · cost ≈ ${costStr} · factcheck: ${f.verdict}\n\n✅ Publish: mark this task **Complete**\n❌ Reject: delete this task`
        const id = await createTask(`📝 REVIEW${flag}: ${article.title}`, preview, { slug })
        log(`queued for review (clickup task ${id || '?'})`)
        return true
    }

    const p = publish(article, a, { image: cover.image, audio: voice.audio })
    if (!p.ok) { await notify(`⚠️ Publish blocked: ${p.error}`); return false }
    await notify(`✅ Published: "${article.title}"\n${wordCount(article)} words · ${costStr} · /blog/${slug}`)
    log(`PUBLISHED → ${p.file}`)
    return true
}
