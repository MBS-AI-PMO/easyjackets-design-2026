// Catalogue data: categories, materials, colours, products, reviews — fetched
// from the API and normalised into the shape the pages render.
import { api, uploadUrl } from './api';

/** The current storefront still hosts the jacket customiser. */
export const LEGACY_SITE = (import.meta.env.VITE_LEGACY_SITE_URL || 'https://easyjackets.com').replace(/\/$/, '');

// discountPrice is a percentage off (the storefront's getProductPrice rule).
const pct = (p) => (p > 0 && p < 100 ? Number(p) : 0);
export const money = (n) => `$${Math.round(Number(n) || 0)}`;
export const discounted = (base, discountPct) => Math.round((Number(base) || 0) * (1 - pct(discountPct) / 100));

export function normalizeProduct(p) {
  if (!p) return null;
  const discountPct = pct(p.discountPrice);
  const original = Number(p.standardPrice) || 0;
  const price = discounted(original, discountPct);
  const sizes = (p.sizes || []).filter((s) => s && s.size).map((s) => {
    const base = Number(s.price) || original;
    return { size: String(s.size).toUpperCase(), original: base, price: discounted(base, discountPct) };
  });
  const images = [p.frontImage, ...(p.otherImages || [])].filter(Boolean).map(uploadUrl);
  const category = p.category && typeof p.category === 'object' ? { id: p.category._id, name: p.category.name, slug: p.category.slug, code: p.category.code || '' } : null;
  const color = p.color && typeof p.color === 'object' ? { id: p.color._id, name: String(p.color.name || '').trim(), code: p.color.code } : null;
  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    price,
    original,
    discountPct,
    hasDiscount: discountPct > 0,
    priceLabel: money(price),
    wasLabel: discountPct > 0 ? money(original) : '',
    badge: discountPct > 0 ? `-${discountPct}%` : '',
    image: images[0] || '',
    images,
    imageAlt: p.imageAlt || p.name,
    category,
    color,
    material: { body: p.material?.body || '', sleeves: p.material?.sleeves || '' },
    materialLabel: [p.material?.body, p.material?.sleeves].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' & '),
    sizes,
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.reviewCount) || 0,
    description: p.description || '',
    shortDescription: p.shortdescription || '',
    care: p.careInstructions || '',
    sku: p.sku || '',
    designId: p.designId ? p.designId._id || p.designId : null,
    createdAt: p.createdAt,
  };
}

// Reference lists are fetched once per session.
const memo = new Map();
const once = (key, fn) => {
  if (!memo.has(key)) memo.set(key, fn().catch((e) => { memo.delete(key); throw e; }));
  return memo.get(key);
};
const listOf = (res, ...keys) => { for (const k of keys) if (Array.isArray(res?.[k])) return res[k]; return Array.isArray(res) ? res : []; };

export const fetchCategories = (section = 'jackets') => once(`categories:${section}`, async () =>
  listOf(await api.get('/category/get-category', { params: { section }, auth: false }), 'category', 'categories')
    .map((c) => ({ id: c._id, name: String(c.name || '').trim(), code: c.code, slug: c.slug, image: uploadUrl(c.image), section: c.section || 'jackets', serial: c.serial || 0, showOnLanding: c.showOnLanding !== false }))
    .sort((a, b) => a.serial - b.serial || a.name.localeCompare(b.name)));

export const fetchCategoryCounts = () => once('category-counts', async () => (await api.get('/product/category-counts', { auth: false })).counts || []);

export const fetchMaterials = () => once('materials', async () =>
  listOf(await api.get('/property/materials', { auth: false }), 'materials', 'data').map((m) => ({ id: m._id, name: String(m.name || '').trim() })).filter((m) => m.name));

export const fetchColors = () => once('colors', async () =>
  listOf(await api.get('/property/colors', { auth: false }), 'colors', 'data')
    .filter((c) => c.isActive !== false)
    .map((c) => ({ id: c._id, name: String(c.name || '').trim(), code: c.code })).filter((c) => c.name));

/** One page of the shop. Params: page, limit, category, color, material, search, sort, minPrice, maxPrice. */
export async function fetchProducts(params = {}, signal) {
  const r = await api.get('/product/product-filters/', { params: { view: 'card', ...params }, auth: false, signal });
  return { products: (r.products || []).map(normalizeProduct), total: r.totalProducts || 0, totalPages: r.totalPages || 1, page: r.currentPage || 1 };
}

