// scripts/applySeoAuditMetadata.mjs
//
// The SEO-audit changes that live in the admin's SEO screen (Metadata rows) of the 2026 copy database:
//   - the 16 size pages (/shop/size/…) become noindex and leave the sitemap: every product is sold in
//     every size, so each one repeated /shop, and nothing on the site links to them (N-A6, N-A7);
//   - /sizechart and /how-to-design-jacket get titles and descriptions that answer the search (B-O8).
// Only those fields of those rows change; nothing is deleted. Each previous value is saved first, and
// --restore puts them back. Refuses any database but the copy.
//
//   node scripts/applySeoAuditMetadata.mjs                   dry run: lists every change
//   node scripts/applySeoAuditMetadata.mjs --apply           writes them (backup: scripts/.seo-metadata-backup-<time>.json)
//   node scripts/applySeoAuditMetadata.mjs --restore <file>  puts the saved values back
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const RESTORE = args.includes('--restore') ? args[args.indexOf('--restore') + 1] : null;
const ALLOWED_DB = 'easyjackets2026';
const HERE = path.dirname(fileURLToPath(import.meta.url));

const PAGE_CHANGES = {
  '/sizechart': {
    title: 'Varsity Jacket Size Chart (Inches & CM)',
    description: 'Varsity and letterman jacket size chart in inches and centimetres, XXS to 6XL, with youth, cropped and coach jacket sizes and how to measure for the right fit.',
  },
  '/how-to-design-jacket': {
    title: 'How to Design a Varsity Jacket in 6 Steps',
    description: 'Design your own varsity jacket in 6 steps: choose the material and style, set the options and colors, add names, patches and logos, then review your free proof and order.',
  },
};

await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }
const rows = db.collection('metadatas');

if (RESTORE) {
  const saved = JSON.parse(await fs.readFile(path.resolve(RESTORE), 'utf8'));
  for (const { id, before } of saved) await rows.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: before });
  console.log(`restored ${saved.length} row(s) from ${RESTORE}`);
  await mongoose.disconnect();
  process.exit(0);
}

const plan = [];
for (const row of await rows.find({ route: /^\/shop\/size\//i }).toArray()) {
  if (row.noIndex === true && row.sitemapEnabled === false) continue;
  plan.push({ row, set: { noIndex: true, sitemapEnabled: false } });
}
for (const [route, set] of Object.entries(PAGE_CHANGES)) {
  const row = await rows.findOne({ route });
  if (!row) { console.log(`  (no saved row for ${route}: the code default applies)`); continue; }
  if (row.title === set.title && row.description === set.description) continue;
  plan.push({ row, set });
}

for (const { row, set } of plan) {
  const before = Object.fromEntries(Object.keys(set).map((k) => [k, row[k] ?? null]));
  console.log(`  ${row.route}: ${Object.keys(set).map((k) => `${k} ${JSON.stringify(before[k])} → ${JSON.stringify(set[k])}`).join('; ')}`);
}
console.log(`${plan.length} row(s) to change`);
if (!APPLY || !plan.length) {
  if (!APPLY) console.log('dry run: nothing written. --apply writes these changes.');
  await mongoose.disconnect();
  process.exit(0);
}

const backup = plan.map(({ row, set }) => ({ id: String(row._id), route: row.route, before: Object.fromEntries(Object.keys(set).map((k) => [k, row[k] ?? null])) }));
const backupFile = path.join(HERE, `.seo-metadata-backup-${Date.now()}.json`);
await fs.writeFile(backupFile, JSON.stringify(backup, null, 1));
for (const { row, set } of plan) await rows.updateOne({ _id: row._id }, { $set: { ...set, updatedAt: new Date() } });
console.log(`changed ${plan.length} row(s); previous values: ${backupFile}`);
await mongoose.disconnect();
