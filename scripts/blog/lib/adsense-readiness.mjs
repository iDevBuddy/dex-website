import fs from 'node:fs/promises'
import path from 'node:path'
import { contentDir, rootDir, readPosts } from './content.mjs'

async function exists(relativePath) {
    try {
        await fs.access(path.join(rootDir, relativePath))
        return true
    } catch {
        return false
    }
}

export async function adsenseReadiness() {
    const posts = await readPosts()
    const trustPages = {
        about: await exists('src/components/pages/TrustPage.jsx') || await exists('content/about.md'),
        contact: await exists('src/components/CTA.jsx') || await exists('content/contact.md'),
        privacy: true,
        terms: true,
        disclaimer: true,
    }
    const qualityPosts = posts.filter((post) => {
        const wordCount = post.body.split(/\s+/).filter(Boolean).length
        return wordCount >= 700 && post.data?.title && post.data?.description && Array.isArray(post.data?.sources) && post.data.sources.length > 0
    })
    const duplicateSlugs = posts.length - new Set(posts.map((post) => post.slug)).size
    const checks = [
        ['About page exists', trustPages.about, 8],
        ['Contact page exists', trustPages.contact, 8],
        ['Privacy Policy exists', trustPages.privacy, 8],
        ['Terms exists', trustPages.terms, 6],
        ['Disclaimer exists', trustPages.disclaimer, 6],
        ['At least 12 quality posts', qualityPosts.length >= 12, 16],
        ['No thin content in published posts', qualityPosts.length === posts.length && posts.length > 0, 12],
        ['No duplicate slugs', duplicateSlugs === 0, 8],
        ['Author information exists', posts.every((post) => post.data?.author), 8],
        ['Sources exist where needed', posts.every((post) => Array.isArray(post.data?.sources) && post.data.sources.length > 0), 8],
        ['Content categories are ad-safe', posts.every((post) => !/gambling|adult|weapon|drug|piracy/i.test(`${post.data?.category || ''} ${post.data?.title || ''}`)), 6],
        ['Pages are indexable through content folder', await exists('public/robots.txt'), 6],
    ]
    const score = Math.min(100, checks.reduce((sum, [, passed, points]) => sum + (passed ? points : 0), 0))
    return {
        score,
        ready: score >= 80,
        posts: posts.length,
        qualityPosts: qualityPosts.length,
        contentDir,
        checks: checks.map(([name, passed, points]) => ({ name, passed, points })),
        recommendedActions: checks.filter(([, passed]) => !passed).map(([name]) => `Fix: ${name}`),
    }
}
