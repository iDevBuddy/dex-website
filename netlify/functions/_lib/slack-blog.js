import { createHmac, timingSafeEqual } from 'node:crypto'
import { createBlogDraft, createBlogIdea, createPerformanceReport, createRefreshTask } from './notion-dashboard.js'
import { dispatchBlogWorkflow } from './github-dispatch.js'
import { buildSystemReport } from './system-report.js'

export function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    }
}

export function verifySlackEvent(event) {
    const secret = process.env.SLACK_SIGNING_SECRET
    if (!secret) return false
    const timestamp = event.headers['x-slack-request-timestamp'] || event.headers['X-Slack-Request-Timestamp']
    const signature = event.headers['x-slack-signature'] || event.headers['X-Slack-Signature']
    if (!timestamp || !signature) return false
    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
    if (age > 60 * 5) return false
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || ''
    const expected = `v0=${createHmac('sha256', secret).update(`v0:${timestamp}:${rawBody}`).digest('hex')}`
    const expectedBuffer = Buffer.from(expected)
    const signatureBuffer = Buffer.from(signature)
    if (expectedBuffer.length !== signatureBuffer.length) return false
    return timingSafeEqual(expectedBuffer, signatureBuffer)
}

export function parseSlackBody(event) {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body || ''
    return Object.fromEntries(new URLSearchParams(rawBody))
}

export function helpText() {
    return [
        '*DEX Blog commands*',
        '`/blog report` - latest performance scaffold',
        '`/blog system report` - full system and provider report',
        '`/blog ideas` - topic discovery status',
        '`/blog sources latest` / `improve sources latest`',
        '`/blog generate` - discover topics and create one approval-only draft',
        '`/blog sprint status` / `start` / `stop`',
        '`/blog new topic: [topic]` - add idea',
        '`/blog draft: [topic]` - request a draft',
        '`/blog approve latest` - publish latest approved draft',
        '`/blog reject latest` / `rewrite latest`',
        '`/blog change topic [topic]` / `add section [request]`',
        '`/blog make expert latest` / `make simple latest` / `improve seo latest`',
        '`/blog generate slides latest` / `generate infographic latest`',
        '`/blog schedule` - show the 4-per-week drafting schedule',
        '`/blog adsense status` - AdSense readiness check',
        '`/blog improve [url]` - queue refresh',
        '`/blog generate image [url]` - regenerate image',
        '`/blog generate audio [url]` - generate/listen support',
        '`/blog rewrite title [url]` - queue title rewrite',
        '`/blog change tone [url] [tone]` - queue tone update',
        '`/blog update old posts` - queue refresh scan',
        '`/blog cluster [topic]` - plan a topic cluster',
        '`/blog pause autopublish` / `/blog resume autopublish`',
        '`/blog status` - system status',
    ].join('\n')
}

function nextScheduledRun() {
    const report = buildSystemReport(process.env)
    return report.blogEngine.currentSchedule.nextRunUtc || 'not calculated'
}

function sprintText() {
    const days = Number(process.env.AUTHORITY_SPRINT_DAYS || 30)
    const start = process.env.AUTHORITY_SPRINT_START_DATE ? new Date(process.env.AUTHORITY_SPRINT_START_DATE) : new Date()
    const day = process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' && !Number.isNaN(start.getTime())
        ? Math.min(days, Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1))
        : 0
    return { day, days, remaining: Math.max(0, days - day), enabled: process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true' }
}

export function slackBlocks({ title, message, fields = [], actions = [] }) {
    const blocks = [
        { type: 'header', text: { type: 'plain_text', text: title.slice(0, 150) } },
        { type: 'section', text: { type: 'mrkdwn', text: message } },
    ]
    if (fields.length) {
        blocks.push({
            type: 'section',
            fields: fields.map((field) => ({ type: 'mrkdwn', text: `*${field.label}:*\n${field.value || '-'}` })),
        })
    }
    if (actions.length) {
        blocks.push({
            type: 'actions',
            elements: actions.map((action) => ({
                type: 'button',
                text: { type: 'plain_text', text: action.text },
                style: action.style,
                action_id: action.actionId,
                value: JSON.stringify(action.value || {}),
            })),
        })
    }
    return blocks
}

