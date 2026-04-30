import path from 'node:path'
import { dataDir, readJson, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'
import { syncRefreshTask } from './lib/notion-dashboard.mjs'

export async function recommendUpdates() {
    const report = await readJson(path.join(dataDir, 'performance-report.json'), { posts: [] })
    const recommendations = report.posts.map((post) => {
        let action = 'keep as is'
        let problem = 'Not enough live performance data yet.'
        if (post.impressions > 100 && post.ctr < 0.01) {
            action = 'rewrite title and improve meta description'
            problem = 'High impressions with low CTR.'
        } else if (post.averagePosition > 12 && post.impressions > 50) {
            action = 'expand section and add internal links'
            problem = 'Ranking outside first page with some demand.'
        } else if (post.pageviews > 0 && post.engagementTime < 20) {
            action = 'improve introduction and practical examples'
            problem = 'Low engagement time.'
        }
        return { ...post, problem, recommendedFix: action, priority: action === 'keep as is' ? 'Low' : 'High' }
    })
    await writeJson(path.join(dataDir, 'refresh-recommendations.json'), recommendations)
    for (const item of recommendations.filter((rec) => rec.priority === 'High')) {
        await syncRefreshTask({
            blogUrl: item.url,
            problem: item.problem,
            recommendedFix: item.recommendedFix,
            priority: item.priority,
            status: 'Needs Review',
        })
    }
    log('refresh_recommendations_created', { count: recommendations.length })
    return recommendations
}

if (import.meta.url === `file://${process.argv[1]}`) {
    recommendUpdates().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
