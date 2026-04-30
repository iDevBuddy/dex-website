import path from 'node:path'
import { dataDir, readPosts, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

export async function tonePerformance() {
    const posts = await readPosts()
    const tones = {}
    for (const post of posts) {
        const tone = post.data.tone || 'Unspecified'
        tones[tone] ||= { tone, posts: 0, clicks: 0, impressions: 0 }
        tones[tone].posts += 1
    }
    const result = Object.values(tones)
    await writeJson(path.join(dataDir, 'tone-performance.json'), result)
    log('tone_performance_created', { tones: result.length })
    return result
}

if (import.meta.url === `file://${process.argv[1]}`) {
    tonePerformance().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
