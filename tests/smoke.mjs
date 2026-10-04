// Smoke test: loads every route of the roadmap in Chromium and fails on any page error, a missing
// heading, or horizontal scrolling on a phone-sized screen. Also checks that each share page redirects.
// Run: python3 -m http.server 8000 & node tests/smoke.mjs   (needs: npm i --no-save playwright)
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:8000/';
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', e => failures.push(`page error on ${page.url()}: ${e.message}`));
await page.goto(BASE + 'index.html#flows');

const routes = await page.evaluate(() => [
  'flows', 'graph', 'topics', 'progress', 'visuals', 'radar', 'review', 'new', 'tracker', 'map', 'ch13',
  ...Object.values(T).flatMap(t => ['topic/' + t.slug, 'graph/' + t.slug, 'review/' + t.slug]),
  ...FL.flatMap(f => ['flow/' + f.slug, ...f.steps.map((_, i) => `flow/${f.slug}/${i + 1}`)]),
]);
for (const r of routes) {
  await page.evaluate(h => { location.hash = h; }, r);
  await page.waitForTimeout(25);
  const h1 = await page.evaluate(() => document.querySelector('main h1')?.textContent || '');
  if (!h1 || /not found/i.test(h1)) failures.push(`#${r}: no page heading (${h1 || 'empty'})`);
}

const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
phone.on('pageerror', e => failures.push(`page error on ${phone.url()}: ${e.message}`));
for (const r of ['flows', 'topics', 'topic/rag', 'flow/agentic-systems/6', 'progress', 'radar', 'review/rag', 'visuals']) {
  await phone.goto(BASE + 'index.html#' + r);
  await phone.waitForTimeout(150);
  const sw = await phone.evaluate(() => document.documentElement.scrollWidth);
  if (sw > 391) failures.push(`#${r}: page scrolls sideways on a phone (${sw}px wide)`);
}

for (const [file, want] of [['share/topic-rag.html#reading-list', '#topic/rag/reading-list'], ['share/flow-evals.html', '#flow/evals'], ['share/radar.html', '#radar']]) {
  await page.goto(BASE + file);
  await page.waitForTimeout(150);
  const got = await page.evaluate(() => location.hash);
  if (got !== want) failures.push(`${file} redirected to ${got}, expected ${want}`);
}

await browser.close();
console.log(`Checked ${routes.length} routes.`);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log('All good.');
