// scripts/storeCutoutProductPhotos.mjs
//
// Gives the 2026 copy database its own background-removed product photos.
//
// The copy was made from the live database, so every product photo address still
// points at the LIVE server's file (https://api.easyjackets.com/uploads/<key>), which
// has its studio background. This backend's file store holds the cut-out at that same
// key (the untouched original beside it as <name>.original.<ext>). The script stores
// each cut-out under a key of its own, <name>-nobg.<ext> (original beside it as
// <name>-nobg.original.<ext>, the store's usual cut-out layout), and points the
// product's frontImage / otherImages at it on the 2026 API's address.
//
// Only the copy database (easyjackets2026) is written; the live database and the
// live server's files are never touched. Existing files are never changed or removed.
//
//   node scripts/storeCutoutProductPhotos.mjs                        dry run: what would change
//   node scripts/storeCutoutProductPhotos.mjs --apply                copy files + update the products
//   node scripts/storeCutoutProductPhotos.mjs --restore <backup>     put the previous addresses back
//   --base <url>   address prefix for the new photos
//                  (default https://api2.easyjackets.com/uploads/, the 2026 API in admin/Dockerfile)
//
// Previous addresses are saved to scripts/.product-photo-backup-<time>.json (git-ignored).
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { keyFromUrl, resolveUploadPath } from '../helpers/localUploadStorage.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const RESTORE = args.includes('--restore') ? args[args.indexOf('--restore') + 1] : null;
const BASE = (args.includes('--base') ? args[args.indexOf('--base') + 1] : 'https://api2.easyjackets.com/uploads/').replace(/\/*$/, '/');
const ALLOWED_DB = 'easyjackets2026';
const HERE = path.dirname(fileURLToPath(import.meta.url));

if (!/^https:\/\/[^/]+\/uploads\/$/.test(BASE)) { console.error(`--base must look like https://<host>/uploads/ (got ${BASE})`); process.exit(1); }

await connectDB();
const dbName = mongoose.connection.db.databaseName;
if (dbName !== ALLOWED_DB) { console.error(`refusing: connected to "${dbName}", expected "${ALLOWED_DB}"`); await mongoose.disconnect(); process.exit(1); }
const products = mongoose.connection.db.collection('products');

// ---------- restore ----------
if (RESTORE) {
  const saved = JSON.parse(await fs.readFile(path.resolve(RESTORE), 'utf8'));
  let restored = 0;
  for (const c of saved) {
    const r = await products.updateOne(
      { _id: new mongoose.Types.ObjectId(c.id), frontImage: c.after.frontImage, otherImages: c.after.otherImages },
      { $set: { frontImage: c.before.frontImage, otherImages: c.before.otherImages } },
    );
    if (r.modifiedCount) restored += 1; else console.log(`  not restored (changed since): ${c.slug}`);
  }
  console.log(`database ${dbName}: restored ${restored} of ${saved.length} product(s) from ${RESTORE}`);
  await mongoose.disconnect();
  process.exit(0);
}

// ---------- plan ----------
const exists = (f) => fs.access(f).then(() => true, () => false);
const withSuffix = (key, suffix) => key.replace(/(\.[a-z0-9]+)$/i, `${suffix}$1`);
const addressOf = (key) => BASE + key.split('/').map(encodeURIComponent).join('/');

const files = new Map(); // new key -> { from, fromOriginal, to, toOriginal }
const problems = [];
let photos = 0;
let done = 0;
const changes = [];

const planAddress = async (address, where) => {
  if (!address) return address;
  photos += 1;
  const key = decodeURIComponent(keyFromUrl(address));
  if (/-nobg\.[a-z0-9]+$/i.test(key)) { done += 1; return address; } // already its own cut-out
  const from = resolveUploadPath(key);
  const fromOriginal = withSuffix(from, '.original');
  if (!(await exists(from)) || !(await exists(fromOriginal))) { problems.push(`${where}: no cut-out on disk for ${key}`); return address; }
  const newKey = withSuffix(key, '-nobg');
  files.set(newKey, { from, fromOriginal, to: resolveUploadPath(newKey), toOriginal: withSuffix(resolveUploadPath(newKey), '.original') });
  return addressOf(newKey);
};

const all = await products.find({}, { projection: { name: 1, slug: 1, frontImage: 1, otherImages: 1 } }).toArray();
for (const p of all) {
  const before = { frontImage: p.frontImage ?? '', otherImages: p.otherImages ?? [] };
  const after = {
    frontImage: await planAddress(before.frontImage, `${p.slug} front`),
    otherImages: [],
  };
  for (const [i, u] of before.otherImages.entries()) after.otherImages.push(await planAddress(u, `${p.slug} photo ${i + 2}`));
  if (after.frontImage !== before.frontImage || after.otherImages.some((u, i) => u !== before.otherImages[i])) {
    changes.push({ id: String(p._id), slug: p.slug, before, after });
  }
}

console.log(`database ${dbName}: ${all.length} products, ${photos} photo addresses`);
console.log(`  to point at their own cut-out: ${changes.length} product(s), ${files.size} file(s) to store under -nobg keys`);
if (done) console.log(`  already on their own cut-out: ${done} photo(s)`);
if (problems.length) console.log(`  left as they are (${problems.length}):\n    ${problems.join('\n    ')}`);
if (changes[0]) console.log(`  e.g. ${changes[0].slug}\n    ${changes[0].before.frontImage}\n    -> ${changes[0].after.frontImage}`);

if (!APPLY) {
  console.log('\ndry run: nothing written. Add --apply to copy the files and update the products.');
  await mongoose.disconnect();
  process.exit(0);
}

// ---------- apply ----------
const backup = path.join(HERE, `.product-photo-backup-${Date.now()}.json`);
await fs.writeFile(backup, JSON.stringify(changes, null, 2));
console.log(`\nprevious addresses saved to ${backup}`);

const sameSize = async (a, b) => (await exists(b)) && (await fs.stat(a)).size === (await fs.stat(b)).size;
let copied = 0;
for (const f of files.values()) {
  for (const [src, dest] of [[f.from, f.to], [f.fromOriginal, f.toOriginal]]) {
    if (await sameSize(src, dest)) continue; // stored by an earlier run
    if (await exists(dest)) throw new Error(`refusing to overwrite a different file: ${dest}`);
    await fs.copyFile(src, dest);
    if (!(await sameSize(src, dest))) throw new Error(`copy did not verify: ${dest}`);
    copied += 1;
  }
}
console.log(`stored ${copied} file(s) (${files.size} cut-outs, each with its original beside it)`);

let updated = 0;
for (const c of changes) {
  const r = await products.updateOne(
    { _id: new mongoose.Types.ObjectId(c.id), frontImage: c.before.frontImage, otherImages: c.before.otherImages },
    { $set: { frontImage: c.after.frontImage, otherImages: c.after.otherImages } },
  );
  if (r.modifiedCount) updated += 1; else console.log(`  not updated (changed since the plan): ${c.slug}`);
}
console.log(`updated ${updated} of ${changes.length} product(s) in ${dbName}`);
await mongoose.disconnect();
