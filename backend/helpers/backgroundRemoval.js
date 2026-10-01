// helpers/backgroundRemoval.js
//
// Product photos get their background removed by the built-in remover
// (bg-remover/, started by bgRemoverProcess.js). Uploads are stored exactly as before; the cut-out is
// produced afterwards by a small in-process queue and written over the same
// file (so URLs never change), the original kept beside it as
// <name>.original.<ext>. The pixel size is preserved: the service returns the
// upload's own pixels with an alpha channel. Resized copies of the file are
// purged so the next request re-renders them from the cut-out.
//
// Env: BG_REMOVER_URL + BG_REMOVER_KEY (an outside service instead of the built-in one),
// BG_REMOVER_MODEL (default birefnet-general), AUTO_REMOVE_BG (false = pause).
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { keyFromUrl, resolveUploadPath } from './localUploadStorage.js';
import { EMBEDDED_KEY, embeddedAllowed, refreshEmbeddedState, startBgRemover } from './bgRemoverProcess.js';

const EXTERNAL = (process.env.BG_REMOVER_URL || '').replace(/\/+$/, '');
const MODEL = process.env.BG_REMOVER_MODEL || 'birefnet-general';
const RESIZE_WIDTHS = [320, 480, 640, 768, 960, 1280];
const TIMEOUT_MS = Number(process.env.BG_REMOVER_TIMEOUT_MS) || 180000;

export const backgroundRemovalEnabled = () => (!!EXTERNAL || embeddedAllowed()) && process.env.AUTO_REMOVE_BG !== 'false';

/** Where to send photos: the outside service when one is configured, else the built-in one (started on demand). */
async function service() {
  if (EXTERNAL) return { url: EXTERNAL, key: process.env.BG_REMOVER_KEY || '' };
  return { url: await startBgRemover(), key: EMBEDDED_KEY };
}

