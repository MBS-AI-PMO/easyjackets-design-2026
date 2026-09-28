// Editorial content the admin manages: top bar, blog posts, page FAQs, reviews.
import { api, uploadUrl } from './api';
import { stripHtml } from './html';

const listOf = (res, ...keys) => { for (const k of keys) if (Array.isArray(res?.[k])) return res[k]; return Array.isArray(res) ? res : []; };

export const fetchTopBar = async (signal) => {
  const r = await api.get('/features/top-bar', { auth: false, signal });
  const text = String(r?.topBar?.text || '').trim();
  return text ? { text } : null;
};

export function normalizeBlog(b) {
  if (!b) return null;
  return {
    id: b._id,
    slug: b.slug,
    title: b.title,
    excerpt: stripHtml(b.excerpt || ''),
    image: uploadUrl(b.image),
    category: b.category || '',
    categoryColor: b.categoryColor || '',
    author: b.author || '',
    readTime: b.readTime ? `${b.readTime} min` : '',
    featured: !!b.featured,
    date: b.createdAt,
    dateLabel: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
  };
}
export const fetchRecentBlogs = async (limit = 3, signal) =>
  listOf(await api.get('/features/blogs/recent', { auth: false, signal }), 'blogs').map(normalizeBlog).filter(Boolean).slice(0, limit);

/** Every published post, newest first. */
export const fetchBlogs = async (signal) =>
  listOf(await api.get('/features/blogs', { params: { limit: 200 }, auth: false, signal }), 'blogs')
    .filter((b) => b.isActive !== false)
    .map(normalizeBlog)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

/** One post with its body. */
export const fetchBlog = async (slug, signal) => {
  const r = await api.get(`/features/blogs/slug/${encodeURIComponent(slug)}`, { auth: false, signal });
  const b = r?.blog;
  return b ? { ...normalizeBlog(b), content: b.content || '' } : null;
};

/**
 * FAQs the admin attaches to a page in the Storefront FAQs screen — the same
 * source the live site reads. `pageKey` is a storefront route ("/" is the
 * landing page, "/faq", "/bulk-order", …) or a template name
 * ("product-template", "catalog-template") whose questions carry
 * {placeholders}. Answers are the editor's HTML, sanitised where rendered.
 * Read-only; one request per key per session.
 */
const faqCache = new Map();
export const fetchPageFaqs = (pageKey = '/') => {
  if (!faqCache.has(pageKey)) {
    faqCache.set(pageKey, api.get('/features/page-faqs', { params: { pageKey }, auth: false })
      .then((r) => (Array.isArray(r?.faqs) ? r.faqs : []).map((f) => ({ id: f._id, q: f.question, a: f.answer || '', points: f.points || [], category: f.category || '' })))
      .catch((error) => { faqCache.delete(pageKey); throw error; }));
  }
  return faqCache.get(pageKey);
};
/** Replace {token} placeholders; an unknown token stays visible rather than blanking. */
export const applyFaqTemplate = (text = '', values = {}) =>
  String(text || '').replace(/\{(\w+)\}/g, (match, token) => (Object.prototype.hasOwnProperty.call(values, token) ? String(values[token] ?? '') : match));
/** FAQs for a page: the first key with questions wins (a category's own list before the catalog template), placeholders filled. */
export const fetchFaqsFor = async (pageKeys, values) => {
  for (const key of (pageKeys || []).filter(Boolean)) {
    const list = await fetchPageFaqs(key);
    if (list.length) return values ? list.map((f) => ({ ...f, q: applyFaqTemplate(f.q, values), a: applyFaqTemplate(f.a, values) })) : list;
  }
  return [];
};

export const fetchFeaturedReviews = async (limit = 3, signal) => {
  const r = await api.get('/reviews/featured', { params: { limit }, auth: false, signal });
  return {
    reviews: listOf(r, 'reviews').map((x) => ({
      id: x._id,
      name: x.name,
      initial: String(x.name || '?').trim().charAt(0).toUpperCase(),
      rating: x.rating,
      title: x.title,
      quote: x.comment,
      product: x.product ? { name: x.product.name, slug: x.product.slug } : null,
      date: x.createdAt,
    })),
    total: r?.total || 0,
    averageRating: r?.averageRating || 0,
  };
};

/** Which patch/lettering techniques a photo caption mentions (the landing tiles and the Embroidery & Patches chips key on these). */
export const patchTags = (caption = '') => {
  const t = [];
  if (/chenille|letterman|varsity|college/i.test(caption)) t.push('Chenille'); // varsity/letterman jackets carry chenille letters
  if (/patch|logo|crest/i.test(caption)) t.push('Patches');
  if (/embroider/i.test(caption)) t.push('Embroidery');
  if (/sublimat|print/i.test(caption)) t.push('Printed');
  if (/rhinestone|glitter/i.test(caption)) t.push('Rhinestone');
  if (/\bname|number|year\b/i.test(caption)) t.push('Names & numbers');
  return t.length ? t : ['Patches'];
};

/** Customer photos the admin curates in the Gallery. */
export const fetchGallery = async (signal) =>
  listOf(await api.get('/gallery', { auth: false, signal }), 'data', 'gallery')
    .filter((g) => g.isActive !== false && (g.imageUrl || g.imageUrls?.[0]))
    .map((g) => ({ id: g._id, image: uploadUrl(g.imageUrl || g.imageUrls[0]), images: (g.imageUrls || []).map(uploadUrl), caption: String(g.description || '').trim(), date: g.createdAt }));

/** Patch and lettering photos the admin manages in Embroidery & Patches (tags = techniques shown). */
export const fetchPatchPhotos = async (signal) =>
  listOf(await api.get('/patches', { params: { limit: 200 }, auth: false, signal }), 'data')
    .filter((g) => g.isActive !== false && (g.imageUrl || g.imageUrls?.[0]))
    .map((g) => ({ id: g._id, image: uploadUrl(g.imageUrl || g.imageUrls[0]), images: (g.imageUrls || []).map(uploadUrl), caption: String(g.description || '').trim(), tags: Array.isArray(g.tags) && g.tags.length ? g.tags : patchTags(g.description), date: g.createdAt }));

/** Fabric colour sections (Melton Wool, Cowhide Leather…) with their swatch photos. */
export const fetchFabricSections = async (signal) => {
  const r = await api.get('/fabric-colors', { auth: false, signal });
  // browsers do not all decode .jfif/.bmp, so a tile prefers a swatch in a web format
  const webImage = (u) => /\.(webp|jpe?g|png|avif)(\?|$)/i.test(u || '');
  const swatches = listOf(r, 'data').filter((c) => c.isActive !== false).map((c) => ({ id: c._id, name: c.name, group: c.group, image: uploadUrl(c.imageUrl), alt: c.altText || c.name, order: c.sortOrder || 0 })).sort((a, b) => (webImage(b.image) - webImage(a.image)) || a.order - b.order);
  return listOf(r, 'sections').filter((s) => s.isActive !== false).map((s) => ({
    id: s._id,
    key: s.key,
    title: s.title,
    name: String(s.eyebrow || s.title || '').replace(/\s*(collection|colors)\s*$/i, '').trim(),
    description: s.description || '',
    order: s.sortOrder || 0,
    swatches: swatches.filter((c) => c.group === s.key && c.image),
    // for a tile: only swatches in a format browsers decode (the .jfif ones also 404 on the server)
    tileSwatches: swatches.filter((c) => c.group === s.key && c.image && webImage(c.image)),
    colorCount: swatches.filter((c) => c.group === s.key).length,
  })).sort((a, b) => a.order - b.order);
};
