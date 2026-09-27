import { timingSafeEqual } from 'node:crypto'
export function authorized(event, secret = process.env.BLOG_CLOUD_SECRET) {
    if (!secret || secret.length < 32) return false
    const supplied = String(event.headers?.authorization || '').replace(/^Bearer /, '')
    const a = Buffer.from(supplied), b = Buffer.from(secret)
    return a.length === b.length && timingSafeEqual(a, b)
}
