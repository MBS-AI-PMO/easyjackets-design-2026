// helpers/uploadMirror.js
//
// The catalogue's image URLs point at the live site's uploads. This backend
// serves the same paths under its own /uploads: the first request for a file
// that is not on disk fetches it once from LEGACY_UPLOADS_URL and keeps it,
// so afterwards it is served (and resized, see imageResize.js) locally.
// Without LEGACY_UPLOADS_URL the middleware does nothing.
import fs from 'fs/promises';
import path from 'path';
import { resolveUploadPath } from './localUploadStorage.js';

const LEGACY = (process.env.LEGACY_UPLOADS_URL || '').replace(/\/+$/, '');
const FETCH_TIMEOUT_MS = 20000;
const inflight = new Map(); // key -> promise, so a burst of requests fetches once

const exists = (file) => fs.access(file).then(() => true, () => false);

async function mirror(key, target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = `${LEGACY}/${key.split('/').map(encodeURIComponent).join('/')}`;
    const response = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'easyjackets-2026-mirror' } });
    if (!response.ok) throw new Error(`upstream ${response.status}`);
    if (!(response.headers.get('content-type') || '').startsWith('image/')) throw new Error('upstream is not an image');
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.mkdir(path.dirname(target), { recursive: true });
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, buffer);
    await fs.rename(tmp, target);
  } finally {
    clearTimeout(timer);
  }
}

export const uploadMirror = async (req, res, next) => {
  if (!LEGACY || (req.method !== 'GET' && req.method !== 'HEAD')) return next();
  let key;
  try {
    key = decodeURIComponent(req.path).replace(/^\/+/, '');
  } catch {
    return next();
  }
  if (!key || key.startsWith('.resized/') || key.includes('..') || !/\.(webp|jpe?g|jfif|png|gif|svg|avif|bmp)$/i.test(key)) return next();
  let target;
  try {
    target = resolveUploadPath(key);
  } catch {
    return next();
  }
  if (await exists(target)) return next();
  if (!inflight.has(key)) {
    inflight.set(key, mirror(key, target).finally(() => inflight.delete(key)));
  }
  try {
    await inflight.get(key);
  } catch (error) {
    // Nothing to serve; the static handler answers 404.
    if (process.env.DEV_MODE === 'development') console.warn(`uploadMirror: ${key}: ${error.message}`);
  }
  return next();
};
