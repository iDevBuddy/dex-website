import fs from 'node:fs/promises'
import path from 'node:path'

export const rootDir = process.cwd()
export const contentDir = path.join(rootDir, 'content', 'blog')
export const dataDir = path.join(rootDir, 'data', 'blog')
export const imageDir = path.join(rootDir, 'public', 'blog', 'images')
export const audioDir = path.join(rootDir, 'public', 'blog', 'audio')

export function slugify(value) {
    return String(value)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function parseFrontmatter(raw) {
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
    if (!match) return { data: {}, body: raw }
    const data = {}
    match[1].split(/\r?\n/).forEach((line) => {
        const separator = line.indexOf(':')
        if (separator === -1) return
        const key = line.slice(0, separator).trim()
        const value = line.slice(separator + 1).trim()
        if (value.startsWith('[') || value.startsWith('{')) {
            try {
                data[key] = JSON.parse(value)
                return
            } catch {
                data[key] = value
                return
            }
        }
        data[key] = value.replace(/^["']|["']$/g, '')
    })
    return { data, body: match[2].trim() }
}

export function stringifyFrontmatter(data, body) {
    const lines = Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) || typeof value === 'object') return `${key}: ${JSON.stringify(value)}`
        return `${key}: "${String(value).replaceAll('"', '\\"')}"`
    })
    return `---\n${lines.join('\n')}\n---\n\n${body.trim()}\n`
}

export async function ensureBlogDirs() {
    await fs.mkdir(contentDir, { recursive: true })
    await fs.mkdir(dataDir, { recursive: true })
    await fs.mkdir(imageDir, { recursive: true })
    await fs.mkdir(audioDir, { recursive: true })
}

export async function readJson(file, fallback) {
    try {
        return JSON.parse(await fs.readFile(file, 'utf8'))
    } catch {
        return fallback
    }
}

export async function writeJson(file, data) {
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`)
}

export async function readPosts() {
    await ensureBlogDirs()
    const files = await fs.readdir(contentDir)
    const posts = []
    for (const file of files.filter((item) => item.endsWith('.md'))) {
        const raw = await fs.readFile(path.join(contentDir, file), 'utf8')
        const parsed = parseFrontmatter(raw)
        posts.push({
            file,
            path: path.join(contentDir, file),
            slug: parsed.data.slug || file.replace(/\.md$/, ''),
            ...parsed,
        })
    }
    return posts
}
