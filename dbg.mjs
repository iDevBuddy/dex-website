import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' })
const max = await page.evaluate(() => document.body.scrollHeight)
for (let y = 0; y <= max; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(110) }
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'))
    const hidden = els.filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.5).map((el) => (el.textContent || '').trim().slice(0, 30))
    return { total: els.length, hiddenCount: hidden.length, hidden }
})
console.log(JSON.stringify({ ...info, errors }, null, 2))
await browser.close()
