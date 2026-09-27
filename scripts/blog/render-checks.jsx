import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import assert from 'node:assert/strict'
import MarkdownRenderer from '../../src/components/blog/MarkdownRenderer'

export function verifyRenderer() {
    const body = '## Steps\n1. First\n2. Second\n\n| Input | Result |\n|---|---|\n| Request | Review |\n\n```json\n{"html":"<script>unsafe</script>"}\n```\n\n[Unsafe](javascript:alert) [Safe](/blog)'
    const html = renderToStaticMarkup(<MarkdownRenderer body={body} />)
    assert.match(html, /<ol>/); assert.match(html, /<table>/); assert.match(html, /<th scope="col">Input<\/th>/)
    assert.match(html, /<pre><code>/); assert.match(html, /&lt;script&gt;/)
    assert.ok(!html.includes('href="javascript:'))
    assert.match(html, /href="\/blog"/)
    const hidden = renderToStaticMarkup(<MarkdownRenderer body={'## Sources\nDo not repeat\n## Guidance\nKeep this'} />)
    assert.ok(!hidden.includes('Do not repeat')); assert.ok(hidden.includes('Keep this'))
    console.log('Verified Markdown tables, ordered steps, code, safe links and source-section handling.')
}
