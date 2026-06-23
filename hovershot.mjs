import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5181/', { waitUntil: 'networkidle' })
let top = await page.evaluate(() => document.getElementById('process').getBoundingClientRect().top + window.scrollY)
for (let y = 0; y <= top; y += 400) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(90) }
await page.evaluate((yy) => window.scrollTo(0, yy), top)
await page.waitForTimeout(500)
await page.locator('#process button').nth(2).click()
await page.waitForTimeout(900)
// re-anchor to the section top after layout settles
top = await page.evaluate(() => document.getElementById('process').getBoundingClientRect().top + window.scrollY)
await page.evaluate((yy) => window.scrollTo(0, yy - 20), top)
await page.waitForTimeout(700)
await page.screenshot({ path: 'shot-process-3.png' })
await browser.close()
console.log('done')
