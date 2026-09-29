// scripts/seedPatchPhotos.mjs
//
// Fills the admin's "Embroidery & Patches" collection with the photos the storefront's
// /embroidery-and-patches page showed before it read that collection: the Photo Gallery's
// photos, the workshop patch photos from frontend/src/data/embroidery-photos.json and the
// client's detail shot in the storefront's public/images/site. Same order as the page
// showed them (the collection lists newest first). From then on the page shows exactly
// what the admin has, and photos are added or removed there.
//
// Only inserts rows into the 2026 copy database (easyjackets2026); refuses any other.
// A photo whose address is already in the collection is skipped, so it can run again.
//
//   node scripts/seedPatchPhotos.mjs                    dry run
//   node scripts/seedPatchPhotos.mjs --apply            insert the rows
//   node scripts/seedPatchPhotos.mjs --remove <file>    delete the rows a run inserted
//
// Inserted ids are saved to scripts/.patch-seed-<time>.json (git-ignored).
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import PatchPhoto from '../models/patchPhotoModel.js';
import Gallery from '../models/galleryModel.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const REMOVE = args.includes('--remove') ? args[args.indexOf('--remove') + 1] : null;
const ALLOWED_DB = 'easyjackets2026';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.resolve(HERE, '../../frontend/src/data/embroidery-photos.json');

// the storefront's caption rule (frontend/src/lib/content.js patchTags)
const patchTags = (caption = '') => {
  const t = [];
  if (/chenille|letterman|varsity|college/i.test(caption)) t.push('Chenille');
  if (/patch|logo|crest/i.test(caption)) t.push('Patches');
  if (/embroider/i.test(caption)) t.push('Embroidery');
  if (/sublimat|print/i.test(caption)) t.push('Printed');
  if (/rhinestone|glitter/i.test(caption)) t.push('Rhinestone');
  if (/\bname|number|year\b/i.test(caption)) t.push('Names & numbers');
  return t.length ? t : ['Patches'];
};
const interleave = (a, b) => {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
  return out;
};

await connectDB();
const dbName = mongoose.connection.db.databaseName;
if (dbName !== ALLOWED_DB) { console.error(`refusing: connected to "${dbName}", expected "${ALLOWED_DB}"`); await mongoose.disconnect(); process.exit(1); }

if (REMOVE) {
  const ids = JSON.parse(await fs.readFile(path.resolve(REMOVE), 'utf8')).map((id) => new mongoose.Types.ObjectId(id));
  const r = await PatchPhoto.collection.deleteMany({ _id: { $in: ids } });
  console.log(`database ${dbName}: removed ${r.deletedCount} of ${ids.length} seeded patch photo(s)`);
  await mongoose.disconnect();
  process.exit(0);
}

const gallery = (await Gallery.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).lean())
  .filter((g) => g.imageUrl || g.imageUrls?.[0])
  .map((g) => {
    const description = String(g.description || 'Customer photo').trim();
    const imageUrls = g.imageUrls?.length ? g.imageUrls : [g.imageUrl];
    return { imageUrl: g.imageUrl || imageUrls[0], imageUrls, description, tags: patchTags(description) };
  });
const manifest = JSON.parse(await fs.readFile(MANIFEST, 'utf8'))
  .filter((p) => p.url)
  .map((p) => ({ imageUrl: p.url, imageUrls: [p.url], description: p.cap, tags: p.tags }));
// the storefront's own public file (served by the storefront, not the API)
const own = [{ imageUrl: '/images/site/red-s-jacket.webp', imageUrls: ['/images/site/red-s-jacket.webp'], description: 'Chenille letter, name & numbers', tags: ['Chenille', 'Patches', 'Names & numbers'] }];

const ordered = interleave(gallery, [...manifest, ...own]);
const existing = new Set((await PatchPhoto.find({}, { imageUrl: 1 }).lean()).map((p) => p.imageUrl));
const base = Date.now();
const docs = ordered
  .filter((p) => !existing.has(p.imageUrl))
  .map((p, i) => ({ ...p, isActive: true, createdAt: new Date(base - i * 1000), updatedAt: new Date(base - i * 1000), __v: 0 }));

console.log(`database ${dbName}: ${ordered.length} photo(s) on the page (${gallery.length} gallery, ${manifest.length} workshop, ${own.length} site); ${docs.length} to add, ${ordered.length - docs.length} already there`);
docs.forEach((d, i) => console.log(`  ${String(i + 1).padStart(2)}. ${d.description}  [${d.tags.join(', ')}]`));
if (!APPLY) {
  console.log('\ndry run: nothing written. Add --apply to insert them.');
  await mongoose.disconnect();
  process.exit(0);
}
if (docs.length) {
  const r = await PatchPhoto.collection.insertMany(docs);
  const ids = Object.values(r.insertedIds).map(String);
  const file = path.join(HERE, `.patch-seed-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(ids, null, 2));
  console.log(`\ninserted ${ids.length} patch photo(s); ids saved to ${file}`);
}
await mongoose.disconnect();
