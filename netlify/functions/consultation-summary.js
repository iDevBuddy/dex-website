import OpenAI from 'openai'
import { z } from 'zod'
import { sendConsultationEmails } from './_lib/email.js'
import { requireEnv } from './_lib/env.js'
import { json, methodNotAllowed, parseJsonBody } from './_lib/http.js'

const transcriptEntrySchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1),
})

const requestSchema = z.object({
    mode: z.enum(['preview', 'send']).default('send'),
    reason: z.string().trim().min(1).optional(),
    sessionId: z.string().trim().min(1).optional(),
    lead: z.object({
        fullName: z.string().trim().default(''),
        email: z.string().trim().default(''),
    }),
    summary: z
        .object({
            customer_name: z.string().default(''),
            customer_email: z.string().default(''),
            business_name: z.string().default(''),
            business_problem: z.string().default(''),
            general_question: z.string().default(''),
            agent_suggestion: z.string().default(''),
        })
        .optional(),
    hume: z
        .object({
            chatId: z.string().nullable().optional(),
            chatGroupId: z.string().nullable().optional(),
            requestId: z.string().nullable().optional(),
        })
        .optional(),
    transcript: z.array(transcriptEntrySchema).default([]),
})

const summarySchema = {
    name: 'consultation_summary',
    strict: true,
    schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
            customer_name: { type: 'string' },
            customer_email: { type: 'string' },
            business_name: { type: 'string' },
            business_problem: { type: 'string' },
            general_question: { type: 'string' },
            agent_suggestion: { type: 'string' },
        },
        required: [
            'customer_name',
            'customer_email',
            'business_name',
            'business_problem',
            'general_question',
            'agent_suggestion',
        ],
    },
}

function normalizeSummary(summary, lead) {
    return {
        customer_name: summary.customer_name || lead.fullName || '',
        customer_email: summary.customer_email || lead.email || '',
        business_name: summary.business_name || '',
        business_problem: summary.business_problem || '',
        general_question: summary.general_question || '',
        agent_suggestion: summary.agent_suggestion || '',
    }
}

function cleanText(value) {
    return value.replace(/\s+/g, ' ').trim()
}

function extractEmailFromTranscript(transcript) {
    const combined = transcript.map((entry) => entry.content).join(' ')
    const match = combined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    return match ? match[0].trim() : ''
}

function extractBusinessName(transcript) {
    const userMessages = transcript.filter((entry) => entry.role === 'user').map((entry) => cleanText(entry.content))
    const patterns = [
        /\bI run ([A-Z][A-Za-z0-9&.' -]{1,80}?)(?:,|\.|\band\b|\bbut\b|$)/i,
        /\bmy business(?: name)? is ([A-Z][A-Za-z0-9&.' -]{1,80}?)(?:,|\.|\band\b|\bbut\b|$)/i,
        /\bmy company(?: name)? is ([A-Z][A-Za-z0-9&.' -]{1,80}?)(?:,|\.|\band\b|\bbut\b|$)/i,
        /\b(?:we are|we're) ([A-Z][A-Za-z0-9&.' -]{1,80}?)(?:,|\.|\band\b|\bbut\b|$)/i,
    ]

    for (const message of userMessages) {
        for (const pattern of patterns) {
            const match = message.match(pattern)
            if (match?.[1]) {
                return cleanText(match[1].replace(/[.,]$/, ''))
            }
        }
    }

    return ''
}

function extractBusinessProblem(transcript) {
    const userMessages = transcript.filter((entry) => entry.role === 'user').map((entry) => cleanText(entry.content))
    const priorityKeywords =
        /(problem|issue|stuck|bottleneck|frustrat|slow|manual|miss|lost|lead|booking|appointment|follow-up|calls?|inquiries?|workflow)/i

    const directMatch = userMessages.find((message) => priorityKeywords.test(message))
    if (directMatch) {
        return directMatch
    }

    return userMessages[0] || ''
}

function extractGeneralQuestion(transcript) {
    const userMessages = transcript.filter((entry) => entry.role === 'user').map((entry) => cleanText(entry.content))
    const directQuestion = userMessages.find((message) => message.includes('?'))
    if (directQuestion) {
        return directQuestion
    }

    const softQuestion = userMessages.find((message) => /^(how|what|can|could|would|do|does|is|are)\b/i.test(message))
    return softQuestion || ''
}

function extractAgentSuggestion(transcript) {
    const assistantMessages = transcript
        .filter((entry) => entry.role === 'assistant')
        .map((entry) => cleanText(entry.content))
        .reverse()

    const directSuggestion = assistantMessages.find((message) =>
        /(recommend|suggest|best next step|could help|can help|we could|DEX could|founder|expert|follow up)/i.test(message)
    )

    return directSuggestion || assistantMessages[0] || ''
}

function fallbackExtractSummary(payload) {
    return normalizeSummary(
        {
            customer_name: payload.lead.fullName || '',
            customer_email: payload.lead.email || extractEmailFromTranscript(payload.transcript),
            business_name: extractBusinessName(payload.transcript),
            business_problem: extractBusinessProblem(payload.transcript),
            general_question: extractGeneralQuestion(payload.transcript),
            agent_suggestion: extractAgentSuggestion(payload.transcript),
        },
        payload.lead
    )
}

async function extractSummary(payload) {
    try {
        const client = new OpenAI({
            apiKey: requireEnv('OPENAI_API_KEY'),
        })

        const transcriptText =
            payload.transcript.map((entry) => `${entry.role === 'assistant' ? 'DEX' : 'Visitor'}: ${entry.content}`).join('\n') ||
            'No transcript available.'

        const completion = await client.chat.completions.create({
            model: process.env.OPENAI_SUMMARY_MODEL || 'gpt-4.1-mini',
            response_format: {
                type: 'json_schema',
                json_schema: summarySchema,
            },
            messages: [
                {
                    role: 'system',
                    content: `
Extract a clean business consultation summary.

Rules:
- Use confirmed form values as the primary source for customer_name and customer_email.
- If the transcript clearly corrects them later, prefer the corrected value.
- Never hallucinate missing fields.
- If a field is missing, return an empty string.
- Keep values short, direct, and business-ready.
                    `.trim(),
                },
                {
                    role: 'user',
                    content: JSON.stringify(
                        {
                            lead_form: payload.lead,
                            transcript: transcriptText,
                        },
                        null,
                        2
                    ),
                },
            ],
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
            throw new Error('OpenAI returned an empty summary.')
        }

        return normalizeSummary(JSON.parse(content), payload.lead)
    } catch (error) {
        return fallbackExtractSummary(payload)
    }
}

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return methodNotAllowed(['POST'])
    }

    try {
        const payload = requestSchema.parse(await parseJsonBody(event))
        const extractedSummary = payload.summary ? normalizeSummary(payload.summary, payload.lead) : await extractSummary(payload)

        if (payload.mode === 'preview') {
            return json(200, {
                ok: true,
                summary: extractedSummary,
            })
        }

        const summary = normalizeSummary(extractedSummary, payload.lead)

        await sendConsultationEmails({
            summary,
            transcript: payload.transcript,
            lead: payload.lead,
        })

        return json(200, {
            ok: true,
            summary,
        })
    } catch (error) {
        return json(500, {
            error: error instanceof Error ? error.message : 'Failed to process the conversation summary.',
        })
    }
}
