import path from 'node:path'
import { dataDir, readPosts, writeJson } from './lib/content.mjs'
import { log } from './lib/logger.mjs'
import { createNotionPage, numberProperty, richTextProperty, titleProperty } from './lib/notion.mjs'

export async function performanceReport() {
    const posts = await readPosts()
    const report = {
        date: new Date().toISOString(),
        sourceStatus: {
            searchConsole: process.env.GOOGLE_CLIENT_EMAIL ? 'configured' : 'missing_credentials',
            ga4: process.env.GA4_PROPERTY_ID ? 'configured' : 'missing_credentials',
        },
        posts: posts.map((post) => ({
            slug: post.data.slug || post.slug,
            title: post.data.title,
            url: `/blog/${post.data.slug || post.slug}`,
            clicks: 0,
            impressions: 0,
            ctr: 0,
            averagePosition: 0,
            pageviews: 0,
            engagementTime: 0,
            audioPlays: 0,
            ctaClicks: 0,
            recommendedAction: 'collect_data',
        })),
    }
    await writeJson(path.join(dataDir, 'performance-report.json'), report)
    await createNotionPage(process.env.NOTION_PERFORMANCE_REPORTS_DB_ID, {
        Date: titleProperty(report.date.slice(0, 10)),
        Summary: richTextProperty('Performance connector scaffold created. Add Google credentials to collect live GSC and GA4 metrics.'),
        'Recommended Actions': richTextProperty('Connect Search Console and GA4 credentials, then run npm run blog:performance.'),
        'Top Blog': richTextProperty(report.posts[0]?.title || 'No posts'),
        'Worst Blog': richTextProperty('Not enough data'),
    })
    log('performance_report_created', { posts: report.posts.length })
    return report
}

if (import.meta.url === `file://${process.argv[1]}`) {
    performanceReport().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
