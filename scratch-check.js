import { chromium } from 'playwright';

async function run() {
    console.log("Launching headless browser...");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text(), msg.location());
        }
    });
    
    page.on('pageerror', err => {
        console.log('BROWSER EXCEPTION CRASH:', err.message);
        console.log(err.stack);
    });
    
    console.log("Navigating to https://dexakif.netlify.app/ ...");
    await page.goto('https://dexakif.netlify.app/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log("Finished page load check.");
    await browser.close();
}

run().catch(console.error);
