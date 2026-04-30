import path from 'node:path'
import { dataDir, readPosts, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'

export async function clusterManager() {
    const posts = await readPosts()
    const clusters = {}
    for (const post of posts) {
        const category = post.data.category || 'AI Automation'
        clusters[category] ||= {
            cluster: category,
            pillarPost: null,
            supportingPosts: [],
            missingPosts: [],
            clusterScore: 0,
        }
        if (!clusters[category].pillarPost) clusters[category].pillarPost = `/blog/${post.data.slug || post.slug}`
        else clusters[category].supportingPosts.push(`/blog/${post.data.slug || post.slug}`)
    }
    for (const cluster of Object.values(clusters)) {
        cluster.clusterScore = Math.min(100, 30 + cluster.supportingPosts.length * 15)
        if (cluster.supportingPosts.length < 3) cluster.missingPosts.push(`Add more supporting posts for ${cluster.cluster}`)
    }
    await writeJson(path.join(dataDir, 'topic-clusters.json'), Object.values(clusters))
    log('topic_clusters_updated', { clusters: Object.keys(clusters).length })
    return clusters
}

if (import.meta.url === `file://${process.argv[1]}`) {
    clusterManager().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
