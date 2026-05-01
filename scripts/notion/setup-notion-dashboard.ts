import fs from 'node:fs/promises'
import path from 'node:path'

const NOTION_VERSION = '2022-06-28'
const rootDir = process.cwd()

type SelectOption = { name: string; color?: string }
type NotionProperty =
    | { title: object }
    | { rich_text: object }
    | { number: { format?: string } }
    | { url: object }
    | { date: object }
    | { checkbox: object }
    | { select: { options: SelectOption[] } }

type DatabaseSpec = {
    name: string
    envName: string
    properties: Record<string, NotionProperty>
}

function log(message: string, details?: Record<string, unknown>) {
    console.log(JSON.stringify({ ts: new Date().toISOString(), message, ...(details || {}) }))
}

function normalizePageId(value: string) {
    let candidate = value
    try {
        const parsed = new URL(value)
        candidate = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).at(-1) || value)
    } catch {
        candidate = value
    }
    const directMatches = candidate.match(/[0-9a-f]{32}/gi)
    const compactMatches = candidate.replace(/-/g, '').match(/[0-9a-f]{32}/gi)
    const match = directMatches?.at(-1) || compactMatches?.at(-1)
    if (!match) throw new Error('Could not extract a Notion page ID from NOTION_PARENT_PAGE_URL.')
    const id = match
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
}

