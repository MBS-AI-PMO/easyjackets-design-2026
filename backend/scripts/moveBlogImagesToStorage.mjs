/**
 * scripts/moveBlogImagesToStorage.mjs
 *
 * Moves images embedded in blog articles out to storage, leaving only URLs in
 * the database.
 *
 * Why this exists: the article editor used to embed pasted and uploaded images
 * as data: URLs — the whole image, base64-encoded, inline in the HTML. One post
 * reached 8 MB that way, and because the list endpoints carried every post's
 * body, the home page, the blog index, every post's sidebar and the admin
 * table were each downloading it. The editor and the API no longer accept
 * data: URLs; this cleans up what was saved before that.
 *
 * =========================================================================
 *   RUN THIS INSIDE THE PRODUCTION API CONTAINER.
 *
 *   Storage is the container's /app/uploads volume. Run from anywhere else,
 *   the images land on that machine's disk and the live site would be given
 *   URLs to files that do not exist. The verification step below catches
 *   that and refuses to write, but there is no reason to find out that way.
 *
 *   Coolify -> Easyjackets api -> Terminal, then:
 *      node scripts/moveBlogImagesToStorage.mjs           # dry run
 *      node scripts/moveBlogImagesToStorage.mjs --apply   # do it
 * =========================================================================
 *
 * Nothing is lost. For every post, in this order:
 *   1. the original document is backed up to the `blog_backups` collection;
 *   2. every embedded image is written to storage under uploads/blog/;
 *   3. every resulting URL is fetched over HTTP and must come back 200 with an
 *      image content-type — the same request a visitor's browser will make;
 *   4. only then is the post's HTML rewritten to point at those URLs.
 * A post whose images cannot all be verified is left exactly as it was.
 *
 * Usage:
 *   node scripts/moveBlogImagesToStorage.mjs                 # dry run, writes nothing
 *   node scripts/moveBlogImagesToStorage.mjs --apply         # back up, upload, verify, write
 *   node scripts/moveBlogImagesToStorage.mjs --restore       # undo from newest backup
 *   node scripts/moveBlogImagesToStorage.mjs --restore=<id>  # undo from a named backup
 *   node scripts/moveBlogImagesToStorage.mjs --list          # show available backups
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';

const BACKUP_COLLECTION = 'blog_backups';
const VERIFY_TIMEOUT_MS = 20_000;

const args = process.argv.slice(2);
const has = (flag) => args.some((arg) => arg === flag || arg.startsWith(`${flag}=`));
const valueOf = (flag) => {
  const found = args.find((arg) => arg.startsWith(`${flag}=`));
  return found ? found.slice(flag.length + 1) : '';
};

const APPLY = has('--apply');
const RESTORE = has('--restore');
const LIST = has('--list');

const kb = (text) => Math.round(String(text || '').length / 1024);
const mb = (n) => (n / 1024).toFixed(1);

await mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection.db;
const blogs = db.collection('blogs');
const backups = db.collection(BACKUP_COLLECTION);

const { hasInlineImages, countInlineImages, moveInlineImagesToStorage } = await import('../helpers/blogImages.js');

const finish = async (code = 0) => {
  await mongoose.disconnect();
  process.exit(code);
};

// ── --list ───────────────────────────────────────────────────────────────────
if (LIST) {
  const all = await backups.find({}).project({ createdAt: 1, count: 1, note: 1 })
    .sort({ createdAt: -1 }).toArray();
  if (!all.length) console.log('No backups found.');
  all.forEach((b) => console.log(
    `  ${b._id}  ${new Date(b.createdAt).toISOString()}  ${b.count} post(s)  ${b.note || ''}`
  ));
  await finish();
}

// ── --restore ────────────────────────────────────────────────────────────────
if (RESTORE) {
  const wanted = valueOf('--restore');
  const backup = wanted
    ? await backups.findOne({ _id: new mongoose.Types.ObjectId(wanted) })
    : await backups.find({}).sort({ createdAt: -1 }).limit(1).next();

  if (!backup) {
    console.error('No backup to restore from.');
    await finish(1);
  }

  console.log(`Restoring backup ${backup._id} (${backup.count} post(s))...`);
  for (const post of backup.posts) {
    await blogs.updateOne(
      { _id: new mongoose.Types.ObjectId(post._id) },
      { $set: { content: post.content } }
    );
    console.log(`  restored  ${post.title}`);
  }
  console.log('Done. The uploaded image files are left in storage; they are harmless.');
  await finish();
}

// ── plan ─────────────────────────────────────────────────────────────────────
const all = await blogs.find({}).project({ title: 1, slug: 1, content: 1 }).toArray();
const affected = all
  .filter((post) => hasInlineImages(post.content))
  .map((post) => ({ ...post, images: countInlineImages(post.content), kb: kb(post.content) }))
  .sort((a, b) => b.kb - a.kb);

const totalKb = all.reduce((sum, post) => sum + kb(post.content), 0);
const affectedKb = affected.reduce((sum, post) => sum + post.kb, 0);

console.log(`\n${all.length} posts, ${mb(totalKb)} MB of article HTML in total.`);
console.log(`${affected.length} post(s) have images embedded in the body, ${mb(affectedKb)} MB between them:\n`);
affected.forEach((post) => console.log(
  `  ${String(post.kb).padStart(6)} KB  ${String(post.images).padStart(2)} image(s)  ${post.title}`
));

if (!affected.length) {
  console.log('\nNothing to do.');
  await finish();
}

if (!APPLY) {
  console.log('\nDry run. Nothing uploaded, nothing written. Re-run with --apply to make these changes.');
  await finish();
}

// ── apply ────────────────────────────────────────────────────────────────────

// The same request a visitor's browser will make. A URL that does not answer
// with an image is not good enough to put in the database.
const verifyUrl = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
  try {
    const response = await fetch(url, { method: 'GET', signal: controller.signal });
    const type = response.headers.get('content-type') || '';
    if (!response.ok) return `HTTP ${response.status}`;
    if (!type.startsWith('image/')) return `content-type is "${type}", not an image`;
    const bytes = (await response.arrayBuffer()).byteLength;
    if (!bytes) return 'empty body';
    return null;
  } catch (error) {
    return error.name === 'AbortError' ? 'timed out' : error.message;
  } finally {
    clearTimeout(timer);
  }
};

const backupDoc = {
  createdAt: new Date(),
  count: affected.length,
  note: 'before moveBlogImagesToStorage',
  posts: affected.map((post) => ({
    _id: String(post._id),
    title: post.title,
    slug: post.slug,
    content: post.content,
  })),
};
const { insertedId } = await backups.insertOne(backupDoc);
console.log(`\nBacked up ${backupDoc.count} post(s) as ${insertedId}.\n`);

let written = 0;
let skipped = 0;
let beforeKb = 0;
let afterKb = 0;

for (const post of affected) {
  console.log(`> ${post.title}`);
  console.log(`    ${post.images} image(s), ${post.kb} KB`);

  let result;
  try {
    result = await moveInlineImagesToStorage(post.content, undefined, {
      namePrefix: String(post.slug || 'post').slice(0, 40),
    });
  } catch (error) {
    console.log(`    FAIL upload: ${error.message}. Post left unchanged.`);
    skipped += 1;
    continue;
  }

  if (result.moved !== post.images) {
    console.log(`    FAIL expected ${post.images} upload(s), got ${result.moved}. Post left unchanged.`);
    skipped += 1;
    continue;
  }

  let allGood = true;
  for (const url of result.urls) {
    const problem = await verifyUrl(url);
    if (problem) {
      console.log(`    FAIL ${url}`);
      console.log(`         ${problem}`);
      allGood = false;
    } else {
      console.log(`    ok   ${url}`);
    }
  }

  if (!allGood) {
    console.log('    Not every image is reachable, so the post is left unchanged.');
    console.log('    If this is every post, the script is probably not running inside the API container.');
    skipped += 1;
    continue;
  }

  await blogs.updateOne({ _id: post._id }, { $set: { content: result.html } });
  const after = kb(result.html);
  beforeKb += post.kb;
  afterKb += after;
  written += 1;
  console.log(`    written: ${post.kb} KB -> ${after} KB\n`);
}

console.log('-'.repeat(70));
console.log(`${written} post(s) rewritten, ${skipped} left unchanged.`);
if (written) console.log(`Article HTML for those: ${mb(beforeKb)} MB -> ${mb(afterKb)} MB.`);
console.log(`\nUndo with: node scripts/moveBlogImagesToStorage.mjs --restore=${insertedId}`);
await finish(skipped ? 1 : 0);
