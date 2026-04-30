export const config = {
    siteUrl: process.env.SITE_URL || 'https://dexbyakif.com',
    brandName: process.env.BRAND_NAME || 'DEX by Akif Saeed',
    authorName: process.env.AUTHOR_NAME || 'Akif Saeed',
    authorBio: 'AI automation engineer building practical agents, workflow systems, and business automation infrastructure for service companies.',
    defaultCategory: 'AI Automation',
    categories: ['AI Automation', 'AI Agents', 'Business Automation', 'Workflow Automation', 'AI Tools', 'Lead Generation', 'Ecommerce Automation', 'Tutorials'],
    brandColors: {
        background: '#111111',
        accent: '#e05132',
        text: '#ffffff',
    },
    publishingFrequency: process.env.PUBLISHING_FREQUENCY || 'weekly',
    manualApproval: process.env.MANUAL_APPROVAL !== 'false',
    autoPublish: process.env.USE_AUTO_PUBLISH === 'true',
    minQualityScore: Number(process.env.MIN_QUALITY_SCORE || 85),
    minTopicScore: Number(process.env.MIN_TOPIC_SCORE || 75),
    blogsPerWeek: Number(process.env.BLOGS_PER_WEEK || 4),
    blogGenerationDays: (process.env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT').split(',').map((day) => day.trim()).filter(Boolean),
    blogGenerationTimeUtc: process.env.BLOG_GENERATION_TIME_UTC || '05:00',
    blogTimezone: process.env.BLOG_TIMEZONE || 'Asia/Karachi',
    defaultBlogTone: process.env.DEFAULT_BLOG_TONE || 'Business Owner',
    defaultBlogStyle: process.env.DEFAULT_BLOG_STYLE || 'Practical Guide',
    localLlmUrl: process.env.LOCAL_LLM_URL || '',
    localLlmModel: process.env.LOCAL_LLM_MODEL || '',
    imageProvider: process.env.IMAGE_PROVIDER || 'local_comfyui',
    ttsProvider: process.env.TTS_PROVIDER || 'browser_fallback',
    slackEnabled: process.env.USE_SLACK === 'true',
    notionEnabled: process.env.USE_NOTION === 'true',
    searchConsoleEnabled: process.env.ENABLE_SEARCH_CONSOLE_MONITORING === 'true',
    ga4Enabled: process.env.ENABLE_GA4_MONITORING === 'true',
}

export function validateConfig({ strict = false } = {}) {
    const warnings = []
    if (!config.siteUrl.startsWith('http')) warnings.push('SITE_URL should be an absolute URL.')
    if (config.slackEnabled && !process.env.SLACK_WEBHOOK_URL) warnings.push('USE_SLACK=true but SLACK_WEBHOOK_URL is missing.')
    if (config.notionEnabled && !process.env.NOTION_API_KEY) warnings.push('USE_NOTION=true but NOTION_API_KEY is missing.')
    if (config.minQualityScore < 60) warnings.push('MIN_QUALITY_SCORE is low; recommended MVP value is 85.')
    if (config.minTopicScore < 60) warnings.push('MIN_TOPIC_SCORE is low; recommended MVP value is 75.')
    if (strict && warnings.length) throw new Error(warnings.join('\n'))
    return warnings
}
