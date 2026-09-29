// Site identity from the admin (Settings → Site Identity & Logos, route /global-settings):
// the tab icon for light and dark browsers, the navbar logo and the footer logo with their
// sizes. The admin panel uses the same favicons.
//
// The navbar logo shows with the very first paint: the last one this browser saw is kept
// here as a small inline image (data: URL, fetched at navbar size from the API's resizer),
// so no request is needed. A first-ever visit shows the bundled copy (/logo-navbar.webp,
// preloaded in index.html) until the admin's logo has downloaded. Settings refresh with
// the site's live data (tab focus, every minute).
import { useEffect, useState } from 'react';
import { api, imageUrl, uploadUrl } from './api';
import { onRevalidate } from './useAsync';

const KEY = 'ej-identity';
export const FALLBACK_NAV_LOGO = '/logo-navbar.webp';
export const FALLBACK_FOOTER_LOGO = '/logo-navbar.webp';
const NAV_LOGO_WIDTH = 320; // the resizer's smallest size: 2x+ the navbar's display width
const DEFAULTS = { favicon: '', faviconDark: '', navbarLogo: '', navbarLogoHeight: 72, footerLogo: '', footerLogoHeight: 64, navSrc: '', navFor: '' };

const read = () => {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; }
};
const write = (value) => {
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* storage full or blocked: works without it */ }
};

let current = read();
const listeners = new Set();
const publish = (next) => { current = next; write(next); listeners.forEach((fn) => fn(next)); };

/** Tab icon: `favicon` for light browsers, `faviconDark` for dark ones (else the light one). */
export function applyFavicons({ favicon, faviconDark } = current) {
  const light = favicon ? uploadUrl(favicon) : '';
  const dark = faviconDark ? uploadUrl(faviconDark) : light;
  if (!light && !dark) return;
  document.querySelectorAll("link[rel*='icon']").forEach((link) => link.remove());
  const add = (href, media) => {
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = href;
    if (media) link.media = media;
    document.head.appendChild(link);
  };
  // browsers use the last icon whose media matches: the plain one first, the themed ones after it
  add(light || dark);
  if (light) add(light, '(prefers-color-scheme: light)');
  if (dark) add(dark, '(prefers-color-scheme: dark)');
}

const toDataUrl = async (url) => {
  const res = await fetch(url);
  if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image/')) throw new Error(`logo ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

let inflight = null;
/** Reads the settings from the API (and the navbar logo once per new logo); updates every user of it. */
export function loadIdentity() {
  if (inflight) return inflight;
  inflight = api.get('/metadata/global-settings', { auth: false })
    .then(async (res) => {
      const m = res?.metadata || {};
      const next = {
        favicon: m.favicon || '',
        faviconDark: m.faviconDark || '',
        navbarLogo: m.navbarLogo || '',
        navbarLogoHeight: Number(m.navbarLogoHeight) || DEFAULTS.navbarLogoHeight,
        footerLogo: m.footerLogo || '',
        footerLogoHeight: Number(m.footerLogoHeight) || DEFAULTS.footerLogoHeight,
        navSrc: current.navSrc,
        navFor: current.navFor,
      };
      if (!next.navbarLogo) {
        next.navSrc = ''; next.navFor = '';
      } else if (next.navFor !== next.navbarLogo || !next.navSrc) {
        try { next.navSrc = await toDataUrl(imageUrl(next.navbarLogo, NAV_LOGO_WIDTH)); next.navFor = next.navbarLogo; } catch { next.navSrc = ''; next.navFor = ''; }
      }
      if (JSON.stringify(next) !== JSON.stringify(current)) publish(next);
      applyFavicons(next);
      return next;
    })
    .catch(() => current)
    .finally(() => { inflight = null; });
  return inflight;
}

/** The current identity; re-renders when the admin's settings change. */
export function useSiteIdentity() {
  const [value, setValue] = useState(current);
  useEffect(() => {
    listeners.add(setValue);
    setValue(current);
    return () => { listeners.delete(setValue); };
  }, []);
  return value;
}

// start at once (main.jsx imports this before rendering) and refresh with the live data
if (typeof window !== 'undefined') {
  applyFavicons(current);
  loadIdentity();
  onRevalidate(() => { loadIdentity(); });
}
