import fs from 'node:fs/promises'
import path from 'node:path'
import { config } from './lib/config.mjs'
import { ensureBlogDirs, readPosts } from './lib/content.mjs'
import { log } from './lib/logger.mjs'
import { generateImage } from './generate-image.mjs'

function escapeXml(value) {
    return String(value || '').replace(/[<>&'"]/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
    }[char]))
}

export async function generateStaticAssets() {
    await ensureBlogDirs()
    await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true })
    const posts = await readPosts()
    if (posts.length) {
        await generateImage({
            frontmatter: {
                slug: posts[0].data.slug,
                title: posts[0].data.title,
                imageAlt: posts[0].data.imageAlt,
            },
            imagePrompt: `Featured image for ${posts[0].data.title}`,
        })
    }

    const urls = [
        { loc: '/', priority: '1.0' },
        { loc: '/blog', priority: '0.9' },
        { loc: '/about', priority: '0.5' },
        { loc: '/contact', priority: '0.5' },
        { loc: '/privacy', priority: '0.3' },
        { loc: '/terms', priority: '0.3' },
        { loc: '/disclaimer', priority: '0.3' },
        ...posts.map((post) => ({ loc: `/blog/${post.data.slug || post.slug}`, priority: '0.8', lastmod: post.data.updatedAt || post.data.publishedAt })),
    ]

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${escapeXml(config.siteUrl + url.loc)}</loc>${url.lastmod ? `<lastmod>${escapeXml(url.lastmod)}</lastmod>` : ''}<priority>${url.priority}</priority></url>`).join('\n')}\n</urlset>\n`
    await fs.writeFile(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap)

    const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeXml(config.brandName)} AI Automation Blog</title><link>${escapeXml(config.siteUrl)}/blog</link><description>Practical AI automation guides and workflows.</description>${posts.map((post) => `<item><title>${escapeXml(post.data.title)}</title><link>${escapeXml(config.siteUrl)}/blog/${escapeXml(post.data.slug || post.slug)}</link><guid>${escapeXml(config.siteUrl)}/blog/${escapeXml(post.data.slug || post.slug)}</guid><pubDate>${new Date(post.data.publishedAt || Date.now()).toUTCString()}</pubDate><description>${escapeXml(post.data.description)}</description></item>`).join('')}</channel></rss>\n`
    await fs.writeFile(path.join(process.cwd(), 'public', 'rss.xml'), rss)
    await fs.writeFile(path.join(process.cwd(), 'public', 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`)
    log('static_assets_generated', { posts: posts.length })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    generateStaticAssets().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
