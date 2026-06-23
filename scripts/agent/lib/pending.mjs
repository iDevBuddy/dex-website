/**
 * Pending drafts — a post sits here (committed, but NOT in content/blog, so
 * the live site never shows it) until you approve it in ClickUp. On approval
 * the publisher moves it into content/blog. Guarded throughout.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs'

const DIR = 'data/blog/pending'

export function savePending(slug, data) {
    try { mkdirSync(DIR, { recursive: true }); writeFileSync(`${DIR}/${slug}.json`, JSON.stringify(data, null, 2)); return true } catch { return false }
}

export function readPending(slug) {
    try { return JSON.parse(readFileSync(`${DIR}/${slug}.json`, 'utf8')) } catch { return null }
}

export function pendingSlugs() {
    try { return readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')) } catch { return [] }
}

export function removePending(slug) {
    try { rmSync(`${DIR}/${slug}.json`); return true } catch { return false }
}
