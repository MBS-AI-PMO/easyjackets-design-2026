// helpers/invoiceImages.js
//
// Makes the product thumbnails in an order email actually appear.
//
// The invoice template pointed each <img> straight at the stored URL, which
// fails several ways depending on who opens it:
//
//   * Remote images are blocked by default in most clients — Outlook, Roundcube
//     and the webmail Hostinger serves among them. Gmail is the exception: it
//     fetches through its own proxy, which is why the same email looked fine in
//     one inbox and broken in another.
//   * Uploads are stored as WebP. Outlook and several webmail clients have no
//     WebP decoder at all, so even an allowed image draws nothing.
//   * Our uploads are stored under the API's planned domain
//     (https://api2.easyjackets.com/uploads/...), which is not live yet, and a
//     developer's computer is not reachable at all: Gmail showed a broken image.
//
// All of it goes away if the picture travels with the message as an inline
// attachment in a format every client can read. Our own uploads are read from
// this backend's disk; anything else is fetched. Each picture is re-encoded as
// PNG and referenced by cid: — the same approach designImages.js already uses
// for the shared-design email.
//
// Nothing here is allowed to cost an email. Every failure falls back to the
// original URL, which is no worse than before.

import fs from 'node:fs/promises';
import sharp from 'sharp';
import { keyFromUrl, resolveUploadPath } from './localUploadStorage.js';

const FETCH_TIMEOUT_MS = 8000;

// Rendered at up to 150px in the template, so 320 covers high-DPI without making
// the message heavy.
const THUMB_PX = 320;

// an upload of this backend: /uploads/..., or any easyjackets.com host's /uploads/...
const OUR_UPLOAD = /^(https?:\/\/[^/]*easyjackets\.com)?\/uploads\//i;

export const readOwnUpload = async (url) => {
  const base = (process.env.UPLOADS_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
  if (!OUR_UPLOAD.test(url) && !(base && url.startsWith(`${base}/`))) return null;
  try {
    const buffer = await fs.readFile(resolveUploadPath(keyFromUrl(url)));
    return buffer.length ? buffer : null;
  } catch {
    return null;
  }
};

const fetchImage = async (url) => {
  const local = await readOwnUpload(url);
  if (local) return local;
  if (!/^https?:\/\//i.test(url)) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    if (!(response.headers.get('content-type') || '').startsWith('image/')) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length ? buffer : null;
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const toPng = async (buffer) => sharp(buffer)
  .resize({ width: THUMB_PX, height: THUMB_PX, fit: 'inside', withoutEnlargement: true })
  .flatten({ background: '#ffffff' })  // PNG keeps alpha, but a white plate matches the email
  .png({ compressionLevel: 9 })
  .toBuffer();

/**
 * Swaps every cart picture (the front of each line, and the back view of a jacket
 * designed in the builder) for an inline attachment.
 *
 * @param {object} data  the template payload; only `cartData` is touched
 * @returns {Promise<{ data: object, attachments: Array }>} the payload to render
 *          with, and the attachments to add to the message
 */
export const inlineCartImages = async (data) => {
  const items = Array.isArray(data?.cartData) ? data.cartData : [];
  if (!items.length) return { data, attachments: [] };

  const attachments = [];
  const inline = async (item, field, cid, filename) => {
    const source = typeof item?.[field] === 'string' ? item[field].trim() : '';
    if (!source || source.startsWith('cid:')) return source;
    try {
      const raw = await fetchImage(source);
      if (!raw) return source;
      attachments.push({ filename, content: await toPng(raw), cid });
      return `cid:${cid}`;
    } catch (error) {
      console.warn(`Invoice image could not be inlined (${source}):`, error.message);
      return source;
    }
  };

  const cartData = await Promise.all(items.map(async (item, index) => {
    const next = { ...item, frontImage: await inline(item, 'frontImage', `cart-item-${index}`, `item-${index + 1}.png`) };
    if (item?.backImage) next.backImage = await inline(item, 'backImage', `cart-item-${index}-back`, `item-${index + 1}-back.png`);
    return next;
  }));

  return { data: { ...data, cartData }, attachments };
};
