// scripts/syncCategoryImagesFromLive.mjs
//
// Copies the jacket categories' thumbnail (the `image` field only) from the live
// site's public API into THIS backend's database, matched by category slug.
// Reads the live site with GET only; writes nothing there. Refuses to run
// against any database other than the 2026 copy.
//
//   node scripts/syncCategoryImagesFromLive.mjs            dry run: shows what would change
//   node scripts/syncCategoryImagesFromLive.mjs --apply    writes the new image fields
//
// Previous values are saved to scripts/.category-image-backup-<time>.json.
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import CategoryModel from '../models/CategoryModel.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const APPLY = process.argv.includes('--apply');
const LIVE_API = (process.env.LIVE_API_URL || 'https://api.easyjackets.com/api/v1').replace(/\/+$/, '');
const ALLOWED_DB = 'easyjackets2026';

const live = await (await fetch(`${LIVE_API}/category/get-category?section=jackets`)).json();
const liveCats = live.category || live.categories || [];
if (!liveCats.length) { console.error('live API returned no categories'); process.exit(1); }

await connectDB();
const dbName = mongoose.connection.db.databaseName;
if (dbName !== ALLOWED_DB) { console.error(`refusing: connected to "${dbName}", expected "${ALLOWED_DB}"`); await mongoose.disconnect(); process.exit(1); }

const changes = [];
for (const lc of liveCats) {
  const local = await CategoryModel.findOne({ slug: lc.slug }).select('name slug image').lean();
  if (!local) { console.log(`  no local category "${lc.slug}"`); continue; }
  if (!lc.image || local.image === lc.image) { console.log(`  unchanged: ${local.name}`); continue; }
  changes.push({ id: String(local._id), slug: local.slug, name: local.name, from: local.image, to: lc.image });
}
console.log(`database ${dbName}: ${changes.length} category image(s) to update${APPLY ? '' : ' (dry run)'}`);
for (const c of changes) console.log(`  ${c.name}: ${c.from}\n      -> ${c.to}`);

if (APPLY && changes.length) {
  const backup = path.join(path.dirname(fileURLToPath(import.meta.url)), `.category-image-backup-${Date.now()}.json`);
  await fs.writeFile(backup, JSON.stringify(changes, null, 2));
  for (const c of changes) await CategoryModel.updateOne({ _id: c.id }, { $set: { image: c.to } });
  console.log(`updated ${changes.length}; previous values saved to ${backup}`);
}
await mongoose.disconnect();
