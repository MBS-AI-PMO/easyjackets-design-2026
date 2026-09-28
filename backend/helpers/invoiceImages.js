// helpers/invoiceImages.js
//
// Makes the product thumbnails in an order email actually appear.
//
// The invoice template pointed each <img> straight at the stored URL, which
// fails two different ways depending on who opens it:
//
//   * Remote images are blocked by default in most clients — Outlook, Roundcube
//     and the webmail Hostinger serves among them. Gmail is the exception: it
//     fetches through its own proxy, which is why the same email looked fine in
//     one inbox and broken in another.
//   * Uploads are stored as WebP. Outlook and several webmail clients have no
//     WebP decoder at all, so even an allowed image draws nothing.
//
// Both go away if the picture travels with the message as an inline attachment
// in a format every client can read. Each thumbnail is fetched once, re-encoded
// as PNG, and referenced by cid: — the same approach designImages.js already
// uses for the shared-design email.
//
// Nothing here is allowed to cost an email. Every failure falls back to the
// original URL, which is no worse than before.

import sharp from 'sharp';

const FETCH_TIMEOUT_MS = 8000;

// Rendered at 72px in the template, so 200 covers high-DPI without making the
// message heavy. Four items at this size add well under 100 KB.
const THUMB_PX = 200;

const fetchImage = async (url) => {
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
 * Swaps every remote cart thumbnail for an inline attachment.
 *
 * @param {object} data  the template payload; only `cartData` is touched
 * @returns {Promise<{ data: object, attachments: Array }>} the payload to render
 *          with, and the attachments to add to the message
 */
export const inlineCartImages = async (data) => {
  const items = Array.isArray(data?.cartData) ? data.cartData : [];
  if (!items.length) return { data, attachments: [] };

  const attachments = [];

  const cartData = await Promise.all(items.map(async (item, index) => {
    const source = typeof item?.frontImage === 'string' ? item.frontImage.trim() : '';
    if (!/^https?:\/\//i.test(source)) return item;

    try {
      const raw = await fetchImage(source);
      if (!raw) return item;

      const png = await toPng(raw);
      const cid = `cart-item-${index}`;
      attachments.push({ filename: `item-${index + 1}.png`, content: png, cid });

      return { ...item, frontImage: `cid:${cid}` };
    } catch (error) {
      console.warn(`Invoice image could not be inlined (${source}):`, error.message);
      return item;
    }
  }));

  return { data: { ...data, cartData }, attachments };
};
