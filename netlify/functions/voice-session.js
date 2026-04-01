const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io'
const DEFAULT_AGENT_ID = 'agent_4501kn3whsk4eq6a22eyqpxf43nc'

function json(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
        },
        body: JSON.stringify(body),
    }
}

function safeString(value, maxLength = 80) {
    if (typeof value !== 'string') return ''
    return value.trim().replace(/[^a-zA-Z0-9 _.-]/g, '').slice(0, maxLength)
}

async function parseErrorResponse(response) {
    try {
        const data = await response.json()
        if (data?.detail?.message) return data.detail.message
        if (typeof data?.message === 'string') return data.message
        if (typeof data?.error === 'string') return data.error
    } catch {
        const text = await response.text().catch(() => '')
        if (text) return text.slice(0, 300)
    }
    return `HTTP ${response.status}`
}

function getQuery(agentId, participantName, branchId) {
    const query = new URLSearchParams({ agent_id: agentId })
    if (participantName) query.set('participant_name', participantName)
    if (branchId) query.set('branch_id', branchId)
    return query.toString()
}

async function getConversationToken({ apiKey, agentId, participantName, branchId }) {
    const query = getQuery(agentId, participantName, branchId)
    const response = await fetch(`${ELEVENLABS_API_BASE}/v1/convai/conversation/token?${query}`, {
        method: 'GET',
        headers: {
            'xi-api-key': apiKey,
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`Token request failed: ${await parseErrorResponse(response)}`)
    }

    const data = await response.json()
    if (!data?.token) {
        throw new Error('Token response missing token.')
    }

    return data.token
}

async function getSignedUrl({ apiKey, agentId, participantName, branchId }) {
    const query = getQuery(agentId, participantName, branchId)
    const endpoints = [
        `${ELEVENLABS_API_BASE}/v1/convai/conversation/get-signed-url?${query}`,
        `${ELEVENLABS_API_BASE}/v1/convai/conversation/get_signed_url?${query}`,
    ]

    let lastError = null
    for (const url of endpoints) {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
                Accept: 'application/json',
            },
        })

        if (!response.ok) {
            lastError = `Signed URL request failed (${url}): ${await parseErrorResponse(response)}`
            continue
        }

        const data = await response.json()
        if (data?.signed_url) {
            return data.signed_url
        }

        lastError = `Signed URL response missing signed_url (${url}).`
    }

    throw new Error(lastError || 'Signed URL request failed.')
}

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return json(405, { error: 'Method Not Allowed' })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
        return json(500, { error: 'Voice backend is not configured.' })
    }

    let body = {}
    try {
        body = JSON.parse(event.body || '{}')
    } catch {
        return json(400, { error: 'Invalid JSON body.' })
    }

    const agentId = safeString(body.agentId || process.env.ELEVENLABS_AGENT_ID || DEFAULT_AGENT_ID, 120)
    const participantName = safeString(body.participantName, 80)
    const branchId = safeString(body.branchId, 120)

    if (!agentId) {
        return json(400, { error: 'Missing agent id.' })
    }

    try {
        const conversationToken = await getConversationToken({ apiKey, agentId, participantName, branchId })
        return json(200, {
            connectionType: 'webrtc',
            conversationToken,
        })
    } catch (tokenError) {
        console.error('Voice token error:', tokenError)
        try {
            const signedUrl = await getSignedUrl({ apiKey, agentId, participantName, branchId })
            return json(200, {
                connectionType: 'websocket',
                signedUrl,
            })
        } catch (signedUrlError) {
            console.error('Voice signed URL error:', signedUrlError)
            return json(502, {
                error: 'Unable to create voice session.',
                details: {
                    tokenError: tokenError?.message || 'token request failed',
                    signedUrlError: signedUrlError?.message || 'signed URL request failed',
                },
            })
        }
    }
}
