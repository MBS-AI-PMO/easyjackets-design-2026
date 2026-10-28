// scripts/copyMissingBlogsFromLive.mjs
//
// Copies blog posts that are published on the LIVE site but missing from the 2026 copy database
// (easyjackets2026) — posts written on the live admin after the copy was made (SEO audit N-T4).
//   - Reads the live site only through its public API (the post list, then each post by id, which does
//     not count a view); never writes there.
//   - INSERTS only: a post whose slug already exists in the copy is skipped; nothing is updated or deleted.
// BEFORE THE DOMAIN SWITCH ONLY (used Oct 2026): it treats api.easyjackets.com as the old live server. Since the
// switch, api.easyjackets.com is this backend and the site's addresses use it (api2. was dropped), so do not run it.
//   - Images the posts use on the live server are copied into this backend's file store and their
//     addresses rewritten to the 2026 API (https://api2.easyjackets.com/uploads/…), as moveOffLiveServer.mjs
//     did for everything else, so no address points at the old server.
//   - Refuses any database but the copy.
//
//   node scripts/copyMissingBlogsFromLive.mjs           dry run: lists the posts and images it would copy
//   node scripts/copyMissingBlogsFromLive.mjs --apply   copies them; the inserted ids go to
//                                                       scripts/.blog-copy-<time>.json (git-ignored)
import 'dotenv/config';
import dns from 'node:dns';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import { resolveUploadPath } from '../helpers/localUploadStorage.js';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(',').map((s) => s.trim()));
const APPLY = process.argv.includes('--apply');
const ALLOWED_DB = 'easyjackets2026';
const LIVE_API = 'https://api.easyjackets.com/api/v1';
const LIVE_FILES = 'https://api.easyjackets.com/uploads/';
const NEW_BASE = 'https://api2.easyjackets.com/uploads/';
const HERE = path.dirname(fileURLToPath(import.meta.url));
// (no backslash in a key: scanning JSON text, a quote after the address is escaped as \")
const LIVE_RE = /https?:\/\/api\.easyjackets\.com\/uploads\/?([^\s"'<>)\\]+)/gi;
const NEW_RE = /https?:\/\/api2\.easyjackets\.com\/uploads\/?([^\s"'<>)\\]+)/gi;

const getJson = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
};
const decodeKey = (raw) => { try { return decodeURIComponent(raw.split(/[?#]/)[0]); } catch { return raw.split(/[?#]/)[0]; } };
const exists = (f) => fs.access(f).then(() => true, () => false);

await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }
const blogs = db.collection('blogs');

const liveList = await getJson(`${LIVE_API}/features/blogs`);
const have = new Set((await blogs.find({}, { projection: { slug: 1 } }).toArray()).map((b) => String(b.slug)));
const missing = (Array.isArray(liveList) ? liveList : []).filter((b) => b?.slug && b.isActive !== false && !have.has(String(b.slug)));
console.log(`live posts: ${liveList.length}; in the copy: ${have.size}; missing from the copy: ${missing.length}`);

// the full posts (by id: read-only on the live server)
const posts = [];
for (const item of missing) posts.push(await getJson(`${LIVE_API}/features/blogs/${item._id}`));

// images on the live server they use
const keys = new Set();
for (const post of posts) for (const m of JSON.stringify(post).matchAll(LIVE_RE)) keys.add(decodeKey(m[1]));
const toCopy = [];
for (const key of keys) if (!(await exists(resolveUploadPath(key)))) toCopy.push(key);
posts.forEach((p) => console.log(`  - ${p.slug}  (${new Date(p.createdAt).toISOString().slice(0, 10)}, ${String(p.content || '').length} chars)`));
console.log(`images on the live server: ${keys.size} (${keys.size - toCopy.length} already here, ${toCopy.length} to copy)`);
// posts already in the copy whose 2026 image addresses have no file here yet (e.g. an earlier, interrupted run)
for (const b of await blogs.find({}, { projection: { content: 1, image: 1 } }).toArray()) {
  for (const m of JSON.stringify(b).matchAll(NEW_RE)) {
    const key = decodeKey(m[1]);
    if (!keys.has(key) && !(await exists(resolveUploadPath(key)))) { keys.add(key); toCopy.push(key); }
  }
}
console.log(`files to fetch in all: ${toCopy.length}`);

if (!APPLY) {
  console.log('\ndry run: nothing copied or written. --apply inserts the posts above.');
  await mongoose.disconnect();
  process.exit(0);
}

const failed = new Set();
for (const key of toCopy) {
  const res = await fetch(LIVE_FILES + key.split('/').map(encodeURIComponent).join('/'), { signal: AbortSignal.timeout(30000) }).catch(() => null);
  if (!res?.ok) { failed.add(key); continue; }
  const file = resolveUploadPath(key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
}
console.log(`copied ${toCopy.length - failed.size}/${toCopy.length} image(s)${failed.size ? `; not found on the live server: ${[...failed].join(', ')}` : ''}`);

const rewrite = (value) => (typeof value === 'string'
  ? value.replace(LIVE_RE, (all, raw) => (failed.has(decodeKey(raw)) ? all : NEW_BASE + decodeKey(raw).split('/').map(encodeURIComponent).join('/')))
  : value);

const inserted = [];
for (const post of posts) {
  if (await blogs.findOne({ slug: post.slug }, { projection: { _id: 1 } })) { console.log(`  skipped ${post.slug}: already in the copy`); continue; }
  const doc = {
    _id: new mongoose.Types.ObjectId(String(post._id)),
    title: post.title,
    slug: post.slug,
    content: rewrite(post.content),
    excerpt: post.excerpt,
    image: rewrite(post.image),
    author: post.author,
    category: post.category,
    categoryColor: post.categoryColor,
    fitImage: post.fitImage,
    fitImageScale: post.fitImageScale,
    featured: post.featured,
    readTime: post.readTime,
    views: 0,
    isActive: post.isActive !== false,
    comments: [],
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date(),
  };
  Object.keys(doc).forEach((k) => doc[k] === undefined && delete doc[k]);
  if (await blogs.findOne({ _id: doc._id }, { projection: { _id: 1 } })) delete doc._id; // same id taken: let Mongo pick one
  const { insertedId } = await blogs.insertOne(doc);
  inserted.push({ id: String(insertedId), slug: doc.slug });
  console.log(`  inserted ${doc.slug}`);
}
const record = path.join(HERE, `.blog-copy-${Date.now()}.json`);
await fs.writeFile(record, JSON.stringify({ database: db.databaseName, inserted, copiedImages: toCopy.filter((k) => !failed.has(k)) }, null, 1));
console.log(`\ninserted ${inserted.length} post(s); record: ${record}`);
await mongoose.disconnect();
