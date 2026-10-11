// The storefront's web server (it replaces plain nginx). It serves the Vite build and, for every page,
// writes that page's own title, description, canonical, robots, social tags, schema and main text into
// the HTML before sending it, so search engines, link previews and AI answer engines see each page without
// running JavaScript (the live site's server.cjs does the same). The data comes from the backend's
// /api/v1/seo-render. It also:
//   - answers old and alternative addresses with one real 301 (https, no www, no trailing slash, lower
//     case, the live site's aliases from App.jsx, old WordPress paths);
//   - answers a real 404 for addresses that are not pages;
//   - forwards the sitemaps to the backend;
//   - marks every host except the real domain noindex (staging);
//   - writes the admin's site tags (Search Console verification and the like) into the head;
//   - caches and compresses files: hashed build files for a year, fonts and site images for 30 days.
// Run: `npm run build && node server.mjs` (PORT, default 80; API from the build's VITE_API_URL or SEO_API_URL).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { catalogProfile } from './src/lib/catalogSeo.js';
import { FILTER_TYPES } from './src/lib/urls.js';
import { stateBySlug } from './src/lib/states.js';
import { readRouteTable } from './tools/route-table.mjs';
import { LEGACY_REDIRECTS } from './src/data/redirects.js';
import { LANDING_CUSTOMIZE, LANDING_PAGES, LANDING_STEPS } from './src/data/landingPages.js';
import { answerFor, fillAnswer } from './src/data/answers.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, 'dist');
const INDEX_FILE = path.join(DIST, 'index.html');
const PORT = Number(process.env.PORT || 80);
const SITE_URL = 'https://easyjackets.com';
const SITE_HOST = 'easyjackets.com';
const SITE_NAME = 'Easy Jackets';

const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
const buildEnv = readJson(path.join(HERE, "server-data", "build-env.json")) || {};
const trim = (value = '') => String(value || '').replace(/\/+$/, '');
// the API the browser build talks to (image addresses must match it exactly) and the one this server asks
const BUILD_API = trim(buildEnv.apiUrl || process.env.VITE_API_URL || '');
const API_ORIGIN = trim(process.env.SEO_API_URL || BUILD_API || process.env.DEPLOY_STATUS_API || 'http://127.0.0.1:8080').replace(/\/api\/v1$/i, '');
// hosts that may be indexed; any other (the sslip.io staging address) is sent noindex
const INDEXABLE_HOSTS = new Set(String(process.env.INDEXABLE_HOSTS || SITE_HOST).split(',').map((h) => h.trim().toLowerCase()).filter(Boolean));

const ROUTES = readJson(path.join(HERE, "server-data", "route-table.json")) || readRouteTable(path.join(HERE, 'src', 'App.jsx'));

// ── helpers ──────────────────────────────────────────────────────────────────

const escapeHtml = (value = '') => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const escapeJsonForHtml = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const decode = (segment) => { try { return decodeURIComponent(segment); } catch { return segment; } };

/** Remembers each answer for `ttlMs`; a failed refresh keeps serving the last good answer. */
const cache = (ttlMs, max = 500) => {
  const store = new Map();
  return async (key, load) => {
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    if (hit?.pending) return hit.pending;
    const pending = load()
      .then((value) => { store.set(key, { value, at: Date.now() }); if (store.size > max) store.delete(store.keys().next().value); return value; })
      .catch((error) => { if (hit) { store.set(key, hit); return hit.value; } store.delete(key); throw error; });
    store.set(key, { ...(hit || {}), pending, at: hit?.at || 0 });
    return pending;
  };
};

const fetchJson = async (url, timeoutMs = 4000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
};

// ── security headers (were security-headers.conf) ────────────────────────────

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "base-uri 'self'; object-src 'none'; frame-ancestors 'self'",
  'Strict-Transport-Security': 'max-age=15552000',
};

// ── routes: pages, redirects, 404 ────────────────────────────────────────────

const patternToRegex = (pattern) => new RegExp(`^${pattern
  .split('/')
  .map((part) => (part === '*' ? '(.*)' : part.startsWith(':') ? '([^/]+)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  .join('/')}$`, 'i');
const PAGE_ROUTES = ROUTES.pages.map((pattern) => ({ pattern, re: patternToRegex(pattern) }));
const ALIAS_ROUTES = ROUTES.redirects.map(({ from, to }) => ({ re: patternToRegex(from), to }));

const matchPage = (route) => {
  for (const page of PAGE_ROUTES) {
    const m = page.re.exec(route);
    if (m) return { pattern: page.pattern, params: m.slice(1).map(decode) };
  }
  return null;
};