export function approvalActions(context = {}) {
    return [
        { text: 'Approve Publish', style: 'primary', actionId: 'blog_approve_publish', value: context },
        { text: 'Request Rewrite', actionId: 'blog_request_rewrite', value: context },
        { text: 'Improve SEO', actionId: 'blog_improve_seo', value: context },
        { text: 'Change Tone', actionId: 'blog_change_tone', value: context },
        { text: 'Regenerate Image', actionId: 'blog_regenerate_image', value: context },
        { text: 'Generate Audio', actionId: 'blog_generate_audio', value: context },
        { text: 'Reject', style: 'danger', actionId: 'blog_reject', value: context },
    ]
}

function extractAfter(text, prefix) {
    return text.slice(prefix.length).trim()
}

function splitUrlCommand(text, prefix) {
    return extractAfter(text, prefix).split(/\s+/).filter(Boolean)
}

export async function routeSlackCommand(payload) {
    const text = String(payload.text || '').trim()
    const responseUrl = payload.response_url || ''
    const userName = payload.user_name || payload.user_id || 'Slack user'
    const channelId = payload.channel_id || ''
    const slackThread = responseUrl || `${channelId}:${payload.trigger_id || ''}`

    if (!text || text === 'help') {
        return { text: helpText(), response_type: 'ephemeral' }
    }

    if (text === 'status') {
        return {
            response_type: 'ephemeral',
            text: 'Blog engine is online. GitHub remains the publishing source; Notion is editorial dashboard only.',
            blocks: slackBlocks({
                title: 'Blog Engine Status',
                message: 'Command center is reachable. Publishing still writes Markdown/MDX into GitHub, not Notion.',
                fields: [
                    { label: 'Manual approval', value: process.env.MANUAL_APPROVAL === 'false' ? 'Off' : 'On' },
                    { label: 'Auto publish', value: process.env.USE_AUTO_PUBLISH === 'true' ? 'On' : 'Off' },
                    { label: 'LLM', value: process.env.LOCAL_LLM_URL || process.env.OPENAI_API_KEY ? 'Configured' : 'Missing model config' },
                    { label: 'Schedule', value: 'Mon, Tue, Thu, Sat at 10:00 AM Pakistan time' },
                    { label: 'Notion sync', value: process.env.NOTION_API_KEY ? 'Configured' : 'Missing token' },
                    { label: 'GitHub dispatch', value: process.env.GITHUB_TOKEN || process.env.BLOG_GITHUB_TOKEN ? 'Configured' : 'Missing token' },
                ],
            }),
        }
    }

    if (text === 'report') {
        return {
            response_type: 'ephemeral',
            text: 'Performance intelligence is not fully enabled yet. Phase 4 is pending.',
            blocks: slackBlocks({
                title: 'Performance Report',
                message: 'Performance intelligence is not fully enabled yet. Phase 4 is pending.',
            }),
        }
    }

    if (text === 'system report') {
        const report = buildSystemReport(process.env)
        return {
            response_type: 'ephemeral',
            text: 'System report generated.',
            blocks: slackBlocks({
                title: 'AI Blog Engine System Report',
                message: `Full JSON report: ${process.env.SITE_URL || 'https://www.dexakif.com'}/api/blog/system-report`,
                fields: [
                    { label: 'Production ready', value: report.qualityGates.realImageRequired ? String(report.image.productionReady) : 'true' },
                    { label: 'LLM', value: report.llm.primaryProvider },
                    { label: 'Image provider', value: `${report.image.provider} (${report.image.productionReady ? 'ready' : 'missing setup'})` },
                    { label: 'Manual approval', value: report.blogEngine.manualApproval ? 'On' : 'Off' },
                    { label: 'Next run UTC', value: report.blogEngine.currentSchedule.nextRunUtc || 'not calculated' },
                    { label: 'Phase 4', value: 'Pending' },
                ],
            }),
        }
    }

    if (text === 'ideas') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_ideas',
            inputs: { command: 'ideas', dryRun: 'true', requested_by: userName },
        })
        return {
            response_type: 'ephemeral',
            text: 'Topic discovery request routed.',
            blocks: slackBlocks({
                title: 'Topic Discovery',
                message: 'Topic discovery is routed to the pipeline. Ideas will sync to Notion when credentials are configured.',
                fields: [{ label: 'GitHub', value: dispatch.ok ? dispatch.type : dispatch.reason || 'Not dispatched' }],
            }),
        }
    }

    if (text === 'generate') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_generate',
            workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml',
            inputs: { topic: '', dryRun: 'false', forceDraft: 'false', requested_by: userName },
        })
        return {
            response_type: 'ephemeral',
            text: 'Automatic draft generation routed.',
            blocks: slackBlocks({
                title: 'Draft Generation Started',
                message: 'I routed topic discovery, scoring, drafting, SEO review, quality check, image/audio fallback, and approval notification. Manual approval remains on.',
                fields: [{ label: 'GitHub', value: dispatch.ok ? dispatch.type : dispatch.reason || 'Not dispatched' }],
            }),
        }
    }

    if (text === 'schedule') {
        const sprint = process.env.FIRST_MONTH_AUTHORITY_SPRINT === 'true'
        return {
            response_type: 'ephemeral',
            text: sprint ? 'Authority sprint schedule: daily at 10:00 AM Pakistan time.' : 'Blog auto-draft schedule: Monday, Tuesday, Thursday, Saturday at 10:00 AM Pakistan time.',
            blocks: slackBlocks({
                title: 'Blog Schedule',
                message: sprint ? 'Authority sprint runs daily. Cron: `0 5 * * *` equals 10:00 AM Pakistan time.' : 'Auto-drafts run 4 times per week after sprint. Normal cadence: Monday, Tuesday, Thursday, Saturday at 10:00 AM Pakistan time.',
                fields: [
                    { label: 'Manual approval', value: process.env.MANUAL_APPROVAL === 'false' ? 'Off' : 'On' },
                    { label: 'Auto publish', value: process.env.USE_AUTO_PUBLISH === 'true' ? 'On' : 'Off' },
                    { label: 'Minimum topic score', value: process.env.MIN_TOPIC_SCORE || '75' },
                    { label: 'Minimum quality score', value: process.env.MIN_QUALITY_SCORE || '85' },
                    { label: 'Next run UTC', value: nextScheduledRun() },
                    { label: 'Next run PKT', value: '10:00 AM Pakistan time' },
                ],
            }),
        }
    }

    if (text.startsWith('sprint ')) {
        const action = extractAfter(text, 'sprint')
        if (action === 'status') {
            const sprint = sprintText()
            return { response_type: 'ephemeral', text: `Authority sprint is ${sprint.enabled ? 'enabled' : 'disabled'}. Day ${sprint.day}/${sprint.days}; ${sprint.remaining} day(s) remaining. Daily content mode is ${process.env.DAILY_CONTENT_MODE === 'true' ? 'on' : 'off'}. Next run: ${nextScheduledRun()} UTC.` }
        }
        return {
            response_type: 'ephemeral',
            text: `Sprint ${action} request noted. To persist this, set FIRST_MONTH_AUTHORITY_SPRINT=${action === 'start' ? 'true' : 'false'} in Netlify/GitHub variables.`,
        }
    }

    if (text.startsWith('new topic:')) {
        const topic = extractAfter(text, 'new topic:')
        const notion = await createBlogIdea({
            topic,
            source: 'Slack command',
            keyword: topic.toLowerCase(),
            status: 'New',
            priority: 'High',
            slackThread,
            responseUrl,
        })
        return {
            response_type: 'ephemeral',
            text: `Topic captured: ${topic}`,
            blocks: slackBlocks({
                title: 'Topic Captured',
                message: `Added topic idea for editorial review: *${topic}*`,
                fields: [{ label: 'Notion', value: notion.skipped ? notion.reason : 'Created' }],
            }),
        }
    }

    if (text.startsWith('draft:')) {
        const topic = extractAfter(text, 'draft:')
        const notion = await createBlogDraft({
            title: topic,
            topic,
            draftStatus: 'Drafting',
            approvalStatus: 'Waiting',
            slackThread,
            responseUrl,
        })
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_draft',
            workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml',
            inputs: { topic, dryRun: 'false', forceDraft: 'true', requested_by: userName },
        })
        return {
            response_type: 'ephemeral',
            text: `Draft request routed: ${topic}`,
            blocks: slackBlocks({
                title: 'Draft Requested',
                message: `I routed a draft request for *${topic}*. It stays in approval mode before publishing.`,
                fields: [
                    { label: 'Notion', value: notion.skipped ? notion.reason : 'Draft record created' },
                    { label: 'GitHub', value: dispatch.ok ? dispatch.type : dispatch.reason || 'Not dispatched' },
                ],
                actions: approvalActions({ topic, source: 'slack_draft_request' }),
            }),
        }
    }

    if (text === 'draft tomorrow') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_draft_tomorrow',
            workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml',
            inputs: { mode: 'sprint', dryRun: 'false', forceDraft: 'false', requested_by: userName },
        })
        return { response_type: 'ephemeral', text: `Tomorrow sprint draft queued. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text === 'publish latest' || text === 'approve latest') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_publish_latest',
            inputs: { command: 'approve_publish', force_publish: 'true', requested_by: userName },
        })
        return {
            response_type: 'ephemeral',
            text: 'Publish latest request routed.',
            blocks: slackBlocks({
                title: 'Publish Latest',
                message: 'I routed the approved publish request. Final content remains GitHub Markdown/MDX.',
                fields: [{ label: 'GitHub', value: dispatch.ok ? dispatch.type : dispatch.reason || 'Not dispatched' }],
            }),
        }
    }

    if (text === 'reject latest') {
        await createBlogDraft({ title: 'Latest draft', approvalStatus: 'Rejected', draftStatus: 'Rejected', notes: `Rejected from Slack by ${userName}` })
        return { response_type: 'ephemeral', text: 'Latest draft marked rejected in Notion.' }
    }

    if (text === 'rewrite latest') {
        const dispatch = await dispatchBlogWorkflow({ eventType: 'blog_rewrite_latest', inputs: { command: 'request_rewrite', forceDraft: 'true', requested_by: userName } })
        return { response_type: 'ephemeral', text: `Rewrite latest routed. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text.startsWith('change topic ')) {
        const topic = extractAfter(text, 'change topic')
        const dispatch = await dispatchBlogWorkflow({ workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml', inputs: { topic, forceDraft: 'true', dryRun: 'false', requested_by: userName } })
        return { response_type: 'ephemeral', text: `New draft routed for changed topic: ${topic}. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text.startsWith('add section ')) {
        const request = extractAfter(text, 'add section')
        await createBlogDraft({ title: 'Latest draft section request', draftStatus: 'Rewrite Needed', approvalStatus: 'Rewrite Needed', notes: `Add section: ${request}` })
        return { response_type: 'ephemeral', text: `Section request saved for latest draft: ${request}` }
    }

    if (text === 'make expert latest' || text === 'make simple latest' || text === 'improve seo latest') {
        const command = text === 'improve seo latest' ? 'improve_seo' : text === 'make expert latest' ? 'make_expert' : 'make_simple'
        const dispatch = await dispatchBlogWorkflow({ eventType: command, inputs: { command, requested_by: userName } })
        return { response_type: 'ephemeral', text: `${text} routed. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text === 'sources latest' || text === 'improve sources latest') {
        const command = text === 'sources latest' ? 'sources_latest' : 'improve_sources'
        const dispatch = await dispatchBlogWorkflow({ workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml', inputs: { command, requested_by: userName } })
        const message = text === 'sources latest'
            ? 'Latest source report routed.'
            : 'Authentic source selector rerun routed for the latest draft.'
        return { response_type: 'ephemeral', text: `${message} ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text === 'generate slides latest' || text === 'generate infographic latest') {
        const command = text.includes('slides') ? 'generate_slides' : 'generate_infographic'
        const dispatch = await dispatchBlogWorkflow({ workflow: process.env.BLOG_PIPELINE_WORKFLOW || 'blog-auto-draft.yml', inputs: { command, requested_by: userName } })
        return { response_type: 'ephemeral', text: `${text} routed. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text === 'adsense status') {
        const dispatch = await dispatchBlogWorkflow({ eventType: 'blog_adsense_status', inputs: { command: 'adsense_status', requested_by: userName } })
        return { response_type: 'ephemeral', text: `AdSense readiness check routed. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'Not dispatched.'}` }
    }

    if (text.startsWith('improve ')) {
        const [targetUrl] = splitUrlCommand(text, 'improve')
        const notion = await createRefreshTask({
            blogUrl: targetUrl,
            problem: 'Manual Slack improvement request',
            recommendedFix: 'Review Search Console/GA4 data, improve title/meta/internal links/content gaps.',
            priority: 'High',
            status: 'Open',
        })
        return {
            response_type: 'ephemeral',
            text: `Refresh task queued: ${targetUrl}`,
            blocks: slackBlocks({
                title: 'Refresh Queued',
                message: `Created a refresh queue request for ${targetUrl || 'the requested article'}.`,
                fields: [{ label: 'Notion', value: notion.skipped ? notion.reason : 'Refresh task created' }],
            }),
        }
    }

    if (text.startsWith('rewrite title ')) {
        const [targetUrl] = splitUrlCommand(text, 'rewrite title')
        await createRefreshTask({
            blogUrl: targetUrl,
            problem: 'Title rewrite requested from Slack',
            recommendedFix: 'Rewrite title for stronger CTR while preserving search intent.',
            priority: 'High',
            status: 'Open',
        })
        return { response_type: 'ephemeral', text: `Title rewrite queued for ${targetUrl}` }
    }

    if (text.startsWith('change tone ')) {
        const parts = splitUrlCommand(text, 'change tone')
        const targetUrl = parts.shift()
        const tone = parts.join(' ')
        await createRefreshTask({
            blogUrl: targetUrl,
            problem: `Tone change requested: ${tone}`,
            recommendedFix: `Revise article tone to ${tone || 'requested tone'}.`,
            priority: 'Medium',
            status: 'Open',
        })
        return { response_type: 'ephemeral', text: `Tone change queued for ${targetUrl}: ${tone}` }
    }

    if (text.startsWith('generate image ')) {
        const [targetUrl] = splitUrlCommand(text, 'generate image')
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_generate_image',
            inputs: { command: 'generate_image', url: targetUrl || '', dry_run: 'false', requested_by: userName },
        })
        return { response_type: 'ephemeral', text: `Image generation routed for ${targetUrl}. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'GitHub dispatch not configured.'}` }
    }

    if (text.startsWith('generate audio ')) {
        const [targetUrl] = splitUrlCommand(text, 'generate audio')
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_generate_audio',
            inputs: { command: 'generate_audio', url: targetUrl || '', dry_run: 'false', requested_by: userName },
        })
        return { response_type: 'ephemeral', text: `Audio generation routed for ${targetUrl}. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'GitHub dispatch not configured.'}` }
    }

    if (text === 'pause autopublish' || text === 'resume autopublish') {
        return {
            response_type: 'ephemeral',
            text: `${text === 'pause autopublish' ? 'Pause' : 'Resume'} request noted. Set USE_AUTO_PUBLISH in Netlify/GitHub environment to make this persistent.`,
        }
    }

    if (text === 'update old posts') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_update_old_posts',
            inputs: { command: 'update_old_posts', requested_by: userName },
        })
        return { response_type: 'ephemeral', text: `Old-post update scan routed. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'GitHub dispatch not configured.'}` }
    }

    if (text.startsWith('cluster ')) {
        const topic = extractAfter(text, 'cluster')
        await createBlogIdea({
            topic: `Topic cluster: ${topic}`,
            source: 'Slack cluster command',
            keyword: topic.toLowerCase(),
            status: 'Cluster Requested',
            priority: 'High',
            slackThread,
        })
        return { response_type: 'ephemeral', text: `Topic cluster request captured: ${topic}` }
    }

    return {
        response_type: 'ephemeral',
        text: `I did not recognize that command.\n\n${helpText()}`,
    }
}

