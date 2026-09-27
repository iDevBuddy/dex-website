export async function handler() {
    if (process.env.CONTEXT !== 'production') return { statusCode: 200 }
    if (process.env.BLOG_CLOUD_ENABLED !== 'true') return { statusCode: 200 }
    if (!(process.env.CLICKUP_TOKEN || process.env.clickup) || !process.env.CLICKUP_LIST_ID) {
        console.log('ClickUp approval sync inactive: configuration missing')
        return { statusCode: 200 }
    }
    const secret = process.env.BLOG_CLOUD_SECRET
    if (!secret || secret.length < 32) throw new Error('Cloud authorization missing')
    const response = await fetch(`${process.env.URL}/.netlify/functions/clickup-reviews-background`, {
        method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(15000),
    })
    if (response.status !== 202) throw new Error(`ClickUp invocation HTTP ${response.status}`)
    return { statusCode: 200 }
}
