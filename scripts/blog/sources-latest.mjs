import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseFrontmatter } from './lib/content.mjs'
import { selectSourcesForTopic } from './lib/source-selector.mjs'
import { writePipelineJson } from './lib/cli.mjs'

async function latestPostFile() {
    const dir = path.join(process.cwd(), 'content/blog')
    const files = await fs.readdir(dir)
    const posts = []
    for (const file of files.filter((name) => name.endsWith('.md'))) {
        const fullPath = path.join(dir, file)
        const stat = await fs.stat(fullPath)
        posts.push({ file: fullPath, mtime: stat.mtimeMs })
    }
    return posts.sort((a, b) => b.mtime - a.mtime)[0]?.file
}

export async function sourcesLatest({ improve = process.argv.includes('--improve') } = {}) {
    const draftPath = path.join(process.cwd(), 'data/blog/draft-article.json')
    let article = null
    try {
        article = JSON.parse(await fs.readFile(draftPath, 'utf8'))
    } catch {
        const file = await latestPostFile()
        if (file) {
            const parsed = parseFrontmatter(await fs.readFile(file, 'utf8'))
            article = { frontmatter: parsed.data, body: parsed.body }
        }
    }
    if (!article) throw new Error('No draft or published blog post found for source reporting.')
    const frontmatter = article.frontmatter || article
    if (improve) {
        const selection = selectSourcesForTopic({
            topic: frontmatter.title,
            keyword: frontmatter.targetKeyword,
            category: frontmatter.category,
            businessFunction: frontmatter.businessFunction,
            contentPersona: frontmatter.contentPersona,
        })
        frontmatter.sources = selection.sources
        frontmatter.sourcesStatus = selection.sourceStatus
        frontmatter.sourceQualityScore = selection.sourceQualityScore
        frontmatter.sourceNotes = selection.sourceNotes
        article.frontmatter = frontmatter
        await writePipelineJson('draft-article.json', article)
    }
    const report = {
        title: frontmatter.title,
        slug: frontmatter.slug,
        sourcesStatus: frontmatter.sourcesStatus || 'Ready',
        sourceQualityScore: frontmatter.sourceQualityScore || 0,
        sources: Array.isArray(frontmatter.sources) ? frontmatter.sources : [],
    }
    console.log(JSON.stringify(report, null, 2))
    return report
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    sourcesLatest().catch((error) => {
        console.error(error)
        process.exit(1)
    })
}
