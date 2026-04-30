function configured(env, name) {
    return Boolean(env[name] && String(env[name]).trim())
}

function allConfigured(env, names) {
    return names.every((name) => configured(env, name))
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
    if (!mainLlmConfigured) nextSteps.push('Add LOCAL_LLM_URL and LOCAL_LLM_MODEL to enable AI article generation.')
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
                mainConfigured: mainLlmConfigured || configured(env, 'OPENAI_API_KEY'),
                reviewConfigured: reviewLlmConfigured || mainLlmConfigured || configured(env, 'OPENAI_API_KEY'),
                openAiFallbackConfigured: configured(env, 'OPENAI_API_KEY'),
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
