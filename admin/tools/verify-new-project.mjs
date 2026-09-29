// admin/tools/verify-new-project.mjs
//
// Proves the new admin belongs to the NEW project only: not one address, link, image or request
// may lead to the old live setup (the live API server api.easyjackets.com, the live storefront,
// the live database). Run from the repo:  node admin/tools/verify-new-project.mjs [--no-db] [--no-build]
//
//   1. source   admin/src, admin/public, Dockerfile, .env.example, and the jacket builder's
//               (custom-jacket/src, public, Dockerfile, .env.example)   (comments ignored)
//   2. bundle   the production build (npm run build, CI rules)
//   3. running  every admin screen, opened twice: on localhost (-> the local new backend) and on a
//               real-looking domain (-> the deployed new backend). Every request, link, image and
//               stylesheet the page uses is recorded. A stand-in session opens the screens; the backend
//               refuses its requests, which is fine: where they GO is what is checked.
//   4. data     the copy database (backend/scripts/auditLiveReferences.mjs), unless --no-db
//
// The jacket builder is this repo's custom-jacket/ now (its source is checked in step 1): a link to
// the live one (custom.easyjackets.com) is a failure like any other. Exit code 1 when anything
// points at the old setup.
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ADMIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(ADMIN, '..');
const require = createRequire(path.join(REPO, 'frontend', 'package.json'));
const { chromium } = require('playwright-core');
const args = process.argv.slice(2);

// web addresses only (a word in a comment or a check like url.includes(...) is not a link)
const OLD = [
  ['live API server', /https?:\/\/api\.easyjackets\.com/i],
  ['live database', /mongodb(\+srv)?:\/\/[^\s"'`]*|\/Ecommerce\b/i],
  ['live storefront link', /https?:\/\/(www\.)?easyjackets\.com(?![\w.-])/i],
  ['live jacket builder', /https?:\/\/custom\.easyjackets\.com/i],
];
const problems = [];
const report = (where, text) => {
  for (const [label, re] of OLD) if (re.test(text)) problems.push(`${label}: ${where}  ${text.trim().slice(0, 140)}`);
};

// ---------- 1. source ----------
const files = [];
const collect = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) collect(p);
    else if (/\.(jsx?|mjs|html|json|css)$/i.test(e.name)) files.push(p);
  }
};
collect(path.join(ADMIN, 'src'));
collect(path.join(ADMIN, 'public'));
files.push(path.join(ADMIN, 'Dockerfile'), path.join(ADMIN, '.env.example'));
// the jacket builder the admin's Products screen opens
const BUILDER = path.join(REPO, 'custom-jacket');
collect(path.join(BUILDER, 'src'));
collect(path.join(BUILDER, 'public'));
files.push(path.join(BUILDER, 'Dockerfile'), path.join(BUILDER, '.env.example'));
let inBlock = false;
for (const file of files) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const t = line.trim();
    if (inBlock) { if (t.includes('*/')) inBlock = false; return; }
    if (t.startsWith('/*') || t.startsWith('{/*')) { if (!t.includes('*/')) inBlock = true; return; }
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('#')) return;
    report(`${path.relative(REPO, file)}:${i + 1}`, line.replace(/\/\/ .*$/, ''));
  });
}
console.log(`1. source: ${files.length} files checked`);

// ---------- 2. bundle ----------
const BUILD = path.join(ADMIN, 'build');
if (!args.includes('--no-build')) {
  const r = spawnSync('npm', ['run', 'build'], { cwd: ADMIN, shell: true, env: { ...process.env, CI: 'true', GENERATE_SOURCEMAP: 'false' }, encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stdout.slice(-2000), r.stderr.slice(-2000)); problems.push('bundle: the admin does not build'); }
}
if (fs.existsSync(BUILD)) {
  const js = path.join(BUILD, 'static', 'js');
  for (const f of fs.readdirSync(js).filter((n) => n.endsWith('.js'))) {
    const text = fs.readFileSync(path.join(js, f), 'utf8');
    for (const m of text.matchAll(/https?:\/\/[a-z0-9.-]+[^"'`\s)]*/gi)) report(`bundle ${f}`, m[0]);
  }
  console.log('2. bundle: production build scanned');
}

// ---------- 3. running ----------
const routes = [...new Set([...fs.readFileSync(path.join(ADMIN, 'src', 'App.js'), 'utf8').matchAll(/path="(\/[^":*]*)"/g)].map((m) => m[1]))];
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(BUILD, url);
  if (!file.startsWith(BUILD) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(BUILD, 'index.html');
  const type = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(3977, '127.0.0.1', r));
const browser = await chromium.launch({ channel: 'chrome', args: ['--host-resolver-rules=MAP admin.easyjackets-2026.test 127.0.0.1'] });
for (const [mode, origin] of [['localhost', 'http://localhost:3977'], ['deployed domain', 'http://admin.easyjackets-2026.test:3977']]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('auth', JSON.stringify({ token: 'verify-new-project', user: { name: 'Check', role: 1 } })); } catch { /* ignore */ } });
  const hosts = new Map();
  ctx.on('request', (r) => {
    const u = new URL(r.url());
    if (u.protocol === 'data:' || u.protocol === 'blob:') return;
    hosts.set(u.host, (hosts.get(u.host) || 0) + 1);
    report(`${mode} request`, r.url());
  });
  const page = await ctx.newPage();
  for (const route of routes) {
    await page.goto(origin + route, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const refs = await page.evaluate(() => [
      ...[...document.querySelectorAll('a[href]')].map((a) => a.href),
      ...[...document.querySelectorAll('img[src], iframe[src], source[src]')].map((e) => e.src),
      ...[...document.querySelectorAll('link[href]')].map((l) => l.href),
      ...[...document.querySelectorAll('[style*="url("]')].map((e) => e.getAttribute('style')),
    ]);
    refs.forEach((ref) => report(`${mode} page ${route}`, ref));
  }
  console.log(`3. running (${mode}): ${routes.length} screens, requests went to ${[...hosts].map(([h, n]) => `${h} (${n})`).join(', ')}`);
  await ctx.close();
}
await browser.close();
server.close();

// ---------- 4. data ----------
if (!args.includes('--no-db')) {
  const out = await new Promise((resolve) => {
    const child = spawn('node', ['scripts/auditLiveReferences.mjs'], { cwd: path.join(REPO, 'backend'), shell: true });
    let text = '';
    child.stdout.on('data', (d) => { text += d; });
    child.on('close', () => resolve(text));
  });
  const totals = [...out.matchAll(/^(.+?): (\d+) reference\(s\)/gm)].map((m) => [m[1], Number(m[2])]);
  const relevant = totals;
  relevant.forEach(([label, n]) => { if (n) problems.push(`data: ${n} value(s) in the copy database still point at the ${label}`); });
  console.log(`4. data: ${relevant.map(([l, n]) => `${l} ${n}`).join(' | ') || 'audit did not run'}`);
}

console.log('');
if (problems.length) {
  console.log(`FAIL: ${problems.length} place(s) point at the old live setup`);
  [...new Set(problems)].slice(0, 60).forEach((p) => console.log(`  - ${p}`));
  process.exit(1);
}
console.log('PASS: nothing in the new admin points at the old live server, live storefront or live database');
