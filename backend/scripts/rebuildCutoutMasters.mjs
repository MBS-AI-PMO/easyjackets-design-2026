// scripts/rebuildCutoutMasters.mjs
//
// Re-encodes every cut-out master losslessly from the PNG copies that
// removeProductBackgrounds.mjs --save wrote (DIR/<category>/<product>/<n> - background removed.png),
// so no lossy generation sits between the photo and the resizer. Reads the
// database only; rewrites stored image files whose PNG copy exists. Backups stay.
//
//   node scripts/rebuildCutoutMasters.mjs --from "C:/Users/User/Desktop/All Easy"
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import sharp from 'sharp';
import connectDB from '../config/db.js';
import productModel from '../models/productModel.js';
import '../models/CategoryModel.js';
import { keyFromUrl, resolveUploadPath } from '../helpers/localUploadStorage.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const FROM = arg('--from');
if (!FROM) { console.error('--from DIR is required'); process.exit(1); }
const safe = (s) => String(s || '').replace(/[<>:"/\|?*]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60).replace(/[ .]+$/, '') || 'untitled';

await connectDB();
const products = await productModel.find({}).select('name frontImage otherImages category').populate('category', 'name').lean();
await mongoose.disconnect();
const seen = new Set();
let done = 0, missing = 0, failed = 0, skipped = 0, bytesBefore = 0, bytesAfter = 0;
const started = Date.now();
// a lossless webp carries a VP8L chunk right after the RIFF header
const isLossless = async (file) => { const h = await fs.open(file, 'r'); try { const b = Buffer.alloc(16); await h.read(b, 0, 16, 0); return b.toString('ascii', 12, 16) === 'VP8L'; } finally { await h.close(); } };
for (const p of products) {
  let n = 0;
  for (const url of [p.frontImage, ...(p.otherImages || [])]) {
    const key = keyFromUrl(url || '');
    if (!key || !/\.webp$/i.test(key)) continue;
    n += 1;
    if (seen.has(key)) continue;
    seen.add(key);
    const png = path.join(FROM, safe(p.category?.name || 'Uncategorised'), safe(p.name), `${n} - background removed.png`);
    try { await fs.access(png); } catch { missing += 1; console.log(`  no PNG copy: ${png}`); continue; }
    const file = resolveUploadPath(key);
    try {
      if (await isLossless(file)) { skipped += 1; continue; } // already rebuilt on an earlier run
      const before = (await fs.stat(file)).size;
      const out = await sharp(png).webp({ lossless: true, effort: 6 }).toBuffer();
      await fs.writeFile(file, out);
      bytesBefore += before; bytesAfter += out.length; done += 1;
      if (done % 25 === 0) console.log(`  ${done} rebuilt (${Math.round((Date.now() - started) / 1000)} s)`);
    } catch (error) { failed += 1; console.log(`  FAILED ${key}: ${error.message}`); }
  }
}
console.log(`done: ${done} masters rebuilt losslessly, ${skipped} already lossless, ${missing} without a PNG copy, ${failed} failed; ${(bytesBefore / 1048576).toFixed(1)} MB -> ${(bytesAfter / 1048576).toFixed(1)} MB in ${Math.round((Date.now() - started) / 1000)} s`);
