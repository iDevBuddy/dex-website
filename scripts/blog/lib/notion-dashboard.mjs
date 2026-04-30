import { createNotionPage, numberProperty, richTextProperty, titleProperty } from './notion.mjs'

function statusText(value) {
    return richTextProperty(value)
}

function urlText(value) {
    return richTextProperty(value || '')
}

export async function syncBlogIdea(topic) {
    return createNotionPage(process.env.NOTION_BLOG_IDEAS_DB_ID, {
        Topic: titleProperty(topic.topic),
        Source: richTextProperty(topic.source || 'Pipeline'),
        Keyword: richTextProperty(topic.keyword || topic.topic || ''),
        'Trend Score': numberProperty(topic.trendScore),
        'SEO Score': numberProperty(topic.seoScore),
        'Business Value': numberProperty(topic.businessValue),
        Priority: richTextProperty(topic.priority || 'Medium'),
        Status: statusText(topic.status || 'Discovered'),
        'Created Date': richTextProperty(topic.createdAt || new Date().toISOString()),
        'Slack Thread': richTextProperty(topic.slackThread || ''),
    })
}

export async function syncBlogDraft(article, overrides = {}) {
    const frontmatter = article.frontmatter || article
    return createNotionPage(process.env.NOTION_BLOG_DRAFTS_DB_ID, {
        Title: titleProperty(frontmatter.title || overrides.title || 'Untitled draft'),
        Slug: richTextProperty(frontmatter.slug || ''),
        Topic: richTextProperty(frontmatter.targetKeyword || overrides.topic || ''),
        'Draft Status': statusText(overrides.draftStatus || 'Draft Created'),
        'SEO Score': numberProperty(overrides.seoScore),
        'Quality Score': numberProperty(overrides.qualityScore),
        'Image Status': statusText(overrides.imageStatus || 'Pending'),
        'Audio Status': statusText(overrides.audioStatus || 'Browser Fallback'),
        'Approval Status': statusText(overrides.approvalStatus || 'Needs Approval'),
        'Preview URL': urlText(overrides.previewUrl || ''),
        'Published URL': urlText(overrides.publishedUrl || ''),
        'Notion Notes': richTextProperty(overrides.notes || ''),
        'Slack Thread': richTextProperty(overrides.slackThread || ''),
    })
}

export async function syncPublishedPost(article, quality = {}) {
    const frontmatter = article.frontmatter || article
    const url = `${process.env.SITE_URL || 'https://dexbyakif.com'}/blog/${frontmatter.slug}`
    return createNotionPage(process.env.NOTION_PUBLISHED_POSTS_DB_ID, {
        Title: titleProperty(frontmatter.title),
        URL: richTextProperty(url),
        Slug: richTextProperty(frontmatter.slug),
        'Target Keyword': richTextProperty(frontmatter.targetKeyword || ''),
        Category: richTextProperty(frontmatter.category || 'AI Automation'),
        'Date Published': richTextProperty(frontmatter.publishedAt || new Date().toISOString().slice(0, 10)),
        'Last Updated': richTextProperty(frontmatter.updatedAt || frontmatter.publishedAt || new Date().toISOString().slice(0, 10)),
        Clicks: numberProperty(0),
        Impressions: numberProperty(0),
        CTR: numberProperty(0),
        'Average Position': numberProperty(0),
        'Performance Score': numberProperty(quality.score || 0),
        'Recommended Action': richTextProperty('Collect performance data'),
    })
}

export async function syncRefreshTask(item = {}) {
    return createNotionPage(process.env.NOTION_REFRESH_QUEUE_DB_ID, {
        'Blog URL': titleProperty(item.blogUrl || item.url || ''),
        Problem: richTextProperty(item.problem || ''),
        'Recommended Fix': richTextProperty(item.recommendedFix || item.fix || ''),
        Priority: richTextProperty(item.priority || 'Medium'),
        Status: statusText(item.status || 'Needs Review'),
        'Before Score': numberProperty(item.beforeScore),
        'After Score': numberProperty(item.afterScore),
    })
}

export async function syncPerformanceReport(report = {}) {
    return createNotionPage(process.env.NOTION_PERFORMANCE_REPORTS_DB_ID, {
        Date: titleProperty(report.date || new Date().toISOString().slice(0, 10)),
        'Top Blog': richTextProperty(report.topBlog || ''),
        'Worst Blog': richTextProperty(report.worstBlog || ''),
        'Best Topic': richTextProperty(report.bestTopic || ''),
        'Best Tone': richTextProperty(report.bestTone || ''),
        'Recommended Actions': richTextProperty(report.recommendedActions || ''),
        Summary: richTextProperty(report.summary || ''),
    })
}
