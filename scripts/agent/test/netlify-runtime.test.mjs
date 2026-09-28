import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { createHmac } from 'node:crypto'
import { withLambda } from '@netlify/aws-lambda-compat'
import { verifySlackEvent } from '../../../netlify/functions/_lib/slack-blog.js'

const directory = new URL('../../../netlify/functions/', import.meta.url)
const files = (await readdir(directory)).filter(name => /\.(mjs|js)$/.test(name))
const context = { requestId: 'local-runtime-test' }

test('every deployed entrypoint uses the modern runtime to avoid the legacy environment cap', async () => {
    assert.equal(files.length, 17)
    for (const file of files) {
        const module = await import(new URL(file, directory))
        assert.equal(typeof module.default, 'function', `${file} still uses the legacy runtime`)
    }
})

test('existing method and authorization guards survive the request adapter', async () => {
    const cases = [
        ['blog-approve.js', 405], ['blog-improve.js', 405], ['blog-run.js', 405],
        ['notion-webhook.js', 405], ['hume-session.js', 405], ['consultation-summary.js', 405],
        ['slack-commands.js', 405], ['slack-interactions.js', 405],
        ['blog-cloud-status.mjs', 401], ['clickup-review-status.mjs', 401],
        ['blog-draft-background.mjs', 401], ['clickup-reviews-background.mjs', 401],
    ]
    for (const [file, status] of cases) {
        const module = await import(new URL(file, directory))
        const response = await module.default(new Request(`https://example.test/.netlify/functions/${file}`), context)
        assert.equal(response.status, status, file)
    }
})

test('adapter preserves the raw Slack body used for signature verification', async () => {
    const previous = process.env.SLACK_SIGNING_SECRET
    process.env.SLACK_SIGNING_SECRET = 'local-test-only-signing-secret'
    try {
        const timestamp = String(Math.floor(Date.now() / 1000))
        const body = 'command=%2Fblog&text=hello+world&user_name=test'
        const signature = 'v0=' + createHmac('sha256', process.env.SLACK_SIGNING_SECRET).update(`v0:${timestamp}:${body}`).digest('hex')
        const handle = withLambda(async event => ({ statusCode: verifySlackEvent(event) ? 200 : 401 }))
        const request = () => new Request('https://example.test/slack', { method: 'POST', headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Slack-Request-Timestamp': timestamp, 'X-Slack-Signature': signature,
        }, body })
        assert.equal((await handle(request(), context)).status, 200)
        const tampered = request()
        tampered.headers.set('X-Slack-Signature', 'v0=' + '0'.repeat(64))
        assert.equal((await handle(tampered, context)).status, 401)
    } finally {
        if (previous === undefined) delete process.env.SLACK_SIGNING_SECRET
        else process.env.SLACK_SIGNING_SECRET = previous
    }
})

test('worker background modes and existing schedule cadence are explicit', async () => {
    for (const file of ['blog-draft-background.mjs', 'clickup-reviews-background.mjs']) {
        assert.equal((await import(new URL(file, directory))).config.background, true)
    }
    assert.equal((await import(new URL('blog-draft-schedule.mjs', directory))).config.schedule, '30 9,11 * * 1,3,5')
    assert.equal((await import(new URL('clickup-reviews-schedule.mjs', directory))).config.schedule, '7,37 * * * *')
})
