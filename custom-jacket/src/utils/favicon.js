import { getSiteSettings } from './siteSettings';
import { uploadUrl } from '../config/url';

// The tab icon from the admin's Settings → Site Identity & Logos, the same one the storefront and
// the admin use: `favicon` for light-themed browsers, `faviconDark` for dark ones (falls back to
// the light one), loaded from the new backend. The resolved addresses are remembered so the inline
// script in public/index.html shows the admin's icon at once on the next visit.
const CACHE_KEY = 'ej-builder-favicons';
const withVersion = (url, version) => `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version || Date.now())}`;

const applyFavicons = ({ light, dark }) => {
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
};

export const loadSiteFavicon = async () => {
  try {
    const metadata = await getSiteSettings();
    if (!metadata?._id) return;
    const version = metadata.updatedAt || metadata._id;
    const light = metadata.favicon ? withVersion(uploadUrl(metadata.favicon), version) : '';
    const dark = metadata.faviconDark ? withVersion(uploadUrl(metadata.faviconDark), version) : light;
    applyFavicons({ light, dark });
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ light, dark })); } catch { /* private mode */ }
  } catch (error) {
    console.error('Error fetching the site favicon:', error);
  }
};
