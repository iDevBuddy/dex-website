import { config } from './config.mjs'
import { warn } from './logger.mjs'

async function notion(path, body) {
    if (!config.notionEnabled || !process.env.NOTION_API_KEY) return { skipped: true }
    const response = await fetch(`https://api.notion.com/v1/${path}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
            'Content-Type': 'application/json',
            'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(`Notion API failed: ${response.status} ${await response.text()}`)
    return response.json()
}

export async function createNotionPage(databaseId, properties) {
    if (!databaseId) return { skipped: true }
    try {
        return await notion('pages', {
            parent: { database_id: databaseId },
            properties,
        })
    } catch (error) {
        warn('notion_sync_failed', { message: error.message })
        return { ok: false, error: error.message }
    }
}

export function titleProperty(text) {
    return { title: [{ text: { content: String(text).slice(0, 2000) } }] }
}

export function richTextProperty(text) {
    return { rich_text: [{ text: { content: String(text).slice(0, 2000) } }] }
}

export function numberProperty(value) {
    return { number: Number(value) || 0 }
}
