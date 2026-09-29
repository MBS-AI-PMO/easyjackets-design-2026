// scripts/auditLiveReferences.mjs
//
// READ ONLY. Lists every place the 2026 copy database (easyjackets2026) still points at the
// OLD live setup: the live API server (api.easyjackets.com) or the live database. Walks every document of every collection, including nested fields and HTML.
//
//   node scripts/auditLiveReferences.mjs            summary per collection and field
//   node scripts/auditLiveReferences.mjs --samples  plus a few example values
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const SAMPLES = process.argv.includes('--samples');
const ALLOWED_DB = 'easyjackets2026';
export const PATTERNS = {
  'live API server (api.easyjackets.com)': /https?:\/\/api\.easyjackets\.com/i,
  'live database (Ecommerce)': /mongodb(\+srv)?:\/\/[^\s"']*\/Ecommerce\b/i,
};

await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }

const found = new Map(); // "collection.field|pattern" -> { count, docs:Set, samples:[] }
const walk = (value, path, visit) => {
  if (typeof value === 'string') visit(path, value);
  else if (Array.isArray(value)) value.forEach((v) => walk(v, `${path}[]`, visit));
  else if (value && typeof value === 'object' && !(value instanceof Date) && !(value._bsontype)) {
    for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k, visit);
  }
};

const collections = (await db.listCollections().toArray()).map((c) => c.name).sort();
let docsScanned = 0;
for (const name of collections) {
  const cursor = db.collection(name).find({});
  for await (const doc of cursor) {
    docsScanned += 1;
    walk(doc, '', (path, str) => {
      for (const [label, re] of Object.entries(PATTERNS)) {
        if (!re.test(str)) continue;
        const key = `${name}.${path}|${label}`;
        const e = found.get(key) || { count: 0, docs: new Set(), samples: [] };
        e.count += (str.match(new RegExp(re.source, 'gi')) || []).length;
        e.docs.add(String(doc._id));
        if (e.samples.length < 2) e.samples.push(str.length > 140 ? `${str.slice(0, 140)}…` : str);
        found.set(key, e);
      }
    });
  }
}

console.log(`database ${db.databaseName}: ${collections.length} collections, ${docsScanned} documents scanned`);
const byLabel = {};
for (const [key, e] of found) {
  const [where, label] = key.split('|');
  (byLabel[label] ||= []).push({ where, ...e });
}
for (const label of Object.keys(PATTERNS)) {
  const rows = (byLabel[label] || []).sort((a, b) => b.count - a.count);
  const total = rows.reduce((n, r) => n + r.count, 0);
  console.log(`\n${label}: ${total} reference(s) in ${rows.length} field(s)`);
  for (const r of rows) {
    console.log(`  ${String(r.count).padStart(5)}  ${r.where}  (${r.docs.size} doc${r.docs.size === 1 ? '' : 's'})`);
    if (SAMPLES) r.samples.forEach((s) => console.log(`         e.g. ${s}`));
  }
}
await mongoose.disconnect();
