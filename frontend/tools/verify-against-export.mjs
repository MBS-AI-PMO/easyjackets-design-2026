// End-to-end verification of the conversion.
//
//   1. Serves the original export (the folder on the Desktop) and renders each
//      page with its own runtime; serves the Vite app; renders each route.
//   2. Compares the visible text of every page, line by line.
//   3. On the app: console errors/warnings, horizontal overflow at phone width,
//      elements wider than the viewport, and a screenshot per page at 390px.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const EXPORT_DIR = path.resolve(process.argv[2]);
const APP_URL = process.argv[3];          // e.g. http://localhost:5173
const OUT = process.argv[4];
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['Easy Jackets Landing v2.dc.html', '/'],
  ['Easy Jackets Listing.dc.html', '/shop'],
  ['Easy Jackets Product.dc.html', '/product'],
  ['Easy Jackets Design.dc.html', '/design'],
  ['Easy Jackets How To Design.dc.html', '/how-to-design'],
  ['Easy Jackets Bulk.dc.html', '/bulk-orders'],
  ['Easy Jackets Blog.dc.html', '/blog'],
  ['Easy Jackets Blog Post.dc.html', '/blog/design-a-jacket-thats-uniquely-yours'],
  ['Easy Jackets FAQ.dc.html', '/faq'],
  ['Easy Jackets Size Chart.dc.html', '/size-chart'],
  ['Easy Jackets Material Colors.dc.html', '/material-colors'],
  ['Easy Jackets Fabrics.dc.html', '/fabrics'],
  ['Easy Jackets Gallery.dc.html', '/gallery'],
  ['Easy Jackets About.dc.html', '/about'],
  ['Easy Jackets Contact.dc.html', '/contact'],
  ['Easy Jackets Reviews.dc.html', '/reviews'],
  ['Easy Jackets Shipping Returns.dc.html', '/shipping-returns'],
  ['Easy Jackets Privacy Policy.dc.html', '/privacy-policy'],
  ['Easy Jackets Terms.dc.html', '/terms'],
  ['Easy Jackets Track Order.dc.html', '/track-order'],
  ['Easy Jackets Cart.dc.html', '/cart'],
  ['Easy Jackets Checkout.dc.html', '/checkout'],
  ['Easy Jackets Order Confirmation.dc.html', '/order-confirmation'],
  ['Easy Jackets Account.dc.html', '/account'],
  ['Easy Jackets Dashboard.dc.html', '/dashboard'],
  ['Easy Jackets United States.dc.html', '/united-states'],
  ['Easy Jackets State.dc.html', '/united-states/alabama'],
  ['Easy Jackets Style Guide.dc.html', '/style-guide'],
  ['Easy Jackets 404.dc.html', '/this-page-does-not-exist'],
];

// --- tiny static server for the export -------------------------------------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const file = path.join(EXPORT_DIR, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(EXPORT_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const EXPORT_URL = `http://localhost:${server.address().port}`;


// Scroll through the page so lazy images start, then wait for them to finish
// (bounded), so text and screenshots reflect the loaded page.
const settle = async (page) => {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } window.scrollTo(0, 0); });
  await page.evaluate(() => Promise.race([
    Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }))),
    new Promise((r) => setTimeout(r, 6000)),
  ]));
  await page.waitForTimeout(200);
};
const norm = (t) => t.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
const textOf = (page) => page.evaluate(() => document.body.innerText);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
try {
  // 1. original export, desktop width (its runtime pulls React from a CDN)
  const orig = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const op = await orig.newPage();
  const origText = {};
  for (const [file] of PAGES) {
    await op.goto(`${EXPORT_URL}/${encodeURIComponent(file)}`, { waitUntil: 'networkidle', timeout: 60000 });
    await op.waitForFunction(() => !document.querySelector('.sc-placeholder') && document.body.innerText.length > 200, null, { timeout: 30000 }).catch(() => {});
    await settle(op);
    origText[file] = norm(await textOf(op));
  }
  await orig.close();

  // 2. the app at desktop width: text + console
  const desk = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dp = await desk.newPage();
  const consoleMsgs = [];
  dp.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push({ route: dp.url().replace(APP_URL, ''), type: m.type(), text: m.text().slice(0, 300) }); });
  dp.on('pageerror', (e) => consoleMsgs.push({ route: dp.url().replace(APP_URL, ''), type: 'pageerror', text: String(e).slice(0, 300) }));
  const appText = {};
  for (const [, route] of PAGES) {
    await dp.goto(APP_URL + route, { waitUntil: 'networkidle', timeout: 60000 });
    await settle(dp);
    appText[route] = norm(await textOf(dp));
  }
  await desk.close();

  // 3. the app at phone width: overflow + screenshots
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mp = await mob.newPage();
  const overflow = {};
  for (const [, route] of PAGES) {
    await mp.goto(APP_URL + route, { waitUntil: 'networkidle', timeout: 60000 });
    await settle(mp);
    overflow[route] = await mp.evaluate(() => {
      const vw = window.innerWidth;
      const wide = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') {
          const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean).slice(0, 2).join('.') : '');
          wide.push(`${tag} right=${Math.round(r.right)} w=${Math.round(r.width)} :: ${(el.textContent || '').trim().slice(0, 40)}`);
          if (wide.length >= 6) break;
        }
      }
      return { scrollWidth: document.documentElement.scrollWidth, vw, wide };
    });
    const name = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '_');
    await mp.screenshot({ path: path.join(OUT, `m-${name}.png`), fullPage: true });
  }
  await mob.close();

  // report
  for (const [file, route] of PAGES) {
    const a = new Set(appText[route]), o = new Set(origText[file]);
    const missing = origText[file].filter((l) => !a.has(l));
    const extra = appText[route].filter((l) => !o.has(l));
    const ov = overflow[route];
    results.push({ file, route, origLines: origText[file].length, appLines: appText[route].length, missing, extra, overflow: ov.scrollWidth > ov.vw ? ov : null });
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ results, consoleMsgs }, null, 2));
  console.log('page'.padEnd(46), 'orig', ' app', ' miss', 'extra', 'overflow');
  for (const r of results) console.log(r.file.replace('Easy Jackets ', '').replace('.dc.html', '').padEnd(46), String(r.origLines).padStart(4), String(r.appLines).padStart(4), String(r.missing.length).padStart(5), String(r.extra.length).padStart(5), r.overflow ? `${r.overflow.scrollWidth}>${r.overflow.vw}` : '  -');
  console.log('\nconsole errors/warnings:', consoleMsgs.length);
  const seen = new Set();
  for (const m of consoleMsgs) { const k = m.type + m.text.slice(0, 80); if (seen.has(k)) continue; seen.add(k); console.log(' ', m.route, m.type, '|', m.text.slice(0, 200)); if (seen.size >= 25) break; }
} finally {
  await browser.close();
  server.close();
}
