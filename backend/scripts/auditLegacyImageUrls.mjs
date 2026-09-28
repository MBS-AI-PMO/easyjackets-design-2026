import dotenv from 'dotenv';
import mongoose from 'mongoose';

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

const LEGACY_IMAGE_RE = /\.(png|jpe?g)(?:[?#].*)?$/i;

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

const isLegacyImage = (value) => typeof value === 'string' && LEGACY_IMAGE_RE.test(value);

const countCollection = async ({ name, model, strings = [], arrays = [], nestedArrays = [] }) => {
  const docs = await model.find({}).lean();
  let docsWithLegacy = 0;
  let legacyUrls = 0;
  const sample = [];

  for (const doc of docs) {
    let docLegacy = 0;

    for (const field of strings) {
      if (isLegacyImage(doc[field])) {
        docLegacy += 1;
        sample.push(doc[field]);
      }
    }

    for (const field of arrays) {
      if (!Array.isArray(doc[field])) continue;
      for (const value of doc[field]) {
        if (isLegacyImage(value)) {
          docLegacy += 1;
          sample.push(value);
        }
      }
    }

    for (const { arrayPath, field } of nestedArrays) {
      if (!Array.isArray(doc[arrayPath])) continue;
      for (const item of doc[arrayPath]) {
        if (isLegacyImage(item?.[field])) {
          docLegacy += 1;
          sample.push(item[field]);
        }
      }
    }

    if (docLegacy) docsWithLegacy += 1;
    legacyUrls += docLegacy;
  }

  console.log(`${name}: scanned=${docs.length}, changedDocs=${docsWithLegacy}, legacyUrls=${legacyUrls}`);
  return { legacyUrls, sample };
};

const main = async () => {
  if (!process.env.MONGO_URL) throw new Error('MONGO_URL is required');

  await mongoose.connect(process.env.MONGO_URL);
  let total = 0;
  const samples = [];

  for (const collection of collections) {
    const result = await countCollection(collection);
    total += result.legacyUrls;
    samples.push(...result.sample);
  }

  await mongoose.disconnect();

  const unique = [...new Set(samples)];
  console.log(`Done. uniqueLegacyUrls=${unique.length}, totalReferences=${total}`);
  if (unique.length) {
    console.log('Remaining legacy URL samples:');
    for (const url of unique.slice(0, 50)) {
      console.log(`- ${url}`);
    }
  }
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
