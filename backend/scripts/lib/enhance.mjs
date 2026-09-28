// scripts/lib/enhance.mjs — one photo pipeline shared by enhancePhotos.mjs and
// uploadToLiveStorage.mjs.
//
// Phone / WhatsApp photos become web-ready pictures: EXIF orientation is
// applied and then dropped with the rest of the metadata, levels are
// normalised, colour is lifted a touch, the picture is upscaled (Lanczos, at
// most 2x and at most PHOTO_MAX_EDGE on the long edge) and re-sharpened.
// `format: 'webp'` gives the optimised delivery file; `format: 'png'` gives a
// lossless master for a server that encodes uploads itself.
import sharp from 'sharp';

// 1600 px is the live server's own ceiling for uploads (WEBP_MAX_EDGE), so
// the pixels we sharpen are the pixels that get served.
export const MAX_EDGE = parseInt(process.env.PHOTO_MAX_EDGE, 10) || 1600;
export const QUALITY = parseInt(process.env.PHOTO_QUALITY, 10) || 80;

export async function enhance(input, { format = 'webp' } = {}) {
  const image = sharp(input, { failOn: 'none' }).rotate();
  const { width, height } = await image.metadata();
  const scale = Math.min(2, MAX_EDGE / Math.max(width, height));
  const out = image
    .normalise({ lower: 1, upper: 99 })
    .modulate({ brightness: 1.02, saturation: 1.1 })
    .resize(Math.round(width * scale), Math.round(height * scale), { kernel: 'lanczos3' })
    .sharpen({ sigma: 1.0, m1: 0.8, m2: 2.0 });
  return (format === 'png' ? out.png({ compressionLevel: 6 }) : out.webp({ quality: QUALITY, effort: 6, smartSubsample: true }))
    .toBuffer({ resolveWithObject: true });
}
