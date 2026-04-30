function configured(env, name) {
    return Boolean(env[name] && String(env[name]).trim())
}

function allConfigured(env, names) {
    return names.every((name) => configured(env, name))
}

function nextScheduledRun(env) {
    const days = (env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT').split(',').map((day) => day.trim().toUpperCase())
    const time = env.BLOG_GENERATION_TIME_UTC || '05:00'
    const [hour, minute] = time.split(':').map((value) => Number(value))
    const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 }
    const targetDays = days.map((day) => dayMap[day]).filter((day) => day !== undefined)
    if (!targetDays.length || Number.isNaN(hour) || Number.isNaN(minute)) return null
    const now = new Date()
    for (let offset = 0; offset <= 8; offset += 1) {
        const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset, hour, minute, 0))
        if (targetDays.includes(candidate.getUTCDay()) && candidate > now) return candidate.toISOString()
    }
    return null
}

export function getBlogStatus(env = process.env) {
    const missingRequired = [
        'SITE_URL',
        'SLACK_SIGNING_SECRET',
        'SLACK_WEBHOOK_URL',
        'SLACK_BLOG_CHANNEL_ID',
        'NOTION_API_KEY',
        'NOTION_PARENT_PAGE_URL',
        'NOTION_WEBHOOK_SECRET',
        'NOTION_BLOG_IDEAS_DB_ID',
        'NOTION_BLOG_DRAFTS_DB_ID',
        'NOTION_PUBLISHED_POSTS_DB_ID',
        'NOTION_REFRESH_QUEUE_DB_ID',
        'NOTION_PERFORMANCE_REPORTS_DB_ID',
        'GITHUB_TOKEN',
    ].filter((name) => !configured(env, name))

    const missingOptional = [
        'LOCAL_LLM_URL',
        'LOCAL_LLM_MODEL',
        'REVIEW_LLM_URL',
        'REVIEW_LLM_MODEL',
        'OPENAI_API_KEY',
        'OPENAI_MODEL',
        'COMFYUI_URL',
        'COMFYUI_WORKFLOW_PATH',
        'TTS_API_URL',
        'TTS_VOICE',
        'TTS_SPEED',
        'GOOGLE_CLIENT_EMAIL',
        'GOOGLE_PRIVATE_KEY',
        'GOOGLE_SEARCH_CONSOLE_SITE_URL',
        'GA4_PROPERTY_ID',
    ].filter((name) => !configured(env, name))

    const mainLlmConfigured = configured(env, 'LOCAL_LLM_URL') && configured(env, 'LOCAL_LLM_MODEL')
    const reviewLlmConfigured = configured(env, 'REVIEW_LLM_URL') && configured(env, 'REVIEW_LLM_MODEL')
    const openAiFallbackConfigured = configured(env, 'OPENAI_API_KEY')
    const llmConfigured = mainLlmConfigured || openAiFallbackConfigured
    const imageProvider = env.IMAGE_PROVIDER || 'local_comfyui'
    const imageConfigured = imageProvider === 'local_comfyui'
        ? configured(env, 'COMFYUI_URL') && configured(env, 'COMFYUI_WORKFLOW_PATH')
        : imageProvider === 'gpt_image'
            ? configured(env, 'OPENAI_API_KEY') && env.USE_GPT_IMAGE === 'true'
            : false
    const ttsProvider = env.TTS_PROVIDER || 'browser_fallback'

    const nextSteps = []
    if (!configured(env, 'NOTION_API_KEY') || !configured(env, 'NOTION_PARENT_PAGE_URL')) nextSteps.push('Add NOTION_API_KEY and NOTION_PARENT_PAGE_URL, then run npm run notion:setup.')
    if (!allConfigured(env, ['NOTION_BLOG_IDEAS_DB_ID', 'NOTION_BLOG_DRAFTS_DB_ID', 'NOTION_PUBLISHED_POSTS_DB_ID', 'NOTION_REFRESH_QUEUE_DB_ID', 'NOTION_PERFORMANCE_REPORTS_DB_ID'])) nextSteps.push('Copy generated Notion database IDs into Netlify environment variables.')
    if (!configured(env, 'SLACK_SIGNING_SECRET')) nextSteps.push('Add SLACK_SIGNING_SECRET for verified Slack commands.')
    if (!configured(env, 'GITHUB_TOKEN')) nextSteps.push('Add GITHUB_TOKEN with repo and workflow permissions to enable Slack/Notion dispatch.')
    if (!llmConfigured) nextSteps.push('Add LOCAL_LLM_URL and LOCAL_LLM_MODEL, or OPENAI_API_KEY, to enable AI article generation.')
    if (!imageConfigured) nextSteps.push('Configure COMFYUI_URL and COMFYUI_WORKFLOW_PATH or enable GPT image.')

    return {
        ok: true,
        service: 'AI Blog Engine',
        manualApproval: env.MANUAL_APPROVAL !== 'false',
        autoPublish: env.USE_AUTO_PUBLISH === 'true',
        integrations: {
            slack: {
                configured: allConfigured(env, ['SLACK_SIGNING_SECRET', 'SLACK_WEBHOOK_URL', 'SLACK_BLOG_CHANNEL_ID']),
                signingSecretExists: configured(env, 'SLACK_SIGNING_SECRET'),
                webhookExists: configured(env, 'SLACK_WEBHOOK_URL'),
                blogChannelIdExists: configured(env, 'SLACK_BLOG_CHANNEL_ID'),
                botTokenExists: configured(env, 'SLACK_BOT_TOKEN'),
            },
            notion: {
                configured: configured(env, 'NOTION_API_KEY') && configured(env, 'NOTION_PARENT_PAGE_URL'),
                apiKeyExists: configured(env, 'NOTION_API_KEY'),
                parentPageUrlExists: configured(env, 'NOTION_PARENT_PAGE_URL'),
                webhookSecretExists: configured(env, 'NOTION_WEBHOOK_SECRET'),
                databasesConfigured: allConfigured(env, ['NOTION_BLOG_IDEAS_DB_ID', 'NOTION_BLOG_DRAFTS_DB_ID', 'NOTION_PUBLISHED_POSTS_DB_ID', 'NOTION_REFRESH_QUEUE_DB_ID', 'NOTION_PERFORMANCE_REPORTS_DB_ID']),
            },
            github: {
                configured: configured(env, 'GITHUB_TOKEN') || configured(env, 'BLOG_GITHUB_TOKEN'),
            },
            llm: {
                configured: llmConfigured,
                mainConfigured: llmConfigured,
                reviewConfigured: reviewLlmConfigured || llmConfigured,
                openAiFallbackConfigured,
            },
            topicDiscovery: {
                enabled: true,
                minTopicScore: Number(env.MIN_TOPIC_SCORE || 75),
            },
            scheduledAutomation: {
                enabled: true,
                blogsPerWeek: Number(env.BLOGS_PER_WEEK || 4),
                days: env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT',
                timeUtc: env.BLOG_GENERATION_TIME_UTC || '05:00',
                timezone: env.BLOG_TIMEZONE || 'Asia/Karachi',
                nextRunUtc: nextScheduledRun(env),
            },
            image: {
                provider: imageProvider,
                configured: imageConfigured,
            },
            tts: {
                provider: ttsProvider,
                configured: ttsProvider === 'browser_fallback' || configured(env, 'TTS_API_URL'),
            },
            notebooklm: {
                enabled: env.USE_NOTEBOOKLM === 'true',
                mode: env.NOTEBOOKLM_MODE || 'manual',
            },
        },
        missingRequired,
        missingOptional,
        nextSteps,
        phase4Pending: true,
    }
}
