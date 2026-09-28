/**
 * Export HBJ product images for Easyjackets MongoDB migration.
 * Intended to run INSIDE the Handmade By JB backend container (/app).
 *
 * On Coolify server:
 *   docker cp export-hbj-product-images.cjs HBJ_CONTAINER:/tmp/export-hbj.cjs
 *   docker exec HBJ_CONTAINER node /tmp/export-hbj.cjs > hbj-product-images.json
 */
const path = require('path');

const appRoot = process.env.HBJ_APP_ROOT || '/app';
process.chdir(appRoot);

require('dotenv').config({ path: path.join(appRoot, '.env') });

const sequelize = require(path.join(appRoot, 'config/database'));
const Product = require(path.join(appRoot, 'models/Product'));

const getImageUrl = (image) => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (typeof image === 'object') return image.url || image.src || '';
  return '';
};

const isLocalUpload = (value = '') => typeof value === 'string' && value.startsWith('/uploads/');

const collectProductImages = (product) => {
  const urls = [];
  const add = (value) => {
    const url = getImageUrl(value);
    if (isLocalUpload(url)) urls.push(url);
  };

  for (const image of product.images || []) add(image);
  for (const variant of product.variants || []) {
    add(variant.mainImage);
    for (const galleryImage of variant.galleryImages || []) add(galleryImage);
    for (const image of variant.images || []) add(image);
  }

  return [...new Set(urls)];
};

const main = async () => {
  const products = await Product.findAll({
    attributes: ['id', 'title', 'slug', 'images', 'variants'],
    order: [['id', 'ASC']],
  });

  const exportData = products
    .map((product) => {
      const plain = product.get({ plain: true });
      const images = collectProductImages(plain);
      if (!images.length) return null;
      return {
        hbjProductId: plain.id,
        title: plain.title,
        slug: plain.slug || '',
        images,
      };
    })
    .filter(Boolean);

  process.stdout.write(`${JSON.stringify(exportData, null, 2)}\n`);
};

main()
  .catch((error) => {
    console.error('Export failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
