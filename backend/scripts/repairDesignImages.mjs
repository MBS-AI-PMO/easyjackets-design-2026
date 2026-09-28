/**
 * scripts/repairDesignImages.mjs
 *
 * Repoints saved designs at preview images that actually exist.
 *
 * Why this exists: a design's four preview URLs (custom_image, _back, _left,
 * _right) are stored in the document as absolute URLs. Designs saved before the
 * move to Coolify storage still carry s3.amazonaws.com URLs, and that bucket is
 * gone — it answers 403. The result is a blank tile everywhere a jacket is
 * shown: the storefront design page, the admin order screen, the order PDF.
 *
 * The pictures themselves were never lost. Each design also stores the same
 * four views as base64 snapshots under jackets[0].front/back/left/right. This
 * uploads those snapshots to storage and rewrites the URLs to match.
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
 *      node scripts/repairDesignImages.mjs           # dry run
 *      node scripts/repairDesignImages.mjs --apply   # do it
 * =========================================================================
 *
 * Nothing is lost. For every design, in this order:
 *   1. the four original URLs are backed up to the `design_backups` collection;
 *   2. each snapshot is written to storage under uploads/design/;
 *   3. every resulting URL is fetched over HTTP and must come back 200 with an
 *      image content-type — the same request a visitor's browser will make;
 *   4. only then are the design's URL fields rewritten.
 * A design whose images cannot all be verified is left exactly as it was. The
 * base64 snapshots are never touched, so this can be run again safely.
 *
 * Usage:
 *   node scripts/repairDesignImages.mjs                 # dry run, writes nothing
 *   node scripts/repairDesignImages.mjs --apply         # back up, upload, verify, write
 *   node scripts/repairDesignImages.mjs --limit=20      # only the first N designs
 *   node scripts/repairDesignImages.mjs --restore       # undo from newest backup
 *   node scripts/repairDesignImages.mjs --restore=<id>  # undo from a named backup
 *   node scripts/repairDesignImages.mjs --list          # show available backups
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';

const BACKUP_COLLECTION = 'design_backups';
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
const LIMIT = Number(valueOf('--limit')) || 0;

await mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection.db;
const designs = db.collection('designs');
const backups = db.collection(BACKUP_COLLECTION);

const {
  DESIGN_VIEWS,
  isServableUrl,
  planDesignRepair,
  publicUploadsBase,
  uploadDesignSnapshot,
} = await import('../helpers/designPreviews.js');

const FIELDS = Object.keys(DESIGN_VIEWS);

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
    `  ${b._id}  ${new Date(b.createdAt).toISOString()}  ${b.count} design(s)  ${b.note || ''}`
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

  console.log(`Restoring backup ${backup._id} (${backup.count} design(s))...`);
  for (const entry of backup.designs) {
    await designs.updateOne(
      { _id: new mongoose.Types.ObjectId(entry._id) },
      { $set: entry.fields }
    );
  }
  console.log('Done. The uploaded image files are left in storage; they are harmless.');
  await finish();
}

// ── plan ─────────────────────────────────────────────────────────────────────
const base = publicUploadsBase();
if (!base) {
  console.error('Neither UPLOADS_PUBLIC_BASE_URL nor AWS_FILE_PATH is set, so there is');
  console.error('no way to tell a working preview URL from a dead one. Refusing to run.');
  await finish(1);
}
console.log(`\nWorking previews are the ones under ${base}/`);

// The planning pass must not pull the snapshots themselves. They are ~250 KB a
// design and there are hundreds — holding them all would be most of a gigabyte,
// and sorting on an unindexed field made the server sort whole documents in
// memory and blow Atlas's 32 MB limit. So: no sort at all (the repair does not
// care about order), and `$type` to ask whether each snapshot is a string
// without transferring a byte of it. The snapshots are fetched one design at a
// time in the apply pass below.
const firstJacketView = (view) => ({
  $let: {
    // `jackets` is Schema.Types.Mixed, so it is an array in most documents but
    // not guaranteed to be one.
    vars: { j: { $cond: [{ $isArray: '$jackets' }, { $arrayElemAt: ['$jackets', 0] }, '$jackets'] } },
    in: { $type: `$$j.${view}` },
  },
});

const pipeline = [{
  $project: {
    title: 1, categoryCode: 1, createdAt: 1,
    ...Object.fromEntries(FIELDS.map((f) => [f, 1])),
    snapshots: Object.fromEntries(
      Object.values(DESIGN_VIEWS).map((view) => [view, firstJacketView(view)])
    ),
  },
}];

const planned = [];
let total = 0;
let healthy = 0;
let beyondRepair = 0;

// No sort and no grouping, so there is no blocking stage — and allowDiskUse is
// rejected outright on Atlas shared tiers, so it stays off.
const cursor = designs.aggregate(pipeline);
for await (const design of cursor) {
  total += 1;

  const unservable = FIELDS.filter((field) => !isServableUrl(design[field]));
  if (!unservable.length) { healthy += 1; continue; }

  // A snapshot we can rebuild from is one that is actually stored as a string.
  const views = unservable.filter((field) => design.snapshots?.[DESIGN_VIEWS[field]] === 'string');
  const missingSnapshot = unservable.filter((field) => !views.includes(field));

  if (!views.length) { beyondRepair += 1; continue; }

  planned.push({
    _id: design._id,
    title: design.title || design.categoryCode || 'design',
    createdAt: design.createdAt,
    views,
    missingSnapshot,
    originals: Object.fromEntries(unservable.map((f) => [f, design[f] ?? null])),
  });
}

const limited = LIMIT ? planned.slice(0, LIMIT) : planned;
const totalImages = limited.reduce((sum, d) => sum + d.views.length, 0);

console.log(`\n${total} design(s) in total.`);
console.log(`  ${healthy} already point at working previews.`);
console.log(`  ${planned.length} can be rebuilt from their base64 snapshots.`);
console.log(`  ${beyondRepair} are broken with no snapshot to rebuild from.`);
if (LIMIT) console.log(`  --limit=${LIMIT}: only the first ${limited.length} will be touched.`);
console.log(`\n${totalImages} image(s) to upload across ${limited.length} design(s).\n`);

limited.slice(0, 15).forEach((d) => console.log(
  `  ${String(d._id)}  ${d.views.length} view(s)  ${d.title}`
));
if (limited.length > 15) console.log(`  ... and ${limited.length - 15} more`);

if (!limited.length) {
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

const { insertedId } = await backups.insertOne({
  createdAt: new Date(),
  count: limited.length,
  note: 'before repairDesignImages',
  designs: limited.map((d) => ({ _id: String(d._id), title: d.title, fields: d.originals })),
});
console.log(`\nBacked up ${limited.length} design(s) as ${insertedId}.\n`);

let written = 0;
let skipped = 0;
let uploaded = 0;

for (const design of limited) {
  const views = design.views;
  console.log(`> ${design.title}  (${String(design._id)})`);

  // Fetched here, one design at a time, so only a single design's snapshots are
  // ever in memory.
  const full = await designs.findOne(
    { _id: design._id },
    { projection: { jackets: 1, ...Object.fromEntries(FIELDS.map((f) => [f, 1])) } }
  );
  const { repairable } = planDesignRepair(full || {});

  const updates = {};
  let allGood = true;

  for (const field of views) {
    const view = DESIGN_VIEWS[field];

    if (!repairable[field]) {
      console.log(`    FAIL ${view}: the snapshot was not readable on re-fetch`);
      allGood = false;
      break;
    }

    let url;
    try {
      url = await uploadDesignSnapshot(repairable[field], {
        name: `${String(design._id)}-${view}`,
      });
      uploaded += 1;
    } catch (error) {
      console.log(`    FAIL ${view}: ${error.message}`);
      allGood = false;
      break;
    }

    const problem = await verifyUrl(url);
    if (problem) {
      console.log(`    FAIL ${view}: ${url}`);
      console.log(`         ${problem}`);
      allGood = false;
      break;
    }

    console.log(`    ok   ${view}: ${url}`);
    updates[field] = url;
  }

  if (!allGood) {
    console.log('    Not every view is reachable, so the design is left unchanged.');
    console.log('    If this is every design, the script is probably not running inside the API container.\n');
    skipped += 1;
    continue;
  }

  if (design.missingSnapshot.length) {
    console.log(`    note: ${design.missingSnapshot.join(', ')} had no snapshot and stay as they are.`);
  }

  await designs.updateOne({ _id: design._id }, { $set: updates });
  written += 1;
  console.log(`    written: ${views.length} view(s)\n`);
}

console.log('-'.repeat(70));
console.log(`${written} design(s) repaired, ${skipped} left unchanged, ${uploaded} image(s) uploaded.`);
console.log(`\nUndo with: node scripts/repairDesignImages.mjs --restore=${insertedId}`);
await finish(skipped ? 1 : 0);
