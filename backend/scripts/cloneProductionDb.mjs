// Copies every collection from the production database into this backend's
// own database, so the 2026 stack has real data without ever writing to the
// live one. The source connection is read-only by construction (find only).
//
//   node scripts/cloneProductionDb.mjs                 dry run: lists what would be copied
//   node scripts/cloneProductionDb.mjs --apply         copies (target collections are replaced)
//   node scripts/cloneProductionDb.mjs --apply --only products,categories
//
// Source: SOURCE_MONGO_URL (or the MONGO_URL in ../../node-backend/.env).
// Target: MONGO_URL from this backend's .env — refused if it names the same
// database as the source.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '..', '.env') });
// Some local resolvers refuse the SRV lookup Atlas needs; DNS_SERVERS=1.1.1.1,8.8.8.8 routes around that.
if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));

const readEnvValue = (file, key) => {
  if (!fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(new RegExp(`^[ \\t]*${key}[ \\t]*=[ \\t]*(.*?)[ \\t]*\\r?$`, 'm'));
  return m ? m[1] : null;
};

const APPLY = process.argv.includes('--apply');
const onlyArg = process.argv.indexOf('--only');
const ONLY = onlyArg > -1 ? process.argv[onlyArg + 1].split(',').map((s) => s.trim()) : null;
const BATCH = 500;

const targetUrl = process.env.MONGO_URL;
const sourceUrl = process.env.SOURCE_MONGO_URL || readEnvValue(path.join(here, '..', '..', '..', 'node-backend', '.env'), 'MONGO_URL');
if (!targetUrl || !sourceUrl) { console.error('need MONGO_URL (target) and SOURCE_MONGO_URL or ../../node-backend/.env (source)'); process.exit(1); }

const dbName = (url) => new URL(url).pathname.replace(/^\//, '').split('?')[0];
const sourceDb = dbName(sourceUrl), targetDb = dbName(targetUrl);
if (!targetDb) { console.error('target MONGO_URL has no database name'); process.exit(1); }
if (sourceDb === targetDb && new URL(sourceUrl).host === new URL(targetUrl).host) { console.error(`refusing: source and target are the same database (${targetDb})`); process.exit(1); }

console.log(`source: ${sourceDb} @ ${new URL(sourceUrl).host}\ntarget: ${targetDb} @ ${new URL(targetUrl).host}\nmode:   ${APPLY ? 'APPLY (target collections are replaced)' : 'dry run'}\n`);

const src = new MongoClient(sourceUrl, { readPreference: 'secondaryPreferred' });
const dst = new MongoClient(targetUrl);
await src.connect(); await dst.connect();
try {
  const sdb = src.db(sourceDb), tdb = dst.db(targetDb);
  const names = (await sdb.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).filter((n) => !n.startsWith('system.')).sort();
  const chosen = ONLY ? names.filter((n) => ONLY.includes(n)) : names;
  if (ONLY) for (const n of ONLY) if (!names.includes(n)) console.warn(`  ! no source collection named ${n}`);

  let total = 0;
  for (const name of chosen) {
    const count = await sdb.collection(name).estimatedDocumentCount();
    const existing = await tdb.collection(name).estimatedDocumentCount().catch(() => 0);
    console.log(`${name.padEnd(28)} ${String(count).padStart(7)} docs${existing ? `   (target currently ${existing})` : ''}`);
    total += count;
    if (!APPLY) continue;

    await tdb.collection(name).drop().catch(() => {});
    const cursor = sdb.collection(name).find({}, { batchSize: BATCH });
    let batch = [], copied = 0;
    for await (const doc of cursor) {
      batch.push(doc);
      if (batch.length >= BATCH) { await tdb.collection(name).insertMany(batch, { ordered: false }); copied += batch.length; batch = []; }
    }
    if (batch.length) { await tdb.collection(name).insertMany(batch, { ordered: false }); copied += batch.length; }
    // indexes (skip the implicit _id one)
    for (const idx of await sdb.collection(name).indexes()) {
      if (idx.name === '_id_') continue;
      const { key, name: idxName, ...opts } = idx;
      delete opts.v; delete opts.ns;
      await tdb.collection(name).createIndex(key, { name: idxName, ...opts }).catch((e) => console.warn(`    index ${idxName}: ${e.message}`));
    }
    const verify = await tdb.collection(name).countDocuments();
    console.log(`${''.padEnd(28)} copied ${copied}, target now ${verify}${verify !== count ? '  <-- MISMATCH' : ''}`);
  }
  console.log(`\n${chosen.length} collections, ${total} documents${APPLY ? ' copied' : ' would be copied'}.`);
} finally {
  await src.close(); await dst.close();
}
