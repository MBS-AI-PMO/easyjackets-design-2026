// Behavioural verification of the app (the export comparison lives in
// verify-against-export.mjs). Checks, in headless Chrome:
//   - every internal link on every page resolves to a real route (no 404s)
//   - every hash link's target id exists on the page it points to
//   - no horizontal overflow at phone, tablet and laptop widths
//   - console errors/warnings on every route at every width
//   - the interactive flows: drawer, shop filters (+ ?style / ?material),
//     product add-to-cart, cart quantities and scenarios, blog filter,
//     dashboard tabs, account -> dashboard, checkout -> confirmation,
//     promo toggle, 404 page
import { chromium } from 'playwright-core';

const APP = process.argv[2] || 'http://127.0.0.1:5174';
const ROUTES = ['/', '/shop', '/product', '/design', '/how-to-design', '/bulk-orders', '/blog', '/blog/design-a-jacket-thats-uniquely-yours', '/faq', '/size-chart', '/material-colors', '/fabrics', '/gallery', '/about', '/contact', '/reviews', '/shipping-returns', '/privacy-policy', '/terms', '/track-order', '/cart', '/checkout', '/order-confirmation', '/account', '/dashboard', '/united-states', '/united-states/alabama', '/style-guide'];

const failures = [];
const fail = (what) => { failures.push(what); console.log('  FAIL', what); };
const ok = (what) => console.log('  ok  ', what);
const expect = (cond, what) => (cond ? ok(what) : fail(what));

