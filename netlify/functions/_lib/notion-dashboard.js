const NOTION_VERSION = '2022-06-28'

export const notionDatabases = {
    ideas: process.env.NOTION_BLOG_IDEAS_DB_ID,
    drafts: process.env.NOTION_BLOG_DRAFTS_DB_ID,
    published: process.env.NOTION_PUBLISHED_POSTS_DB_ID,
    refresh: process.env.NOTION_REFRESH_QUEUE_DB_ID,
    reports: process.env.NOTION_PERFORMANCE_REPORTS_DB_ID,
}

export function title(text) {
    return { title: [{ text: { content: String(text || '').slice(0, 2000) } }] }
}

export function richText(text) {
    return { rich_text: [{ text: { content: String(text || '').slice(0, 2000) } }] }
}

export function number(value) {
    return { number: Number(value) || 0 }
}

export function select(name) {
    return { select: { name: String(name || 'Unknown').slice(0, 100) } }
}

export function status(name) {
    return { status: { name: String(name || 'Not Started').slice(0, 100) } }
}

export function date(value = new Date()) {
    return { date: { start: new Date(value).toISOString() } }
}

export function url(value) {
    return value ? { url: String(value).slice(0, 2000) } : { url: null }
}

async function notionRequest(path, body, method = 'POST') {
    if (!process.env.NOTION_API_KEY) return { skipped: true, reason: 'NOTION_API_KEY missing' }
    const response = await fetch(`https://api.notion.com/v1/${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': NOTION_VERSION,
        },
        body: JSON.stringify(body),
    })
    if (!response.ok) {
        return {
            ok: false,
            error: `Notion API ${response.status}`,
            detail: await response.text(),
        }
    }
    return response.json()
}

export async function createNotionRecord(databaseId, properties) {
    if (!databaseId) return { skipped: true, reason: 'database id missing' }
    return notionRequest('pages', {
        parent: { database_id: databaseId },
        properties,
    })
}

export async function updateNotionRecord(pageId, properties) {
    if (!pageId) return { skipped: true, reason: 'page id missing' }
    return notionRequest(`pages/${pageId}`, { properties }, 'PATCH')
}

export function blogIdeaProperties(input = {}) {
    return {
        Topic: title(input.topic),
        Source: richText(input.source || 'Slack'),
        Keyword: richText(input.keyword || input.topic || ''),
        'Trend Score': number(input.trendScore),
        'SEO Score': number(input.seoScore),
        'Business Value': number(input.businessValue),
        Priority: select(input.priority || 'Medium'),
        Status: status(input.status || 'New'),
        'Created Date': date(input.createdDate || new Date()),
        'Slack Thread': richText(input.slackThread || input.responseUrl || ''),
    }
}

export function blogDraftProperties(input = {}) {
    return {
        Title: title(input.title || input.topic),
        Slug: richText(input.slug || ''),
        Topic: richText(input.topic || input.title || ''),
        'Draft Status': status(input.draftStatus || 'Requested'),
        'SEO Score': number(input.seoScore),
        'Quality Score': number(input.qualityScore),
        'Image Status': status(input.imageStatus || 'Pending'),
        'Audio Status': status(input.audioStatus || 'Browser Fallback'),
        'Approval Status': status(input.approvalStatus || 'Needs Approval'),
        'Preview URL': url(input.previewUrl),
        'Published URL': url(input.publishedUrl),
        'Notion Notes': richText(input.notes || ''),
        'Slack Thread': richText(input.slackThread || input.responseUrl || ''),
    }
}

export function publishedPostProperties(input = {}) {
    return {
        Title: title(input.title),
        URL: url(input.url),
        Slug: richText(input.slug || ''),
        'Target Keyword': richText(input.targetKeyword || ''),
        Category: select(input.category || 'AI Automation'),
        'Date Published': date(input.datePublished || new Date()),
        'Last Updated': date(input.lastUpdated || input.datePublished || new Date()),
        Clicks: number(input.clicks),
        Impressions: number(input.impressions),
        CTR: number(input.ctr),
        'Average Position': number(input.averagePosition),
        'Performance Score': number(input.performanceScore),
        'Recommended Action': richText(input.recommendedAction || 'Collect data'),
    }
}

export function refreshQueueProperties(input = {}) {
    return {
        'Blog URL': title(input.blogUrl || input.url),
        Problem: richText(input.problem || ''),
        'Recommended Fix': richText(input.recommendedFix || input.fix || ''),
        Priority: select(input.priority || 'Medium'),
        Status: status(input.status || 'Needs Review'),
        'Before Score': number(input.beforeScore),
        'After Score': number(input.afterScore),
    }
}

export function performanceReportProperties(input = {}) {
    return {
        Date: title(input.date || new Date().toISOString().slice(0, 10)),
        'Top Blog': richText(input.topBlog || ''),
        'Worst Blog': richText(input.worstBlog || ''),
        'Best Topic': richText(input.bestTopic || ''),
        'Best Tone': richText(input.bestTone || ''),
        'Recommended Actions': richText(input.recommendedActions || ''),
        Summary: richText(input.summary || ''),
    }
}

export async function createBlogIdea(input) {
    return createNotionRecord(notionDatabases.ideas, blogIdeaProperties(input))
}

export async function createBlogDraft(input) {
    return createNotionRecord(notionDatabases.drafts, blogDraftProperties(input))
}

export async function createPublishedPost(input) {
    return createNotionRecord(notionDatabases.published, publishedPostProperties(input))
}

export async function createRefreshTask(input) {
    return createNotionRecord(notionDatabases.refresh, refreshQueueProperties(input))
}

export async function createPerformanceReport(input) {
    return createNotionRecord(notionDatabases.reports, performanceReportProperties(input))
}
