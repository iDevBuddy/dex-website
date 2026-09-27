export async function handler() {
    if (process.env.BLOG_CLOUD_ENABLED !== 'true') return { statusCode: 200 }
    const secret = process.env.BLOG_CLOUD_SECRET
    if (!secret || secret.length < 32) throw new Error('Cloud draft authorization missing')
    const response = await fetch(`${process.env.URL}/.netlify/functions/blog-draft-background`, {
        method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(15000),
    })
    if (response.status !== 202) throw new Error(`Draft invocation HTTP ${response.status}`)
    console.log('Draft invocation accepted; completion is recorded in GitHub review branches.')
    return { statusCode: 200 }
}
