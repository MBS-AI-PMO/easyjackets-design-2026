// scripts/consolidateBlogPosts.mjs
//
// SEO audit B-O3: 16 posts fell into 6 groups that compete for the same searches. The strongest post of
// each group (most Search Console impressions) stays; the others are UNPUBLISHED here (isActive: false) —
// not deleted, their text stays in the database and can be merged into the kept post or republished from
// the admin — and the storefront answers their addresses with a 301 to the kept post
// (frontend/src/data/redirects.js). Refuses any database but the copy.
//
//   node scripts/consolidateBlogPosts.mjs                   dry run
//   node scripts/consolidateBlogPosts.mjs --apply           unpublish (record: scripts/.blog-consolidation-<time>.json)
//   node scripts/consolidateBlogPosts.mjs --restore <file>  publish them again
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

// merged post → the post it now points to (the same pairs as frontend/src/data/redirects.js)
const MERGED_INTO = {
  'letterman-jacket-vs-varsity-jacket-what-s-the-difference': 'varsity-jacket-vs-letterman-jacket-what-s-the-real-difference',
  'varsity-jackets-vs-letterman-jackets': 'varsity-jacket-vs-letterman-jacket-what-s-the-real-difference',
  'How-Much-Does-a-Custom-Varsity-Jacket-Cost-Materials-Quality-and-Pricing-Guide': 'how-much-do-custom-varsity-jackets-cost',
  'a-concise-history-of-the-letterman-jacket-and-its-significance': 'history-of-letterman-jackets-in-american-schools-sports-easy-jackets',
  'design-a-custom-jacket-that-s-uniquely-yours': 'how-to-design-custom-varsity-jackets-with-your-own-name-logo-and-patches',
  'design-your-own-custom-jacket-express-your-style-with-every-stitch': 'how-to-design-custom-varsity-jackets-with-your-own-name-logo-and-patches',
  'step-by-step-guideline-how-to-design-your-varsity-jacket-online-2025': 'how-to-design-custom-varsity-jackets-with-your-own-name-logo-and-patches',
  'how-to-style-a-custom-varsity-jacket-in-2025': 'how-to-style-a-varsity-jacket-for-men-and-women',
  'custom-varsity-jackets-schools-teams-clubs': 'custom-varsity-jackets-for-teams-schools-and-brands',
};

await connectDB();
const db = mongoose.connection.db;
if (db.databaseName !== ALLOWED_DB) { console.error(`refusing: connected to "${db.databaseName}", expected "${ALLOWED_DB}"`); process.exit(1); }
const blogs = db.collection('blogs');

if (RESTORE) {
  const saved = JSON.parse(await fs.readFile(path.resolve(RESTORE), 'utf8'));
  for (const { id, isActive } of saved.posts) await blogs.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { isActive } });
  console.log(`restored ${saved.posts.length} post(s) from ${RESTORE}`);
  await mongoose.disconnect();
  process.exit(0);
}

const plan = [];
for (const [slug, target] of Object.entries(MERGED_INTO)) {
  const [post, kept] = await Promise.all([blogs.findOne({ slug }), blogs.findOne({ slug: target })]);
  if (!post) { console.log(`  (not in the copy: ${slug})`); continue; }
  if (!kept || kept.isActive === false) { console.log(`  skipped ${slug}: the post it would point to is missing or unpublished`); continue; }
  if (post.isActive === false) continue;
  plan.push(post);
  console.log(`  unpublish ${slug}\n      → points to ${target}`);
}
console.log(`${plan.length} post(s) to unpublish`);
if (!APPLY || !plan.length) {
  if (!APPLY) console.log('dry run: nothing written. --apply unpublishes them.');
  await mongoose.disconnect();
  process.exit(0);
}
const record = path.join(HERE, `.blog-consolidation-${Date.now()}.json`);
await fs.writeFile(record, JSON.stringify({ database: db.databaseName, posts: plan.map((p) => ({ id: String(p._id), slug: p.slug, isActive: p.isActive !== false })) }, null, 1));
for (const post of plan) await blogs.updateOne({ _id: post._id }, { $set: { isActive: false } });
console.log(`unpublished ${plan.length} post(s); record: ${record}`);
await mongoose.disconnect();