async function notion(pathname: string, init: RequestInit = {}) {
    const token = process.env.NOTION_API_KEY
    if (!token) throw new Error('Missing NOTION_API_KEY.')
    const response = await fetch(`https://api.notion.com/v1/${pathname}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    })
    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
            throw new Error('Please share the parent Notion page with the AI Blog Engine integration.')
        }
        throw new Error(`Notion API error ${response.status}: ${text}`)
    }
    return data
}

function select(options: string[]): NotionProperty {
    const colors = ['gray', 'brown', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'red']
    return { select: { options: options.map((name, index) => ({ name, color: colors[index % colors.length] })) } }
}

const richText = (): NotionProperty => ({ rich_text: {} })
const title = (): NotionProperty => ({ title: {} })
const number = (): NotionProperty => ({ number: { format: 'number' } })
const url = (): NotionProperty => ({ url: {} })
const date = (): NotionProperty => ({ date: {} })
const checkbox = (): NotionProperty => ({ checkbox: {} })

const databases: DatabaseSpec[] = [
    {
        name: 'Blog Ideas',
        envName: 'NOTION_BLOG_IDEAS_DB_ID',
        properties: {
            Topic: title(),
            Source: select(['Google Trends', 'Google News', 'Reddit', 'Hacker News', 'Product Hunt', 'GitHub', 'Slack', 'Manual', 'Notion']),
            Keyword: richText(),
            'Search Intent': select(['Informational', 'Commercial', 'Transactional', 'Navigational']),
            'Trend Score': number(),
            'SEO Score': number(),
            'Business Value': select(['Low', 'Medium', 'High']),
            Priority: select(['Low', 'Medium', 'High', 'Urgent']),
            Status: select(['New', 'Scored', 'Approved', 'Rejected', 'Drafting', 'Published']),
            'Created Date': date(),
            'Slack Thread': url(),
            Notes: richText(),
        },
    },
    {
        name: 'Blog Drafts',
        envName: 'NOTION_BLOG_DRAFTS_DB_ID',
        properties: {
            Title: title(),
            Slug: richText(),
            Topic: richText(),
            'Target Keyword': richText(),
            'Draft Status': select(['Researching', 'Drafting', 'SEO Review', 'Needs Review', 'Approved', 'Rewrite Needed', 'Rejected', 'Published']),
            'SEO Score': number(),
            'Quality Score': number(),
            'Image Status': select(['Not Started', 'Generating', 'Generated', 'Failed']),
            'Audio Status': select(['Not Started', 'Generating', 'Generated', 'Browser Fallback', 'Failed']),
            'Approval Status': select(['Waiting', 'Approved', 'Rewrite Needed', 'Rejected', 'Published']),
            'Preview URL': url(),
            'Published URL': url(),
            'Slack Thread': url(),
            'Research Notes': richText(),
            'Internal Links': richText(),
            'Slides Status': select(['Not Started', 'Task Created', 'Generating', 'Generated', 'Failed']),
            'Infographic Status': select(['Not Started', 'Task Created', 'Ready for Image Provider', 'Generating', 'Generated', 'Failed']),
            'Asset Brief': richText(),
            'Asset URLs': richText(),
            'Media Recommendations': richText(),
            'Sources Status': select(['Ready', 'Needs Research', 'Missing', 'Approved']),
            'Source Quality Score': number(),
            'Source Notes': richText(),
            'Content Persona': select(['AI Expert', 'Business Automation Expert', 'Hybrid']),
            'Business Function': select(['Finance', 'Security', 'Marketing', 'Sales', 'Operations', 'Customer Support', 'Ecommerce', 'HR', 'Analytics', 'General']),
            'Authority Angle': select(['expert_tricks', 'practical_workflow', 'tool_tutorial', 'case_study', 'trend_analysis', 'awareness', 'solution_guide']),
            'Image Provider Status': select(['Configured', 'Missing Provider', 'Fallback Used', 'Generated', 'Failed']),
            'Publish Ready': checkbox(),
            'Blocking Issues': richText(),
            'Trend Score': number(),
            'Market Sentiment': select(['positive', 'neutral', 'risky']),
            'Recovery Notes': richText(),
            'Created Date': date(),
            'Last Updated': date(),
        },
    },
    {
        name: 'Published Posts',
        envName: 'NOTION_PUBLISHED_POSTS_DB_ID',
        properties: {
            Title: title(),
            URL: url(),
            Slug: richText(),
            'Target Keyword': richText(),
            Category: select(['AI Automation', 'AI Agents', 'Business Automation', 'Workflow Automation', 'AI Tools', 'Lead Generation', 'Ecommerce Automation', 'Tutorials']),
            Tone: select(['Beginner Friendly', 'Expert Guide', 'Business Owner', 'Case Study', 'Listicle', 'Tutorial', 'Checklist']),
            'Date Published': date(),
            'Last Updated': date(),
            Clicks: number(),
            Impressions: number(),
            CTR: number(),
            'Average Position': number(),
            'Performance Score': number(),
            'Recommended Action': richText(),
            Status: select(['Live', 'Needs Refresh', 'Updating', 'Updated', 'Archived']),
        },
    },
    {
        name: 'Refresh Queue',
        envName: 'NOTION_REFRESH_QUEUE_DB_ID',
        properties: {
            'Blog URL': title(),
            Problem: richText(),
            'Recommended Fix': richText(),
            Priority: select(['Low', 'Medium', 'High', 'Urgent']),
            Status: select(['Open', 'Approved', 'In Progress', 'Updated', 'Rejected']),
            'Before Score': number(),
            'After Score': number(),
            'Created Date': date(),
            'Completed Date': date(),
            'Slack Thread': url(),
        },
    },
    {
        name: 'Performance Reports',
        envName: 'NOTION_PERFORMANCE_REPORTS_DB_ID',
        properties: {
            'Report Name': title(),
            Date: date(),
            'Top Blog': richText(),
            'Worst Blog': richText(),
            'Best Topic': richText(),
            'Best Tone': richText(),
            'Total Clicks': number(),
            'Total Impressions': number(),
            'Average CTR': number(),
            'Average Position': number(),
            'Recommended Actions': richText(),
            Summary: richText(),
        },
    },
]

async function listChildDatabases(parentPageId: string) {
    const results: Array<{ id: string; title: string }> = []
    let start_cursor: string | undefined
    do {
        const query = start_cursor ? `?start_cursor=${encodeURIComponent(start_cursor)}` : ''
        const data = await notion(`blocks/${parentPageId}/children${query}`)
        for (const block of data.results || []) {
            if (block.type === 'child_database') {
                results.push({ id: block.id, title: block.child_database?.title || '' })
            }
        }
        start_cursor = data.has_more ? data.next_cursor : undefined
    } while (start_cursor)
    return results
}

async function createDatabase(parentPageId: string, spec: DatabaseSpec) {
    return notion('databases', {
        method: 'POST',
        body: JSON.stringify({
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ type: 'text', text: { content: spec.name } }],
            properties: spec.properties,
        }),
    })
}

async function ensureDatabaseProperties(databaseId: string, spec: DatabaseSpec) {
    const database = await notion(`databases/${databaseId}`)
    const existing = Object.keys(database.properties || {})
    const missing = Object.fromEntries(Object.entries(spec.properties).filter(([name]) => !existing.includes(name)))
    if (!Object.keys(missing).length) return
    log('Adding missing database properties', { name: spec.name, properties: Object.keys(missing) })
    await notion(`databases/${databaseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ properties: missing }),
    })
}

