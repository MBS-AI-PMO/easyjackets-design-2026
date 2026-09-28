// helpers/designImages.js
//
// The customiser renders each jacket view to a WebP data URI (canvas
// toDataURL with encoderType 'image/webp'). That format cannot be used as-is
// in either delivery channel:
//
//   * PhantomJS 2.1.1 is Qt WebKit from 2015 and has no WebP decoder, so the
//     PDF drew four empty boxes.
//   * Gmail, Outlook and Yahoo strip `data:` URIs out of <img> tags entirely,
//     so even a PNG data URI would not appear in the email body.
//
// So the buffers are decoded once, re-encoded as PNG, and handed to each
// channel in the form it can actually render: a data URI for the PDF, and a
// cid: reference backed by an inline attachment for the email.

import sharp from 'sharp';

// Every view is letterboxed onto the same square canvas. The front and back
// renders are wide, the side renders are roughly twice as tall — left to their
// own aspect ratios, the second row of the preview grid outgrew the page and
// split across it, leaving two empty card frames behind. A common box keeps the
// 2x2 grid even and its height predictable. Big enough to stay crisp on A4,
// small enough that four of them do not push the render past its timeout.
const BOX = 600;

export const VIEWS = [
  { key: 'custom_image', label: 'Front', cid: 'jacket-front' },
  { key: 'custom_image_back', label: 'Back', cid: 'jacket-back' },
  { key: 'custom_image_left', label: 'Left', cid: 'jacket-left' },
  { key: 'custom_image_right', label: 'Right', cid: 'jacket-right' },
];

const parseDataUri = (value) => {
  const match = /^data:([^;,]+);base64,(.+)$/i.exec(String(value || '').trim());
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
};

/**
 * Decode one view to PNG. Returns null rather than throwing: a single bad
 * preview should cost that one image, not the whole email.
 */
const toPng = async (value, label) => {
  const parsed = parseDataUri(value);
  if (!parsed) return null;

  try {
    return await sharp(parsed.buffer)
      .resize({ width: BOX, height: BOX, fit: 'contain', background: '#ffffff' })
      .flatten({ background: '#ffffff' })
      .png({ compressionLevel: 9 })
      .toBuffer();
  } catch (error) {
    console.error(`Could not convert the ${label} jacket view to PNG:`, error.message);
    return null;
  }
};

/**
 * Build the preview set for a shared design.
 *
 * @returns {Promise<Array<{label: string, cid: string, dataUri: string, buffer: Buffer}>>}
 */
export const prepareDesignImages = async (data = {}) => {
  const prepared = await Promise.all(
    VIEWS.map(async ({ key, label, cid }) => {
      const buffer = await toPng(data[key], label);
      if (!buffer) return null;
      return { label, cid, buffer, dataUri: `data:image/png;base64,${buffer.toString('base64')}` };
    })
  );

  return prepared.filter(Boolean);
};
