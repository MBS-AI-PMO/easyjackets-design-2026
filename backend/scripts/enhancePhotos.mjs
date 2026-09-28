// scripts/enhancePhotos.mjs
//
// Writes web-ready WebP copies of phone photos (see lib/enhance.mjs for what
// is done to them).
//
//   node scripts/enhancePhotos.mjs <manifest.json> <photoDir> [outDir]
//
// The manifest lists { file, slug, … } entries (for example
// frontend/src/data/embroidery-photos.json); <photoDir>/<file> becomes
// <outDir>/<slug>.webp, outDir defaulting to <photoDir>/optimized.
// Tunables: PHOTO_MAX_EDGE (2000), PHOTO_QUALITY (80).
import fs from 'node:fs/promises';
import path from 'node:path';
import { enhance } from './lib/enhance.mjs';

const [manifestPath, photoDir, outArg] = process.argv.slice(2);
if (!manifestPath || !photoDir) {
  console.error('usage: node scripts/enhancePhotos.mjs <manifest.json> <photoDir> [outDir]');
  process.exit(1);
}
const outDir = outArg || path.join(photoDir, 'optimized');
const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
await fs.mkdir(outDir, { recursive: true });
let total = 0;
for (const entry of manifest) {
  const src = path.join(photoDir, entry.file);
  const dest = path.join(outDir, `${entry.slug}.webp`);
  const before = (await fs.stat(src)).size;
  const { data, info } = await enhance(src);
  await fs.writeFile(dest, data);
  total += data.length;
  console.log(`${entry.file} -> ${path.basename(dest)}  ${info.width}x${info.height}  ${Math.round(before / 1024)} KB -> ${Math.round(data.length / 1024)} KB`);
}
console.log(`${manifest.length} photos written to ${outDir} (${(total / 1048576).toFixed(1)} MB)`);
