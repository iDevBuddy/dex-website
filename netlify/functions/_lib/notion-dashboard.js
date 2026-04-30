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
    return select(name || 'Not Started')
}

function normalizedTone(value) {
    const map = {
        'Practical, Business-focused': 'Business Owner',
        'Business owner practical guide': 'Business Owner',
        'Business Owner': 'Business Owner',
        'Expert guide': 'Expert Guide',
        'Expert Guide': 'Expert Guide',
        'Beginner Friendly': 'Beginner Friendly',
        'Case Study': 'Case Study',
        Listicle: 'Listicle',
        Tutorial: 'Tutorial',
        Checklist: 'Checklist',
    }
    return map[value] || 'Business Owner'
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
        Source: select(input.source || 'Slack'),
        Keyword: richText(input.keyword || input.topic || ''),
        'Search Intent': select(input.searchIntent || 'Informational'),
        'Trend Score': number(input.trendScore),
        'SEO Score': number(input.seoScore),
        'Business Value': select(input.businessValueLabel || input.businessValue || 'Medium'),
        Priority: select(input.priority || 'Medium'),
        Status: status(input.status || 'New'),
        'Created Date': date(input.createdDate || new Date()),
        'Slack Thread': url(input.slackThread || input.responseUrl || ''),
        Notes: richText(input.notes || ''),
    }
}

export function blogDraftProperties(input = {}) {
    return {
        Title: title(input.title || input.topic),
        Slug: richText(input.slug || ''),
        Topic: richText(input.topic || input.title || ''),
        'Target Keyword': richText(input.targetKeyword || ''),
        'Draft Status': status(input.draftStatus || 'Needs Review'),
        'SEO Score': number(input.seoScore),
        'Quality Score': number(input.qualityScore),
        'Image Status': status(input.imageStatus || 'Not Started'),
        'Audio Status': status(input.audioStatus || 'Browser Fallback'),
        'Approval Status': status(input.approvalStatus || 'Waiting'),
        'Preview URL': url(input.previewUrl),
        'Published URL': url(input.publishedUrl),
        'Slack Thread': url(input.slackThread || input.responseUrl || ''),
        'Research Notes': richText(input.notes || input.researchNotes || ''),
        'Internal Links': richText(input.internalLinks || ''),
        'Slides Status': select(input.slidesStatus || 'Not Started'),
        'Infographic Status': select(input.infographicStatus || 'Not Started'),
        'Asset Brief': richText(input.assetBrief || ''),
        'Asset URLs': richText(input.assetUrls || ''),
        'Media Recommendations': richText(input.mediaRecommendations ? JSON.stringify(input.mediaRecommendations) : ''),
        'Created Date': date(input.createdDate || new Date()),
        'Last Updated': date(input.lastUpdated || new Date()),
    }
}

export function publishedPostProperties(input = {}) {
    return {
        Title: title(input.title),
        URL: url(input.url),
        Slug: richText(input.slug || ''),
        'Target Keyword': richText(input.targetKeyword || ''),
        Category: select(input.category || 'AI Automation'),
        Tone: select(normalizedTone(input.tone)),
        'Date Published': date(input.datePublished || new Date()),
        'Last Updated': date(input.lastUpdated || input.datePublished || new Date()),
        Clicks: number(input.clicks),
        Impressions: number(input.impressions),
        CTR: number(input.ctr),
        'Average Position': number(input.averagePosition),
        'Performance Score': number(input.performanceScore),
        'Recommended Action': richText(input.recommendedAction || 'Collect data'),
        Status: select(input.status || 'Live'),
    }
}

export function refreshQueueProperties(input = {}) {
    return {
        'Blog URL': title(input.blogUrl || input.url),
        Problem: richText(input.problem || ''),
        'Recommended Fix': richText(input.recommendedFix || input.fix || ''),
        Priority: select(input.priority || 'Medium'),
        Status: status(input.status || 'Open'),
        'Before Score': number(input.beforeScore),
        'After Score': number(input.afterScore),
        'Created Date': date(input.createdDate || new Date()),
        'Completed Date': input.completedDate ? date(input.completedDate) : { date: null },
        'Slack Thread': url(input.slackThread || ''),
    }
}

export function performanceReportProperties(input = {}) {
    return {
        'Report Name': title(input.name || `Performance Report ${new Date().toISOString().slice(0, 10)}`),
        Date: date(input.date || new Date()),
        'Top Blog': richText(input.topBlog || ''),
        'Worst Blog': richText(input.worstBlog || ''),
        'Best Topic': richText(input.bestTopic || ''),
        'Best Tone': richText(input.bestTone || ''),
        'Total Clicks': number(input.totalClicks),
        'Total Impressions': number(input.totalImpressions),
        'Average CTR': number(input.averageCtr),
        'Average Position': number(input.averagePosition),
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
