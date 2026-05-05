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
    firstMonthAuthoritySprint: process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true',
    authoritySprintDays: Number(process.env.AUTHORITY_SPRINT_DAYS || 30),
    dailyContentMode: process.env.DAILY_CONTENT_MODE === 'true',
    dailyContentTarget: Number(process.env.DAILY_CONTENT_TARGET || 1),
    minQualityScore: Number(process.env.MIN_QUALITY_SCORE || (process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 88 : 85)),
    minTopicScore: Number(process.env.MIN_TOPIC_SCORE || (process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 78 : 75)),
    requireAuthenticSources: process.env.REQUIRE_AUTHENTIC_SOURCES === 'true',
    minAuthoritySourcesPerArticle: Number(process.env.MIN_AUTHORITY_SOURCES_PER_ARTICLE || 2),
    maxSourcesPerArticle: Number(process.env.MAX_SOURCES_PER_ARTICLE || 6),
    sourceMinAuthorityScore: Number(process.env.SOURCE_MIN_AUTHORITY_SCORE || 75),
    enableTrendQualityOverride: process.env.ENABLE_TREND_QUALITY_OVERRIDE !== 'false',
    enableRealtimeTrends: process.env.ENABLE_REALTIME_TRENDS !== 'false',
    trendOverrideMinScore: Number(process.env.TREND_OVERRIDE_MIN_SCORE || 82),
    trendQualityFloor: Number(process.env.TREND_QUALITY_FLOOR || 78),
    minAuthenticityScore: Number(process.env.MIN_AUTHENTICITY_SCORE || 72),
    minAuthenticityScoreForTrendOverride: Number(process.env.MIN_AUTHENTICITY_SCORE_FOR_TREND_OVERRIDE || 68),
    duplicateTopicThreshold: Number(process.env.DUPLICATE_TOPIC_THRESHOLD || 0.74),
    similarTopicThreshold: Number(process.env.SIMILAR_TOPIC_THRESHOLD || 0.52),
    qualityFailureRetryEnabled: process.env.QUALITY_FAILURE_RETRY_ENABLED !== 'false',
    qualityFailureMaxRetries: Number(process.env.QUALITY_FAILURE_MAX_RETRIES || 2),
    blogsPerWeek: Number(process.env.BLOGS_PER_WEEK || 4),
    blogGenerationDays: (process.env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT').split(',').map((day) => day.trim()).filter(Boolean),
    blogGenerationTimeUtc: process.env.BLOG_GENERATION_TIME_UTC || '05:00',
    blogTimezone: process.env.BLOG_TIMEZONE || 'Asia/Karachi',
    defaultBlogTone: process.env.DEFAULT_BLOG_TONE || 'Business Owner',
    defaultBlogStyle: process.env.DEFAULT_BLOG_STYLE || 'Practical Guide',
    defaultContentPersona: process.env.DEFAULT_CONTENT_PERSONA || 'Hybrid',
    defaultAuthorityAngle: process.env.DEFAULT_AUTHORITY_ANGLE || 'practical_workflow',
    requireRealLlm: process.env.REQUIRE_REAL_LLM === 'true',
    requireRealImageModel: process.env.REQUIRE_REAL_IMAGE_MODEL === 'true',
    requireRealTts: process.env.REQUIRE_REAL_TTS === 'true',
    allowFallbackInProduction: process.env.ALLOW_FALLBACK_IN_PRODUCTION === 'true',
    useGamma: process.env.USE_GAMMA === 'true',
    slidesProvider: process.env.SLIDES_PROVIDER || 'manual',
    infographicProvider: process.env.INFOGRAPHIC_PROVIDER || 'image_model',
    localLlmUrl: process.env.LOCAL_LLM_URL || '',
    localLlmModel: process.env.LOCAL_LLM_MODEL || '',
    imageProvider: process.env.IMAGE_PROVIDER || 'stable_diffusion',
    ttsProvider: process.env.TTS_PROVIDER || 'browser_fallback',
    slackEnabled: process.env.USE_SLACK === 'true',
    notionEnabled: process.env.USE_NOTION === 'true',
    searchConsoleEnabled: process.env.ENABLE_SEARCH_CONSOLE_MONITORING === 'true',
    ga4Enabled: process.env.ENABLE_GA4_MONITORING === 'true',
}

export function authoritySprintDay(startDate = process.env.AUTHORITY_SPRINT_START_DATE) {
    if (!config.firstMonthAuthoritySprint) return 0
    const start = startDate ? new Date(startDate) : new Date()
    if (Number.isNaN(start.getTime())) return 1
    const diff = Date.now() - start.getTime()
    return Math.min(config.authoritySprintDays, Math.max(1, Math.floor(diff / 86400000) + 1))
}

export function authoritySprintActive() {
    return config.firstMonthAuthoritySprint && authoritySprintDay() <= config.authoritySprintDays
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
