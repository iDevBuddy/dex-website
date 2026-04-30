import { config } from './config.mjs'

export async function generateWithModel(messages, { temperature = 0.4 } = {}) {
    const endpoint = config.localLlmUrl
    const body = {
        model: config.localLlmModel,
        messages,
        temperature,
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(process.env.OPENAI_API_KEY ? { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } : {}),
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`AI provider failed: ${response.status} ${await response.text()}`)
    }

    const json = await response.json()
    return json.choices?.[0]?.message?.content || json.output_text || ''
}

export function buildFallbackArticle(topic, brief) {
    const slug = topic.slug
    const title = brief?.title || `How to Use ${topic.topic} in a Practical Business Automation Workflow`
    const body = `## The direct business use case

${topic.topic} matters when it removes repetitive work, improves response speed, or gives leaders better visibility into operations.

- Start with one painful workflow
- Define the trigger, owner, inputs, decision rules, and expected output
- Add AI only where language understanding, summarization, classification, or generation creates a measurable improvement
- Keep a human approval step for customer-facing or high-risk actions

## Step-by-step workflow

- Capture the incoming request from Slack, a website form, CRM, inbox, or support channel
- Classify the request by intent, urgency, and account value
- Retrieve the relevant customer or process context
- Generate a recommended response or next action
- Route the task to the right owner when confidence is low
- Log the outcome for reporting and future optimization

## Common mistakes

- Automating a broken process before simplifying it
- Letting an AI agent take irreversible actions without approval
- Measuring only cost savings instead of response time, quality, and conversion impact
- Publishing AI content without examples, sources, or review

## What to do next

Pick one workflow that happens every week, write down the manual steps, and create a small automation that saves time without removing human control.`

    return {
        frontmatter: {
            title,
            metaTitle: `${title} | DEX by Akif Saeed`,
            description: brief?.description || `A practical guide to applying ${topic.topic} in business automation without unsafe shortcuts.`,
            metaDescription: brief?.description || `Learn how to apply ${topic.topic} in useful AI automation workflows with quality controls and business-focused examples.`,
            slug,
            subtitle: `A practical business automation playbook for ${topic.topic}.`,
            author: config.authorName,
            publishedAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString().slice(0, 10),
            category: topic.category || config.defaultCategory,
            image: `/blog/images/${slug}.png`,
            imageAlt: `AI automation workflow dashboard for ${topic.topic}`,
            directAnswer: `${topic.topic} can support business automation when it is attached to a clear workflow, quality checks, and human approval for risky actions.`,
            tone: 'Business owner practical guide',
            targetKeyword: topic.keyword || topic.topic.toLowerCase(),
            faqs: [
                {
                    question: `Is ${topic.topic} useful for small businesses?`,
                    answer: 'Yes, when it is tied to a specific repetitive workflow and measured against time saved, response speed, or conversion quality.',
                },
                {
                    question: 'Should this workflow be fully automated?',
                    answer: 'Start with approval-based automation. Move toward full automation only when confidence, logs, and failure handling are strong.',
                },
            ],
            sources: [
                {
                    title: 'Google Search Essentials',
                    url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
                },
            ],
            related: [],
        },
        body,
        imagePrompt: `Professional dark dashboard showing ${topic.topic} as an AI automation workflow, orange accent, realistic SaaS interface, no text artifacts.`,
        audioScript: `${title}. This guide explains how to apply ${topic.topic} in a practical business automation workflow.`,
    }
}
