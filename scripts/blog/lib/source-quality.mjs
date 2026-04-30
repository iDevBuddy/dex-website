const trustedDomains = [
    'openai.com',
    'platform.openai.com',
    'microsoft.com',
    'learn.microsoft.com',
    'ibm.com',
    'mckinsey.com',
    'deloitte.com',
    'hbr.org',
    'nist.gov',
    'mit.edu',
    'stanford.edu',
    'harvard.edu',
    'github.com',
    'kaggle.com',
    'developers.google.com',
    'cloud.google.com',
]

function hostname(value = '') {
    try {
        return new URL(value).hostname.replace(/^www\./, '')
    } catch {
        return ''
    }
}

function authorityScore(source = {}) {
    const host = hostname(source.url)
    const trusted = trustedDomains.some((domain) => host === domain || host.endsWith(`.${domain}`))
    const official = /official|documentation|research|report|standard|guide/i.test(`${source.type || ''} ${source.supports || ''}`)
    const organization = String(source.organization || '').trim()
    let score = trusted ? 78 : 35
    if (official) score += 10
    if (organization) score += 6
    if (source.supports && String(source.supports).length > 30) score += 6
    return Math.max(0, Math.min(100, score))
}

function relevanceScore(source = {}, topic = '') {
    const haystack = `${source.title || ''} ${source.organization || ''} ${source.supports || ''} ${source.type || ''}`.toLowerCase()
    const words = String(topic).toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3)
    if (!words.length) return 50
    const hits = words.filter((word) => haystack.includes(word)).length
    return Math.min(100, 45 + Math.round((hits / words.length) * 55))
}

export function scoreSource(source = {}, topic = '') {
    const authority = authorityScore(source)
    const relevance = relevanceScore(source, topic)
    const originality = /research|report|documentation|standard|dataset|repository/i.test(`${source.type || ''} ${source.supports || ''}`) ? 88 : 68
    const trustworthiness = authority
    const directRelation = relevance
    const score = Math.round((authority * 0.35) + (relevance * 0.25) + (originality * 0.15) + (trustworthiness * 0.15) + (directRelation * 0.10))
    return {
        ...source,
        authority,
        relevance,
        originality,
        trustworthiness,
        directRelation,
        authorityScore: Math.max(0, Math.min(100, score)),
    }
}

export function filterQualitySources(sources = [], topic = '', minScore = 75) {
    return sources
        .map((source) => scoreSource(source, topic))
        .filter((source) => source.title && source.url && source.authorityScore >= minScore)
        .sort((a, b) => b.authorityScore - a.authorityScore)
}
