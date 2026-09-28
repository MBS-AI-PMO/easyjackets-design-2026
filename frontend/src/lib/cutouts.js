// Which product photos have had their background removed. The API reads it
// from the file store (a cut-out keeps its original beside it), so nothing in
// the database changes. The set refreshes every minute while a page is open,
// so photos processed since then lose their white box too.
import { useEffect, useState } from 'react';
import { api } from './api';

const REFRESH_MS = 60000;
const KEY_IN_SRC = new RegExp('/uploads/([^?#]+)');
let keys = new Set();
let versions = {};
let loadedAt = 0;
let inflight = null;
let timer = null;
const listeners = new Set();

/** The upload key inside any of our image URLs (live or local, sized or not). */
export function keyOf(src) {
  const m = KEY_IN_SRC.exec(String(src || ''));
  return m ? decodeURIComponent(m[1]) : null;
}

export function isCutout(src) {
  const key = keyOf(src);
  return !!key && keys.has(key);
}

/** The cut-out's file version (its modification time), or 0 when the photo is not a cut-out. */
export function cutoutVersion(src) {
  const key = keyOf(src);
  return key ? versions[key] || 0 : 0;
}

/** Adds the version to an image URL so browsers holding the old photo (uploads are cached immutable) fetch the new file. */
export function withVersion(url, version) {
  if (!url || !version) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${version}`;
}

export function loadCutouts(force = false) {
  if (inflight) return inflight;
  if (!force && Date.now() - loadedAt < REFRESH_MS) return Promise.resolve(keys);
  inflight = api.get('/product/cutouts', { auth: false })
    .then((r) => {
      const next = new Set(r.keys || []);
      const nextVersions = r.versions || {};
      const changed = next.size !== keys.size || [...next].some((k) => !keys.has(k) || nextVersions[k] !== versions[k]);
      keys = next;
      versions = nextVersions;
      loadedAt = Date.now();
      if (changed) listeners.forEach((fn) => fn());
      return keys;
    })
    .catch(() => keys)
    .finally(() => { inflight = null; });
  return inflight;
}

/** Re-renders the caller whenever the set of cut-out photos changes; returns `isCutout`. */
export function useCutouts() {
  const [, tick] = useState(0);
  useEffect(() => {
    const fn = () => tick((n) => n + 1);
    listeners.add(fn);
    loadCutouts();
    if (!timer) timer = setInterval(() => loadCutouts(), REFRESH_MS);
    return () => {
      listeners.delete(fn);
      if (!listeners.size && timer) { clearInterval(timer); timer = null; }
    };
  }, []);
  return isCutout;
}
