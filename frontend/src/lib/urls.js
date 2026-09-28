// Canonical URLs. The storefront uses the live site's URL scheme, so every page
// keeps the address search engines already know: /bulk-order, /sizechart,
// /new-blog/:slug, /shop/category/:slug and so on. Build links with these helpers
// rather than by hand, so a link never points at a redirect.

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://easyjackets.com').replace(/\/+$/, '');

export const FILTER_TYPES = ['category', 'material', 'color', 'size'];

/** "Melton Wool" -> "melton-wool", "M/TALL" -> "m-tall" (the live site's slug rule). */
export const slugify = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/\//g, '-')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/** "melton-wool" -> "Melton Wool"; sizes come back upper-case ("m-tall" -> "M/TALL"). */
export const unslugify = (slug = '', type = '') => {
  if (!slug) return '';
  if (type === 'size') return String(slug).replace(/-tall$/i, '/TALL').toUpperCase();
  return String(slug).replace(/-/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * The shop URL for a set of filters: /shop, /shop/<type>/<value> for one filter,
 * /shop/filter/<type>/<value>/<type>/<value> for several (as on the live site).
 * `query` is appended as a search string (sort, max, page, q).
 */
export const shopPath = (filters = {}, query) => {
  const active = FILTER_TYPES.map((t) => [t, slugify(filters[t] || '')]).filter(([, v]) => v);
  let path = '/shop';
  if (active.length === 1) path = `/shop/${active[0][0]}/${encodeURIComponent(active[0][1])}`;
  else if (active.length > 1) path = `/shop/filter/${active.map(([t, v]) => `${t}/${encodeURIComponent(v)}`).join('/')}`;
  const qs = query ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString() : '';
  return qs ? `${path}?${qs}` : path;
};

/** The filters in a shop path (plus the old ?category= style, still read for old links). */
export const parseShopPath = (pathname = '', search = '') => {
  const filters = {};
  const rest = pathname.replace(/^\/shop\/?/i, '').replace(/\/+$/, '');
  const parts = rest ? rest.split('/').map((p) => decodeURIComponent(p)) : [];
  if (parts[0] === 'filter') {
    for (let i = 1; i < parts.length; i += 2) if (FILTER_TYPES.includes(parts[i]) && parts[i + 1]) filters[parts[i]] = slugify(parts[i + 1]);
  } else if (FILTER_TYPES.includes(parts[0]) && parts[1]) {
    filters[parts[0]] = slugify(parts[1]);
  }
  const params = new URLSearchParams(search);
  FILTER_TYPES.forEach((t) => { if (!filters[t] && params.get(t)) filters[t] = slugify(params.get(t)); });
  return filters;
};

/** Product pages live at /product/<lower-case slug>, as on the live site. */
export const productPath = (slug = '') => {
  const s = String(slug || '').trim().toLowerCase();
  return s ? `/product/${encodeURIComponent(s)}` : '/shop';
};

export const blogPath = (slug = '') => `/new-blog/${encodeURIComponent(slug)}`;

/** Routes that must never be indexed (account and checkout flow). */
export const PRIVATE_ROUTES = [/^\/cart$/, /^\/checkout$/, /^\/account$/, /^\/dashboard$/, /^\/order-confirmation/, /^\/success\//, /^\/track-order$/];

/**
 * The canonical address of the page at `pathname` (+ `search`): the live-site path,
 * lower-cased (routes match case-insensitively, so /Shop and /shop are one page),
 * with every query parameter dropped except a shop page number above 1.
 */
export const canonicalPath = (pathname = '/', search = '') => {
  const keepCase = /^\/new-blog\//i.test(pathname);
  const decode = (seg) => { try { return decodeURIComponent(seg); } catch { return seg; } };
  // every segment decoded and re-encoded, so "%E2%80%99", "%e2%80%99" and "’" are one address
  let path = (pathname.replace(/\/+$/, '') || '/').split('/')
    .map((seg) => encodeURIComponent(keepCase ? decode(seg) : decode(seg).toLowerCase()))
    .join('/') || '/';
  if (/^\/shop(\/|$)/.test(path)) {
    const page = Number(new URLSearchParams(search).get('page')) || 1;
    const legacy = parseShopPath('', search);
    if (Object.keys(legacy).length) path = shopPath({ ...parseShopPath(path), ...legacy });
    if (page > 1) path += `?page=${page}`;
  }
  return path;
};
