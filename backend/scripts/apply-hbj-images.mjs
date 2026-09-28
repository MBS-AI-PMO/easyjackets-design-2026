import dotenv from 'dotenv';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';

dotenv.config();

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const inputArgIndex = args.findIndex((arg) => arg === '--input');
const inputPath = inputArgIndex >= 0 ? args[inputArgIndex + 1] : 'hbj-product-images.json';
const mediaBase = (process.env.UPLOADS_PUBLIC_BASE_URL || process.env.AWS_FILE_PATH || 'https://api.easyjackets.com/uploads')
  .replace(/\/+$/, '');

const normalizeSlug = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const toAbsoluteUrl = (value = '') => {
  const url = String(value).trim();
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${mediaBase}${parsed.pathname.replace(/^\/uploads/, '')}`;
      }
    } catch {
      // keep original absolute url
    }
    return url;
  }
  if (url.startsWith('/uploads/')) return `${mediaBase}${url.replace(/^\/uploads/, '')}`;
  if (url.startsWith('/')) return `${mediaBase}${url}`;
  return `${mediaBase}/${url.replace(/^\/+/, '')}`;
};

const buildIndex = (entries) => {
  const bySlug = new Map();
  const byTitle = new Map();

  for (const entry of entries) {
    const slugKey = normalizeSlug(entry.slug);
    const titleKey = normalizeSlug(entry.title);
    if (slugKey) bySlug.set(slugKey, entry);
    if (titleKey) byTitle.set(titleKey, entry);
  }

  return { bySlug, byTitle };
};

const findExportEntry = (product, index) => {
  const slugKey = normalizeSlug(product.slug);
  const titleKey = normalizeSlug(product.name);

  return index.bySlug.get(slugKey) || index.byTitle.get(titleKey) || null;
};

const main = async () => {
  const raw = await fs.readFile(inputPath, 'utf8');
  const entries = JSON.parse(raw);
  const index = buildIndex(entries);

  await mongoose.connect(process.env.MONGO_URL);
  const products = await Product.find({}).lean();

  let matched = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    const entry = findExportEntry(product, index);
    if (!entry?.images?.length) {
      skipped += 1;
      continue;
    }

    matched += 1;
    const absoluteImages = entry.images.map(toAbsoluteUrl).filter(Boolean);
    const nextFrontImage = absoluteImages[0];
    const nextOtherImages = absoluteImages.slice(1);

    console.log(`${shouldApply ? 'Updating' : 'Would update'} ${product.slug} -> ${nextFrontImage}`);

    if (shouldApply) {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            frontImage: nextFrontImage,
            otherImages: nextOtherImages,
          },
        }
      );
      updated += 1;
    }
  }

  console.log('');
  console.log(`Products scanned: ${products.length}`);
  console.log(`Matched with HBJ images: ${matched}`);
  console.log(`Skipped (no HBJ match): ${skipped}`);
  console.log(`${shouldApply ? 'Updated' : 'Dry run only'}: ${shouldApply ? updated : matched}`);
  if (!shouldApply) {
    console.log('Run again with --apply to write MongoDB updates.');
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error('Migration failed:', error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exitCode = 1;
});
