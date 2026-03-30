import OpenAI from 'openai'

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    let body
    try {
        body = JSON.parse(event.body || '{}')
    } catch {
        return { statusCode: 400, body: JSON.stringify({ fallback: true, text: '' }) }
    }

    const { text } = body
    if (!text) {
        return { statusCode: 400, body: JSON.stringify({ fallback: true, text: '' }) }
    }

    const provider = process.env.TTS_PROVIDER || 'openai'

    try {
        if (provider === 'elevenlabs') {
            const voiceId = process.env.ELEVENLABS_VOICE_ID
            if (!voiceId || !process.env.ELEVENLABS_API_KEY) throw new Error('ElevenLabs not configured')

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2_5',
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
                }),
            })

            if (!response.ok) throw new Error(`ElevenLabs error: ${response.status}`)
            const buffer = Buffer.from(await response.arrayBuffer())
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: buffer.toString('base64') }),
            }
        }

        // Default: OpenAI TTS
        if (!process.env.OPENAI_API_KEY) throw new Error('OpenAI key not configured')
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const mp3 = await client.audio.speech.create({
            model: 'tts-1',
            voice: process.env.OPENAI_TTS_VOICE || 'nova',
            input: text,
            response_format: 'mp3',
        })
        const buffer = Buffer.from(await mp3.arrayBuffer())
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: buffer.toString('base64') }),
        }
    } catch (err) {
        console.error('TTS error:', err)
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fallback: true, text }),
        }
    }
}
