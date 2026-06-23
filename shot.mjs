import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5181/'
const out = process.argv[3] || 'shot.png'
const target = process.argv[4] || '0'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await page.goto(url, { waitUntil: 'networkidle' })

if (target.startsWith('#')) {
    // stepped scroll to element, triggering reveals along the way
    const top = await page.evaluate((sel) => {
        const el = document.querySelector(sel)
        return el ? el.getBoundingClientRect().top + window.scrollY : 0
    }, target)
    for (let y = 0; y <= top; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(110) }
    await page.evaluate((yy) => window.scrollTo(0, yy - 30), top)
} else {
    const scrollY = Number(target)
    for (let y = 0; y <= scrollY; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(110) }
    await page.evaluate((yy) => window.scrollTo(0, yy), scrollY)
}
await page.waitForTimeout(1600)
await page.screenshot({ path: out })
await browser.close()
console.log('saved', out)
