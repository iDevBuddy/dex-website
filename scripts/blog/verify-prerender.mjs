import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { readPosts } from './lib/content.mjs'
import { SITE_URL } from '../../shared/site.mjs'

const posts = await readPosts({ includeRedirects: true })
const redirects = await readFile('dist/_redirects', 'utf8')
const sitemap = await readFile('dist/sitemap.xml', 'utf8')
for (const { slug, data } of posts) {
    if (data.redirectTo) {
        assert.ok(redirects.includes(`/blog/${slug} /blog/${data.redirectTo} 301!`))
        assert.ok(!sitemap.includes(`<loc>${SITE_URL}/blog/${slug}</loc>`))
        continue
    }
    const html = await readFile(`dist/blog/${slug}/index.html`, 'utf8')
    assert.match(html, /<article[ >]/)
    assert.match(html, /class="blog-prose"/)
    assert.match(html, /<h1[ >]/)
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1)
    assert.ok(html.includes(`href="${SITE_URL}/blog/${slug}"`))
    assert.ok(html.includes('"@type":"BlogPosting"'))
    assert.ok(html.includes('content="article"'))
    assert.ok(!html.includes('https://www.dexakif.com'))
}
const blog = await readFile('dist/blog/index.html', 'utf8')
assert.match(blog, /Practical AI automation playbooks/)
assert.match(blog, /AI Automation Blog \| DEX/)
const missing = await readFile('dist/404.html', 'utf8')
assert.match(missing, /noindex,follow/)
assert.ok(!missing.includes('rel="canonical"'))
assert.ok(!sitemap.includes('https://www.'))
console.log(`Verified initial HTML, schema, canonical, sitemap and redirects for ${posts.length} article records.`)
