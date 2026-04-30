import path from 'node:path'
import { dataDir, readPosts, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

export async function internalLinker() {
    const posts = await readPosts()
    const suggestions = posts.map((post) => {
        const related = posts
            .filter((candidate) => candidate.slug !== post.slug)
            .filter((candidate) => candidate.data.category === post.data.category)
            .slice(0, 3)
            .map((candidate) => ({ title: candidate.data.title, url: `/blog/${candidate.data.slug || candidate.slug}` }))
        return { slug: post.data.slug || post.slug, suggestions: related }
    })
    await writeJson(path.join(dataDir, 'internal-link-suggestions.json'), suggestions)
    log('internal_links_suggested', { posts: suggestions.length })
    return suggestions
}

if (import.meta.url === `file://${process.argv[1]}`) {
    internalLinker().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
