import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'
import { SITE_URL } from '../../shared/site.mjs'
import { readPosts } from './lib/content.mjs'

const escape = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const json = value => JSON.stringify(value).replace(/</g, '\\u003c')
export function documentHtml(template, { html, seo, siteSchemas }) {
    // Replace the template's page metadata, preserving verification, fonts, stylesheet and script assets.
    let output = template.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/gi, '').replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
    const canonical = SITE_URL + seo.path
    const image = new URL(seo.image || '/blog/images/ai-authority-blog-engine.png', SITE_URL).href
    const meta = `<title>${escape(seo.title)}</title>\n<meta name="description" content="${escape(seo.description)}">\n<meta name="robots" content="${escape(seo.robots)}">\n`
        + (seo.status === 404 ? '' : `<link rel="canonical" href="${escape(canonical)}">\n`)
        + Object.entries({ 'og:title': seo.title, 'og:description': seo.description, 'og:type': seo.type, 'og:url': canonical, 'og:image': image }).map(([key, value]) => `<meta property="${key}" content="${escape(value)}">`).join('\n')
        + Object.entries({ 'twitter:card': 'summary_large_image', 'twitter:title': seo.title, 'twitter:description': seo.description, 'twitter:image': image }).map(([key, value]) => `<meta name="${key}" content="${escape(value)}">`).join('\n')
        + siteSchemas.map(item => `<script type="application/ld+json" data-site-schema="true">${json(item)}</script>`).join('\n')
        + seo.schema.filter(Boolean).map(item => `<script type="application/ld+json" data-blog-schema="true">${json(item)}</script>`).join('\n')
    return output.replace('</head>', `${meta}\n</head>`).replace('<div id="root"></div>', `<div id="root" data-prerendered="true">${html}</div>`)
}

export async function prerender() {
    const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
    try {
        const entry = await server.ssrLoadModule('/src/entry-server.jsx')
        const checks = await server.ssrLoadModule('/scripts/blog/render-checks.jsx')
        checks.verifyRenderer()
        const template = await fs.readFile('dist/index.html', 'utf8')
        const routes = entry.pagePaths()
        const redirects = ['https://www.dexakif.com/* https://dexakif.com/:splat 301!']
        for (const route of [...routes, '/404']) {
            if (!/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(route)) throw new Error('Unsafe generated page path')
            const file = route === '/' ? 'index.html' : route === '/404' ? '404.html' : `${route.slice(1)}/index.html`
            await fs.mkdir(path.dirname(`dist/${file}`), { recursive: true })
            await fs.writeFile(`dist/${file}`, documentHtml(template, entry.render(route)))
            if (route !== '/404' && route !== '/') redirects.push(`${route} /${file} 200!`)
        }
        const posts = await readPosts({ includeRedirects: true })
        const retired = posts.filter(p => p.data.redirectTo)
        for (const post of retired) {
            if (!routes.includes(`/blog/${post.data.redirectTo}`)) throw new Error('Retired article target does not exist')
            redirects.splice(1, 0, `/blog/${post.slug} /blog/${post.data.redirectTo} 301!`)
        }
        await fs.writeFile('dist/_redirects', redirects.join('\n') + '\n')
        console.log(`Prerendered ${routes.length} pages, a noindex 404, and ${retired.length} article redirects.`)
    } finally { await server.close() }
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/prerender.mjs')) await prerender()
