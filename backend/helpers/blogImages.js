// helpers/blogImages.js
//
// Keeps image data out of the blogs collection.
//
// The article editor used to insert pasted and uploaded images as data: URLs —
// the whole image, base64-encoded, inline in the HTML. One post with three
// photos in it reached 8 MB that way, and because the list endpoints carried
// every post's body, the home page, the blog index, every post's sidebar and
// the admin table were each downloading it before they could draw a card.
//
// Images belong in storage under uploads/blog/, and only their URL belongs in
// the document. The editor now uploads as it goes, but this also runs on every
// save — the HTML source view, a paste from another site, an older admin build
// can all still hand us a data: URL, and none of them may reach the database.

import uploadToS3, { getPublicFileUrl } from './fileUpload.js';

export const BLOG_IMAGE_FOLDER = 'blog';

// src="data:image/png;base64,....". Whitespace inside the payload is tolerated
// because some editors wrap long attribute values.
const INLINE_IMAGE = /src=(["'])data:(image\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)\1/gi;

const EXTENSION = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

export const hasInlineImages = (html = '') => /src=["']data:image\//i.test(String(html || ''));

export const countInlineImages = (html = '') =>
  (String(html || '').match(/src=["']data:image\//gi) || []).length;

/**
 * Absolute public URL for a stored blog image.
 *
 * With a request in hand the helper reads the host from it. Without one — the
 * migration script — it falls back to the same base the blog cover images are
 * saved with, which the Dockerfile points at the API's public /uploads/. A
 * relative URL would be useless here: the storefront is a different origin.
 */
export const blogImageUrl = (key, req) => {
  const url = getPublicFileUrl(key, req);
  if (/^https?:\/\//i.test(url)) return url;

  const base = String(process.env.AWS_FILE_PATH || process.env.UPLOADS_PUBLIC_BASE_URL || '')
    .replace(/\/+$/, '');
  return base ? `${base}/${String(key).replace(/^\/+/, '')}` : url;
};

/**
 * Replaces every inline image in `html` with the URL of the same image in
 * storage. The upload pipeline converts to WebP and caps the long edge, so the
 * stored copy is usually a fraction of what was pasted.
 *
 * Returns { html, moved, urls }. Uploads happen first, all of them; the HTML
 * is only rewritten once every image has a URL, so a failure part-way leaves
 * the original untouched rather than half-converted.
 *
 * @param {string} html
 * @param {import('express').Request} [req]   for the public host
 * @param {{ namePrefix?: string }} [options]  stem for the stored filenames
 */
export const moveInlineImagesToStorage = async (html = '', req, { namePrefix = 'image' } = {}) => {
  const source = String(html || '');
  if (!hasInlineImages(source)) return { html: source, moved: 0, urls: [] };

  const matches = [...source.matchAll(INLINE_IMAGE)];
  const urls = [];

  for (const [, , mimetype, base64] of matches) {
    const buffer = Buffer.from(base64.replace(/\s+/g, ''), 'base64');
    if (!buffer.length) {
      urls.push(null);
      continue;
    }

    const extension = EXTENSION[mimetype.toLowerCase()] || 'png';
    const key = await uploadToS3(
      { originalFilename: `${namePrefix}-${urls.length + 1}.${extension}`, mimetype },
      null,
      buffer,
      { folder: BLOG_IMAGE_FOLDER }
    );
    urls.push(blogImageUrl(key, req));
  }

  let index = 0;
  const output = source.replace(INLINE_IMAGE, (full, quote) => {
    const url = urls[index++];
    return url ? `src=${quote}${url}${quote}` : full;
  });

  return { html: output, moved: urls.filter(Boolean).length, urls: urls.filter(Boolean) };
};
