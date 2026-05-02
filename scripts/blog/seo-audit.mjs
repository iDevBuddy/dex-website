import { getPipelineOptions, modeDetails, readPipelineJson, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'

function words(value = '') {
    return String(value).split(/\s+/).filter(Boolean)
}

export function auditSeo(article) {
    const frontmatter = article.frontmatter || {}
    const body = article.body || ''
    const checks = [
        ['metaTitleLength', String(frontmatter.metaTitle || frontmatter.title || '').length <= 62 && String(frontmatter.metaTitle || frontmatter.title || '').length >= 25, 12],
        ['metaDescriptionLength', String(frontmatter.metaDescription || frontmatter.description || '').length <= 155 && String(frontmatter.metaDescription || frontmatter.description || '').length >= 70, 12],
        ['cleanSlug', /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frontmatter.slug || ''), 10],
        ['singleH1HandledByTemplate', !/^#\s+/m.test(body), 8],
        ['semanticHeadings', (body.match(/^##\s+/gm) || []).length >= 4, 10],
        ['faqReady', Array.isArray(frontmatter.faqs) && frontmatter.faqs.length >= 2, 10],
        ['sourcesReady', Array.isArray(frontmatter.sources) && frontmatter.sources.length >= 2, 10],
        ['imageAlt', String(frontmatter.imageAlt || '').length >= 20, 8],
        ['internalLinks', /\/blog\/|\/#services|\/#contact/.test(JSON.stringify(frontmatter) + body), 8],
        ['notThinContent', words(body).length >= 700, 12],
    ]
    const score = checks.reduce((sum, [, passed, points]) => sum + (passed ? points : 0), 0)
    const minScore = Number(process.env.SEO_AUDIT_MIN_SCORE || 82)
    return {
        score,
        minScore,
        passed: score >= minScore,
        checks: checks.map(([name, passed, points]) => ({ name, passed, points })),
        tool: process.env.SEO_AUDIT_SKILL || 'local_seo_audit_bridge',
        notes: score >= minScore
            ? 'SEO audit passed.'
            : 'SEO audit needs improvement before automatic publishing.',
    }
}

export async function runSeoAudit(articleArg, options = getPipelineOptions()) {
    const article = articleArg || await readPipelineJson('draft-article.json', null, options)
    if (!article) throw new Error('No draft article found.')
    const report = auditSeo(article)
    article.frontmatter.seoAuditScore = report.score
    article.frontmatter.seoAuditPassed = report.passed
    article.frontmatter.seoAuditTool = report.tool
    await writePipelineJson('seo-audit-report.json', report, options)
    await writePipelineJson('draft-article.json', article, options)
    log('seo_audit_completed', { score: report.score, passed: report.passed, ...modeDetails(options) })
    return { article, report }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runSeoAudit(undefined, getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
