import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildSystemReport } from '../../netlify/functions/_lib/system-report.js'

function command(value) {
    try {
        return execSync(value, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
    } catch {
        return 'unknown'
    }
}

export async function systemReport() {
    const report = buildSystemReport(process.env, {
        currentBranch: command('git rev-parse --abbrev-ref HEAD'),
        latestCommit: command('git rev-parse --short HEAD'),
        sitemapStatus: fs.existsSync('public/sitemap.xml') ? 'present' : 'generated during build',
        rssStatus: fs.existsSync('public/rss.xml') ? 'present' : 'generated during build',
    })
    console.log(JSON.stringify(report, null, 2))
    return report
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    systemReport().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
