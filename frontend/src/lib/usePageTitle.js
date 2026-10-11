import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from './api';

const SITE = 'Easy Jackets';

// The admin's SEO screen (GET /metadata/by-path) can set a title, description
// and no-index flag per route, as on the live site. One request per path per
// session; <Seo> applies it on navigation and usePageTitle defers to it.
const cache = new Map();
export const metaPath = (pathname) => (pathname === '/' ? '/' : pathname.replace(/\/+$/, ''));
export const fetchMeta = (path) => {
  if (!cache.has(path)) {
    cache.set(path, api.get('/metadata/by-path', { params: { path }, auth: false }).then((r) => r?.metadata || null).catch(() => null));
  }
  return cache.get(path);
};
export const setMeta = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!content) { if (tag) tag.remove(); return; }
  if (!tag) { tag = document.createElement('meta'); tag.name = name; document.head.appendChild(tag); }
  tag.content = content;
};

/**
 * "Custom Coach Jackets" → "Custom Coach Jackets | Easy Jackets": every title carries the brand, as the
 * storefront server writes it (backend seo-render), unless it already names it or would pass 65
 * characters, where search results cut it off anyway (N-O7).
 */
export const withBrand = (title) => {
  const t = String(title || '').trim();
  if (!t) return `${SITE} | Custom Varsity & Letterman Jackets`;
  if (/easy\s*jackets?\b/i.test(t)) return t;
  return `${t} | ${SITE}`.length <= 65 ? `${t} | ${SITE}` : t;
};

// Pages that found nothing to show (the 404 page, an unknown product or post): kept out of the index.
// <Seo> reads this when it applies the robots rule, so the order the two effects run in does not matter.
export const missingPages = new Set();
export function useNoIndex(active) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!active) return undefined;
    const path = metaPath(pathname);
    missingPages.add(path);
    setMeta('robots', 'noindex, follow');
    return () => { missingPages.delete(path); };
  }, [active, pathname]);
}

/**
 * Sets document.title (and the meta description when given) for the page.
 * An entry for the route in the admin's SEO screen wins over these defaults
 * (Seo.jsx applies it on navigation; it is re-applied here so the outcome
 * does not depend on which effect runs last).
 */
export function usePageTitle(title, description) {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = withBrand(title);
    if (description != null) setMeta('description', description);
    let alive = true;
    fetchMeta(metaPath(pathname)).then((m) => {
      if (!alive || !m) return;
      if (m.title) document.title = withBrand(m.title);
      if (m.description) setMeta('description', m.description);
    });
    return () => { alive = false; };
  }, [title, description, pathname]);
}
