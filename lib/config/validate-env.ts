function exists(env: NodeJS.ProcessEnv, name: string) {
    return Boolean(env[name] && String(env[name]).trim())
}

export function validateBlogEngineEnv(env = process.env) {
    const required = [
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
    ]
    const optional = [
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
    ]
    return {
        missingRequired: required.filter((name) => !exists(env, name)),
        missingOptional: optional.filter((name) => !exists(env, name)),
    }
}