// never indexed (same list as lib/urls.js PRIVATE_ROUTES, plus the design reference and saved designs)
const PRIVATE = [/^\/cart$/, /^\/checkout$/, /^\/account$/, /^\/dashboard$/, /^\/order-confirmation/, /^\/success\//, /^\/track-order$/, /^\/style-guide$/, /^\/design\//];
// addresses that keep their letter case (Stripe session ids, order numbers, blog slugs)
const KEEP_CASE = /^\/(new-blog|success|order-confirmation)\//i;

/** The canonical spelling of a path: no trailing slash, single slashes, lower case, each segment encoded one way. */
const canonicalSpelling = (pathname) => {
  const collapsed = pathname.replace(/\/{2,}/g, '/');
  const trimmed = collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
  const keep = KEEP_CASE.test(trimmed);
  return trimmed.split('/').map((seg) => encodeURIComponent(keep ? decode(seg) : decode(seg).toLowerCase())).join('/') || '/';
};

const categoryCache = cache(10 * 60 * 1000);
const knownCategories = () => categoryCache('all', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/category/get-category`, 10000); // old addresses only, kept 10 min
  if (status !== 200) throw new Error(`categories ${status}`);
  const list = (body?.category || body?.categories || body?.data || []).filter((c) => c?.slug);
  return { slugs: new Set(list.map((c) => String(c.slug).toLowerCase())), byId: new Map(list.map((c) => [String(c._id), c])) };
}).catch(() => ({ slugs: new Set(), byId: new Map() }));

const categoryHref = (c) => `${c.section === 'sports' ? '/sports-spirit-wears' : '/shop'}/category/${encodeURIComponent(String(c.slug).toLowerCase())}`;

/** Where an address should permanently point instead, or null. Query strings are kept by the caller unless the target has its own. */
const redirectTarget = async (route, searchParams) => {
  const lower = route.toLowerCase();
  // the old "all products" page, filtered by a category id
  if (lower === '/allproducts' && searchParams.get('category')) {
    const category = (await knownCategories()).byId.get(searchParams.get('category'));
    return category ? `${categoryHref(category)}?` : '/shop?';
  }
  if (LEGACY_REDIRECTS[lower]) return LEGACY_REDIRECTS[lower];
  // any other sports-and-spirit-wear address (material, colour, filter pages): see src/data/redirects.js
  if (/^\/sports-spirit-wears(\/|$)/.test(lower)) return '/team-jackets';
  // a bare category address (/varsity-jackets/, /coach-jackets/), still linked from old directories (P-4)
  if (/^\/[a-z0-9-]+$/.test(lower) && !matchPage(lower)) {
    const { slugs, byId } = await knownCategories();
    if (slugs.has(lower.slice(1))) {
      const category = [...byId.values()].find((c) => String(c.slug).toLowerCase() === lower.slice(1));
      return category ? categoryHref(category) : `/shop/category/${lower.slice(1)}`;
    }
  }
  for (const alias of ALIAS_ROUTES) if (alias.re.test(route)) return alias.to;
  let m;
  if ((m = /^\/products\/([^/]+)$/i.exec(route))) {
    const slug = decode(m[1]).toLowerCase();
    const { slugs } = await knownCategories();
    return slugs.has(slug) ? `/shop/category/${encodeURIComponent(slug)}` : `/product/${encodeURIComponent(slug.replace(/['’‘]/g, ''))}`;
  }
  // product addresses carry no apostrophes (B-O2)
  if ((m = /^\/product\/(.+)$/i.exec(route)) && /['’‘]/.test(decode(m[1]))) return `/product/${encodeURIComponent(decode(m[1]).replace(/['’‘]/g, ''))}`;
  if ((m = /^\/blog\/([^/]+)$/i.exec(route))) return `/new-blog/${m[1]}`;
  if ((m = /^\/order-confirmation\/([^/]+)$/i.exec(route))) return `/order-confirmation?order=${m[1]}`;
  // WordPress-era addresses that search engines still hold
  if ((m = /^\/product-category\/(?:[^/]+\/)*([^/]+)$/i.exec(route))) return `/shop/category/${m[1].toLowerCase()}`;
  if ((m = /^\/united-states\/([^/]+)$/i.exec(route)) && !stateBySlug(decode(m[1]))) return '/united-states';
  return null;
};

// ── backend data: seo-render, site tags, cut-out versions ────────────────────

const seoCache = cache(5 * 60 * 1000, 2000);
const fetchSeo = (route) => seoCache(route, async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/seo-render?path=${encodeURIComponent(route)}`);
  if (!body?.seo) throw new Error(`seo-render ${status}`);
  return { ...body.seo, status };
}).catch(() => null);

const siteTagCache = cache(60 * 1000);
const fetchSiteTags = () => siteTagCache('tags', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/sitetags/active`);
  if (status !== 200) throw new Error(`sitetags ${status}`);
  return Array.isArray(body?.tags) ? body.tags : [];
}).catch(() => []);

const cutoutCache = cache(60 * 1000);
const fetchCutouts = () => cutoutCache('cutouts', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/product/cutouts`);
  if (status !== 200) throw new Error(`cutouts ${status}`);
  return { keys: new Set(body?.keys || []), versions: body?.versions || {} };
}).catch(() => ({ keys: new Set(), versions: {} }));

