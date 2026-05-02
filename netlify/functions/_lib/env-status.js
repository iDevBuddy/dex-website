function configured(env, name) {
    return Boolean(env[name] && String(env[name]).trim())
}

function allConfigured(env, names) {
    return names.every((name) => configured(env, name))
}

function nextScheduledRun(env) {
    const sprintActive = env.FIRST_MONTH_AUTHORITY_SPRINT === 'true'
    const days = (sprintActive ? 'SUN,MON,TUE,WED,THU,FRI,SAT' : (env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT')).split(',').map((day) => day.trim().toUpperCase())
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

function sprintDay(env) {
    if (env.FIRST_MONTH_AUTHORITY_SPRINT !== 'true') return 0
    const start = env.AUTHORITY_SPRINT_START_DATE ? new Date(env.AUTHORITY_SPRINT_START_DATE) : new Date()
    if (Number.isNaN(start.getTime())) return 1
    return Math.min(Number(env.AUTHORITY_SPRINT_DAYS || 30), Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1))
}

function imageProviderStatus(env) {
    const provider = env.IMAGE_PROVIDER || 'local_comfyui'
    const requiresRealImage = env.REQUIRE_REAL_IMAGE_MODEL === 'true'
    const missingValues = []
    if (provider === 'local_comfyui') {
        if (!configured(env, 'COMFYUI_URL')) missingValues.push('COMFYUI_URL')
        if (!configured(env, 'COMFYUI_WORKFLOW_PATH')) missingValues.push('COMFYUI_WORKFLOW_PATH')
    } else if (provider === 'nvidia_flux' || provider === 'nvidia') {
        if (!configured(env, 'NVIDIA_API_KEY') && !configured(env, 'NVIDIA_NIM_API_KEY')) missingValues.push('NVIDIA_API_KEY')
        if (!configured(env, 'NVIDIA_FLUX_URL')) missingValues.push('NVIDIA_FLUX_URL')
    } else if (provider === 'gpt_image') {
        if (env.USE_GPT_IMAGE !== 'true') missingValues.push('USE_GPT_IMAGE=true')
        if (!configured(env, 'OPENAI_API_KEY')) missingValues.push('OPENAI_API_KEY')
    } else {
        missingValues.push(`Unsupported IMAGE_PROVIDER=${provider}`)
    }
    const isConfigured = missingValues.length === 0
    return {
        configured: isConfigured,
        provider,
        requiresRealImage,
        missingValues,
        productionReady: !requiresRealImage || isConfigured,
    }
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
        'NVIDIA_API_KEY',
        'NVIDIA_FLUX_URL',
        'NVIDIA_FLUX_MODEL',
        'NVIDIA_IMAGE_SIZE',
        'NVIDIA_FLUX_STEPS',
        'NVIDIA_FLUX_TIMEOUT_MS',
        'ENABLE_REALTIME_TRENDS',
        'TWITTER_BEARER_TOKEN',
        'AUTHENTICITY_PROVIDER',
        'HUGGINGFACE_API_TOKEN',
        'HUGGINGFACE_MODEL',
        'COMFYUI_URL',
        'COMFYUI_WORKFLOW_PATH',
        'COMFYUI_AUTH_HEADER',
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
    const imageStatus = imageProviderStatus(env)
    const imageProvider = imageStatus.provider
    const imageConfigured = imageStatus.configured
    const ttsProvider = env.TTS_PROVIDER || 'browser_fallback'
    const realLlmRequired = env.REQUIRE_REAL_LLM === 'true'
    const realImageRequired = env.REQUIRE_REAL_IMAGE_MODEL === 'true'
    const realTtsRequired = env.REQUIRE_REAL_TTS === 'true'
    const fallbackAllowedInProduction = env.ALLOW_FALLBACK_IN_PRODUCTION === 'true'
    const ttsConfigured = ttsProvider === 'browser_fallback' ? !realTtsRequired : configured(env, 'TTS_API_URL') || configured(env, 'PIPER_TTS_URL') || configured(env, 'KOKORO_TTS_URL') || configured(env, 'MINIMAX_API_KEY') || configured(env, 'ELEVENLABS_API_KEY') || configured(env, 'OPENAI_API_KEY')
    const productionReady = (!realLlmRequired || llmConfigured) && (!realImageRequired || imageConfigured) && (!realTtsRequired || ttsConfigured)

    const nextSteps = []
    if (!configured(env, 'NOTION_API_KEY') || !configured(env, 'NOTION_PARENT_PAGE_URL')) nextSteps.push('Add NOTION_API_KEY and NOTION_PARENT_PAGE_URL, then run npm run notion:setup.')
    if (!allConfigured(env, ['NOTION_BLOG_IDEAS_DB_ID', 'NOTION_BLOG_DRAFTS_DB_ID', 'NOTION_PUBLISHED_POSTS_DB_ID', 'NOTION_REFRESH_QUEUE_DB_ID', 'NOTION_PERFORMANCE_REPORTS_DB_ID'])) nextSteps.push('Copy generated Notion database IDs into Netlify environment variables.')
    if (!configured(env, 'SLACK_SIGNING_SECRET')) nextSteps.push('Add SLACK_SIGNING_SECRET for verified Slack commands.')
    if (!configured(env, 'GITHUB_TOKEN')) nextSteps.push('Add GITHUB_TOKEN with repo and workflow permissions to enable Slack/Notion dispatch.')
    if (!llmConfigured) nextSteps.push('Add LOCAL_LLM_URL and LOCAL_LLM_MODEL, or OPENAI_API_KEY, to enable AI article generation.')
    if (!imageConfigured) {
        if (imageProvider === 'nvidia_flux' || imageProvider === 'nvidia') {
            nextSteps.push('Add NVIDIA_API_KEY, NVIDIA_FLUX_URL, NVIDIA_FLUX_MODEL, and NVIDIA_IMAGE_SIZE to enable NVIDIA FLUX image generation.')
        } else if (imageProvider === 'gpt_image') {
            nextSteps.push('Add OPENAI_API_KEY and USE_GPT_IMAGE=true to enable GPT image generation.')
        } else {
            nextSteps.push('Configure COMFYUI_URL and COMFYUI_WORKFLOW_PATH, or switch IMAGE_PROVIDER to nvidia_flux.')
        }
    }

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
                blogsPerWeek: env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 7 : Number(env.BLOGS_PER_WEEK || 4),
                days: env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 'DAILY' : (env.BLOG_GENERATION_DAYS || 'MON,TUE,THU,SAT'),
                timeUtc: env.BLOG_GENERATION_TIME_UTC || '05:00',
                timezone: env.BLOG_TIMEZONE || 'Asia/Karachi',
                nextRunUtc: nextScheduledRun(env),
            },
            image: {
                provider: imageProvider,
                configured: imageConfigured,
                requiresRealImage: imageStatus.requiresRealImage,
                missingValues: imageStatus.missingValues,
                productionReady: imageStatus.productionReady,
            },
            tts: {
                provider: ttsProvider,
                configured: ttsConfigured,
            },
            notebooklm: {
                enabled: env.USE_NOTEBOOKLM === 'true',
                mode: env.NOTEBOOKLM_MODE || 'manual',
            },
        },
        missingRequired,
        missingOptional,
        nextSteps,
        authoritySprint: {
            authoritySprintEnabled: env.FIRST_MONTH_AUTHORITY_SPRINT === 'true',
            sprintDay: sprintDay(env),
            sprintDays: Number(env.AUTHORITY_SPRINT_DAYS || 30),
            dailyContentMode: env.DAILY_CONTENT_MODE === 'true',
            dailyContentTarget: Number(env.DAILY_CONTENT_TARGET || 1),
            minQualityScore: Number(env.MIN_QUALITY_SCORE || (env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 88 : 85)),
            minTopicScore: Number(env.MIN_TOPIC_SCORE || (env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' ? 78 : 75)),
            startDate: env.AUTHORITY_SPRINT_START_DATE || null,
        },
        sourceQuality: {
            authenticSourcesRequired: env.REQUIRE_AUTHENTIC_SOURCES === 'true',
            minSourcesPerArticle: Number(env.MIN_AUTHORITY_SOURCES_PER_ARTICLE || 2),
            maxSourcesPerArticle: Number(env.MAX_SOURCES_PER_ARTICLE || 6),
            minAuthorityScore: Number(env.SOURCE_MIN_AUTHORITY_SCORE || 75),
        },
        trendRecovery: {
            enabled: env.ENABLE_TREND_QUALITY_OVERRIDE !== 'false',
            realtimeTrendsEnabled: env.ENABLE_REALTIME_TRENDS !== 'false',
            trendOverrideMinScore: Number(env.TREND_OVERRIDE_MIN_SCORE || 82),
            trendQualityFloor: Number(env.TREND_QUALITY_FLOOR || 78),
            businessTrendOverrideMinScore: Number(env.BUSINESS_TREND_OVERRIDE_MIN_SCORE || 72),
            qualityFailureRetryEnabled: env.QUALITY_FAILURE_RETRY_ENABLED !== 'false',
            qualityFailureMaxRetries: Number(env.QUALITY_FAILURE_MAX_RETRIES || 2),
        },
        duplicateDetection: {
            enabled: env.ENABLE_DUPLICATE_TOPIC_DETECTION !== 'false',
            duplicateTopicThreshold: Number(env.DUPLICATE_TOPIC_THRESHOLD || 0.74),
            similarTopicThreshold: Number(env.SIMILAR_TOPIC_THRESHOLD || 0.52),
        },
        authenticity: {
            enabled: env.ENABLE_AUTHENTICITY_CHECK !== 'false',
            provider: env.AUTHENTICITY_PROVIDER || 'heuristic_nlp',
            huggingFaceConfigured: configured(env, 'HUGGINGFACE_API_TOKEN') && configured(env, 'HUGGINGFACE_MODEL'),
            minAuthenticityScore: Number(env.MIN_AUTHENTICITY_SCORE || 72),
            minAuthenticityScoreForTrendOverride: Number(env.MIN_AUTHENTICITY_SCORE_FOR_TREND_OVERRIDE || 68),
        },
        imageProvider: imageStatus,
        providerStrictness: {
            realLlmRequired,
            realImageRequired,
            realTtsRequired,
            fallbackAllowedInProduction,
            productionReady,
        },
        phase4Pending: true,
    }
}