/** Picks + bestsellers for the landing page in one call (random per visit). */
export async function fetchLanding(signal) {
  const r = await api.get('/product/landing', { auth: false, signal });
  return { bestsellers: (r.bestsellers || []).map(normalizeProduct), picks: Object.fromEntries(Object.entries(r.picks || {}).map(([k, p]) => [k, p ? normalizeProduct(p) : null])) };
}
/**
 * A few real jackets (never hoodies), different on every call: the landing endpoint samples
 * each category's popular products afresh each time. One per category first, so the set is
 * varied, then in random order.
 */
export async function fetchRandomJackets(n = 4, signal) {
  const { bestsellers } = await fetchLanding(signal);
  const seenIds = new Set();
  const pool = [];
  for (const p of bestsellers) {
    const isJacket = p && p.image && p.category?.slug !== 'hoodies' && !/hood(ie|y)/i.test(p.name || '');
    if (isJacket && !seenIds.has(p.id)) { seenIds.add(p.id); pool.push(p); }
  }
  const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const seenCats = new Set();
  const first = [];
  const rest = [];
  for (const p of shuffle(pool)) {
    const cat = p.category?.slug;
    if (seenCats.has(cat)) rest.push(p);
    else { seenCats.add(cat); first.push(p); }
  }
  return shuffle([...first, ...rest].slice(0, n));
}
export const fetchProduct = async (slug, signal) => normalizeProduct((await api.get(`/product/get-product/${encodeURIComponent(slug)}`, { auth: false, signal })).product);
export const fetchRelated = async (id, categoryId, signal, limit = 4) => ((await api.get(`/product/related-product/${id}/${categoryId}`, { params: { limit }, auth: false, signal })).products || []).map(normalizeProduct);
export const fetchReviews = async (id, signal) => listOf(await api.get(`/reviews/product/${id}`, { auth: false, signal }), 'reviews', 'data');
export const fetchReviewSummary = async (id, signal) => (await api.get(`/reviews/product/${id}/summary`, { auth: false, signal })).summary || { averageRating: 0, reviewCount: 0, ratingBreakdown: {} };
export const submitReview = (id, body) => api.post(`/reviews/product/${id}`, body, { auth: false });
export const trackView = (id) => api.post(`/product/interaction/${id}/view`, undefined, { auth: false }).catch(() => {});

// The jacket builder: this repo's custom-jacket/ app, never the live one on custom.easyjackets.com.
// On localhost the local builder (npm start in custom-jacket runs on :3001); elsewhere
// VITE_CUSTOMIZER_URL, else the new deployment's builder (Coolify app, Base Directory /custom-jacket).
const NEW_CUSTOMIZER_URL = 'https://custom.145.223.75.247.sslip.io';
const onLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const CUSTOMIZER = (onLocalhost
  ? import.meta.env.VITE_LOCAL_CUSTOMIZER_URL || 'http://localhost:3001'
  : import.meta.env.VITE_CUSTOMIZER_URL || NEW_CUSTOMIZER_URL).replace(/\/$/, '');

/**
 * A builder link. `id` is the jacket category's code (the builder loads that jacket's options);
 * `design` opens a saved design as a starting point (Add to cart saves a new one); `designedit`
 * reopens the visitor's own cart design to change it in place (Update cart).
 */
export const builderUrl = ({ code, design, designedit } = {}) => {
  const url = new URL(CUSTOMIZER + '/');
  if (code) url.searchParams.set('id', code);
  if (design) url.searchParams.set('design', design);
  if (designedit) url.searchParams.set('designedit', designedit);
  return url.toString();
};
/** The builder opened on this product's own design. */
export const customizerUrl = (product) => builderUrl({ code: product?.category?.code, design: product?.designId });

/** Materials and colours the catalogue's products are actually made in (within one category when given). */
export const fetchFilterOptions = (category = '') => once(`filter-options:${category}`, async () => {
  const r = await api.get('/product/filter-options', { params: category ? { category } : {}, auth: false });
  return {
    materials: (r.materials || []).map((m) => ({ id: m.name, name: String(m.name || '').trim(), count: m.count })).filter((m) => m.name),
    colors: (r.colors || []).map((c) => ({ id: c._id, name: String(c.name || '').trim(), code: c.code, count: c.count })).filter((c) => c.name),
  };
});
