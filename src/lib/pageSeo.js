import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from '../../shared/site.mjs'
import { blogPosts, getPostBySlug, buildBlogPostingSchema, buildFaqSchema } from './blog'
import { breadcrumbSchema } from './siteSchema'
import { trustPages } from './trustPages'

export const pagePaths = () => ['/', '/blog', '/capabilities', ...Object.keys(trustPages).map(k => `/${k}`), ...blogPosts.map(p => `/blog/${p.slug}`)]
export function pageSeo(path) {
    const common = { path, title: SITE_TITLE, description: SITE_DESCRIPTION, type: 'website', robots: 'index,follow', schema: [] }
    if (path === '/') return common
    if (path === '/blog') return { ...common, title: 'AI Automation Blog | DEX by Akif Saeed',
        description: 'Practical guides on AI agents, business automation, workflow systems, and reliable implementations for service businesses.',
        schema: [breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }]), {
            '@context': 'https://schema.org', '@type': 'Blog', '@id': `${SITE_URL}/blog#blog`, name: 'DEX AI Automation Blog',
            publisher: { '@id': `${SITE_URL}/#organization` },
            blogPost: blogPosts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: p.url, datePublished: p.publishedAt })),
        }] }
    if (path === '/capabilities') return { ...common, title: 'AI Agent Development Capabilities | DEX by Akif Saeed', description: 'Explore DEX AI agent development, workflow integrations, technologies, and implementation process.' }
    const trust = trustPages[path.slice(1)]
    if (trust) return { ...common, title: `${trust.title} | DEX by Akif Saeed`, description: trust.description }
    const post = path.startsWith('/blog/') && getPostBySlug(path.slice(6))
    if (post) return { ...common, title: post.metaTitle || `${post.title} | DEX by Akif Saeed`, description: post.metaDescription || post.description,
        image: post.image, type: 'article', robots: post.robots || common.robots,
        schema: [buildBlogPostingSchema(post), buildFaqSchema(post), breadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: post.title, url: path }])] }
    return { ...common, title: 'Page Not Found | DEX by Akif Saeed', description: 'The requested page could not be found.', robots: 'noindex,follow', status: 404 }
}
