import { z } from 'zod'
import { buildSessionSettings, ensureHumeConfigId, fetchHumeAccessToken } from './_lib/hume.js'
import { json, methodNotAllowed, parseJsonBody } from './_lib/http.js'

const emailSchema = z.string().trim().email()

const requestSchema = z.object({
    fullName: z.string().trim().optional().default(''),
    email: z
        .string()
        .trim()
        .optional()
        .transform((value) => value ?? '')
        .refine((value) => value === '' || emailSchema.safeParse(value).success, {
            message: 'Invalid email address.',
        }),
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
            buildSessionSettings(payload),
        ])

        return json(200, {
            accessToken,
            configId,
            sessionId: sessionSettings.customSessionId,
            sessionSettings,
        })
    } catch (error) {
        return json(500, {
            error: error instanceof Error ? error.message : 'Failed to create the Hume session.',
        })
    }
}
