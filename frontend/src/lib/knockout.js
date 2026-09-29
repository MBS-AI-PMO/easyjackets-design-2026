// Jackets rendered in the design lab (custom-jacket/) were saved on a white ground. This clears
// that ground in the browser so the jacket sits on the page colour like the catalogue cut-outs:
// a flood fill from the image's edges through near-white pixels, so only the white AROUND the
// jacket goes; white panels inside its outline (white sleeves, stripes) stay white. The rim is
// softened so no white halo is left. Renders saved without a ground come back unchanged.
import { useEffect, useState } from 'react';

const LIGHT = 236; // a channel at or above this counts as the white ground
const cache = new Map(); // url -> Promise<url of the cleared image, or the original on failure>
const done = new Map(); // url -> resolved url (so a remount shows it at once)

async function clear(url) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  if (!w || !h) return url;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const frame = ctx.getImageData(0, 0, w, h);
  const px = frame.data;
  const light = (i) => px[i * 4 + 3] > 0 && px[i * 4] >= LIGHT && px[i * 4 + 1] >= LIGHT && px[i * 4 + 2] >= LIGHT;

  const cleared = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let top = 0;
  const seed = (i) => { if (!cleared[i] && light(i)) { cleared[i] = 1; stack[top++] = i; } };
  for (let x = 0; x < w; x += 1) { seed(x); seed((h - 1) * w + x); }
  for (let y = 0; y < h; y += 1) { seed(y * w); seed(y * w + w - 1); }
  if (!top) return url; // no white ground (already transparent, or a photo)
  while (top) {
    const i = stack[--top];
    const x = i % w;
    if (x > 0) seed(i - 1);
    if (x < w - 1) seed(i + 1);
    if (i >= w) seed(i - w);
    if (i < w * (h - 1)) seed(i + w);
  }
  for (let i = 0; i < w * h; i += 1) {
    if (cleared[i]) { px[i * 4 + 3] = 0; continue; }
    // the anti-aliased rim next to the cleared ground: keep only how dark it is
    const x = i % w;
    const edge = (x > 0 && cleared[i - 1]) || (x < w - 1 && cleared[i + 1]) || (i >= w && cleared[i - w]) || (i < w * (h - 1) && cleared[i + w]);
    if (edge) {
      const m = Math.min(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
      if (m > 150) px[i * 4 + 3] = Math.round(px[i * 4 + 3] * Math.min(1, (255 - m) / 105));
    }
  }
  ctx.putImageData(frame, 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return blob ? URL.createObjectURL(blob) : url;
}

export function knockoutWhite(url) {
  if (!url) return Promise.resolve('');
  if (!cache.has(url)) {
    cache.set(url, clear(url).catch(() => url).then((out) => { done.set(url, out); return out; }));
  }
  return cache.get(url);
}

/** The cleared image for `url`: '' for none, null while it is being prepared. */
export function useKnockout(url) {
  const [out, setOut] = useState(() => (url ? done.get(url) ?? null : ''));
  useEffect(() => {
    if (!url) { setOut(''); return undefined; }
    let alive = true;
    setOut(done.get(url) ?? null);
    knockoutWhite(url).then((u) => { if (alive) setOut(u); });
    return () => { alive = false; };
  }, [url]);
  return out;
}