const browser = await chromium.launch({ channel: 'chrome' });
const consoleMsgs = [];
const newPage = async (viewport, mobile = false) => {
  const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`${page.url().replace(APP, '')} ${m.type()}: ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => consoleMsgs.push(`${page.url().replace(APP, '')} pageerror: ${String(e).slice(0, 160)}`));
  return { ctx, page };
};
const settle = async (page) => {
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } window.scrollTo(0, 0); });
  await page.waitForTimeout(150);
};
const is404 = (page) => page.evaluate(() => !!document.querySelector('.pg-not-found'));

try {
  // ---- 1. links, hashes, overflow at three widths ------------------------
  const linkTargets = new Map(); // path -> from
  const hashTargets = new Map(); // "path#hash" -> from
  for (const [w, h, mobile] of [[390, 844, true], [820, 1180, false], [1366, 900, false]]) {
    console.log(`\n== ${w}px ==`);
    const { ctx, page } = await newPage({ width: w, height: h }, mobile);
    let overflow = 0;
    for (const route of ROUTES) {
      await page.goto(APP + route, { waitUntil: 'networkidle' });
      await settle(page);
      const sw = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      if (sw[0] > sw[1]) { overflow++; fail(`${route} overflows at ${w}px (${sw[0]} > ${sw[1]})`); }
      if (w === 1366) {
        const hrefs = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')));
        for (const href of hrefs) {
          if (!href || /^(https?:|mailto:|tel:)/.test(href) || href === '#') continue;
          if (href.startsWith('#')) { if (href !== '#top') hashTargets.set(`${route}${href}`, route); continue; }
          const [pathAndQuery, hash] = href.split('#');
          const path = pathAndQuery.split('?')[0];
          linkTargets.set(path, route);
          if (hash) hashTargets.set(`${path}#${hash}`, route);
        }
      }
    }
    expect(overflow === 0, `no horizontal overflow on ${ROUTES.length} routes at ${w}px`);
    await ctx.close();
  }

  console.log('\n== internal links ==');
  {
    const { ctx, page } = await newPage({ width: 1366, height: 900 });
    let bad = 0;
    for (const [path, from] of linkTargets) {
      await page.goto(APP + path, { waitUntil: 'networkidle' });
      if (await is404(page)) { bad++; fail(`link ${path} (from ${from}) lands on the 404 page`); }
    }
    expect(bad === 0, `${linkTargets.size} distinct internal link targets all resolve to real pages`);
    let badHash = 0;
    for (const [target, from] of hashTargets) {
      const [path, hash] = target.split('#');
      await page.goto(APP + path, { waitUntil: 'networkidle' });
      const found = await page.evaluate((id) => !!document.getElementById(decodeURIComponent(id)), hash);
      if (!found) { badHash++; fail(`hash target ${target} (from ${from}) has no element with that id`); }
    }
    expect(badHash === 0, `${hashTargets.size} hash links all have a target on their page`);
    await ctx.close();
  }

  // ---- 2. interactive flows ----------------------------------------------
  console.log('\n== interactions ==');
  {
    const { ctx, page } = await newPage({ width: 390, height: 844 }, true);
    await page.goto(APP + '/', { waitUntil: 'networkidle' });
    await page.click('.ez-burger');
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.querySelector('.ez-drawer').classList.contains('is-open')), 'phone drawer opens from the menu button');
    await page.click('.ez-drawer-close');
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => !document.querySelector('.ez-drawer').classList.contains('is-open')), 'drawer closes from the × button');
    await page.click('.ez-burger'); await page.waitForTimeout(300);
    await page.click('.ez-drawer-links a[href="/faq"]');
    await page.waitForURL(APP + '/faq'); await page.waitForTimeout(300);
    expect(await page.evaluate(() => !document.querySelector('.ez-drawer').classList.contains('is-open')), 'drawer link navigates to /faq and the drawer closes');
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ez-nav-cta')).display === 'none'), 'nav call-to-action hidden on phones');
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage({ width: 1366, height: 900 });
    const count = () => page.evaluate(() => [...document.querySelectorAll('[data-slot]')].filter((e) => /^lst-\d+$/.test(e.dataset.slot)).length);
    await page.goto(APP + '/shop', { waitUntil: 'networkidle' });
    const all = await count();
    await page.click('button:has-text("Bomber")');
    await page.waitForTimeout(200);
    expect(all === 18 && (await count()) === 2, `shop type tab filters (all=${all}, bomber=${await count()})`);
    await page.goto(APP + '/shop?style=Bomber%20Jackets', { waitUntil: 'networkidle' });
    expect((await count()) === 2, 'shop honours ?style=Bomber Jackets from the nav');
    await page.goto(APP + '/shop?material=Melton%20Wool', { waitUntil: 'networkidle' });
    expect((await count()) === 3, 'shop honours ?material=Melton Wool from the nav');
    await page.goto(APP + '/shop', { waitUntil: 'networkidle' });
    await page.selectOption('select.ez-select', 'price-asc');
    await page.waitForTimeout(200);
    const firstId = await page.evaluate(() => [...document.querySelectorAll('[data-slot]')].map((e) => e.dataset.slot).find((v) => /^lst-\d+$/.test(v)));
    expect(firstId === 'lst-16', `shop sort by price ascending puts the $82 coach jacket first (got ${firstId})`);

    await page.goto(APP + '/product', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Add to cart")');
    await page.waitForTimeout(200);
    const needSize = await page.evaluate(() => document.body.innerText.toLowerCase().includes('size'));
    expect(needSize, 'product: add to cart without a size asks for a size');
    await page.click('button.ez-chip:has-text("M")');
    await page.click('button:has-text("Add to cart")');
    await page.waitForTimeout(200);
    const navCta = await page.evaluate(() => document.querySelector('.ez-nav-cta').textContent.trim());
    expect(navCta === 'Cart · 1', `product: adding updates the nav cart count (${navCta})`);
    await page.click('button[aria-label="Increase"]');
    await page.waitForTimeout(100);
    const addLabel = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.includes('Add to cart'))?.textContent.trim());
    expect(/\$300$/.test(addLabel || ''), `product: quantity 2 doubles the price (${addLabel})`);

    await page.goto(APP + '/cart', { waitUntil: 'networkidle' });
    const total = () => page.evaluate(() => document.body.innerText.match(/Total\s*\$?([\d,]+)/i)?.[1]);
    const t1 = await total();
    await page.click('button[aria-label="Increase"]');
    await page.waitForTimeout(150);
    const t2 = await total();
    expect(t1 && t2 && Number(t2.replace(',', '')) > Number(t1.replace(',', '')), `cart: + increases the total (${t1} → ${t2})`);
    await page.goto(APP + '/cart?scenario=team', { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.body.innerText.includes('TEAM10 applied')), 'cart: ?scenario=team applies the team promo');
    await page.goto(APP + '/cart?scenario=empty', { waitUntil: 'networkidle' });
    expect((await page.evaluate(() => document.querySelectorAll('[data-slot^="cart-"]').length)) === 0, 'cart: ?scenario=empty shows no items');

    await page.goto(APP + '/blog', { waitUntil: 'networkidle' });
    const featBefore = await page.evaluate(() => !!document.querySelector('.ez-feat'));
    await page.click('button.ez-chip:has-text("Materials")');
    await page.waitForTimeout(150);
    const featAfter = await page.evaluate(() => !!document.querySelector('.ez-feat'));
    const posts = await page.evaluate(() => document.querySelectorAll('[data-slot^="blog-"]').length);
    expect(featBefore && !featAfter && posts === 2, `blog: category chip filters posts (featured ${featBefore}→${featAfter}, Materials=${posts})`);

    await page.goto(APP + '/dashboard', { waitUntil: 'networkidle' });
    await page.click('button:has-text("Orders")');
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.querySelectorAll('[data-slot^="ord-"]').length === 4), 'dashboard: Orders tab lists the 4 orders');
    await page.click('button:has-text("Delivered")');
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => document.querySelectorAll('[data-slot^="ord-"]').length === 2), 'dashboard: Delivered filter narrows to 2');

    await page.goto(APP + '/account', { waitUntil: 'networkidle' });
    await page.evaluate(() => { for (const i of document.querySelectorAll('input[required]')) { i.value = i.type === 'email' ? 'jordan@example.com' : 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
    await page.click('form button[type="submit"]');
    await page.waitForURL(APP + '/dashboard', { timeout: 5000 }).then(() => ok('account: sign in navigates to /dashboard')).catch(() => fail('account: sign in did not navigate to /dashboard'));

    await page.goto(APP + '/checkout', { waitUntil: 'networkidle' });
    await page.evaluate(() => { for (const i of document.querySelectorAll('input[required], select[required]')) { if (i.tagName === 'SELECT') i.selectedIndex = 1; else i.value = i.type === 'email' ? 'jordan@example.com' : i.type === 'tel' ? '5125550144' : 'x'; i.dispatchEvent(new Event('input', { bubbles: true })); } });
    await page.click('button:has-text("Place order")');
    await page.waitForURL(APP + '/order-confirmation', { timeout: 5000 }).then(() => ok('checkout: place order navigates to /order-confirmation')).catch(() => fail('checkout: place order did not navigate to /order-confirmation'));

    await page.goto(APP + '/?showPromo=false', { waitUntil: 'networkidle' });
    expect(!(await page.evaluate(() => document.body.innerText.includes('Back-to-school'))), 'home: ?showPromo=false hides the promo bar');
    await page.goto(APP + '/?primaryCta=builder', { waitUntil: 'networkidle' });
    expect(await page.evaluate(() => document.querySelector('.ez-nav-cta').textContent.trim() === 'Design your jacket'), 'home: ?primaryCta=builder swaps the calls to action');
    await page.goto(APP + '/definitely-not-a-page', { waitUntil: 'networkidle' });
    expect(await is404(page), 'unknown URL renders the 404 page');
    await page.goto(APP + '/#faq', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    expect((await page.evaluate(() => Math.abs(document.getElementById('faq').getBoundingClientRect().top))) < 140, 'home: /#faq scrolls to the FAQ section');
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log('\n== console ==');
const uniq = [...new Set(consoleMsgs)];
expect(uniq.length === 0, `no console errors/warnings across all runs (${uniq.length})`);
for (const m of uniq.slice(0, 20)) console.log('   ', m);
console.log(`\n${failures.length === 0 ? 'ALL CHECKS PASSED' : failures.length + ' CHECK(S) FAILED'}`);
process.exit(failures.length ? 1 : 0);
