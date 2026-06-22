// Regenerate a cover for an already-published slug and patch its frontmatter.
// Run: node --env-file=.env.local scripts/agent/_cover.mjs <slug>
import { readFileSync, writeFileSync } from 'fs'
import { generateCover } from './artdirector.mjs'

const slug = process.argv[2]
if (!slug) { console.log('usage: _cover.mjs <slug>'); process.exit(1) }
const file = `content/blog/${slug}.md`
const md = readFileSync(file, 'utf8')
const title = (md.match(/^title:\s*"(.+)"/m) || [])[1] || slug
console.log(`cover for: ${title}`)

const res = await generateCover({ title }, { slug })
console.log(res.ok ? `✓ ${res.image} (${res.model}, ${(res.bytes / 1024).toFixed(0)}KB)` : `✗ ${res.error}`)
if (res.ok) {
    writeFileSync(file, md.replace(/^image:\s*".*"$/m, `image: "${res.image}"`))
    console.log('  patched frontmatter image path')
}
