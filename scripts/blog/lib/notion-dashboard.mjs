import {
    createNotionPage,
    dateProperty,
    numberProperty,
    richTextProperty,
    selectProperty,
    titleProperty,
    urlProperty,
} from './notion.mjs'

const sourceMap = {
    'Google News RSS': 'Google News',
    'Hacker News RSS': 'Hacker News',
    'Reddit r/automation RSS': 'Reddit',
    'Reddit r/artificial RSS': 'Reddit',
    'Manual seed': 'Manual',
    'Manual command': 'Slack',
    'Slack command': 'Slack',
    Pipeline: 'Manual',
}

const toneMap = {
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

function statusText(value) {
    return selectProperty(value)
}

function urlText(value) {
    return urlProperty(value || '')
}

export async function syncBlogIdea(topic) {
    return createNotionPage(process.env.NOTION_BLOG_IDEAS_DB_ID, {
        Topic: titleProperty(topic.topic),
        Source: selectProperty(sourceMap[topic.source] || topic.source || 'Manual'),
        Keyword: richTextProperty(topic.keyword || topic.topic || ''),
        'Search Intent': selectProperty(topic.searchIntent || 'Informational'),
        'Trend Score': numberProperty(topic.trendScore),
        'SEO Score': numberProperty(topic.seoScore),
        'Business Value': selectProperty(topic.businessValueLabel || (typeof topic.businessValue === 'number' ? (topic.businessValue >= 70 ? 'High' : topic.businessValue >= 45 ? 'Medium' : 'Low') : topic.businessValue) || 'Medium'),
        Priority: selectProperty(topic.priority || 'Medium'),
        Status: statusText(topic.status || 'New'),
        'Created Date': dateProperty(topic.createdAt || new Date()),
        'Slack Thread': urlText(topic.slackThread || ''),
        Notes: richTextProperty(topic.notes || ''),
    })
}

export async function syncBlogDraft(article, overrides = {}) {
    const frontmatter = article.frontmatter || article
    return createNotionPage(process.env.NOTION_BLOG_DRAFTS_DB_ID, {
        Title: titleProperty(frontmatter.title || overrides.title || 'Untitled draft'),
        Slug: richTextProperty(frontmatter.slug || ''),
        Topic: richTextProperty(frontmatter.targetKeyword || overrides.topic || ''),
        'Target Keyword': richTextProperty(frontmatter.targetKeyword || ''),
        'Draft Status': statusText(overrides.draftStatus || 'Needs Review'),
        'SEO Score': numberProperty(overrides.seoScore),
        'Quality Score': numberProperty(overrides.qualityScore),
        'Image Status': statusText(overrides.imageStatus || 'Not Started'),
        'Audio Status': statusText(overrides.audioStatus || 'Browser Fallback'),
        'Approval Status': statusText(overrides.approvalStatus || 'Waiting'),
        'Preview URL': urlText(overrides.previewUrl || ''),
        'Published URL': urlText(overrides.publishedUrl || ''),
        'Slack Thread': urlText(overrides.slackThread || ''),
        'Research Notes': richTextProperty(overrides.notes || ''),
        'Internal Links': richTextProperty(overrides.internalLinks || ''),
        'Slides Status': selectProperty(overrides.slidesStatus || 'Not Started'),
        'Infographic Status': selectProperty(overrides.infographicStatus || 'Not Started'),
        'Asset Brief': richTextProperty(overrides.assetBrief || ''),
        'Asset URLs': richTextProperty(overrides.assetUrls || ''),
        'Media Recommendations': richTextProperty(overrides.mediaRecommendations ? JSON.stringify(overrides.mediaRecommendations) : JSON.stringify(frontmatter.mediaRecommendations || {})),
        'Sources Status': selectProperty(overrides.sourcesStatus || frontmatter.sourcesStatus || 'Ready'),
        'Source Quality Score': numberProperty(overrides.sourceQualityScore || frontmatter.sourceQualityScore),
        'Source Notes': richTextProperty(overrides.sourceNotes || frontmatter.sourceNotes || ''),
        'Content Persona': selectProperty(frontmatter.contentPersona || 'Hybrid'),
        'Business Function': selectProperty(frontmatter.businessFunction || 'General'),
        'Authority Angle': selectProperty(frontmatter.authorityAngle || 'practical_workflow'),
        'Image Provider Status': selectProperty(overrides.imageProviderStatus || (overrides.imageStatus === 'Failed' ? 'Failed' : 'Configured')),
        'Publish Ready': { checkbox: Boolean(overrides.publishReady ?? frontmatter.publishReady ?? false) },
        'Blocking Issues': richTextProperty(overrides.blockingIssues || frontmatter.blockingIssues || ''),
        'Trend Score': numberProperty(overrides.trendScore || frontmatter.trendScore),
        'Market Sentiment': selectProperty(overrides.marketSentiment || frontmatter.marketSentiment || 'neutral'),
        'Recovery Notes': richTextProperty(overrides.recoveryNotes || ''),
        'Created Date': dateProperty(overrides.createdDate || new Date()),
        'Last Updated': dateProperty(overrides.lastUpdated || new Date()),
    })
}

export async function syncPublishedPost(article, quality = {}) {
    const frontmatter = article.frontmatter || article
    const url = `${process.env.SITE_URL || 'https://dexbyakif.com'}/blog/${frontmatter.slug}`
    return createNotionPage(process.env.NOTION_PUBLISHED_POSTS_DB_ID, {
        Title: titleProperty(frontmatter.title),
        URL: urlProperty(url),
        Slug: richTextProperty(frontmatter.slug),
        'Target Keyword': richTextProperty(frontmatter.targetKeyword || ''),
        Category: selectProperty(frontmatter.category || 'AI Automation'),
        Tone: selectProperty(toneMap[frontmatter.tone] || 'Business Owner'),
        'Date Published': dateProperty(frontmatter.publishedAt || new Date()),
        'Last Updated': dateProperty(frontmatter.updatedAt || frontmatter.publishedAt || new Date()),
        Clicks: numberProperty(0),
        Impressions: numberProperty(0),
        CTR: numberProperty(0),
        'Average Position': numberProperty(0),
        'Performance Score': numberProperty(quality.score || 0),
        'Recommended Action': richTextProperty('Collect performance data'),
        Status: selectProperty('Live'),
    })
}

export async function syncRefreshTask(item = {}) {
    return createNotionPage(process.env.NOTION_REFRESH_QUEUE_DB_ID, {
        'Blog URL': titleProperty(item.blogUrl || item.url || ''),
        Problem: richTextProperty(item.problem || ''),
        'Recommended Fix': richTextProperty(item.recommendedFix || item.fix || ''),
        Priority: selectProperty(item.priority || 'Medium'),
        Status: statusText(item.status || 'Open'),
        'Before Score': numberProperty(item.beforeScore),
        'After Score': numberProperty(item.afterScore),
        'Created Date': dateProperty(item.createdDate || new Date()),
        'Completed Date': item.completedDate ? dateProperty(item.completedDate) : { date: null },
        'Slack Thread': urlProperty(item.slackThread || ''),
    })
}

export async function syncPerformanceReport(report = {}) {
    return createNotionPage(process.env.NOTION_PERFORMANCE_REPORTS_DB_ID, {
        'Report Name': titleProperty(report.name || `Performance Report ${new Date().toISOString().slice(0, 10)}`),
        Date: dateProperty(report.date || new Date()),
        'Top Blog': richTextProperty(report.topBlog || ''),
        'Worst Blog': richTextProperty(report.worstBlog || ''),
        'Best Topic': richTextProperty(report.bestTopic || ''),
        'Best Tone': richTextProperty(report.bestTone || ''),
        'Total Clicks': numberProperty(report.totalClicks),
        'Total Impressions': numberProperty(report.totalImpressions),
        'Average CTR': numberProperty(report.averageCtr),
        'Average Position': numberProperty(report.averagePosition),
        'Recommended Actions': richTextProperty(report.recommendedActions || ''),
        Summary: richTextProperty(report.summary || ''),
    })
}
