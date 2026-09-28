// helpers/imageResize.js
//
// Serves a narrower copy of any stored image on demand:
//
//   /uploads/blog/cover.webp?w=640
//
// Covers are stored at up to 1600px, which is what a desktop hero needs. A
// phone showing the same cover at 650px was downloading the whole thing —
// PageSpeed measured 488 KB of that on the blog index alone, and on a throttled
// connection that is seconds off the largest contentful paint. The storefront
// now asks for the width it needs with srcset, and this answers.
//
// Each width is rendered once with sharp and kept beside the original under
// uploads/.resized/w<width>/…, so the cost is paid on the first request only.
// Widths are snapped to a short list, so a stray value cannot fill the disk
// with one-off sizes. Anything that is not an image, has no `w`, or cannot be
// read falls through to express.static exactly as before.

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { resolveUploadPath } from './localUploadStorage.js';

export const RESIZE_WIDTHS = [320, 480, 640, 768, 960, 1280];
const IMAGE_FILE = /\.(webp|jpe?g|png)$/i;
const RESIZED_DIR = '.resized';
const ONE_YEAR = 'public, max-age=31536000, immutable';

const snapWidth = (wanted) => RESIZE_WIDTHS.find((w) => w >= wanted) || RESIZE_WIDTHS[RESIZE_WIDTHS.length - 1];

const exists = (file) => fs.access(file).then(() => true, () => false);

export const resizedImageHandler = async (req, res, next) => {
  const wanted = Number(req.query.w);
  if (!Number.isFinite(wanted) || wanted <= 0) return next();

  let key;
  try {
    key = decodeURIComponent(req.path).replace(/^\/+/, '');
  } catch {
    return next();
  }
  if (!IMAGE_FILE.test(key) || key.startsWith(`${RESIZED_DIR}/`)) return next();

  const width = snapWidth(wanted);
  let source;
  let target;
  try {
    source = resolveUploadPath(key);
    target = resolveUploadPath(`${RESIZED_DIR}/w${width}/${key.replace(IMAGE_FILE, '.webp')}`);
  } catch {
    return next();
  }

  if (!(await exists(target))) {
    if (!(await exists(source))) return next();
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      // Written to a temp name and renamed, so a request arriving mid-render
      // never reads a half-written file.
      const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4, smartSubsample: true }) // colour edges (red on white) keep their detail
        .toFile(tmp);
      await fs.rename(tmp, target);
    } catch (error) {
      console.error(`imageResize: could not render ${key} at ${width}px:`, error.message);
      return next();
    }
  }

  res.set('Cache-Control', ONE_YEAR);
  res.type('image/webp');
  res.sendFile(target);
};