/** Buffer in → PNG with alpha (same size) from the service. A short outage (restart, deploy) is retried, not failed. */
export async function removeBackground(buffer, { model = MODEL, matting = false, fill = 0.02, filename = 'image' } = {}) {
  if (!backgroundRemovalEnabled()) throw new Error('background removal is switched off');
  const query = `/remove?model=${encodeURIComponent(model)}&matting=${matting ? 1 : 0}&fill=${fill}`;
  const waits = [5000, 15000, 30000, 60000];
  for (let attempt = 0; ; attempt += 1) {
    const form = new FormData();
    form.append('image', new Blob([buffer]), filename);
    let target;
    try { target = await service(); } catch (error) {
      if (attempt >= waits.length) throw error;
      await new Promise((r) => setTimeout(r, waits[attempt]));
      continue;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${target.url}${query}`, { method: 'POST', body: form, headers: target.key ? { 'X-BG-Key': target.key } : {}, signal: controller.signal });
      if (res.ok) return { png: Buffer.from(await res.arrayBuffer()), model: res.headers.get('x-model') || model, ms: Number(res.headers.get('x-elapsed-ms')) || 0 };
      const detail = (await res.text()).slice(0, 200);
      if (![502, 503, 504].includes(res.status) || attempt >= waits.length) throw new Error(`bg-remover ${res.status}: ${detail}`);
    } catch (error) {
      // a refused connection or a dropped socket means the service is (re)starting: wait and try again
      const transient = /fetch failed|ECONNREFUSED|ECONNRESET|socket hang up/i.test(String(error?.cause?.message || error?.message));
      if (!transient || attempt >= waits.length) throw error;
    } finally {
      clearTimeout(timer);
    }
    await new Promise((r) => setTimeout(r, waits[attempt]));
  }
}
/** Windows sometimes refuses to open a file that a scanner or another server is reading; wait and try again. */
async function writeWithRetry(file, data, attempts = 4) {
  for (let i = 0; ; i += 1) {
    try { return await fs.writeFile(file, data); } catch (error) {
      if (i >= attempts - 1) throw error;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

const backupPathFor = (file) => file.replace(/(\.[a-z0-9]+)$/i, '.original$1');

/** Encode the cut-out in the stored file's own format, keeping transparency where the format allows it. */
async function encodeLike(file, png) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return png;
  if (ext === '.webp') return sharp(png).webp({ lossless: true, effort: 6 }).toBuffer(); // the master stays lossless; the resizer makes the lossy display sizes
  return sharp(png).flatten({ background: '#ffffff' }).jpeg({ quality: 88, progressive: true }).toBuffer(); // jpeg has no alpha
}

async function purgeResized(key) {
  const webpKey = key.replace(/\.[a-z0-9]+$/i, '.webp');
  for (const w of RESIZE_WIDTHS) {
    try { await fs.unlink(resolveUploadPath(`.resized/w${w}/${webpKey}`)); } catch { /* not cached */ }
  }
}

/**
 * Cut out one stored upload in place. `outFile` writes the result elsewhere
 * instead (dry runs, tests); without it the file is replaced and the original
 * saved once as <name>.original.<ext>. `pngCopy` also keeps the untouched
 * PNG cut-out at that path. Returns what was done.
 */
export async function cutoutStoredImage(keyOrUrl, { outFile, model, matting, pngCopy } = {}) {
  const key = keyFromUrl(keyOrUrl);
  if (!key) throw new Error(`not an upload key: ${keyOrUrl}`);
  const file = resolveUploadPath(key);
  const original = await fs.readFile(file);
  const { png, ms } = await removeBackground(original, { model, matting, filename: path.basename(file) });
  if (pngCopy) { await fs.mkdir(path.dirname(pngCopy), { recursive: true }); await fs.writeFile(pngCopy, png); }
  const encoded = await encodeLike(outFile || file, png);
  const meta = await sharp(encoded).metadata();
  if (outFile) {
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, encoded);
    return { key, outFile, ms, width: meta.width, height: meta.height, bytes: encoded.length };
  }
  const backup = backupPathFor(file);
  let madeBackup = false;
  try { await fs.access(backup); } catch { await fs.writeFile(backup, original); madeBackup = true; }
  try {
    await writeWithRetry(file, encoded);
  } catch (error) {
    if (madeBackup) await fs.unlink(backup).catch(() => {}); // keep "backup exists" meaning "cut out"
    throw error;
  }
  await purgeResized(key);
  return { key, ms, width: meta.width, height: meta.height, bytes: encoded.length, original: path.basename(backup) };
}

/** Put the original back (undo). */
export async function restoreOriginal(keyOrUrl) {
  const key = keyFromUrl(keyOrUrl);
  const file = resolveUploadPath(key);
  const backup = backupPathFor(file);
  await fs.copyFile(backup, file);
  await purgeResized(key);
  return { key };
}

/** True when the file already went through the cut-out (its original backup exists). */
export async function isCutOut(keyOrUrl) {
  try { await fs.access(backupPathFor(resolveUploadPath(keyFromUrl(keyOrUrl)))); return true; } catch { return false; }
}

// ---- background queue for fresh uploads ----
const queue = [];
let draining = false;
let current = null;
let lastResult = null;
async function drain() {
  if (draining) return;
  draining = true;
  while (queue.length) {
    const key = queue.shift();
    current = key;
    try {
      const r = await cutoutStoredImage(key);
      lastResult = { key, ok: true, ms: r.ms, at: new Date().toISOString() };
      console.log(`bg-remover: ${key} cut out in ${r.ms} ms (${r.width}x${r.height}, ${Math.round(r.bytes / 1024)} KB)`);
    } catch (error) {
      console.error(`bg-remover: ${key} failed: ${error.message}`);
      lastResult = { key, ok: false, error: error.message, at: new Date().toISOString() };
    }
    current = null;
  }
  draining = false;
}
/** Schedule a just-uploaded product photo (key or public URL). Never throws; a disabled service is a no-op. */
export function queueProductCutout(keyOrUrl) {
  if (!backgroundRemovalEnabled()) return false;
  const key = keyFromUrl(keyOrUrl);
  if (!key || !/\.(webp|png|jpe?g)$/i.test(key)) return false;
  queue.push(key);
  setImmediate(drain);
  return true;
}

/** What the admin shows beside the "Remove background" switch. */
export async function backgroundRemovalStatus() {
  const base = { enabled: backgroundRemovalEnabled(), queued: queue.length, processing: current, last: lastResult };
  if (!base.enabled) return { ...base, mode: 'off', status: 'off' };
  if (EXTERNAL) {
    try {
      const res = await fetch(`${EXTERNAL}/health`, { signal: AbortSignal.timeout(2000) });
      const h = res.ok ? await res.json() : null;
      return { ...base, mode: 'external', status: h?.ok ? (h.ready ? 'ready' : 'warming') : 'unreachable', model: h?.model || MODEL };
    } catch { return { ...base, mode: 'external', status: 'unreachable', model: MODEL }; }
  }
  const s = await refreshEmbeddedState();
  return { ...base, mode: 'built-in', status: s.status, detail: s.detail, model: s.model, restarts: s.restarts };
}
