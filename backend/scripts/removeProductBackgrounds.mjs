// scripts/removeProductBackgrounds.mjs
//
// Runs the background remover over the catalogue's existing product photos
// (front image + other views). Reads the database only; writes image files.
//
//   node scripts/removeProductBackgrounds.mjs                 dry run: lists what would be processed
//   node scripts/removeProductBackgrounds.mjs --apply         replaces the stored files (originals kept as *.original.*)
//   node scripts/removeProductBackgrounds.mjs --out DIR       writes cut-outs to DIR instead (a test, nothing replaced)
//   --save DIR      also keeps every original and its transparent PNG under DIR/<category>/<product>/
//   --limit N       first N photos only      --category slug   one category
//   --model isnet-general-use   faster model  --keys a,b        given upload keys or URLs, no database
//
// Needs BG_REMOVER_URL (+ BG_REMOVER_KEY) in .env, and the photos on local
// storage (UPLOADS_ROOT); files not on disk are skipped and listed. Safe to
// re-run: photos already cut out are skipped, and their copies under --save
// are refreshed from the backup without another pass through the model.
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import sharp from 'sharp';
import connectDB from '../config/db.js';
import productModel from '../models/productModel.js';
import CategoryModel from '../models/CategoryModel.js';
import { keyFromUrl, resolveUploadPath } from '../helpers/localUploadStorage.js';
import { cutoutStoredImage, isCutOut } from '../helpers/backgroundRemoval.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const arg = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null; };
const APPLY = process.argv.includes('--apply');
const OUT = arg('--out');
const SAVE = arg('--save');
const LIMIT = Number(arg('--limit')) || Infinity;
const CATEGORY = arg('--category');
const MODEL = arg('--model') || undefined;
const KEYS = arg('--keys'); // comma-separated upload keys or URLs: no database needed
const safe = (s) => String(s || '').replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60).replace(/[ .]+$/, '') || 'untitled'; // no trailing space or dot: Windows refuses such folder names
const backupOf = (file) => file.replace(/(\.[a-z0-9]+)$/i, '.original$1');

const photos = []; // { key, product, category, n }
let products = [];
if (KEYS) {
  for (const k of KEYS.split(',').map((s) => s.trim()).filter(Boolean)) photos.push({ key: keyFromUrl(k), product: '(key)', category: 'keys', n: photos.length + 1 });
} else {
  await connectDB();
  const filter = {};
  if (CATEGORY) {
    const cat = await CategoryModel.findOne({ slug: CATEGORY }).select('_id');
    if (!cat) { console.error(`no category ${CATEGORY}`); process.exit(1); }
    filter.category = cat._id;
  }
  products = await productModel.find(filter).select('name slug frontImage otherImages category').populate('category', 'name').lean();
  await mongoose.disconnect();
  for (const p of products) {
    let n = 0;
    for (const url of [p.frontImage, ...(p.otherImages || [])]) {
      const key = keyFromUrl(url || '');
      if (key && /\.(webp|png|jpe?g)$/i.test(key)) photos.push({ key, product: p.name, category: p.category?.name || 'Uncategorised', n: ++n });
    }
  }
}
const mode = APPLY ? 'APPLYING (stored files replaced, originals kept)' : OUT ? `writing to ${OUT}` : 'dry run';
console.log(`${products.length} products, ${photos.length} photos — ${mode}${SAVE ? `, copies under ${SAVE}` : ''}`);

let done = 0, skipped = 0, missing = 0, failed = 0;
const started = Date.now();
const todo = photos.slice(0, LIMIT);
for (const [i, { key, product, category, n }] of todo.entries()) {
  const file = resolveUploadPath(key);
  const ext = path.extname(key).toLowerCase();
  try { await fs.access(file); } catch { missing += 1; console.log(`  missing on disk: ${key}`); continue; }
  const saveDir = SAVE ? path.join(SAVE, safe(category), safe(product)) : null;
  const saveOriginal = saveDir ? path.join(saveDir, `${n} - original${ext}`) : null;
  const savePng = saveDir ? path.join(saveDir, `${n} - background removed.png`) : null;
  if (!OUT && await isCutOut(key)) {
    skipped += 1;
    if (saveDir) { // already done on a previous run: refresh the copies from what is on disk
      await fs.mkdir(saveDir, { recursive: true });
      await fs.copyFile(backupOf(file), saveOriginal);
      await sharp(file).png().toFile(savePng);
    }
    continue;
  }
  if (!APPLY && !OUT) { console.log(`  would process: ${key}  (${category} / ${product} #${n})`); done += 1; continue; }
  try {
    if (saveDir) { await fs.mkdir(saveDir, { recursive: true }); await fs.copyFile(file, saveOriginal); }
    const r = await cutoutStoredImage(key, { outFile: OUT ? path.join(OUT, key.replace(/[\\/]/g, '__')) : undefined, model: MODEL, pngCopy: savePng || undefined });
    done += 1;
    const perPhoto = (Date.now() - started) / (i + 1);
    const eta = Math.round((perPhoto * (todo.length - i - 1)) / 60000);
    console.log(`  ${i + 1}/${todo.length}  ${r.width}x${r.height} in ${Math.round(r.ms / 1000)} s  ${category} / ${product} #${n}   (~${eta} min left)`);
  } catch (error) {
    failed += 1;
    console.log(`  FAILED ${key}: ${error.message}`);
  }
}
console.log(`done: ${done} processed, ${skipped} already cut out, ${missing} not on disk, ${failed} failed, ${Math.round((Date.now() - started) / 1000)} s`);
