import nodemailer from 'nodemailer'

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let body
    try {
        body = JSON.parse(event.body || '{}')
    } catch {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }

    const { clientEmail, conversationSummary } = body
    if (!clientEmail) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) }
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    })

    const summaryHtml = conversationSummary
        ? `<tr><td style="padding:0 40px 32px;">
            <p style="margin:0 0 12px;color:#888;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Conversation Summary</p>
            <div style="background:#f9f9f9;border-left:3px solid #e05132;border-radius:4px;padding:16px 20px;">
              <pre style="margin:0;font-family:Inter,Arial,sans-serif;font-size:13px;color:#555;line-height:1.7;white-space:pre-wrap;">${conversationSummary}</pre>
            </div>
          </td></tr>`
        : ''

    const clientHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111111;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-family:monospace;color:#e05132;font-size:20px;font-weight:700;letter-spacing:2px;">DEX AI SOLUTIONS</p>
            <p style="margin:8px 0 0;color:#666;font-size:13px;letter-spacing:1px;">by Akif Saeed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 28px;">
            <h2 style="margin:0 0 16px;color:#111;font-size:22px;font-weight:700;">Thanks for connecting with us!</h2>
            <p style="margin:0 0 16px;color:#444;font-size:15px;line-height:1.7;">Hi! Sarah from DEX AI Solutions here. Thanks for your time today — it was great learning about your business and how we can help.</p>
            <p style="margin:0 0 28px;color:#444;font-size:15px;line-height:1.7;">Our founder <strong>Akif</strong> will be reaching out to you shortly to schedule your free 20-minute discovery call. Looking forward to connecting!</p>
            <a href="https://dexakif.com" style="display:inline-block;background:#e05132;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;">Visit dexakif.com</a>
          </td>
        </tr>
        ${summaryHtml}
        <tr>
          <td style="padding:24px 40px;background:#f9f9f9;border-top:1px solid #eee;">
            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">— Sarah, DEX AI Solutions</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const notifyText = `A new lead came in via the voice agent.

Email: ${clientEmail}
Time: ${new Date().toLocaleString()}

--- Conversation Summary ---
${conversationSummary || 'No transcript available'}`

    const sends = [
        transporter.sendMail({
            from: `"DEX AI Solutions" <${process.env.GMAIL_USER}>`,
            to: clientEmail,
            subject: 'Thanks for connecting with DEX AI Solutions',
            html: clientHtml,
        }),
    ]

    if (process.env.NOTIFY_EMAIL) {
        sends.push(
            transporter.sendMail({
                from: `"DEX Voice Agent" <${process.env.GMAIL_USER}>`,
                to: process.env.NOTIFY_EMAIL,
                subject: 'New Lead from DEX Voice Agent',
                text: notifyText,
            })
        )
    }

    try {
        await Promise.all(sends)
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: true }),
        }
    } catch (err) {
        console.error('Email send error:', err)
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) }
    }
}
