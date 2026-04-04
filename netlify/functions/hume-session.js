import { z } from 'zod'
import { buildSessionSettings, ensureHumeConfigId, fetchHumeAccessToken } from './_lib/hume.js'
import { json, methodNotAllowed, parseJsonBody } from './_lib/http.js'

const requestSchema = z.object({
    fullName: z.string().trim().optional().default(''),
    email: z.string().trim().optional().default(''),
})

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return methodNotAllowed(['POST'])
    }

    try {
        const payload = requestSchema.parse(await parseJsonBody(event))

        const [accessToken, configId, sessionSettings] = await Promise.all([
            fetchHumeAccessToken(),
            ensureHumeConfigId(),
            buildSessionSettings({
                fullName: payload.fullName,
                email: payload.email,
            }),
        ])

        return json(200, {
            accessToken,
            configId,
            sessionId: sessionSettings.customSessionId,
        })
    } catch (error) {
        return json(500, {
            error: error instanceof Error ? error.message : 'Failed to initialize the voice consultation.',
        })
    }
}
