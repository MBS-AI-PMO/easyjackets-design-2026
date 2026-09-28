// scripts/warmImageCache.mjs
//
// Pulls every catalogue image through a running backend once, so the mirror
// (helpers/uploadMirror.js) and the resizer (helpers/imageResize.js) have done
// their work before the first visitor arrives. Safe to run again at any time;
// files already on disk are just served.
//
//   node scripts/warmImageCache.mjs                  # against http://127.0.0.1:8080
//   WARM_BASE_URL=https://api2.example.com node scripts/warmImageCache.mjs
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import productModel from '../models/productModel.js';

const BASE = (process.env.WARM_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8080}`).replace(/\/+$/, '');
const WIDTHS = (process.env.WARM_WIDTHS || '480,640,960').split(',').map((w) => parseInt(w, 10)).filter(Boolean);
const CONCURRENCY = 4;
const LEGACY = /^https?:\/\/api\.easyjackets\.com\/uploads\//i;

const keyOf = (url) => {
  if (!url) return null;
  if (LEGACY.test(url)) return url.replace(LEGACY, '');
  if (/^https?:\/\//.test(url)) return null; // some other host, not ours to mirror
  return url.replace(/^\/?uploads\//, '').replace(/^\/+/, '');
};

await connectDB();
const db = mongoose.connection.db;
const keys = new Set();
for (const p of await productModel.find({}).select('frontImage otherImages').lean()) {
  for (const u of [p.frontImage, ...(p.otherImages || [])]) { const k = keyOf(u); if (k) keys.add(k); }
}
const collect = async (collection, fields) => {
  const docs = await db.collection(collection).find({}).project(Object.fromEntries(fields.map((f) => [f, 1]))).toArray();
  for (const d of docs) for (const f of fields) for (const u of [].concat(d[f] || [])) { const k = keyOf(u); if (k) keys.add(k); }
};
await collect('galleries', ['imageUrl', 'imageUrls']);
await collect('patchphotos', ['imageUrl', 'imageUrls']);
await collect('blogs', ['image']);
await collect('fabriccolors', ['imageUrl']);
await collect('categories', ['image', 'imageUrl']);
await collect('materials', ['image', 'imageUrl']);
await mongoose.disconnect();

const list = [...keys];
console.log(`${list.length} images -> ${BASE}/uploads/... at widths ${WIDTHS.join('/')}`);
let done = 0, failed = 0, bytes = 0;
const started = Date.now();
const worker = async () => {
  while (list.length) {
    const key = list.shift();
    const path = key.split('/').map(encodeURIComponent).join('/');
    for (const suffix of ['', ...WIDTHS.map((w) => `?w=${w}`)]) {
      try {
        const r = await fetch(`${BASE}/uploads/${path}${suffix}`);
        if (!r.ok) { failed += 1; if (!suffix) break; continue; }
        bytes += (await r.arrayBuffer()).byteLength;
      } catch (error) {
        failed += 1;
        if (!suffix) { console.warn(`  ! ${key}: ${error.message}`); break; }
      }
    }
    done += 1;
    if (done % 25 === 0) console.log(`  ${done} done`);
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`done: ${done} images, ${failed} misses, ${(bytes / 1048576).toFixed(1)} MB fetched in ${Math.round((Date.now() - started) / 1000)} s`);
