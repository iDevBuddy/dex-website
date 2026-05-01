import { getBlogStatus } from './env-status.js'

function configured(env, name) {
    return Boolean(env[name] && String(env[name]).trim())
}

function allConfigured(env, names) {
    return names.every((name) => configured(env, name))
}

export function buildSystemReport(env = process.env, runtime = {}) {
    const status = getBlogStatus(env)
    const siteUrl = env.SITE_URL || env.URL || 'https://www.dexakif.com'
    const blogContentFolder = 'content/blog'
    const draftFolder = 'data/blog'

    return {
        ok: true,
        service: 'AI Blog Engine System Report',
        generatedAt: new Date().toISOString(),
        websiteDeployment: {
            siteUrl,
            netlifyDeploymentStatus: runtime.netlifyDeploymentStatus || env.CONTEXT || 'unknown',
            currentBranch: runtime.currentBranch || env.BRANCH || 'unknown',
            latestCommit: runtime.latestCommit || env.COMMIT_REF || 'unknown',
        },
        blogEngine: {
            blogContentFolder,
            draftFolder,
            publishFolder: blogContentFolder,
            format: 'Markdown/MDX-compatible frontmatter',
            sitemapStatus: runtime.sitemapStatus || 'generated during build',
            rssStatus: runtime.rssStatus || 'generated during build',
            currentSchedule: status.integrations.scheduledAutomation,
            manualApproval: status.manualApproval,
            autoPublish: status.autoPublish,
        },
        llm: {
            primaryProvider: configured(env, 'LOCAL_LLM_URL') ? 'OpenAI-compatible local endpoint' : configured(env, 'OPENAI_API_KEY') ? 'OpenAI fallback' : 'missing',
            primaryModel: env.LOCAL_LLM_MODEL || env.OPENAI_MODEL || '',
            reviewProvider: configured(env, 'REVIEW_LLM_URL') ? 'OpenAI-compatible review endpoint' : configured(env, 'LOCAL_LLM_URL') ? 'main LLM fallback' : configured(env, 'OPENAI_API_KEY') ? 'OpenAI fallback' : 'missing',
            reviewModel: env.REVIEW_LLM_MODEL || env.LOCAL_LLM_MODEL || env.OPENAI_MODEL || '',
            fallbackEnabled: configured(env, 'OPENAI_API_KEY'),
            realLlmRequired: env.REQUIRE_REAL_LLM === 'true',
            missingVariables: ['LOCAL_LLM_URL', 'LOCAL_LLM_MODEL', 'OPENAI_API_KEY'].filter((name) => !configured(env, name)),
        },
        image: {
            provider: status.imageProvider.provider,
            comfyUiConfigured: configured(env, 'COMFYUI_URL') && configured(env, 'COMFYUI_WORKFLOW_PATH'),
            replicateConfigured: configured(env, 'REPLICATE_API_KEY') && configured(env, 'REPLICATE_MODEL'),
            replicateModel: env.REPLICATE_MODEL || '',
            replicateImageSize: env.REPLICATE_IMAGE_SIZE || '1200x675',
            workflowPathConfigured: configured(env, 'COMFYUI_WORKFLOW_PATH'),
            gptImageEnabled: env.USE_GPT_IMAGE === 'true' && configured(env, 'OPENAI_API_KEY'),
            fallbackAllowed: env.ALLOW_FALLBACK_IN_PRODUCTION === 'true',
            missingVariables: status.imageProvider.missingValues,
            productionReady: status.imageProvider.productionReady,
        },
        audioTts: {
            provider: env.TTS_PROVIDER || 'browser_fallback',
            browserFallbackStatus: env.REQUIRE_REAL_TTS === 'true' ? 'blocked by REQUIRE_REAL_TTS' : 'available',
            mp3GenerationStatus: configured(env, 'TTS_API_URL') || configured(env, 'PIPER_TTS_URL') || configured(env, 'KOKORO_TTS_URL') || configured(env, 'MINIMAX_API_KEY') || configured(env, 'ELEVENLABS_API_KEY') ? 'configured' : 'not configured',
            missingVariables: ['TTS_API_URL', 'TTS_VOICE', 'TTS_SPEED'].filter((name) => !configured(env, name)),
        },
        slack: {
            commandCenterConfigured: allConfigured(env, ['SLACK_SIGNING_SECRET', 'SLACK_WEBHOOK_URL', 'SLACK_BLOG_CHANNEL_ID']),
            webhookConfigured: configured(env, 'SLACK_WEBHOOK_URL'),
            channelIdConfigured: configured(env, 'SLACK_BLOG_CHANNEL_ID'),
            signingSecretConfigured: configured(env, 'SLACK_SIGNING_SECRET'),
        },
        notion: {
            apiConfigured: configured(env, 'NOTION_API_KEY'),
            parentPageConfigured: configured(env, 'NOTION_PARENT_PAGE_URL'),
            allDatabasesConfigured: status.integrations.notion.databasesConfigured,
            lastNotionSync: runtime.lastNotionSync || 'not tracked yet',
        },
        github: {
            tokenConfigured: configured(env, 'GITHUB_TOKEN') || configured(env, 'BLOG_GITHUB_TOKEN'),
            workflowDispatchConfigured: configured(env, 'BLOG_GITHUB_REPO') || configured(env, 'GITHUB_REPOSITORY') || (configured(env, 'GITHUB_OWNER') && configured(env, 'GITHUB_REPO')),
            autoDraftWorkflowConfigured: true,
        },
        qualityGates: {
            minTopicScore: status.authoritySprint.minTopicScore,
            minQualityScore: status.authoritySprint.minQualityScore,
            authenticSourcesRequired: status.sourceQuality.authenticSourcesRequired,
            minAuthoritySourcesPerArticle: status.sourceQuality.minSourcesPerArticle,
            realImageRequired: status.providerStrictness.realImageRequired,
            manualApproval: status.manualApproval,
            trendRecovery: status.trendRecovery,
            duplicateDetection: status.duplicateDetection,
            authenticity: status.authenticity,
        },
        pendingItems: {
            missingRequired: status.missingRequired,
            missingOptional: status.missingOptional,
            missingProviderSetup: [
                ...status.imageProvider.missingValues,
                ...status.nextSteps.filter((step) => /LLM|COMFYUI|GPT image/i.test(step)),
            ],
            riskyIncompleteFeatures: ['Phase 4 performance intelligence is still pending.'],
            nextRecommendedSetupSteps: status.nextSteps,
        },
    }
}
