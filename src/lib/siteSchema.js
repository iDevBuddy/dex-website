/**
 * Site-wide JSON-LD structured data — establishes the DEX entity for Google
 * (Knowledge Graph, rich results) and AI search engines (AI Overviews,
 * ChatGPT, Perplexity, Claude). Injected once on every page; persists across
 * client-side route changes (marked data-site-schema so setSeo doesn't strip it).
 */
const SITE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL) || 'https://dexakif.com'

const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE}/#organization`,
    name: 'DEX by Akif Saeed',
    alternateName: 'DEX',
    url: SITE,
    description: 'DEX builds production-grade AI agents and business automation — voice agents, chatbots, decision-intelligence agents, and workflow automation that run operations 24/7 for service businesses and enterprises.',
    founder: { '@type': 'Person', name: 'Akif Saeed' },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    knowsAbout: [
        'AI agents', 'AI agent development', 'voice AI agents', 'conversational AI', 'chatbots',
        'workflow automation', 'business process automation', 'AI automation', 'multi-agent systems',
        'decision intelligence', 'RAG', 'LLM integration', 'Claude', 'OpenAI', 'AI for business',
    ],
    slogan: 'AI agents that quietly run your business.',
}

const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: 'DEX by Akif Saeed',
    description: 'AI agent development and business automation services, plus practical guides on AI agents, automation, and Claude/OpenAI for business.',
    publisher: { '@id': `${SITE}/#organization` },
    inLanguage: 'en',
}

const service = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#service`,
    name: 'DEX — AI Agent Development & Business Automation',
    url: SITE,
    description: 'End-to-end AI agent development: voice & call agents, conversational/chat agents, decision-intelligence agents, multi-agent systems, workflow automation, and vision/data agents — built on production-grade, vendor-agnostic stacks.',
    provider: { '@id': `${SITE}/#organization` },
    areaServed: { '@type': 'Place', name: 'Worldwide' },
    serviceType: 'AI agent development',
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'AI agent & automation services',
        itemListElement: [
            'Voice & call agents', 'Conversational & chat agents', 'Decision intelligence agents',
            'Multi-agent systems', 'Workflow automation agents', 'Vision & data agents',
        ].map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
    },
}

/** Build a FAQPage schema from [{question, answer}]. */
export function faqPageSchema(faqs = []) {
    const items = (faqs || []).filter((f) => f && f.question && f.answer)
    if (!items.length) return null
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
    }
}

/** Build a BreadcrumbList schema from [{name, url}]. */
export function breadcrumbSchema(crumbs = []) {
    if (!crumbs.length) return null
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.url?.startsWith('http') ? c.url : `${SITE}${c.url || ''}`,
        })),
    }
}

/** Inject the persistent site entity schema into <head> exactly once. */
export function injectSiteSchema() {
    if (typeof document === 'undefined') return
    if (document.querySelector('script[data-site-schema="true"]')) return
    for (const obj of [organization, website, service]) {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.dataset.siteSchema = 'true'
        s.textContent = JSON.stringify(obj)
        document.head.appendChild(s)
    }
}