export async function routeSlackInteraction(payload) {
    const action = payload.actions?.[0]
    const actionId = action?.action_id || 'unknown'
    let value = {}
    try {
        value = action?.value ? JSON.parse(action.value) : {}
    } catch {
        value = { raw: action?.value }
    }

    const actionMap = {
        blog_approve_publish: { label: 'approved for publish', command: 'approve_publish' },
        blog_request_rewrite: { label: 'rewrite requested', command: 'request_rewrite' },
        blog_improve_seo: { label: 'SEO improvement requested', command: 'improve_seo' },
        blog_change_tone: { label: 'tone change requested', command: 'change_tone' },
        blog_regenerate_image: { label: 'image regeneration requested', command: 'regenerate_image' },
        blog_generate_audio: { label: 'audio generation requested', command: 'generate_audio' },
        blog_reject: { label: 'rejected', command: 'reject' },
    }
    const mapped = actionMap[actionId] || { label: actionId, command: actionId }

    if (actionId === 'blog_approve_publish') {
        await createBlogDraft({
            title: value.topic || value.slug || 'Approved draft',
            topic: value.topic || '',
            approvalStatus: 'Approved',
            draftStatus: 'Approved',
            notes: `Approved from Slack by ${payload.user?.username || payload.user?.id || 'user'}`,
        })
    }

    const dispatch = await dispatchBlogWorkflow({
        eventType: mapped.command,
        inputs: {
            command: mapped.command,
            topic: value.topic || '',
            slug: value.slug || '',
            requested_by: payload.user?.username || payload.user?.id || '',
        },
    })

    return {
        response_type: 'ephemeral',
        text: `Blog action ${mapped.label}. ${dispatch.ok ? 'GitHub dispatch sent.' : dispatch.reason || 'GitHub dispatch not configured.'}`,
    }
}
