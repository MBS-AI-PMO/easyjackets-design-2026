// scripts/uploadToLiveStorage.mjs
//
// Stores enhanced photos on the LIVE site's upload storage through its admin
// image upload (POST /api/v1/features/blogs/upload-image). That endpoint is a
// plain file store: it creates no gallery or blog entries, so nothing on the
// live site shows these files. Each photo's public URL is written back into
// the manifest, which is what the new storefront renders.
//
// The live server encodes every upload itself (fit inside its max edge, WebP),
// so each photo is sent as a lossless PNG master straight from the original:
// one encoding step, no second-generation loss.
//
//   LIVE_ADMIN_TOKEN=<jwt> node scripts/uploadToLiveStorage.mjs <manifest.json> <photoDir>
//   LIVE_ADMIN_EMAIL=… LIVE_ADMIN_PASSWORD=… node scripts/uploadToLiveStorage.mjs <manifest.json> <photoDir>
//
// LIVE_API_URL defaults to https://api.easyjackets.com. Entries that already
// have a url are skipped, so the script can be re-run after a failure.
import fs from 'node:fs/promises';
import path from 'node:path';
import { enhance } from './lib/enhance.mjs';

const [manifestPath, photoDir] = process.argv.slice(2);
if (!manifestPath || !photoDir) {
  console.error('usage: node scripts/uploadToLiveStorage.mjs <manifest.json> <photoDir>');
  process.exit(1);
}
const API = (process.env.LIVE_API_URL || 'https://api.easyjackets.com').replace(/\/+$/, '');

async function token() {
  if (process.env.LIVE_ADMIN_TOKEN) return process.env.LIVE_ADMIN_TOKEN;
  const { LIVE_ADMIN_EMAIL: email, LIVE_ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) throw new Error('set LIVE_ADMIN_TOKEN, or LIVE_ADMIN_EMAIL and LIVE_ADMIN_PASSWORD');
  const r = await fetch(`${API}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const body = await r.json().catch(() => ({}));
  if (!r.ok || !body.token) throw new Error(`login failed: ${body.message || r.status}`);
  return body.token;
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const pending = manifest.filter((e) => !e.url);
if (!pending.length) { console.log('every photo already has a url — nothing to upload'); process.exit(0); }
const auth = await token();
let done = 0;
for (const entry of pending) {
  const { data, info } = await enhance(path.join(photoDir, entry.file), { format: 'png' });
  const form = new FormData();
  form.append('image', new Blob([data], { type: 'image/png' }), `${entry.slug}.png`);
  const r = await fetch(`${API}/api/v1/features/blogs/upload-image`, { method: 'POST', headers: { Authorization: auth }, body: form });
  const body = await r.json().catch(() => ({}));
  if (!r.ok || !body.url) {
    console.error(`  ! ${entry.slug}: ${body.message || r.status}`);
    continue;
  }
  entry.url = body.url;
  entry.key = body.key;
  done += 1;
  console.log(`  ${entry.slug} (${info.width}x${info.height}) -> ${body.url}`);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n'); // progress survives a failure
}
console.log(`${done}/${pending.length} uploaded; manifest updated: ${manifestPath}`);
