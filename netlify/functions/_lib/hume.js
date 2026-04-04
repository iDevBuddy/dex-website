import crypto from 'node:crypto'
import { HumeClient } from 'hume'
import { buildConsultationPrompt } from './prompt.js'
import { optionalEnv, requireEnv } from './env.js'

const DEFAULT_CONFIG_NAME = 'DEX Website Consultant'
const DEFAULT_MODEL = 'gpt-5-mini'

function encodeBasicAuth(apiKey, secretKey) {
    return Buffer.from(`${apiKey}:${secretKey}`, 'utf8').toString('base64')
}

export async function fetchHumeAccessToken() {
    const apiKey = requireEnv('HUME_API_KEY')
    const secretKey = requireEnv('HUME_SECRET_KEY')

    const response = await fetch('https://api.hume.ai/oauth2-cc/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${encodeBasicAuth(apiKey, secretKey)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
        }).toString(),
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch Hume access token: ${response.status} ${response.statusText}`)
    }

    const payload = await response.json()
    return payload.access_token
}

function createHumeClient() {
    return new HumeClient({
        apiKey: requireEnv('HUME_API_KEY'),
    })
}

async function findConfigByName(client, configName) {
    const page = await client.empathicVoice.configs.listConfigs({
        pageNumber: 0,
        pageSize: 100,
        ascendingOrder: false,
    })

    for await (const config of page) {
        if (config.name === configName) {
            return config.id
        }
    }

    return null
}

export async function ensureHumeConfigId() {
    const configuredId = optionalEnv('HUME_CONFIG_ID')
    if (configuredId) {
        return configuredId
    }

    const client = createHumeClient()
    const configName = optionalEnv('HUME_CONFIG_NAME', DEFAULT_CONFIG_NAME)
    const voiceId = requireEnv('HUME_VOICE_ID')
    const existingId = await findConfigByName(client, configName)

    if (existingId) {
        return existingId
    }

    const created = await client.empathicVoice.configs.createConfig({
        name: configName,
        eviVersion: '3',
        voice: {
            id: voiceId,
        },
        languageModel: {
            modelProvider: 'OPEN_AI',
            modelResource: optionalEnv('HUME_LANGUAGE_MODEL', DEFAULT_MODEL),
            temperature: 0.35,
        },
    })

    return created.id
}

export async function buildSessionSettings({ fullName = '', email = '' } = {}) {
    const prompt = await buildConsultationPrompt()
    const voiceId = optionalEnv('HUME_VOICE_ID')
    const safeName = fullName.trim()
    const safeEmail = email.trim()
    const knownDetails =
        safeName || safeEmail
            ? `Known details so far: visitor name is ${safeName || 'not provided'}, visitor email is ${safeEmail || 'not provided'}. Use these only if the visitor does not correct them.`
            : 'No contact details are known yet. Collect name and email naturally only when useful.'

    return {
        type: 'session_settings',
        customSessionId: crypto.randomUUID(),
        systemPrompt: prompt,
        variables: {
            customer_name: safeName,
            customer_email: safeEmail,
        },
        metadata: {
            source: 'dex_website_voice_consultation',
            customerName: safeName,
            customerEmail: safeEmail,
        },
        context: {
            text: knownDetails,
            type: 'persistent',
        },
        ...(voiceId ? { voiceId } : {}),
    }
}
