import nodemailer from 'nodemailer'
import { optionalEnv, requireEnv } from './env.js'

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: requireEnv('GMAIL_USER'),
            pass: requireEnv('GMAIL_APP_PASSWORD'),
        },
    })
}

function row(label, value) {
    return `
        <tr>
            <td style="padding:10px 12px;border:1px solid #2a2a2a;background:#111111;color:#9ca3af;font-weight:600;width:180px;">${label}</td>
            <td style="padding:10px 12px;border:1px solid #2a2a2a;background:#0a0a0a;color:#f3f4f6;">${value || 'Not provided'}</td>
        </tr>
    `
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
}

function buildInternalEmail({ summary, transcript, lead }) {
    const safeSummary = Object.fromEntries(
        Object.entries(summary).map(([key, value]) => [key, escapeHtml(value || '')])
    )

    const transcriptHtml = transcript
        .map(
            (entry) => `
                <p style="margin:0 0 10px;color:#d1d5db;">
                    <strong style="color:#ffffff;">${entry.role === 'assistant' ? 'DEX' : 'Visitor'}:</strong>
                    ${escapeHtml(entry.content)}
                </p>
            `
        )
        .join('')

    return {
        subject: `New DEX voice consultation: ${lead.fullName || 'Unknown lead'}`,
        html: `
            <div style="font-family:Inter,Arial,sans-serif;background:#050505;padding:24px;color:#f3f4f6;">
                <h1 style="margin:0 0 16px;font-size:22px;">DEX Voice Consultation Summary</h1>
                <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
                    ${row('Customer name', safeSummary.customer_name)}
                    ${row('Customer email', safeSummary.customer_email)}
                    ${row('Business name', safeSummary.business_name)}
                    ${row('Business problem', safeSummary.business_problem)}
                    ${row('General question', safeSummary.general_question)}
                    ${row('Agent suggestion', safeSummary.agent_suggestion)}
                </table>
                <h2 style="font-size:16px;margin:0 0 12px;">Conversation transcript</h2>
                <div style="padding:16px;border:1px solid #2a2a2a;background:#0a0a0a;border-radius:16px;">
                    ${transcriptHtml || '<p style="margin:0;color:#9ca3af;">No transcript captured.</p>'}
                </div>
            </div>
        `,
        text: `
DEX Voice Consultation Summary

Customer name: ${summary.customer_name || 'Not provided'}
Customer email: ${summary.customer_email || 'Not provided'}
Business name: ${summary.business_name || 'Not provided'}
Business problem: ${summary.business_problem || 'Not provided'}
General question: ${summary.general_question || 'Not provided'}
Agent suggestion: ${summary.agent_suggestion || 'Not provided'}

Transcript:
${transcript.map((entry) => `${entry.role === 'assistant' ? 'DEX' : 'Visitor'}: ${entry.content}`).join('\n')}
        `.trim(),
    }
}

function buildCustomerEmail({ summary }) {
    const safeSummary = Object.fromEntries(
        Object.entries(summary).map(([key, value]) => [key, escapeHtml(value || '')])
    )

    return {
        subject: 'Your DEX consultation summary',
        html: `
            <div style="font-family:Inter,Arial,sans-serif;background:#050505;padding:24px;color:#f3f4f6;">
                <h1 style="margin:0 0 12px;font-size:22px;">Thank you for speaking with DEX</h1>
                <p style="margin:0 0 18px;color:#d1d5db;line-height:1.7;">
                    We captured the main points from your consultation so our team can follow up clearly.
                </p>
                <table style="border-collapse:collapse;width:100%;margin-bottom:24px;">
                    ${row('Customer name', safeSummary.customer_name)}
                    ${row('Customer email', safeSummary.customer_email)}
                    ${row('Business name', safeSummary.business_name)}
                    ${row('Business problem', safeSummary.business_problem)}
                    ${row('General question', safeSummary.general_question)}
                    ${row('Suggested next step', safeSummary.agent_suggestion)}
                </table>
                <p style="margin:0;color:#9ca3af;line-height:1.7;">
                    If you need to add anything else, simply reply to this email and the DEX team will pick it up.
                </p>
            </div>
        `,
        text: `
Thank you for speaking with DEX.

Customer name: ${summary.customer_name || 'Not provided'}
Customer email: ${summary.customer_email || 'Not provided'}
Business name: ${summary.business_name || 'Not provided'}
Business problem: ${summary.business_problem || 'Not provided'}
General question: ${summary.general_question || 'Not provided'}
Suggested next step: ${summary.agent_suggestion || 'Not provided'}
        `.trim(),
    }
}

export async function sendConsultationEmails({ summary, transcript, lead }) {
    const notifyEmail = requireEnv('NOTIFY_EMAIL')
    const fromEmail = requireEnv('GMAIL_USER')
    const transporter = createTransporter()

    const internalEmail = buildInternalEmail({ summary, transcript, lead })
    const customerEmail = buildCustomerEmail({ summary })

    await transporter.sendMail({
        from: fromEmail,
        to: notifyEmail,
        subject: internalEmail.subject,
        html: internalEmail.html,
        text: internalEmail.text,
    })

    const customerAddress = summary.customer_email || lead.email || optionalEnv('DEFAULT_CUSTOMER_EMAIL')
    if (!customerAddress) {
        return
    }

    await transporter.sendMail({
        from: fromEmail,
        to: customerAddress,
        subject: customerEmail.subject,
        html: customerEmail.html,
        text: customerEmail.text,
    })
}
