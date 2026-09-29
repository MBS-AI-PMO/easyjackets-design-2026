// scripts/moveOffLiveServer.mjs
//
// Makes the 2026 copy database (easyjackets2026) independent of the OLD live server.
//   1. Every file an address points at on the live server (https://api.easyjackets.com/uploads/<key>)
//      is copied into THIS backend's file store (backend/uploads/<key>) if it is not there yet.
//   2. Those addresses are rewritten to the 2026 API (https://api2.easyjackets.com/uploads/<key>),
//      in every collection and field, HTML included.
// Only GETs public files from the live server; never writes there. Refuses any database but the copy.
//
//   node scripts/moveOffLiveServer.mjs                  dry run (counts, missing files)
//   node scripts/moveOffLiveServer.mjs --apply          download the missing files, rewrite the addresses
//   node scripts/moveOffLiveServer.mjs --restore <file> put the previous addresses back
//
// Every changed value is saved to scripts/.live-address-backup-<time>.json (git-ignored).
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { UPLOADS_ROOT, resolveUploadPath } from '../helpers/localUploadStorage.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const RESTORE = args.includes('--restore') ? args[args.indexOf('--restore') + 1] : null;
const ALLOWED_DB = 'easyjackets2026';
const LIVE_FILES = 'https://api.easyjackets.com/uploads/';
const NEW_BASE = 'https://api2.easyjackets.com/uploads/';
const HERE = path.dirname(fileURLToPath(import.meta.url));

// live-server upload address (also the malformed ".../uploads1786..." without the slash)
const LIVE_RE = /https?:\/\/api\.easyjackets\.com\/uploads\/?([^\s"'<>)]+)/gi;

await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }

// ---------- restore ----------
const getAt = (obj, keys) => keys.reduce((o, k) => (o == null ? o : o[k]), obj);
if (RESTORE) {
  const saved = JSON.parse(await fs.readFile(path.resolve(RESTORE), 'utf8'));
  let restored = 0;
  for (const { collection, id, changes } of saved) {
    const doc = await db.collection(collection).findOne({ _id: new mongoose.Types.ObjectId(id) });
    if (!doc) continue;
    const set = {};
    for (const { keys, before, after } of changes) {
      if (getAt(doc, keys) !== after) continue; // changed since: leave it
      const top = keys[0];
      if (!(top in set)) set[top] = structuredClone(doc[top]);
      if (keys.length === 1) set[top] = before;
      else getAt(set[top], keys.slice(1, -1))[keys[keys.length - 1]] = before;
      restored += 1;
    }
    if (Object.keys(set).length) await db.collection(collection).updateOne({ _id: doc._id }, { $set: set });
  }
  console.log(`database ${db.databaseName}: restored ${restored} value(s) from ${RESTORE}`);
  await mongoose.disconnect();
  process.exit(0);
}

// ---------- scan ----------
const decodeKey = (raw) => { try { return decodeURIComponent(raw.split(/[?#]/)[0]); } catch { return raw.split(/[?#]/)[0]; } };
const walk = (value, keys, visit) => {
  if (typeof value === 'string') visit(keys, value);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...keys, i], visit));
  else if (value && typeof value === 'object' && !(value instanceof Date) && !value._bsontype) {
    for (const [k, v] of Object.entries(value)) walk(v, [...keys, k], visit);
  }
};
const exists = (f) => fs.access(f).then(() => true, () => false);

const liveKeys = new Set();
const hits = []; // { collection, doc, keys, value }
for (const { name } of await db.listCollections().toArray()) {
  for await (const doc of db.collection(name).find({})) {
    walk(doc, [], (keys, value) => {
      let hit = false;
      for (const m of value.matchAll(LIVE_RE)) { liveKeys.add(decodeKey(m[1])); hit = true; }
      if (hit) hits.push({ collection: name, id: doc._id, keys, value });
    });
  }
}
const missingLive = [];
for (const key of liveKeys) if (!(await exists(resolveUploadPath(key)))) missingLive.push(key);
console.log(`database ${db.databaseName}: ${hits.length} value(s) point at the live server`);
console.log(`  live-server files referenced: ${liveKeys.size} (${liveKeys.size - missingLive.length} already in ${UPLOADS_ROOT}, ${missingLive.length} to copy)`);

// ---------- copy the files ----------
const download = async (key) => {
  const url = LIVE_FILES + key.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) return `HTTP ${res.status}`;
  const buf = Buffer.from(await res.arrayBuffer());
  const file = resolveUploadPath(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buf);
  return null;
};
const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = items[i++]; out.push([k, await fn(k).catch((e) => e.message)]); } })); return out; };

if (!APPLY) {
  console.log(`\ndry run: nothing downloaded or written. --apply copies ${missingLive.length} live file(s), then rewrites the addresses.`);
  await mongoose.disconnect();
  process.exit(0);
}

const failedLive = (await pool(missingLive, 6, download)).filter(([, err]) => err);
console.log(`copied ${missingLive.length - failedLive.length}/${missingLive.length} live file(s)${failedLive.length ? `; not on the live server: ${failedLive.map(([k, e]) => `${k} (${e})`).join(', ')}` : ''}`);

// ---------- rewrite the addresses ----------
const failedSet = new Set(failedLive.map(([k]) => k));
const newAddress = (key) => NEW_BASE + key.split('/').map(encodeURIComponent).join('/');
const rewrite = (value) => value
  .replace(LIVE_RE, (all, raw) => (failedSet.has(decodeKey(raw)) ? all : newAddress(decodeKey(raw))));

const byDoc = new Map();
for (const h of hits) {
  const after = rewrite(h.value);
  if (after === h.value) continue;
  const k = `${h.collection}|${h.id}`;
  if (!byDoc.has(k)) byDoc.set(k, { collection: h.collection, id: h.id, changes: [] });
  byDoc.get(k).changes.push({ keys: h.keys, before: h.value, after });
}
const backupFile = path.join(HERE, `.live-address-backup-${Date.now()}.json`);
await fs.writeFile(backupFile, JSON.stringify([...byDoc.values()].map((d) => ({ ...d, id: String(d.id) }))));
let updated = 0;
let values = 0;
for (const { collection, id, changes } of byDoc.values()) {
  const doc = await db.collection(collection).findOne({ _id: id });
  const set = {};
  for (const { keys, before, after } of changes) {
    if (getAt(doc, keys) !== before) continue; // changed since the scan
    const top = keys[0];
    if (!(top in set)) set[top] = keys.length === 1 ? doc[top] : structuredClone(doc[top]);
    if (keys.length === 1) set[top] = after;
    else getAt(set[top], keys.slice(1, -1))[keys[keys.length - 1]] = after;
    values += 1;
  }
  if (Object.keys(set).length) { await db.collection(collection).updateOne({ _id: id }, { $set: set }); updated += 1; }
}
console.log(`rewrote ${values} value(s) in ${updated} document(s); previous values saved to ${backupFile}`);
await mongoose.disconnect();
