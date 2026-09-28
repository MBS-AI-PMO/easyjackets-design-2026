import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import Product from '../models/productModel.js';
import Gallery from '../models/galleryModel.js';
import Feature from '../models/features.js';
import Category from '../models/CategoryModel.js';
import Blog from '../models/blogs.js';
import Metadata from '../models/metaData.js';
import Design from '../models/design.js';
import BulkOrder from '../models/bulkorder.js';
import Order from '../models/orderModel.js';

dotenv.config();

const ONE_YEAR_CACHE = 'public, max-age=31536000, immutable';
const LEGACY_IMAGE_RE = /\.(png|jpe?g)(?:[?#].*)?$/i;
const IMAGE_MAX_EDGE = Number(process.env.WEBP_MAX_EDGE || 1600);
const WEBP_QUALITY = Number(process.env.WEBP_QUALITY || 76);
const WEBP_EFFORT = Number(process.env.WEBP_EFFORT || 6);

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const DELETE_OLD = args.has('--delete-old');
const LIMIT = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] || 0);

const requiredEnv = [
  'MONGO_URL',
  'AWS_S3_REGION',
  'AWS_S3_ACCESS_KEY_ID',
  'AWS_S3_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME',
  'AWS_FILE_PATH',
];

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const collections = [
  { name: 'Products', model: Product, strings: ['frontImage'], arrays: ['otherImages'] },
  { name: 'Gallery', model: Gallery, strings: ['imageUrl'], arrays: ['imageUrls'] },
  { name: 'Feature', model: Feature, arrays: ['banner'] },
  { name: 'Category', model: Category, strings: ['image'] },
  { name: 'Blog', model: Blog, strings: ['image'] },
  { name: 'Metadata', model: Metadata, strings: ['favicon', 'navbarLogo', 'footerLogo'] },
  {
    name: 'Design',
    model: Design,
    strings: ['custom_image', 'custom_image_back', 'custom_image_left', 'custom_image_right'],
  },
  { name: 'BulkOrder', model: BulkOrder, arrays: ['images'] },
  { name: 'Order', model: Order, nestedArrays: [{ arrayPath: 'cartData', field: 'frontImage' }] },
];

const cache = new Map();
const failures = [];

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment values: ${missing.join(', ')}`);
  }
};

const isLegacyImage = (value) => typeof value === 'string' && LEGACY_IMAGE_RE.test(value);

const buildPublicUrl = (key) => `${process.env.AWS_FILE_PATH.replace(/\/?$/, '/')}${key}`;

const toS3Key = (url) => {
  if (!url || typeof url !== 'string') return null;

  const filePath = process.env.AWS_FILE_PATH || '';
  if (filePath && url.startsWith(filePath)) {
    return decodeURIComponent(url.slice(filePath.length).split('?')[0].replace(/^\/+/, ''));
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('amazonaws.com')) return null;
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
  } catch (error) {
    return null;
  }
};

const toWebpKey = (url) => {
  const key = toS3Key(url);
  const rawName = key || url.split('?')[0];
  const dir = key ? path.posix.dirname(key) : 'migrated-webp';
  const parsed = path.posix.parse(rawName);
  const cleanBase = (parsed.name || 'image')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'image';
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 10);
  const fileName = `${cleanBase}-${hash}.webp`;
  return dir && dir !== '.' ? `${dir}/${fileName}` : fileName;
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
};

const readImage = async (url) => {
  const key = toS3Key(url);

  if (key) {
    const object = await s3.send(new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }));
    return streamToBuffer(object.Body);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

const convertUrl = async (url) => {
  if (!isLegacyImage(url)) return url;
  if (cache.has(url)) return cache.get(url);

  try {
    const newKey = toWebpKey(url);
    const newUrl = buildPublicUrl(newKey);

    if (!APPLY) {
      cache.set(url, newUrl);
      return newUrl;
    }

    const input = await readImage(url);
    const output = await sharp(input)
      .rotate()
      .resize({
        width: IMAGE_MAX_EDGE,
        height: IMAGE_MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT, smartSubsample: true })
      .toBuffer();

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: newKey,
      Body: output,
      ContentType: 'image/webp',
      CacheControl: ONE_YEAR_CACHE,
    }));

    cache.set(url, newUrl);
    return newUrl;
  } catch (error) {
    failures.push({ url, message: error.message });
    console.warn(`Skipped ${url}: ${error.message}`);
    return url;
  }
};

const convertStringField = async (doc, field) => {
  const current = doc.get(field);
  if (!isLegacyImage(current)) return 0;
  doc.set(field, await convertUrl(current));
  return 1;
};

const convertArrayField = async (doc, field) => {
  const current = doc.get(field);
  if (!Array.isArray(current)) return 0;

  let changed = 0;
  const next = [];
  for (const value of current) {
    if (isLegacyImage(value)) {
      next.push(await convertUrl(value));
      changed += 1;
    } else {
      next.push(value);
    }
  }

  if (changed) doc.set(field, next);
  return changed;
};

const convertNestedArrayField = async (doc, { arrayPath, field }) => {
  const current = doc.get(arrayPath);
  if (!Array.isArray(current)) return 0;

  let changed = 0;
  const next = [];
  for (const item of current) {
    if (item && isLegacyImage(item[field])) {
      next.push({ ...item.toObject?.() || item, [field]: await convertUrl(item[field]) });
      changed += 1;
    } else {
      next.push(item);
    }
  }

  if (changed) doc.set(arrayPath, next);
  return changed;
};

const maybeDeleteOldObjects = async () => {
  if (!APPLY || !DELETE_OLD) return 0;

  let deleted = 0;
  for (const oldUrl of cache.keys()) {
    const key = toS3Key(oldUrl);
    if (!key) continue;
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    }));
    deleted += 1;
  }
  return deleted;
};

const migrateCollection = async ({ name, model, strings = [], arrays = [], nestedArrays = [] }) => {
  const docs = await model.find({});
  let scanned = 0;
  let changedDocs = 0;
  let changedUrls = 0;

  for (const doc of docs) {
    if (LIMIT && scanned >= LIMIT) break;
    scanned += 1;

    let docChanges = 0;
    for (const field of strings) docChanges += await convertStringField(doc, field);
    for (const field of arrays) docChanges += await convertArrayField(doc, field);
    for (const config of nestedArrays) docChanges += await convertNestedArrayField(doc, config);

    if (docChanges) {
      changedDocs += 1;
      changedUrls += docChanges;
      if (APPLY) await doc.save();
    }
  }

  console.log(`${name}: scanned=${scanned}, changedDocs=${changedDocs}, legacyUrls=${changedUrls}`);
  return { scanned, changedDocs, changedUrls };
};

const main = async () => {
  assertEnv();
  console.log(APPLY ? 'Mode: apply changes' : 'Mode: dry run. Re-run with --apply to upload and update MongoDB.');
  if (DELETE_OLD && !APPLY) console.log('--delete-old is ignored in dry-run mode.');

  await mongoose.connect(process.env.MONGO_URL);

  let totalUrls = 0;
  for (const collection of collections) {
    const result = await migrateCollection(collection);
    totalUrls += result.changedUrls;
  }

  const deleted = await maybeDeleteOldObjects();
  await mongoose.disconnect();

  console.log(`Done. uniqueLegacyUrls=${cache.size}, totalReferences=${totalUrls}, deletedOldObjects=${deleted}, failures=${failures.length}`);
  if (failures.length) {
    console.log('Failed URLs:');
    for (const failure of failures) {
      console.log(`- ${failure.url} :: ${failure.message}`);
    }
  }
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