async function ensureDashboardHeading(parentPageId: string) {
    const children = await notion(`blocks/${parentPageId}/children`)
    const hasHeading = (children.results || []).some((block: any) => {
        const text = block[block.type]?.rich_text?.map((item: any) => item.plain_text).join('') || ''
        return text === 'AI Blog Engine Dashboard'
    })
    if (hasHeading) return
    await notion(`blocks/${parentPageId}/children`, {
        method: 'PATCH',
        body: JSON.stringify({
            children: [
                {
                    object: 'block',
                    type: 'heading_1',
                    heading_1: {
                        rich_text: [{ type: 'text', text: { content: 'AI Blog Engine Dashboard' } }],
                    },
                },
            ],
        }),
    })
}

async function updateEnvExample() {
    const envPath = path.join(rootDir, '.env.example')
    const current = await fs.readFile(envPath, 'utf8').catch(() => '')
    const required = [
        'NOTION_API_KEY=',
        'NOTION_PARENT_PAGE_URL=',
        'NOTION_WEBHOOK_SECRET=',
        'NOTION_BLOG_IDEAS_DB_ID=',
        'NOTION_BLOG_DRAFTS_DB_ID=',
        'NOTION_PUBLISHED_POSTS_DB_ID=',
        'NOTION_REFRESH_QUEUE_DB_ID=',
        'NOTION_PERFORMANCE_REPORTS_DB_ID=',
    ]
    const additions = required.filter((line) => !current.includes(line.split('=')[0]))
    if (additions.length) {
        await fs.writeFile(envPath, `${current.trim()}\n${additions.join('\n')}\n`)
    }
}

export async function setupNotionDashboard() {
    const parentUrl = process.env.NOTION_PARENT_PAGE_URL
    if (!parentUrl) throw new Error('Missing NOTION_PARENT_PAGE_URL.')
    const parentPageId = normalizePageId(parentUrl)
    await notion(`pages/${parentPageId}`)
    log('Parent page found', { parentPageId })
    await ensureDashboardHeading(parentPageId)

    const existing = await listChildDatabases(parentPageId)
    const ids: Record<string, string> = {}

    for (const spec of databases) {
        const found = existing.find((database) => database.title === spec.name)
        if (found) {
            log('Existing database found', { name: spec.name, id: found.id })
            ids[spec.envName] = found.id
            await ensureDatabaseProperties(found.id, spec)
        } else {
            log('Creating database', { name: spec.name })
            const created = await createDatabase(parentPageId, spec)
            ids[spec.envName] = created.id
        }
        log(`${spec.name} database ready`, { id: ids[spec.envName] })
    }

    const generated = [
        `NOTION_PARENT_PAGE_URL=${parentUrl}`,
        ...Object.entries(ids).map(([key, value]) => `${key}=${value}`),
    ].join('\n')
    await fs.writeFile(path.join(rootDir, '.env.notion.generated'), `${generated}\n`)
    await updateEnvExample()

    log('Setup complete', ids)
    console.log('\nGenerated Notion database IDs:')
    for (const [key, value] of Object.entries(ids)) console.log(`${key}=${value}`)
    console.log('\nSaved to .env.notion.generated')
    return ids
}

setupNotionDashboard().catch((error) => {
    console.error(error.message || error)
    process.exit(1)
})
