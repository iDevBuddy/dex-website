export async function dispatchBlogWorkflow({ eventType = 'blog_command', workflow = process.env.BLOG_PIPELINE_WORKFLOW || 'blog-pipeline.yml', inputs = {} } = {}) {
    const token = process.env.GITHUB_TOKEN || process.env.BLOG_GITHUB_TOKEN
    const repo = process.env.GITHUB_REPOSITORY || process.env.BLOG_GITHUB_REPO || 'iDevBuddy/dex-website'
    const ref = process.env.BLOG_GITHUB_REF || 'main'
    if (!token) return { skipped: true, reason: 'GITHUB_TOKEN missing' }

    const [owner, name] = repo.split('/')
    const workflowUrl = `https://api.github.com/repos/${owner}/${name}/actions/workflows/${workflow}/dispatches`
    const workflowResponse = await fetch(workflowUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ ref, inputs }),
    })

    if (workflowResponse.status === 204) return { ok: true, type: 'workflow_dispatch', workflow, inputs }

    const repositoryResponse = await fetch(`https://api.github.com/repos/${owner}/${name}/dispatches`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ event_type: eventType, client_payload: inputs }),
    })

    if (repositoryResponse.status === 204) return { ok: true, type: 'repository_dispatch', eventType, inputs }

    return {
        ok: false,
        workflowStatus: workflowResponse.status,
        repositoryStatus: repositoryResponse.status,
        workflowDetail: await workflowResponse.text(),
        repositoryDetail: await repositoryResponse.text(),
    }
}
