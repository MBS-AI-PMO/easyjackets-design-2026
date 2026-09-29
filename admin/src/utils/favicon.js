import { uploadUrl } from '../constant/url';

// The tab icon from Settings → Site Identity & Logos, shared by the admin and the storefront:
// `favicon` for light-themed browsers, `faviconDark` for dark ones (falls back to the light one).
// Both load from the new backend (uploadUrl), never from the live site.
const withVersion = (url, version) => `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(version || Date.now())}`;

export const applyFavicons = ({ favicon, faviconDark } = {}, version) => {
  const light = favicon ? withVersion(uploadUrl(favicon), version) : '';
  const dark = faviconDark ? withVersion(uploadUrl(faviconDark), version) : light;
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
