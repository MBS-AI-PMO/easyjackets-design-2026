// helpers/designPreviews.js
//
// Rebuilds a saved design's preview images from the snapshot it carries.
//
// Every design document stores two copies of the same four pictures: the
// base64 snapshots the customiser produced, under jackets[0].front/back/
// left/right, and the URLs of those pictures in storage, under custom_image*.
// Only the URLs are ever rendered.
//
// Designs saved before the move to Coolify storage have those URLs pointing at
// an S3 bucket that no longer exists, so the storefront's design page, the
// admin order screen and the order PDF all draw blank tiles for them. The
// snapshots are still intact, which is what makes the repair possible: upload
// the snapshot, then point the URL at the copy that is actually there.
//
// Not to be confused with designImages.js, which turns the same four fields
// into PNGs for the share email and its PDF.

import uploadToS3, { getPublicFileUrl } from './fileUpload.js';

export const DESIGN_IMAGE_FOLDER = 'design';

// custom_image field  ->  the jackets[0] key holding the same view
export const DESIGN_VIEWS = {
  custom_image: 'front',
  custom_image_back: 'back',
  custom_image_left: 'left',
  custom_image_right: 'right',
};

const DATA_URI = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i;

const EXTENSION = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/**
 * The base every working preview URL sits under, e.g.
 * https://api.easyjackets.com/uploads. Anything stored outside it — the dead
 * S3 bucket, an empty field, a bare key — cannot be served and needs rebuilding.
 */
export const publicUploadsBase = () => String(
  process.env.UPLOADS_PUBLIC_BASE_URL || process.env.AWS_FILE_PATH || ''
).replace(/\/+$/, '');

export const isServableUrl = (value) => {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) return false;
  const base = publicUploadsBase();
  if (!base) return /^https?:\/\//i.test(url);
  return url.startsWith(`${base}/`);
};

export const isSnapshot = (value) => DATA_URI.test(String(value || '').trim());

/** Absolute public URL for a stored key, with the same fallback blog images use. */
export const designPreviewUrl = (key, req) => {
  const url = getPublicFileUrl(key, req);
  if (/^https?:\/\//i.test(url)) return url;
  const base = publicUploadsBase();
  return base ? `${base}/${String(key).replace(/^\/+/, '')}` : url;
};

/**
 * Writes one base64 snapshot to storage and returns its public URL.
 *
 * The name carries the design id and the view, so the four files of a design
 * can never collide with each other the way a bare timestamp can.
 *
 * @param {string} snapshot   a data:image/...;base64,... string
 * @param {{ name: string }} options
 * @param {import('express').Request} [req]
 */
export const uploadDesignSnapshot = async (snapshot, { name }, req) => {
  const match = DATA_URI.exec(String(snapshot || '').trim());
  if (!match) throw new Error('not a base64 image');

  const [, mimetype, payload] = match;
  const buffer = Buffer.from(payload.replace(/\s+/g, ''), 'base64');
  if (!buffer.length) throw new Error('snapshot decoded to nothing');

  const extension = EXTENSION[mimetype.toLowerCase()] || 'png';
  const key = await uploadToS3(
    { originalFilename: `${name}.${extension}`, mimetype },
    null,
    buffer,
    { folder: DESIGN_IMAGE_FOLDER },
  );

  return designPreviewUrl(key, req);
};

/**
 * Which of a design's four preview URLs are unusable and can be rebuilt.
 *
 * Returns { repairable, unservable, missingSnapshot } where `repairable` maps
 * each broken field to the snapshot it can be rebuilt from.
 */
export const planDesignRepair = (design = {}) => {
  const jacket = Array.isArray(design.jackets) ? design.jackets[0] : null;
  const repairable = {};
  const unservable = [];
  const missingSnapshot = [];

  for (const [field, view] of Object.entries(DESIGN_VIEWS)) {
    if (isServableUrl(design[field])) continue;
    unservable.push(field);

    const snapshot = jacket?.[view];
    if (isSnapshot(snapshot)) repairable[field] = snapshot;
    else missingSnapshot.push(field);
  }

  return { repairable, unservable, missingSnapshot };
};
