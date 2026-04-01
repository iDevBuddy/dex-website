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

    const { clientName, clientEmail, clientPhone, conversationSummary } = body
    if (!clientEmail) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing email' }) }
    }

    const name = clientName || 'Valued Client'
    const phone = clientPhone || 'Not provided'
    const transcript = conversationSummary || 'No transcript available'

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    })

    // ── Client email ──
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
          <td style="padding:36px 40px 28px;">
            <h2 style="margin:0 0 16px;color:#111;font-size:22px;font-weight:700;">Hi ${name}! Thanks for connecting.</h2>
            <p style="margin:0 0 20px;color:#444;font-size:15px;line-height:1.7;">Sarah from DEX AI Solutions here. It was great speaking with you today and learning about your business.</p>
            <p style="margin:0 0 28px;color:#444;font-size:15px;line-height:1.7;">Our founder <strong>Akif</strong> will be reaching out to you shortly to schedule your free 20-minute discovery call. Looking forward to connecting!</p>
            <a href="https://dexakif.com" style="display:inline-block;background:#e05132;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;">Visit dexakif.com</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #eee;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;">Your Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong style="color:#333;">Name:</strong> ${name}</p>
                  <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong style="color:#333;">Email:</strong> ${clientEmail}</p>
                  <p style="margin:0;font-size:14px;color:#555;"><strong style="color:#333;">Phone:</strong> ${phone}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;">Conversation Summary</p>
            <div style="background:#f9f9f9;border-left:3px solid #e05132;border-radius:4px;padding:16px 20px;">
              <pre style="margin:0;font-family:Inter,Arial,sans-serif;font-size:13px;color:#555;line-height:1.8;white-space:pre-wrap;">${transcript}</pre>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#f9f9f9;border-top:1px solid #eee;">
            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">— Sarah, DEX AI Solutions</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    // ── Owner notification email ──
    const ownerHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111111;padding:24px 40px;">
            <p style="margin:0;font-family:monospace;color:#e05132;font-size:16px;font-weight:700;letter-spacing:2px;">NEW LEAD — DEX VOICE AGENT</p>
            <p style="margin:6px 0 0;color:#666;font-size:12px;">${new Date().toLocaleString()}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:16px 24px;border-bottom:1px solid #eee;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;">Contact Info</p>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;">
                  <p style="margin:0 0 8px;font-size:15px;color:#333;"><strong>Name:</strong> ${name}</p>
                  <p style="margin:0 0 8px;font-size:15px;color:#333;"><strong>Email:</strong> <a href="mailto:${clientEmail}" style="color:#e05132;">${clientEmail}</a></p>
                  <p style="margin:0;font-size:15px;color:#333;"><strong>Phone / WhatsApp:</strong> ${phone}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#999;">Full Conversation</p>
            <div style="background:#f9f9f9;border-left:3px solid #e05132;border-radius:4px;padding:16px 20px;">
              <pre style="margin:0;font-family:Inter,Arial,sans-serif;font-size:13px;color:#555;line-height:1.8;white-space:pre-wrap;">${transcript}</pre>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const sends = [
        transporter.sendMail({
            from: `"DEX AI Solutions" <${process.env.GMAIL_USER}>`,
            to: clientEmail,
            subject: `Thanks for connecting, ${name}! — DEX AI Solutions`,
            html: clientHtml,
        }),
    ]

    if (process.env.NOTIFY_EMAIL) {
        sends.push(
            transporter.sendMail({
                from: `"DEX Voice Agent" <${process.env.GMAIL_USER}>`,
                to: process.env.NOTIFY_EMAIL,
                subject: `New Lead: ${name} — DEX Voice Agent`,
                html: ownerHtml,
            })
        )
    }

    // ── WhatsApp notification via Green API (optional) ──
    const waInstance = process.env.WHATSAPP_INSTANCE_ID
    const waToken = process.env.WHATSAPP_API_TOKEN
    const companyWa = process.env.COMPANY_WHATSAPP

    if (waInstance && waToken && companyWa) {
        const waMessage = `🔥 *New Lead — DEX Voice Agent*\n\n👤 *Name:* ${name}\n📧 *Email:* ${clientEmail}\n📱 *Phone:* ${phone}\n🕐 *Time:* ${new Date().toLocaleString()}\n\n💬 *Conversation:*\n${transcript.slice(0, 800)}${transcript.length > 800 ? '...' : ''}`

        sends.push(
            fetch(`https://api.green-api.com/waInstance${waInstance}/sendMessage/${waToken}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: `${companyWa}@c.us`,
                    message: waMessage,
                }),
            }).catch(() => { /* silent if WhatsApp fails */ })
        )

        // Send WhatsApp to client too if they provided phone
        if (clientPhone && clientPhone.trim()) {
            const cleanPhone = clientPhone.replace(/[\s\-\+\(\)]/g, '')
            const clientWaMessage = `Hi ${name}! 👋\n\nSarah from *DEX AI Solutions* here. Thanks for chatting with us today!\n\nOur founder *Akif* will reach out to you shortly to schedule your free discovery call.\n\nLooking forward to connecting! 🚀`
            sends.push(
                fetch(`https://api.green-api.com/waInstance${waInstance}/sendMessage/${waToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chatId: `${cleanPhone}@c.us`,
                        message: clientWaMessage,
                    }),
                }).catch(() => { /* silent */ })
            )
        }
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
