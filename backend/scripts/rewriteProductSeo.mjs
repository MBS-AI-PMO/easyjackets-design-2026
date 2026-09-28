/**
 * scripts/rewriteProductSeo.mjs
 *
 * Rewrites metaTitle / metaDescription / metaKeywords on every active product
 * using helpers/productSeo.js#suggestProductMeta.
 *
 * Why this exists: the imported metaDescription on every product is a truncated
 * copy of the spec bullet list ("Gun Metal YKK Zipper Closure Front Left Sleeve
 * Pocket…"). It names no product category, so it matches nothing anyone searches,
 * and it opens with a noun so it gives nobody a reason to click. Seven coach
 * jackets share one verbatim, which makes Google discard it entirely.
 *
 * Usage:
 *   node scripts/rewriteProductSeo.mjs                 # dry run, writes nothing
 *   node scripts/rewriteProductSeo.mjs --apply         # back up, then write
 *   node scripts/rewriteProductSeo.mjs --restore       # undo from newest backup
 *   node scripts/rewriteProductSeo.mjs --restore=<id>  # undo from a named backup
 *   node scripts/rewriteProductSeo.mjs --list          # show available backups
 *
 * Backups land in the `product_seo_backups` collection, one document per run,
 * holding the previous values for every product touched. Nothing is ever
 * overwritten without one.
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';

const BACKUP_COLLECTION = 'product_seo_backups';

const args = process.argv.slice(2);
const has = (flag) => args.some((arg) => arg === flag || arg.startsWith(`${flag}=`));
const valueOf = (flag) => {
  const found = args.find((arg) => arg.startsWith(`${flag}=`));
  return found ? found.slice(flag.length + 1) : '';
};

const APPLY = has('--apply');
const RESTORE = has('--restore');
const LIST = has('--list');

await mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection.db;
const backups = db.collection(BACKUP_COLLECTION);

const { default: productModel } = await import('../models/productModel.js');
const { suggestProductMeta, ACTIVE_PRODUCT_FILTER } = await import('../helpers/productSeo.js');

const finish = async (code = 0) => {
  await mongoose.disconnect();
  process.exit(code);
};

// ── --list ───────────────────────────────────────────────────────────────────
if (LIST) {
  const all = await backups.find({}).project({ createdAt: 1, count: 1, note: 1 }).sort({ createdAt: -1 }).toArray();
  if (!all.length) console.log('No backups found.');
  all.forEach((b) => console.log(`  ${b._id}  ${new Date(b.createdAt).toISOString()}  ${b.count} products  ${b.note || ''}`));
  await finish();
}

// ── --restore ────────────────────────────────────────────────────────────────
if (RESTORE) {
  const id = valueOf('--restore');
  const backup = id
    ? await backups.findOne({ _id: new mongoose.Types.ObjectId(id) })
    : await backups.findOne({}, { sort: { createdAt: -1 } });

  if (!backup) {
    console.error('No backup found to restore from. Run with --list to see what exists.');
    await finish(1);
  }

  console.log(`Restoring ${backup.products.length} products from backup ${backup._id} (${new Date(backup.createdAt).toISOString()})`);
  const ops = backup.products.map((p) => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(p._id) },
      update: {
        $set: {
          metaTitle: p.metaTitle ?? '',
          metaDescription: p.metaDescription ?? '',
          metaKeywords: p.metaKeywords ?? '',
        },
      },
    },
  }));
  const result = await productModel.bulkWrite(ops, { ordered: false });
  console.log(`Restored. matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  await finish();
}

// ── dry run / apply ──────────────────────────────────────────────────────────
const products = await productModel
  .find(ACTIVE_PRODUCT_FILTER)
  .populate('category', 'name section')
  .populate('color', 'name')
  .lean();

console.log(`${products.length} active products\n`);

const changes = products.map((product) => {
  const next = suggestProductMeta(product);
  return {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    before: {
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      metaKeywords: product.metaKeywords || '',
    },
    after: next,
  };
}).filter((change) =>
  change.before.metaTitle !== change.after.title
  || change.before.metaDescription !== change.after.description
  || change.before.metaKeywords !== change.after.keywords);

console.log(`${changes.length} products would change\n`);

const lengths = changes.map((c) => [c.after.title.length, c.after.description.length]);
console.log('  titles 30-60 :', lengths.filter(([t]) => t >= 30 && t <= 60).length, '/', lengths.length);
console.log('  descs 70-160 :', lengths.filter(([, d]) => d >= 70 && d <= 160).length, '/', lengths.length);
console.log('  unique titles:', new Set(changes.map((c) => c.after.title.toLowerCase())).size);
console.log('  unique descs :', new Set(changes.map((c) => c.after.description.toLowerCase())).size);

console.log('\n--- first 3 changes ---');
changes.slice(0, 3).forEach((c) => {
  console.log(`\n  ${c.slug}`);
  console.log(`    title  "${c.before.metaTitle}"\n        -> "${c.after.title}"`);
  console.log(`    desc   "${c.before.metaDescription.slice(0, 80)}…"\n        -> "${c.after.description}"`);
});

if (!APPLY) {
  console.log('\nDRY RUN — nothing written. Re-run with --apply to save.');
  await finish();
}

if (!changes.length) {
  console.log('\nNothing to do.');
  await finish();
}

// Back up first, and confirm the backup is readable before touching anything.
const backupDoc = {
  createdAt: new Date(),
  count: changes.length,
  note: 'pre-rewrite metaTitle/metaDescription/metaKeywords',
  products: changes.map((c) => ({ _id: c._id, slug: c.slug, ...c.before })),
};
const { insertedId } = await backups.insertOne(backupDoc);
const verifyBackup = await backups.findOne({ _id: insertedId });
if (!verifyBackup || verifyBackup.products.length !== changes.length) {
  console.error('Backup did not save correctly — aborting without writing.');
  await finish(1);
}
console.log(`\nBacked up ${verifyBackup.products.length} products to ${BACKUP_COLLECTION} (${insertedId})`);

const result = await productModel.bulkWrite(changes.map((c) => ({
  updateOne: {
    filter: { _id: new mongoose.Types.ObjectId(c._id) },
    update: {
      $set: {
        metaTitle: c.after.title,
        metaDescription: c.after.description,
        metaKeywords: c.after.keywords,
      },
    },
  },
})), { ordered: false });

console.log(`Written. matched ${result.matchedCount}, modified ${result.modifiedCount}`);

const spotCheck = await productModel.findById(changes[0]._id).select('metaTitle metaDescription metaKeywords').lean();
console.log('\nSpot check:', changes[0].slug);
console.log('  metaTitle      :', spotCheck.metaTitle);
console.log('  metaDescription:', spotCheck.metaDescription);
console.log('  metaKeywords   :', spotCheck.metaKeywords);

console.log(`\nTo undo:  node scripts/rewriteProductSeo.mjs --restore=${insertedId}`);
await finish();
