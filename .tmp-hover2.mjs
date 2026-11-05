import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('http://localhost:3100/', { waitUntil: 'networkidle', timeout: 120000 });
for (const [section, label] of [['#schools','schools'],['#students','students'],['#curriculum','curriculum']]) {
  const card = page.locator(`${section} article`).first();
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(400);
  const overlay = card.locator('span[aria-hidden]').first();
  const before = await overlay.evaluate(el => getComputedStyle(el).opacity);
  await card.hover();
  await page.waitForTimeout(400);
  const after = await overlay.evaluate(el => getComputedStyle(el).opacity);
  console.log(label, 'overlay opacity before/after:', before, after);
}
await browser.close();
