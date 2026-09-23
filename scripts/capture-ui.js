import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, '.impeccable', 'review');
const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
await fs.mkdir(output, { recursive: true });

const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--disable-gpu'] });
const targets = [
  { name: 'desktop', url: 'http://127.0.0.1:4173/', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile', url: 'http://127.0.0.1:4173/', viewport: { width: 390, height: 844, deviceScaleFactor: 1 } },
  { name: 'admin', url: 'http://127.0.0.1:4173/admin', viewport: { width: 1440, height: 1000 } },
];

try {
  for (const target of targets) {
    const page = await browser.newPage();
    await page.setViewport(target.viewport);
    await page.goto(target.url, { waitUntil: 'networkidle0' });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('body *')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return box.right > document.documentElement.clientWidth + 1 || box.left < -1;
        })
        .slice(0, 20)
        .map((element) => ({ tag: element.tagName, className: element.className, box: element.getBoundingClientRect().toJSON() })),
    }));
    if (process.env.DIAGNOSE_ONLY !== '1') {
      await page.screenshot({ path: path.join(output, `${target.name}.png`), fullPage: true });
      if (target.name === 'desktop') {
        await page.type('#catalog-query', 'Cien');
        await page.keyboard.press('Enter');
        await new Promise((resolve) => setTimeout(resolve, 500));
        await page.screenshot({ path: path.join(output, 'search-reordered.png'), fullPage: false });
        await page.click('[data-hero-book-id]');
        await page.waitForSelector('#brick-detail:not([hidden])');
        await page.screenshot({ path: path.join(output, 'detail-inline.png'), fullPage: false });
      }
    }
    console.log(JSON.stringify({ name: target.name, ...metrics }));
    await page.close();
  }
} finally {
  await browser.close();
}