const listCache = cache(5 * 60 * 1000, 500);
const blogListCache = cache(5 * 60 * 1000);
const fetchProductList = (query) => listCache(query, async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/product/product-filters/?${query}`);
  if (status !== 200) throw new Error(`product-filters ${status}`);
  return body;
}).catch(() => null);

// ── site tags (admin Settings → Site Tags), as the live server.cjs renders them ─────

const SITE_TAG_TYPES = new Set(['meta', 'link', 'script', 'style', 'noscript']);
const isSeoManagedTag = (tag) => {
  const key = String(tag?.attributes?.name || tag?.attributes?.property || '').toLowerCase();
  return ['description', 'keywords', 'robots'].includes(key) || key.startsWith('og:') || key.startsWith('twitter:');
};
// analytics loads from the browser after the page is up (src/lib/analytics.js), not in the first paint
const isDeferredAnalyticsTag = (tag) => {
  const src = String(tag?.attributes?.src || '').toLowerCase();
  const content = String(tag?.content || '').toLowerCase();
  return tag?.tagType === 'script' && (src.includes('googletagmanager.com') || src.includes('google-analytics.com') || content.includes('gtag(') || content.includes('datalayer'));
};
const renderTagAttributes = (attributes = {}) => Object.entries(attributes || {})
  .filter(([key, value]) => /^[A-Za-z_:][-A-Za-z0-9_:.]*$/.test(key) && value !== undefined && value !== null && value !== false)
  .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${escapeHtml(String(value))}"`))
  .join('');
// The admin's list was made for the live site's old design: Bootstrap (its CSS turns every link blue),
// Font Awesome, its Google Fonts and preconnects, a black theme colour. This storefront uses none of them
// (its fonts are self-hosted and its theme colour is in index.html), so only the rest is written:
// verification metas, small async scripts and the like.
const isExcludedSiteTag = (tag) => {
  const attributes = tag?.attributes || {};
  const href = String(attributes.href || '').toLowerCase();
  const src = String(attributes.src || '').toLowerCase();
  const rel = String(attributes.rel || '').toLowerCase();
  const name = String(attributes.name || '').toLowerCase();
  return /cdn\.jsdelivr\.net\/npm\/bootstrap|bootstrap(\.bundle)?(\.min)?\.(css|js)/.test(href + src)
    || href.includes('font-awesome') || href.includes('fontawesome')
    || href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com')
    || rel === 'preconnect' || rel === 'dns-prefetch'
    || name === 'theme-color' || name === 'viewport';
};
const renderSiteTags = (tags = []) => tags
  .filter((tag) => tag && SITE_TAG_TYPES.has(tag.tagType) && !isExcludedSiteTag(tag) && !isDeferredAnalyticsTag(tag) && !isSeoManagedTag(tag))
  // the same tag saved twice (two identical verification metas) is written once
  .filter((tag, index, all) => all.findIndex((t) => t.tagType === tag.tagType && JSON.stringify(t.attributes || {}) === JSON.stringify(tag.attributes || {}) && (t.content || '') === (tag.content || '')) === index)
  .map((tag) => {
    const attributes = renderTagAttributes(tag.attributes);
    if (tag.tagType === 'meta' || tag.tagType === 'link') return `<${tag.tagType}${attributes} data-site-tag="ssr" />`;
    if (!tag.content) return '';
    return `<${tag.tagType}${attributes} data-site-tag="ssr">${tag.content}</${tag.tagType}>`;
  })
  .filter(Boolean)
  .join('\n');

// ── the page's head ──────────────────────────────────────────────────────────

