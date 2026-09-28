/**
 * Download HBJ images over HTTPS into Easyjackets /app/uploads.
 * Works across DIFFERENT Coolify servers (no docker cp between servers needed).
 *
 * Run inside Easyjackets API container:
 *   docker cp hbj-product-images.json EJ_CONTAINER:/tmp/hbj-product-images.json
 *   docker cp download-hbj-images-from-urls.mjs EJ_CONTAINER:/tmp/download.mjs
 *   docker exec EJ_CONTAINER node /tmp/download.mjs --input /tmp/hbj-product-images.json --apply
 *
 * Or on your PC (then copy /app/uploads to Easyjackets server):
 *   set UPLOADS_DIR=./staging-uploads
 *   node download-hbj-images-from-urls.mjs --input hbj-product-images.json --apply
 */
import fs from 'fs/promises';
import path from 'path';

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const inputArgIndex = args.findIndex((arg) => arg === '--input');
const inputPath = inputArgIndex >= 0 ? args[inputArgIndex + 1] : 'hbj-product-images.json';

const UPLOADS_ROOT = path.resolve(
  process.env.UPLOADS_DIR ||
  process.env.APP_UPLOADS_DIR ||
  '/app/uploads'
);
const hbjBase = (process.env.HBJ_PUBLIC_URL || 'https://api.handmadebyjb.com').replace(/\/+$/, '');

const resolveUploadPath = (key) => {
  const normalized = String(key).replace(/\\/g, '/').replace(/^\/+/, '').replace(/^uploads\//i, '');
  const resolved = path.resolve(UPLOADS_ROOT, normalized);
  if (!resolved.startsWith(`${UPLOADS_ROOT}${path.sep}`) && resolved !== UPLOADS_ROOT) {
    throw new Error(`Invalid path: ${key}`);
  }
  return resolved;
};

const toRelativeKey = (uploadPath = '') => {
  const value = String(uploadPath).trim();
  if (!value.startsWith('/uploads/')) return null;
  return value.replace(/^\/uploads\//, '');
};

const collectUniquePaths = (entries) => {
  const paths = new Set();
  for (const entry of entries) {
    for (const image of entry.images || []) {
      const key = toRelativeKey(image);
      if (key) paths.add(key);
    }
  }
  return [...paths];
};

const downloadFile = async (relativeKey) => {
  const sourceUrl = `${hbjBase}/uploads/${relativeKey.split('/').map(encodeURIComponent).join('/')}`;
  const targetPath = resolveUploadPath(relativeKey);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  const response = await fetch(sourceUrl, {
    headers: { Accept: 'image/*', 'User-Agent': 'Easyjackets-HBJ-Migration/1.0' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${sourceUrl}`);

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(targetPath, buffer);
  return buffer.length;
};

const main = async () => {
  await fs.mkdir(UPLOADS_ROOT, { recursive: true });

  const raw = await fs.readFile(inputPath, 'utf8');
  const entries = JSON.parse(raw);
  const paths = collectUniquePaths(entries);

  console.log(`HBJ source: ${hbjBase}`);
  console.log(`Target:     ${UPLOADS_ROOT}`);
  console.log(`Files:      ${paths.length}`);
  console.log(`Mode:       ${shouldApply ? 'DOWNLOAD' : 'DRY RUN'}\n`);

  let ok = 0;
  let failed = 0;

  for (const relativeKey of paths) {
    if (!shouldApply) {
      console.log(`Would download: ${hbjBase}/uploads/${relativeKey}`);
      ok += 1;
      continue;
    }
    try {
      const bytes = await downloadFile(relativeKey);
      ok += 1;
      console.log(`OK ${relativeKey} (${bytes} bytes)`);
    } catch (error) {
      failed += 1;
      console.warn(`FAIL ${relativeKey}: ${error.message}`);
    }
  }

  console.log(`\nDone. ok=${ok}, failed=${failed}`);
  if (!shouldApply) console.log('Add --apply to download.');
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
