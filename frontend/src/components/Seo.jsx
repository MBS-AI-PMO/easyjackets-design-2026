import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchMeta, metaPath, setMeta } from '../lib/usePageTitle';
import { PRIVATE_ROUTES, SITE_URL, canonicalPath } from '../lib/urls';

const setHeadTag = (selector, create, attr, value) => {
  let tag = document.head.querySelector(selector);
  if (!value) { if (tag) tag.remove(); return; }
  if (!tag) { tag = create(); document.head.appendChild(tag); }
  tag.setAttribute(attr, value);
};
const setCanonical = (href) => setHeadTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', href);
const setOgUrl = (href) => setHeadTag('meta[property="og:url"]', () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:url'); return m; }, 'content', href);

// Every page's canonical address (the live site's URL scheme, see lib/urls.js)
// and robots rule, plus the admin's SEO screen (GET /metadata/by-path), which can
// set a title, description and no-index flag per route, as on the live site. When
// it has an entry for the current path it overrides the page's own default title;
// otherwise the page's `usePageTitle` stands (the helpers and cache live there).
export default function Seo() {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const canonical = canonicalPath(pathname, search);
  const canonicalBare = canonical.split('?')[0];
  const isPrivate = PRIVATE_ROUTES.some((re) => re.test(canonicalBare));

  // The same page under another spelling (/Shop, /BULK-ORDER, an upper-case
  // product slug) moves to its canonical address, keeping the query and hash.
  useEffect(() => {
    const decode = (p) => { try { return decodeURIComponent(p); } catch { return p; } };
    const current = decode(pathname.replace(/\/+$/, '') || '/');
    const target = decode(canonicalBare);
    if (current !== target && current.toLowerCase() === target.toLowerCase()) navigate(`${canonicalBare}${search}${hash}`, { replace: true });
  }, [pathname, search, hash, canonicalBare, navigate]);

  useEffect(() => {
    const href = `${SITE_URL}${canonical === '/' ? '/' : canonical}`;
    setCanonical(href);
    setOgUrl(href);
  }, [canonical]);

  useEffect(() => {
    let alive = true;
    setMeta('robots', isPrivate ? 'noindex, nofollow' : '');
    fetchMeta(metaPath(canonicalBare)).then((m) => {
      if (!alive) return;
      if (m?.title) document.title = m.title;
      if (m?.description) setMeta('description', m.description);
      if (m?.keywords) setMeta('keywords', m.keywords);
      setMeta('robots', isPrivate || m?.noIndex ? 'noindex, nofollow' : '');
    });
    return () => { alive = false; };
  }, [canonicalBare, isPrivate]);
  return null;
}
