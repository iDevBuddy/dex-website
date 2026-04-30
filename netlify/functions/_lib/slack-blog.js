import { createHmac, timingSafeEqual } from 'node:crypto'
import { createBlogDraft, createBlogIdea, createPerformanceReport, createRefreshTask } from './notion-dashboard.js'
import { dispatchBlogWorkflow } from './github-dispatch.js'

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
        '`/blog ideas` - topic discovery status',
        '`/blog new topic: [topic]` - add idea',
        '`/blog draft: [topic]` - request a draft',
        '`/blog publish latest` - publish latest approved draft',
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
                    { label: 'Notion sync', value: process.env.NOTION_API_KEY ? 'Configured' : 'Missing token' },
                    { label: 'GitHub dispatch', value: process.env.GITHUB_TOKEN || process.env.BLOG_GITHUB_TOKEN ? 'Configured' : 'Missing token' },
                ],
            }),
        }
    }

    if (text === 'report') {
        const notion = await createPerformanceReport({
            summary: `Report requested by ${userName} from Slack.`,
            recommendedActions: 'Run the blog-performance workflow or npm run blog:performance.',
        })
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_report',
            inputs: { command: 'report', requested_by: userName },
        })
        return {
            response_type: 'ephemeral',
            text: 'Performance report request routed.',
            blocks: slackBlocks({
                title: 'Report Requested',
                message: 'I routed the performance report request. Notion receives the dashboard record when configured.',
                fields: [
                    { label: 'Notion', value: notion.skipped ? notion.reason : 'Queued/created' },
                    { label: 'GitHub', value: dispatch.ok ? dispatch.type : dispatch.reason || 'Not dispatched' },
                ],
            }),
        }
    }

    if (text === 'ideas') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_ideas',
            inputs: { command: 'ideas', dry_run: 'true', requested_by: userName },
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
            draftStatus: 'Requested',
            approvalStatus: 'Needs Approval',
            slackThread,
            responseUrl,
        })
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_draft',
            inputs: { command: 'draft', topic, dry_run: 'true', manual_approval: 'true', requested_by: userName },
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

    if (text === 'publish latest') {
        const dispatch = await dispatchBlogWorkflow({
            eventType: 'blog_publish_latest',
            inputs: { command: 'publish_latest', force_publish: 'true', requested_by: userName },
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

    if (text.startsWith('improve ')) {
        const [targetUrl] = splitUrlCommand(text, 'improve')
        const notion = await createRefreshTask({
            blogUrl: targetUrl,
            problem: 'Manual Slack improvement request',
            recommendedFix: 'Review Search Console/GA4 data, improve title/meta/internal links/content gaps.',
            priority: 'High',
            status: 'Needs Review',
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
            status: 'Needs Review',
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
            status: 'Needs Review',
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