const uploadKey = (url = '') => { const m = /\/uploads\/([^?#]+)/.exec(String(url)); return m ? decode(m[1]) : null; };
// lib/api.js uploadUrl + imageUrl: our uploads (live or api2 address) served by the build's API at a width
const LEGACY_UPLOADS = /^https?:\/\/api2?\.easyjackets\.com\/uploads\//i;
const imageAt = (src = '', width) => {
  if (!src || !BUILD_API) return '';
  const url = LEGACY_UPLOADS.test(src) ? `${BUILD_API}/uploads/${src.replace(LEGACY_UPLOADS, '')}` : src;
  if (!url.startsWith(`${BUILD_API}/uploads/`) || !/\.(webp|jpe?g|png)$/i.test(url)) return '';
  return `${url}?w=${width}`;
};
const withVersion = (url, version) => (url && version ? `${url}${url.includes('?') ? '&' : '?'}v=${version}` : url);

/** Preload for a product page's main photo, the exact URLs its ImageSlot asks for (width 1280, 2x 2560). */
const productPreload = async (seo) => {
  const src = seo.preloadImage;
  const one = imageAt(src, 1280);
  if (!one) return { tag: '', script: '' };
  const { keys, versions } = await fetchCutouts();
  const product = (seo.jsonLd || []).find((s) => s['@type'] === 'Product');
  const pageKeys = [src, ...(product?.image || [])].map(uploadKey).filter((k) => k && keys.has(k));
  const version = versions[uploadKey(src)] || 0;
  const x1 = withVersion(one, version);
  const x2 = withVersion(imageAt(src, 2560), version);
  // the page's own cut-out versions, so the first render already asks for the preloaded URL (lib/cutouts.js)
  const seed = pageKeys.length ? { keys: pageKeys, versions: Object.fromEntries(pageKeys.map((k) => [k, versions[k] || 0])) } : null;
  return {
    tag: `<link rel="preload" as="image" href="${escapeHtml(x1)}" imagesrcset="${escapeHtml(`${x1} 1x, ${x2} 2x`)}" fetchpriority="high" />`,
    script: seed ? `<script>window.__EJ_CUTOUTS__=${escapeJsonForHtml(seed)}</script>` : '',
  };
};

const ROBOTS_NOINDEX = 'noindex, follow';

const buildHead = ({ seo, canonicalUrl, robots, preload, route }) => {
  const title = escapeHtml(seo?.fullTitle || seo?.title || SITE_NAME);
  const description = escapeHtml(seo?.description || '');
  const keywords = escapeHtml(seo?.keywords || '');
  const canonical = escapeHtml(canonicalUrl);
  const image = escapeHtml(seo?.image || `${SITE_URL}/social-card.jpg`);
  const imageAlt = escapeHtml(seo?.imageAlt || 'Easy Jackets custom varsity jackets');
  const type = escapeHtml(seo?.type === 'product' ? 'product' : seo?.type || 'website');
  const jsonLd = robots ? [] : (seo?.jsonLd || []);
  return [
    preload?.tag || '',
    `<title>${title}</title>`,
    description ? `<meta name="description" content="${description}" />` : '',
    keywords ? `<meta name="keywords" content="${keywords}" />` : '',
    robots ? `<meta name="robots" content="${robots}" />` : '',
    // data-ssr-path: the page this canonical was written for; the app keeps it there (components/Seo.jsx)
    `<link rel="canonical" href="${canonical}" data-ssr-path="${escapeHtml(route)}" />`,
    `<meta property="og:type" content="${type}" />`,
    '<meta property="og:locale" content="en_US" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    description ? `<meta property="og:description" content="${description}" />` : '',
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:alt" content="${imageAlt}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    description ? `<meta name="twitter:description" content="${description}" />` : '',
    `<meta name="twitter:image" content="${image}" />`,
    ...jsonLd.map((schema) => `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`),
    preload?.script || '',
  ].filter(Boolean).join('\n');
};

// the build's own <title> and description, replaced by the page's
const stripStaticSeo = (html) => html
  .replace(/<title[\s\S]*?<\/title>\s*/i, '')
  .replace(/<meta\b(?=[^>]*\sname=["']description["'])[^>]*>\s*/gi, '');

// ── the page's text before JavaScript (G-1) ──────────────────────────────────

const SHOP_PAGE_SIZE = 12; // pages/Shop.jsx PAGE_SIZE
const productHref = (slug = '') => `/product/${encodeURIComponent(String(slug).trim().toLowerCase())}`;

/** A shop page's product links, the same query the shop sends for that page. */
const shopListing = async (route, page, section) => {
  const parts = route.split('/').slice(2).map(decode);
  const filters = {};
  if (parts[0] === 'filter') for (let i = 1; i < parts.length; i += 2) { if (FILTER_TYPES.includes(parts[i]) && parts[i + 1]) filters[parts[i]] = parts[i + 1]; }
  else if (FILTER_TYPES.includes(parts[0]) && parts[1]) filters[parts[0]] = parts[1];
  const query = new URLSearchParams({ view: 'card', page: String(page), limit: String(SHOP_PAGE_SIZE), ...filters, ...(section ? { section } : {}) });
  const body = await fetchProductList(query.toString());
  if (!body?.products) return { html: '', filters };
  const items = body.products.filter((p) => p?.slug && p?.name);
  const pages = Number(body.totalPages) || 1;
  const pageHref = (n) => `${route}${n > 1 ? `?page=${n}` : ''}`;
  const pager = pages > 1
    ? `<nav aria-label="Pages"><ul>${Array.from({ length: pages }, (_, i) => i + 1)
      .map((n) => (n === page ? `<li aria-current="page">Page ${n}</li>` : `<li><a href="${escapeHtml(pageHref(n))}">Page ${n}</a></li>`)).join('')}</ul></nav>`
    : '';
  const html = items.length
    ? `<section><h2>${escapeHtml(`${body.totalProducts || items.length} jackets`)}${pages > 1 ? `, page ${page} of ${pages}` : ''}</h2><ul>${items
      .map((p) => `<li><a href="${escapeHtml(productHref(p.slug))}">${escapeHtml(p.name)}</a>${p.priceFrom ? ` — from $${Math.round(Number(p.priceFrom))}` : ''}</li>`).join('')}</ul>${pager}</section>`
    : '';
  return { html, filters };
};

const fetchBlogList = () => blogListCache('posts', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/features/blogs`);
  if (status !== 200) throw new Error(`blogs ${status}`);
  return Array.isArray(body) ? body : [];
}).catch(() => []);

const shopSection = (route) => (route.startsWith('/sports-spirit-wears') ? 'sports' : '');
const landingQuery = (landing) => new URLSearchParams({ view: 'card', page: '1', limit: '8', sort: 'popular', ...landing.products }).toString();

const pageContent = async ({ route, seo, match, page }) => {
  let html = seo?.content || '';
  const shop = /^\/(shop|sports-spirit-wears)(\/|$)/i.test(route);
  if (shop) {
    const { html: listing, filters } = await shopListing(route, page, shopSection(route));
    const profile = match.pattern === '/shop/:type/:value' || match.pattern === '/shop' ? catalogProfile(filters) : null;
    const lead = profile
      ? `<h1>${escapeHtml(profile.h1)}</h1><p>${escapeHtml(profile.intro)}</p>${profile.quickAnswer ? `<p>${escapeHtml(profile.quickAnswer)}</p>` : ''}`
      : '';
    // seo-render's text for the page (breadcrumb, H1, FAQs), with the shop's own H1 and intro where it has one
    html = lead ? html.replace(/<h1>[\s\S]*?<\/h1>\s*(<p>[\s\S]*?<\/p>)?/, lead) : html;
    html += listing;
  }
  // the blog index: every published post as a link, so crawlers reach all of them from one page
  if (route === '/new-blog') {
    const list = await fetchBlogList();
    const posts = list.filter((b) => b?.slug && b?.title && b.isActive !== false && !LEGACY_REDIRECTS[`/new-blog/${String(b.slug).toLowerCase()}`]);
    if (posts.length) html += `<section><h2>All guides and articles</h2><ul>${posts.map((b) => `<li><a href="/new-blog/${encodeURIComponent(b.slug)}">${escapeHtml(b.title)}</a></li>`).join('')}</ul></section>`;
  }
  const landing = LANDING_PAGES[route];
  if (landing) {
    const section = (s) => `<section><h2>${escapeHtml(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</section>`;
    const list = await fetchProductList(landingQuery(landing));
    const products = (list?.products || []).filter((p) => p?.slug && p?.name);
    const body = [
      `<p>${escapeHtml(landing.intro)}</p>`,
      `<p><strong>Quick answer:</strong> ${escapeHtml(landing.quickAnswer)}</p>`,
      section(LANDING_CUSTOMIZE),
      landing.extra ? section(landing.extra) : '',
      `<section><h2>Popular options</h2><ul>${landing.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></section>`,
      products.length ? `<section><h2>${escapeHtml(landing.productsTitle)}</h2><ul>${products.map((p) => `<li><a href="${escapeHtml(productHref(p.slug))}">${escapeHtml(p.name)}</a></li>`).join('')}</ul></section>` : '',
      `<section><h2>How ordering works</h2>${LANDING_STEPS.map((s) => `<h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.desc)}</p>`).join('')}</section>`,
      `<nav aria-label="Related pages"><h2>Related pages</h2><ul>${landing.links.map((l) => `<li><a href="${escapeHtml(l.to)}">${escapeHtml(l.label)}</a></li>`).join('')}</ul></nav>`,
    ].join('');
    // seo-render's text has the breadcrumb, H1, description and the page's questions: the copy goes after the H1
    html = html.replace(/(<h1>[\s\S]*?<\/h1>)\s*(<p>[\s\S]*?<\/p>)?/, `$1${body}`)
      .replace(/<nav aria-label="More from Easy Jackets">[\s\S]*?<\/nav>/, '');
  }
  return html ? `<div class="ez-ssr">${html}</div>` : '';
};

// ── answer-first boxes (data/answers.js, G-3): the same text and schema as components/AnswerBox.jsx ──

const priceRangeCache = cache(10 * 60 * 1000);
const fetchPriceRanges = () => priceRangeCache('ranges', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/product/price-ranges`);
  if (status !== 200) throw new Error(`price-ranges ${status}`);
  return body?.ranges || [];
}).catch(() => []);
const shippingCache = cache(10 * 60 * 1000);
const fetchShipping = () => shippingCache('rates', async () => {
  const { status, body } = await fetchJson(`${API_ORIGIN}/api/v1/shipping-rates/public`);
  if (status !== 200) throw new Error(`shipping ${status}`);
  return body?.rates || null;
}).catch(() => null);
const money = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-US')}`;
const usSingleRate = (rates) => {
  const tier = (rates?.usaTiers || []).find((t) => Number(t.minQty) <= 1 && (t.maxQty == null || Number(t.maxQty) >= 1));
  const rate = tier ? Number(tier.rate) : Number(rates?.usaFallbackRate) || 0;
  return rate > 0 ? rate : null;
};

const answerBlock = async (route) => {
  const item = answerFor(route);
  if (!item) return null;
  let answer = item.answer;
  let table = item.table;
  if (table === 'priceRanges') {
    const [ranges, rates] = await Promise.all([fetchPriceRanges(), fetchShipping()]);
    if (!ranges.length) return null;
    const varsity = ranges.find((r) => r.slug === 'varsity-jackets') || ranges[0];
    const us = usSingleRate(rates);
    answer = fillAnswer(answer, {
      from: money(varsity.low), // the varsity row (a hoodie's $40 is not a varsity jacket price)
      typical: money(varsity.typicalFrom),
      usShipping: us ? money(us) : 'charged at checkout',
      freeOver: rates?.enabled !== false && Number(rates?.freeShippingOver) > 0 ? `, free on orders over ${money(rates.freeShippingOver)}` : '',
    });
    table = { head: ['Style', 'Price today', 'Most start at'], rows: ranges.map((r) => [r.name, r.low === r.high ? money(r.low) : `${money(r.low)} – ${money(r.high)}`, money(r.typicalFrom)]) };
  }
  const updated = new Date(`${item.updated}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const html = [
    `<aside><p><strong>Quick answer</strong> · Updated <time datetime="${escapeHtml(item.updated)}">${escapeHtml(updated)}</time></p>`,
    `<h2>${escapeHtml(item.question)}</h2><p>${escapeHtml(answer)}</p>`,
    table ? `<table><thead><tr>${table.head.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map((row) => `<tr>${row.map((c, i) => (i ? `<td>${escapeHtml(c)}</td>` : `<th>${escapeHtml(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table>` : '',
    item.links?.length ? `<p>${item.links.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join(' · ')}</p>` : '',
    '</aside>',
  ].join('');
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: answer } }] };
  return { html, schema };
};

// minimal styling for the text above, shown only until the app replaces it
const SSR_STYLE = '<style>.ez-ssr{max-width:1100px;margin:0 auto;padding:96px 20px 64px;font:16px/1.6 "Instrument Sans",system-ui,sans-serif;color:#14110f;background:#f4efe6}.ez-ssr h1{font:900 clamp(34px,6vw,64px)/1 "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase;margin:12px 0 18px}.ez-ssr h2{font:800 26px/1.1 "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase;margin:32px 0 10px}.ez-ssr h3{font-size:17px;margin:18px 0 6px}.ez-ssr a{color:inherit}.ez-ssr nav ol,.ez-ssr nav ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:6px 14px}.ez-ssr img{max-width:100%;height:auto}</style>';

// ── static files ─────────────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.xsl': 'text/xsl; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.jfif': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/;

const cacheControlFor = (urlPath, ext) => {
  if (urlPath.startsWith('/assets/')) return 'public, max-age=31536000, immutable'; // Vite fingerprints these
  if (['.txt', '.xml', '.xsl', '.html', '.json', '.webmanifest'].includes(ext)) return 'public, max-age=3600';
  return 'public, max-age=2592000'; // fonts, site images, logo, favicons: 30 days (N-T10)
};

const fileCache = new Map(); // compressed copies of small text files
const compressed = (filePath, stat, encoding) => {
  const key = `${filePath}|${encoding}|${stat.mtimeMs}`;
  if (fileCache.has(key)) return fileCache.get(key);
  const raw = fs.readFileSync(filePath);
  const out = encoding === 'br'
    ? zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
    : zlib.gzipSync(raw, { level: 9 });
  if (fileCache.size > 400) fileCache.clear();
  fileCache.set(key, out);
  return out;
};

const pickEncoding = (req) => {
  const accept = String(req.headers['accept-encoding'] || '');
  if (/\bbr\b/.test(accept)) return 'br';
  if (/\bgzip\b/.test(accept)) return 'gzip';
  return '';
};

const resolveFile = (urlPath) => {
  const safe = path.normalize(path.join(DIST, decode(urlPath)));
  if (!safe.startsWith(DIST + path.sep)) return null;
  try { const stat = fs.statSync(safe); return stat.isFile() ? { filePath: safe, stat } : null; } catch { return null; }
};

const sendFile = (req, res, urlPath, file) => {
  const ext = path.extname(file.filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', cacheControlFor(urlPath, ext));
  res.setHeader('Last-Modified', file.stat.mtime.toUTCString());
  res.setHeader('Vary', 'Accept-Encoding');
  const since = Date.parse(req.headers['if-modified-since'] || '');
  if (since && Math.floor(file.stat.mtimeMs / 1000) * 1000 <= since) { res.statusCode = 304; res.end(); return; }
  const encoding = COMPRESSIBLE.test(type) && file.stat.size > 1024 && file.stat.size < 8 * 1024 * 1024 ? pickEncoding(req) : '';
  if (encoding) {
    const body = compressed(file.filePath, file.stat, encoding);
    res.setHeader('Content-Encoding', encoding);
    res.setHeader('Content-Length', body.length);
    res.end(req.method === 'HEAD' ? undefined : body);
    return;
  }
  res.setHeader('Content-Length', file.stat.size);
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file.filePath).pipe(res);
};

const sendText = (req, res, status, body, type = 'text/plain; charset=utf-8') => {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.end(req.method === 'HEAD' ? undefined : body);
};

// ── sitemaps (generated by the backend from the database) ────────────────────

const SITEMAPS = {
  '/sitemap.xml': '/api/v1/sitemap.xml',
  '/page-sitemap.xml': '/api/v1/sitemap/page-sitemap.xml',
  '/product-sitemap.xml': '/api/v1/sitemap/product-sitemap.xml',
  '/blog-sitemap.xml': '/api/v1/sitemap/blog-sitemap.xml',
  '/category-sitemap.xml': '/api/v1/sitemap/category-sitemap.xml',
  '/color-sitemap.xml': '/api/v1/sitemap/color-sitemap.xml',
  '/material-sitemap.xml': '/api/v1/sitemap/material-sitemap.xml',
  '/size-sitemap.xml': '/api/v1/sitemap/size-sitemap.xml',
};

const proxySitemap = async (req, res, apiPath) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    const apiRes = await fetch(`${API_ORIGIN}${apiPath}`, { signal: controller.signal }).finally(() => clearTimeout(timer));
    const body = Buffer.from(await apiRes.arrayBuffer());
    res.statusCode = apiRes.status;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=900');
    const encoding = pickEncoding(req);
    if (encoding && body.length > 1024) {
      const out = encoding === 'br' ? zlib.brotliCompressSync(body) : zlib.gzipSync(body);
      res.setHeader('Content-Encoding', encoding);
      res.setHeader('Vary', 'Accept-Encoding');
      res.end(req.method === 'HEAD' ? undefined : out);
      return;
    }
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    sendText(req, res, 502, 'Sitemap temporarily unavailable');
  }
};

// ── the app's pages ──────────────────────────────────────────────────────────

let indexHtml = null;
const readIndex = () => {
  if (indexHtml && process.env.NODE_ENV === 'production') return indexHtml;
  indexHtml = fs.readFileSync(INDEX_FILE, 'utf8');
  return indexHtml;
};

const NOT_FOUND_SEO = { fullTitle: `Page not found | ${SITE_NAME}`, description: 'The page you were looking for is not here. Browse custom varsity jackets or design your own.', jsonLd: [] };

/**
 * The loads a page's text needs that do not wait on its SEO lookup, started alongside it instead of after it.
 * The cached loaders hand the same pending request to pageContent and answerBlock below: nothing loads twice.
 */
const startPageLoads = (route, page) => {
  fetchSiteTags();
  if (answerFor(route)?.table === 'priceRanges') { fetchPriceRanges(); fetchShipping(); }
  if (/^\/(shop|sports-spirit-wears)(\/|$)/i.test(route)) shopListing(route, page, shopSection(route)).catch(() => {});
  if (route === '/new-blog') fetchBlogList();
  if (LANDING_PAGES[route]) fetchProductList(landingQuery(LANDING_PAGES[route]));
};

const serveApp = async (req, res, route, searchParams) => {
  const match = matchPage(route);
  if (match) startPageLoads(route, Math.max(1, Number(searchParams.get('page')) || 1));
  let seo = match ? await fetchSeo(route) : null;
  let status = 200;
  const notFound = () => { status = 404; seo = { ...(seo || {}), ...NOT_FOUND_SEO, content: '' }; };

  if (!match) notFound();
  else if (seo?.status === 404) notFound();
  else if (match.pattern === '/shop/:type/:value' && (!FILTER_TYPES.includes(match.params[0].toLowerCase()) || seo?.known === false)) notFound();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const canonicalPath = status === 404 ? route : (seo?.canonicalPath || route) + (/^\/(shop|sports-spirit-wears)(\/|$)/.test(route) && page > 1 ? `?page=${page}` : '');
  const isPrivate = PRIVATE.some((re) => re.test(route));
  // filter combinations stay out of the index unless the admin's SEO screen has a row for that exact URL (N-A4)
  const isFilterCombo = /^\/shop\/filter\//i.test(route) && seo?.known === false;
  const robots = status === 404 || isPrivate || isFilterCombo || seo?.noIndex ? ROBOTS_NOINDEX : '';

  const [siteTags, preload, pageText, answer] = await Promise.all([
    fetchSiteTags(),
    status === 200 && seo?.type === 'product' && !robots ? productPreload(seo) : null,
    status === 200 && seo && !isPrivate ? pageContent({ route, seo, match, page }) : '',
    status === 200 && seo ? answerBlock(route) : null,
  ]);
  // the quick answer goes straight under the page's H1, with its FAQPage schema (G-3)
  let content = pageText;
  if (answer) {
    content = content.replace(/(<\/h1>(?:\s*<p>By [\s\S]*?<\/p>)?)/, `$1${answer.html}`);
    seo = { ...seo, jsonLd: [...(seo.jsonLd || []), answer.schema] };
  }

  // With the API unreachable (and nothing cached) the build's own title and description stay: never a
  // blanket noindex because of an outage.
  const head = [
    seo ? buildHead({ seo, canonicalUrl: `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`, robots, preload, route }) : '',
    renderSiteTags(siteTags),
    content ? SSR_STYLE : '',
  ].filter(Boolean).join('\n');
  let html = (seo ? stripStaticSeo(readIndex()) : readIndex()).replace('</head>', `${head}\n</head>`);
  if (content) html = html.replace('<div id="root"></div>', `<div id="root">${content}</div>`);

  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.setHeader('Vary', 'Accept-Encoding');
  const encoding = pickEncoding(req);
  const body = encoding === 'br'
    ? zlib.brotliCompressSync(html, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })
    : encoding === 'gzip' ? zlib.gzipSync(html, { level: 6 }) : Buffer.from(html);
  if (encoding) res.setHeader('Content-Encoding', encoding);
  res.setHeader('Content-Length', body.length);
  res.end(req.method === 'HEAD' ? undefined : body);
};

// ── the server ───────────────────────────────────────────────────────────────

/** A redirect target with the request's query string kept; a target ending in "?" drops it (it was used up, e.g. ?category=<id>). */
const withQuery = (target, search) => {
  const [base, hash = ''] = target.split('#');
  const location = base.endsWith('?') ? base.slice(0, -1) : `${base}${base.includes('?') || !search ? '' : search}`;
  return `${location}${hash ? `#${hash}` : ''}`;
};

const redirect = (res, location, status = 301) => {
  res.statusCode = status;
  res.setHeader('Location', location);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.end();
};

const handle = async (req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '');
  if (!INDEXABLE_HOSTS.has(host)) res.setHeader('X-Robots-Tag', 'noindex, nofollow'); // staging (N-T12)

  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); sendText(req, res, 405, 'Method not allowed'); return; }

  const url = new URL(req.url, 'http://localhost');
  const { pathname, search } = url;

  // the old blog subdomain (P-4): each post to its /new-blog/ page when it exists there, else the blog
  // (needs a DNS record for blog.easyjackets.com and the domain added to this app in Coolify)
  if (host === `blog.${SITE_HOST}`) {
    const slug = decode(pathname.split('/').filter(Boolean).pop() || '').toLowerCase();
    const post = slug && !/^(page|category|tag|author|feed|wp-[a-z-]+|\d+)$/.test(slug) ? await fetchSeo(`/new-blog/${slug}`) : null;
    const target = post && post.status !== 404 ? post.canonicalPath : (LEGACY_REDIRECTS[`/new-blog/${slug}`] || '/new-blog');
    redirect(res, `${SITE_URL}${target}`);
    return;
  }

  // one hop to https://easyjackets.com: from http and from www (B-T1)
  const proto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  if (host === `www.${SITE_HOST}` || (proto === 'http' && INDEXABLE_HOSTS.has(host))) {
    const spelled = path.extname(pathname) && pathname !== '/home/index2.html' ? pathname : canonicalSpelling(pathname);
    // an old address is resolved in the same hop (www.easyjackets.com/AllProducts → https://easyjackets.com/shop)
    const moved = path.extname(spelled) ? null : await redirectTarget(spelled, url.searchParams);
    redirect(res, `${SITE_URL}${moved ? withQuery(moved, search) : `${spelled}${search}`}`);
    return;
  }

  if (SITEMAPS[pathname.toLowerCase()]) { await proxySitemap(req, res, SITEMAPS[pathname.toLowerCase()]); return; }

  // a file from the build (the shell itself only through the page route below)
  const ext = path.extname(pathname).toLowerCase();
  if (ext && MIME[ext] && pathname !== '/index.html') {
    const file = resolveFile(pathname);
    if (file) { sendFile(req, res, pathname, file); return; }
    // a missing file is a 404, never the app's HTML (crawlers and Lighthouse read that as a broken file);
    // except old page addresses that end in .html, which may still redirect
    if (ext !== '.html') { res.setHeader('Cache-Control', 'no-cache'); sendText(req, res, 404, 'Not found'); return; }
  }
  if (pathname.startsWith('/.well-known/')) { sendText(req, res, 404, 'Not found'); return; }

  // the canonical spelling and old addresses: one 301 (N-T7)
  const route = pathname === '/index.html' ? '/' : canonicalSpelling(pathname);
  const target = await redirectTarget(route, url.searchParams);
  if (target) {
    redirect(res, withQuery(target, search));
    return;
  }
  if (route !== pathname) { redirect(res, `${route}${search}`); return; }

  await serveApp(req, res, route, url.searchParams);
};

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error('storefront server:', error);
    if (!res.headersSent) sendText(req, res, 500, 'Something went wrong');
    else res.end();
  });
});
server.keepAliveTimeout = 65000;
server.listen(PORT, () => console.log(`Easy Jackets storefront on :${PORT} (API ${API_ORIGIN})`));
