import { adsenseReadiness } from './lib/adsense-readiness.mjs'
import { getPipelineOptions, writePipelineJson } from './lib/cli.mjs'
import { log } from './lib/logger.mjs'
import { syncPerformanceReport } from './lib/notion-dashboard.mjs'
import { notifySlack } from './lib/slack.mjs'
import { fileURLToPath } from 'node:url'

export async function adsenseCheck(options = {}) {
    const report = await adsenseReadiness()
    await writePipelineJson('adsense-readiness.json', report, options)
    log('adsense_readiness_score', report)
    if (!options.dryRun) {
        await syncPerformanceReport({
            name: 'AdSense Readiness Report',
            summary: `AdSense Readiness Score: ${report.score}/100. ${report.ready ? 'Ready for review.' : 'Needs more work before applying.'}`,
            recommendedActions: report.recommendedActions.join('\n'),
        })
        await notifySlack(`AdSense Readiness Score: ${report.score}/100. ${report.ready ? 'Ready for review.' : 'Needs more work before applying.'}`)
    }
    console.log(JSON.stringify(report, null, 2))
    return report
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    adsenseCheck(getPipelineOptions()).catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
