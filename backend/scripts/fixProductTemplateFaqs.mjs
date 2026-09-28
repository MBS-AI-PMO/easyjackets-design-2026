/**
 * scripts/fixProductTemplateFaqs.mjs
 *
 * Puts the product FAQ template back, and moves the questions that were put
 * there by mistake onto the home page instead.
 *
 * Why this exists: 'product-template' is a template — one entry with
 * {productName} in it produces the FAQ on all 149 product pages. Someone
 * replaced it with ten general questions about custom varsity jackets, so every
 * product page now answers the same generic questions instead of ones about the
 * jacket being viewed. The questions themselves are good, they just belong on
 * the home page, where they are general on purpose.
 *
 * The move is done by reassigning pageKey rather than by recreating the entries,
 * so the answers are carried over exactly as they were written. Anything on
 * 'product-template' that is not one of the three seeded template questions is
 * treated as misplaced; the three are then restored from data/faqDefaults.js.
 *
 * Usage:
 *   node scripts/fixProductTemplateFaqs.mjs                 # dry run, writes nothing
 *   node scripts/fixProductTemplateFaqs.mjs --apply         # back up, then write
 *   node scripts/fixProductTemplateFaqs.mjs --restore       # undo from newest backup
 *   node scripts/fixProductTemplateFaqs.mjs --restore=<id>  # undo from a named backup
 *   node scripts/fixProductTemplateFaqs.mjs --list          # show available backups
 *
 * Backups land in the `page_faq_backups` collection, one document per run,
 * holding every FAQ on both pages as they were before the run.
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';

const BACKUP_COLLECTION = 'page_faq_backups';
const TEMPLATE_KEY = 'product-template';
const HOME_KEY = '/';

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

const { default: pageFaqModel } = await import('../models/pageFaq.js');
const { FAQ_DEFAULTS } = await import('../data/faqDefaults.js');

const finish = async (code = 0) => {
  await mongoose.disconnect();
  process.exit(code);
};

// The three the template is supposed to hold, as seeded.
const TEMPLATE_SEED = FAQ_DEFAULTS
  .filter((faq) => faq.pageKey === TEMPLATE_KEY)
  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

// Compared on the question alone: an admin may legitimately have reworded an
// answer, and rewording is not the same as the entry not belonging here.
const normalise = (text) => String(text || '').trim().toLowerCase().replace(/\s+/g, ' ');
const SEEDED_QUESTIONS = new Set(TEMPLATE_SEED.map((faq) => normalise(faq.question)));

// ── --list ───────────────────────────────────────────────────────────────────
if (LIST) {
  const all = await backups.find({}).project({ createdAt: 1, count: 1, note: 1 })
    .sort({ createdAt: -1 }).toArray();
  if (!all.length) console.log('No backups found.');
  all.forEach((b) => console.log(
    `  ${b._id}  ${new Date(b.createdAt).toISOString()}  ${b.count} FAQs  ${b.note || ''}`
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

  console.log(`Restoring backup ${backup._id} (${backup.count} FAQs)...`);

  // Both pages go back to exactly what the backup holds, so entries the run
  // created are removed rather than left behind as duplicates.
  await pageFaqModel.deleteMany({ pageKey: { $in: [TEMPLATE_KEY, HOME_KEY] } });
  if (backup.faqs.length) {
    await pageFaqModel.collection.insertMany(backup.faqs.map((faq) => ({
      ...faq,
      _id: new mongoose.Types.ObjectId(faq._id),
    })));
  }

  console.log(`Restored ${backup.faqs.length} FAQs.`);
  await finish();
}

// ── plan ─────────────────────────────────────────────────────────────────────
const onTemplate = await pageFaqModel.find({ pageKey: TEMPLATE_KEY })
  .sort({ sortOrder: 1 }).lean();
const onHome = await pageFaqModel.find({ pageKey: HOME_KEY })
  .sort({ sortOrder: 1 }).lean();

const keep = onTemplate.filter((faq) => SEEDED_QUESTIONS.has(normalise(faq.question)));
const misplaced = onTemplate.filter((faq) => !SEEDED_QUESTIONS.has(normalise(faq.question)));

const keptQuestions = new Set(keep.map((faq) => normalise(faq.question)));
const missing = TEMPLATE_SEED.filter((faq) => !keptQuestions.has(normalise(faq.question)));

console.log(`\nProduct Pages template (${TEMPLATE_KEY})`);
console.log(`  currently holds:  ${onTemplate.length} question(s)`);
console.log(`  belong here:      ${keep.length}`);
console.log(`  misplaced:        ${misplaced.length}`);
console.log(`  to restore:       ${missing.length}`);

console.log(`\nHome page (${HOME_KEY})`);
console.log(`  currently holds:  ${onHome.length} question(s)`);
console.log(`  moving in:        ${misplaced.length}`);

if (misplaced.length) {
  console.log('\nMoving to the home page:');
  misplaced.forEach((faq, i) => console.log(`  ${i + 1}. ${faq.question}`));
}
if (missing.length) {
  console.log('\nRestoring to the product template:');
  missing.forEach((faq, i) => console.log(`  ${i + 1}. ${faq.question}`));
}
if (keep.length) {
  console.log('\nAlready correct, left alone:');
  keep.forEach((faq, i) => console.log(`  ${i + 1}. ${faq.question}`));
}

if (!misplaced.length && !missing.length) {
  console.log('\nNothing to do — the template is already correct.');
  await finish();
}

if (!APPLY) {
  console.log('\nDry run. Nothing written. Re-run with --apply to make these changes.');
  await finish();
}

// ── apply ────────────────────────────────────────────────────────────────────
const backupDoc = {
  createdAt: new Date(),
  count: onTemplate.length + onHome.length,
  note: 'before fixProductTemplateFaqs',
  faqs: [...onTemplate, ...onHome].map((faq) => ({ ...faq, _id: String(faq._id) })),
};
const { insertedId } = await backups.insertOne(backupDoc);
console.log(`\nBacked up ${backupDoc.count} FAQs as ${insertedId}.`);

// Misplaced entries move to the home page, appended after anything already
// there, keeping the order they were shown in.
let homeSort = onHome.reduce((max, faq) => Math.max(max, faq.sortOrder || 0), 0);
for (const faq of misplaced) {
  homeSort += 1;
  await pageFaqModel.updateOne(
    { _id: faq._id },
    { $set: { pageKey: HOME_KEY, sortOrder: homeSort } }
  );
}
console.log(`Moved ${misplaced.length} question(s) to the home page.`);

// Restore whichever of the three seeded template questions are missing.
if (missing.length) {
  await pageFaqModel.insertMany(missing.map((faq) => ({
    pageKey: TEMPLATE_KEY,
    question: faq.question,
    answer: faq.answer,
    sortOrder: faq.sortOrder,
    isActive: faq.isActive !== false,
  })));
  console.log(`Restored ${missing.length} question(s) to the product template.`);
}

// Renumber the template so sortOrder matches the seeded order even when some
// entries survived and some were re-inserted.
const finalTemplate = await pageFaqModel.find({ pageKey: TEMPLATE_KEY }).lean();
const seedOrder = new Map(TEMPLATE_SEED.map((faq, i) => [normalise(faq.question), i + 1]));
for (const faq of finalTemplate) {
  const order = seedOrder.get(normalise(faq.question));
  if (order && faq.sortOrder !== order) {
    await pageFaqModel.updateOne({ _id: faq._id }, { $set: { sortOrder: order } });
  }
}

console.log(`\nDone. Undo with: node scripts/fixProductTemplateFaqs.mjs --restore=${insertedId}`);
await finish();
