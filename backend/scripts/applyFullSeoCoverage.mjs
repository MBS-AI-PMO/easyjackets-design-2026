/**
 * Applies the workbook-driven SEO coverage pass.
 *
 * Usage:
 *   node scripts/applyFullSeoCoverage.mjs
 *   node scripts/applyFullSeoCoverage.mjs --apply
 *   node scripts/applyFullSeoCoverage.mjs --workbook="C:\Users\User\Desktop\1.xlsx" --apply
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import 'dotenv/config';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import slugify from 'slugify';

import Metadata from '../models/metaData.js';
import productModel from '../models/productModel.js';
import Blog from '../models/blogs.js';
import PageFaq from '../models/pageFaq.js';
import { KEYWORD_LANDING_FAQ_DEFAULTS } from '../data/keywordLandingFaqDefaults.js';

const SITE_URL = 'https://easyjackets.com';
const BACKUP_COLLECTION = 'full_seo_coverage_backups';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag, fallback = '') => {
  const found = args.find((arg) => arg.startsWith(`${flag}=`));
  return found ? found.slice(flag.length + 1).replace(/^"|"$/g, '') : fallback;
};

const APPLY = has('--apply');
const WORKBOOK = valueOf('--workbook', 'C:\\Users\\User\\Desktop\\1.xlsx');

const cleanText = (value = '') =>
  String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

const stripSiteName = (value = '') =>
  cleanText(value).replace(/\s*[-|]\s*Easy\s*Jackets?$/i, '').trim();

const normalizeRoute = (route = '') => {
  const trimmed = String(route || '').trim();
  if (!trimmed) return '';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
};

const pathFromUrl = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return normalizeRoute(new URL(raw, SITE_URL).pathname);
  } catch {
    return normalizeRoute(raw);
  }
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeSlug = (value = '') =>
  slugify(cleanText(value) || 'page', { lower: true, strict: true, trim: true }) || 'page';

const deriveKeywords = (route, title, h1) => {
  const parts = [
    stripSiteName(title),
    cleanText(h1),
    route
      .replace(/^\/+/, '')
      .replace(/\//g, ' ')
      .replace(/-/g, ' '),
    'Easy Jackets',
  ]
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !['with', 'from', 'your', 'page'].includes(word));

  return [...new Set(parts)].slice(0, 8).join(', ');
};

const findHeaderIndex = (rows) =>
  rows.findIndex((row) => {
    const cells = row.map(normaliseHeader);
    return cells.includes('current url')
      && cells.includes('suggest meta title')
      && cells.includes('suggest meta description');
  });

const normaliseHeader = (value = '') =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const pick = (row, candidates = []) => {
  for (const candidate of candidates) {
    if (Object.prototype.hasOwnProperty.call(row, candidate) && cleanText(row[candidate])) {
      return cleanText(row[candidate]);
    }
  }
  return '';
};

const parseOnPageRows = (workbookPath) => {
  const workbook = xlsx.readFile(workbookPath);
  const sheet = workbook.Sheets['On-Page SEO'] || workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIndex = findHeaderIndex(rows);

  if (headerIndex < 0) {
    throw new Error('Could not find the On-Page SEO header row in the workbook.');
  }

  const headers = rows[headerIndex].map(normaliseHeader);
  return rows.slice(headerIndex + 1)
    .map((values) => headers.reduce((acc, header, index) => {
      if (header) acc[header] = values[index];
      return acc;
    }, {}))
    .filter((row) => pathFromUrl(pick(row, ['current url', 'url', 'page url', 'target url'])));
};

const buildWorkbookChange = (row) => {
  const route = pathFromUrl(pick(row, ['current url', 'url', 'page url', 'target url']));
  const title = stripSiteName(pick(row, [
    'suggested meta title',
    'suggest meta title',
    'suggested title',
    'recommended meta title',
    'meta title',
    'title',
  ]));
  const h1 = stripSiteName(pick(row, [
    'suggested h1',
    'suggest h1',
    'recommended h1',
    'h1',
  ])) || title;
  const description = cleanText(pick(row, [
    'suggested meta description',
    'suggest meta description',
    'recommended meta description',
    'meta description',
    'description',
  ]));
  const imageAlt = cleanText(pick(row, [
    'image alt',
    'image alt guide',
    'suggested image alt',
    'alt text',
  ]));

  return { route, title, h1, description, imageAlt };
};

const isProductRoute = (route) => route.startsWith('/product/');
const isBlogRoute = (route) => route.startsWith('/new-blog/') && route !== '/new-blog';

await mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection.db;
const backups = db.collection(BACKUP_COLLECTION);

const finish = async (code = 0) => {
  await mongoose.disconnect();
  process.exit(code);
};

const workbookRows = parseOnPageRows(WORKBOOK).map(buildWorkbookChange).filter((row) => row.route);
const metadataUpdates = [];
const productUpdates = [];
const blogUpdates = [];
const missingTargets = [];

for (const row of workbookRows) {
  if (isProductRoute(row.route)) {
    const slug = row.route.slice('/product/'.length);
    const product = await productModel.findOne({ slug: new RegExp(`^${escapeRegex(slug)}$`, 'i') }).lean();
    if (!product) {
      missingTargets.push({ route: row.route, type: 'product' });
      continue;
    }

    const update = {};
    if (row.title) update.metaTitle = row.title;
    if (row.description) update.metaDescription = row.description;
    if (row.imageAlt) update.imageAlt = row.imageAlt;
    if (Object.keys(update).length) {
      productUpdates.push({ doc: product, update });
    }
    continue;
  }

  if (isBlogRoute(row.route)) {
    const slug = row.route.slice('/new-blog/'.length);
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) {
      missingTargets.push({ route: row.route, type: 'blog' });
      continue;
    }

    const update = {};
    if (row.h1 || row.title) update.title = row.h1 || row.title;
    if (row.description) update.excerpt = row.description;
    if (Object.keys(update).length) {
      blogUpdates.push({ doc: blog, update: { ...update, updatedAt: new Date() } });
    }
    continue;
  }

  const existing = await Metadata.findOne({ route: row.route }).lean();
  const title = row.title || existing?.title || row.h1;
  const h1 = row.h1 || existing?.h1 || title;
  const description = row.description || existing?.description || '';
  const update = {
    route: row.route,
    title,
    h1,
    description,
    keywords: existing?.keywords || deriveKeywords(row.route, title, h1),
    sitemapEnabled: existing?.sitemapEnabled ?? true,
    sitemapOrder: existing?.sitemapOrder ?? 100,
    sitemapPriority: existing?.sitemapPriority ?? 0.6,
    sitemapChangefreq: existing?.sitemapChangefreq || 'weekly',
  };

  metadataUpdates.push({ doc: existing, update });
}

const products = await productModel.find({ slug: { $exists: true, $ne: '' } }).select('name slug updatedAt').lean();
const groups = new Map();
products.forEach((product) => {
  const key = String(product.slug || '').toLowerCase();
  if (!key) return;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(product);
});

const existingSlugs = new Set(products.map((product) => String(product.slug || '').toLowerCase()).filter(Boolean));
const duplicateSlugUpdates = [];

for (const [, docs] of groups) {
  if (docs.length < 2) continue;
  const sorted = [...docs].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  const [, ...duplicates] = sorted;

  for (const product of duplicates) {
    const base = normalizeSlug(product.name || product.slug);
    let candidate = base;
    let counter = 2;
    while (existingSlugs.has(candidate.toLowerCase())) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }
    existingSlugs.add(candidate.toLowerCase());
    duplicateSlugUpdates.push({ doc: product, update: { slug: candidate } });
  }
}

const changes = {
  metadata: metadataUpdates.filter(({ doc, update }) =>
    !doc
    || String(doc.title || '') !== String(update.title || '')
    || String(doc.h1 || '') !== String(update.h1 || '')
    || String(doc.description || '') !== String(update.description || '')
    || String(doc.keywords || '') !== String(update.keywords || '')
  ),
  products: productUpdates.filter(({ doc, update }) =>
    Object.entries(update).some(([key, value]) => String(doc[key] || '') !== String(value || ''))
  ),
  blogs: blogUpdates.filter(({ doc, update }) =>
    Object.entries(update).some(([key, value]) => key !== 'updatedAt' && String(doc[key] || '') !== String(value || ''))
  ),
  duplicateSlugs: duplicateSlugUpdates,
};

const faqPageKeys = [...new Set(KEYWORD_LANDING_FAQ_DEFAULTS.map((faq) => faq.pageKey))];
const existingFaqKeys = new Set(
  (await PageFaq.find({ pageKey: { $in: faqPageKeys } }).select('pageKey').lean())
    .map((faq) => faq.pageKey)
);
const faqInserts = KEYWORD_LANDING_FAQ_DEFAULTS.filter((faq) => !existingFaqKeys.has(faq.pageKey));

console.log(`Workbook rows read: ${workbookRows.length}`);
console.log(`Metadata rows to upsert/update: ${changes.metadata.length}`);
console.log(`Products to update from workbook: ${changes.products.length}`);
console.log(`Blogs to update from workbook: ${changes.blogs.length}`);
console.log(`Duplicate product slugs to rewrite: ${changes.duplicateSlugs.length}`);
console.log(`Keyword landing FAQs to insert: ${faqInserts.length}`);
if (missingTargets.length) {
  console.log(`Missing workbook targets: ${missingTargets.length}`);
  missingTargets.slice(0, 10).forEach((item) => console.log(`  ${item.type}: ${item.route}`));
}

console.log('\nFirst metadata changes:');
changes.metadata.slice(0, 5).forEach(({ update }) => {
  console.log(`  ${update.route} -> ${update.title}`);
});

console.log('\nDuplicate slug changes:');
changes.duplicateSlugs.forEach(({ doc, update }) => {
  console.log(`  ${doc.slug} -> ${update.slug} (${doc.name})`);
});

if (!APPLY) {
  console.log('\nDRY RUN - nothing written. Re-run with --apply to save.');
  await finish();
}

const backupDoc = {
  createdAt: new Date(),
  workbook: WORKBOOK,
  counts: {
    metadata: changes.metadata.length,
    products: changes.products.length,
    blogs: changes.blogs.length,
    duplicateSlugs: changes.duplicateSlugs.length,
    faqInserts: faqInserts.length,
  },
  metadata: changes.metadata.map(({ doc, update }) => ({ route: update.route, before: doc || null, after: update })),
  products: changes.products.map(({ doc, update }) => ({
    _id: String(doc._id),
    slug: doc.slug,
    before: {
      metaTitle: doc.metaTitle || '',
      metaDescription: doc.metaDescription || '',
      imageAlt: doc.imageAlt || '',
    },
    after: update,
  })),
  blogs: changes.blogs.map(({ doc, update }) => ({
    _id: String(doc._id),
    slug: doc.slug,
    before: {
      title: doc.title || '',
      excerpt: doc.excerpt || '',
    },
    after: update,
  })),
  duplicateSlugs: changes.duplicateSlugs.map(({ doc, update }) => ({
    _id: String(doc._id),
    name: doc.name,
    before: { slug: doc.slug },
    after: update,
  })),
  faqInserts,
  missingTargets,
};

const { insertedId } = await backups.insertOne(backupDoc);
const verifyBackup = await backups.findOne({ _id: insertedId });
if (!verifyBackup) {
  console.error('Backup did not save correctly. Aborting without writes.');
  await finish(1);
}

console.log(`\nBackup saved to ${BACKUP_COLLECTION}: ${insertedId}`);

if (changes.metadata.length) {
  const result = await Metadata.bulkWrite(changes.metadata.map(({ update }) => ({
    updateOne: {
      filter: { route: update.route },
      update: { $set: update },
      upsert: true,
    },
  })), { ordered: false });
  console.log(`Metadata write: matched ${result.matchedCount}, modified ${result.modifiedCount}, upserted ${result.upsertedCount}`);
}

if (changes.products.length) {
  const result = await productModel.bulkWrite(changes.products.map(({ doc, update }) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: update },
    },
  })), { ordered: false });
  console.log(`Product SEO write: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
}

if (changes.blogs.length) {
  const result = await Blog.bulkWrite(changes.blogs.map(({ doc, update }) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: update },
    },
  })), { ordered: false });
  console.log(`Blog write: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
}

if (changes.duplicateSlugs.length) {
  const result = await productModel.bulkWrite(changes.duplicateSlugs.map(({ doc, update }) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: update },
    },
  })), { ordered: false });
  console.log(`Duplicate slug write: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
}

if (faqInserts.length) {
  const result = await PageFaq.insertMany(faqInserts, { ordered: false });
  console.log(`Keyword FAQ insert: inserted ${result.length}`);
}

console.log('SEO coverage apply complete.');
await finish();
