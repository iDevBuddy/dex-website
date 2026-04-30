import fs from 'node:fs/promises'
import { readPosts } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

export async function refreshPost(slug = process.argv[2]) {
    if (!slug) throw new Error('Provide a slug: npm run blog:refresh -- ai-authority-blog-engine')
    const posts = await readPosts()
    const post = posts.find((item) => item.slug === slug || item.data.slug === slug)
    if (!post) throw new Error(`Post not found: ${slug}`)
    const marker = `\n\n## Refresh Notes\n\n- Review Search Console queries for low-CTR opportunities.\n- Add recent examples, stronger internal links, and clearer next steps.\n`
    if (!post.body.includes('## Refresh Notes')) {
        await fs.writeFile(post.path, `---\n${Object.entries(post.data).map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : `"${String(value).replaceAll('"', '\\"')}"`}`).join('\n')}\n---\n\n${post.body}${marker}`)
    }
    log('post_refresh_prepared', { slug })
}

if (import.meta.url === `file://${process.argv[1]}`) {
    refreshPost().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
