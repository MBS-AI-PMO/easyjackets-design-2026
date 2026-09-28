// helpers/productSeo.js
//
// Projects a product document into the same shape SEO Health and the sitemaps
// use for every other page. Product pages are the one page type whose SEO does
// NOT live in the `metadatas` collection — it lives on the product itself
// (`metaTitle` / `metaDescription` / `metaKeywords` / `noIndex`), because that is
// what the product editor writes and what the storefront reads.
//
// Keeping the projection here means SEO Health, the product sitemap, and the
// index-control screen all agree on what a product page's SEO actually is,
// instead of each re-deriving it slightly differently.

import productModel from '../models/productModel.js';
import Metadata from '../models/metaData.js';
import '../models/CategoryModel.js';
import '../models/color.js';

export const PRODUCT_ROUTE_PREFIX = '/product';

export const isProductRoute = (route = '') =>
  String(route || '').startsWith(`${PRODUCT_ROUTE_PREFIX}/`);

/**
 * Where does a write for this route belong — the product document, or `metadatas`?
 *
 * Mirrors the precedence `collectPages()` models and the storefront renders:
 * a Metadata row wins over a product's own fields, so once one exists for a
 * product route, that is where edits keep going. Deliberately a targeted lookup
 * rather than a `collectPages()` scan, because a save should not have to load
 * every product on the site to decide where two strings go.
 *
 * Lives here rather than in a controller because two screens now write page SEO —
 * SEO Health and Route Metadata — and they must not disagree about the target.
 */
export const resolveSaveTarget = async (route) => {
  if (!isProductRoute(route)) return { kind: 'metadata' };

  const existing = await Metadata.findOne({ route }).select('_id').lean();
  if (existing) return { kind: 'metadata' };

  // Slugs are stored Title-Cased ("Red-Satin-Bomber-Jacket") but every URL the
  // storefront emits is lowercased, so an exact match misses. Same case-insensitive
  // fallback getSingleProductController uses. Sorted by updatedAt because a handful
  // of slugs are duplicated, and this must pick the same twin the page list shows.
  const slug = route.slice(PRODUCT_ROUTE_PREFIX.length + 1);
  const product = await productModel
    .findOne({ slug: new RegExp(`^${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })
    .sort({ updatedAt: -1 })
    .select('_id')
    .lean();

  return product ? { kind: 'product', productId: product._id } : { kind: 'metadata' };
};

/** Descriptions are stored as rich text; meta tags must be plain. */
export const stripHtml = (value = '') =>
  String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const readName = (value) => {
  if (!value) return '';
  if (typeof value === 'object') return String(value.name || '').trim();
  return String(value).trim();
};

export const productRouteFor = (slug = '') =>
  `${PRODUCT_ROUTE_PREFIX}/${String(slug).trim().replace(/^\/+|\/+$/g, '').toLowerCase()}`;

/**
 * Target keywords for a product page when the admin has not set any.
 *
 * Deliberately built from the product's *attributes* (colour, material,
 * category) rather than from its full name. Deriving from the name would make
 * "keyword in title" pass automatically and tell you nothing — deriving from
 * attributes asks a real question: does this title mention the colour and
 * material a customer would actually search for?
 */
export const deriveProductKeywords = (product) => {
  const category = readName(product?.category) || 'varsity jackets';
  const color = readName(product?.color);
  const body = String(product?.material?.body || '').trim();
  const sleeves = String(product?.material?.sleeves || '').trim();
  const section = product?.category?.section === 'sports' ? 'sports and spirit wear' : 'varsity jackets';

  const terms = [
    color ? `${color} ${category}` : '',
    body ? `${body} ${category}` : '',
    sleeves && sleeves !== body ? `${sleeves} ${category}` : '',
    `custom ${category}`,
    section,
  ];

  const seen = new Set();
  return terms
    .map((term) => term.toLowerCase().replace(/\s+/g, ' ').trim())
    .filter((term) => {
      if (!term || seen.has(term)) return false;
      seen.add(term);
      return true;
    })
    .slice(0, 5)
    .join(', ');
};

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const DESC_MAX = 160;

/** Cut to a word boundary rather than mid-word, and never leave dangling punctuation. */
const trimTo = (text, max) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:—-]+$/, '');
};

const titleCase = (value = '') =>
  String(value).trim().replace(/\s+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * A meta title and description written for a search result, generated from the
 * product's own attributes.
 *
 * Exists because the imported `metaDescription` on every product is a truncated
 * copy of the spec bullet list ("Gun Metal YKK Zipper Closure Front Left Sleeve
 * Pocket..."). That is accurate but useless as a snippet: it names no product
 * category, so it matches none of the terms people search, and it opens with a
 * noun so it gives nobody a reason to click. Seven coach jackets share one
 * verbatim, which makes Google discard it and invent its own.
 *
 * Returns suggestions only — nothing here writes.
 */
export const suggestProductMeta = (product) => {
  const name = String(product?.name || '').trim();
  const category = readName(product?.category) || 'Varsity Jackets';
  const colour = readName(product?.color);
  const body = String(product?.material?.body || '').trim();
  const sleeves = String(product?.material?.sleeves || '').trim();

  const categoryLower = category.toLowerCase();
  const nameLower = name.toLowerCase();

  // ── Title ──
  // Start from the title the page already uses, not from the raw product name.
  // Several products carry a hand-written metaTitle that is richer than the name
  // ("…Varsity Letterman Jacket Leather Sleeves" vs "Custom Sports Letterman
  // Jacket"), and rebuilding from the name would throw that work away. Only the
  // length is corrected: too short loses qualifying keywords, too long gets
  // truncated by Google mid-phrase.
  const currentTitle = stripHtml(product?.metaTitle) || name;
  let title = currentTitle;

  // The head noun is the last word of the category — "Jackets" -> "jacket". That
  // is the word every derived keyword ends in, so it is the one that must survive
  // both lengthening and trimming.
  const headNoun = (categoryLower.split(/\s+/).pop() || 'jacket').replace(/s$/, '');

  if (title.length < TITLE_MIN) {
    // Only append the category when the title does not already say it, otherwise
    // "Pink Line Jacket - Custom Line Jackets" reads like a stutter.
    const suffix = title.toLowerCase().includes(categoryLower.replace(/s$/, ''))
      ? 'Custom Made to Order'
      : `Custom ${category}`;
    title = `${title} - ${suffix}`;
  }
  if (title.length < TITLE_MIN) title = `${title}, Any Size`;

  if (title.length > TITLE_MAX) {
    // Blind truncation cuts from the end, which is exactly where "…Varsity
    // Jacket" lives — so trimming a long title would silently delete the words the
    // page ranks for. Every significant word of the category has to survive, not
    // just the head noun: "…Leather Jacket" satisfies nothing when the keyword is
    // "varsity jackets".
    const categorySingular = category.replace(/s$/, '');
    const needed = categorySingular.toLowerCase().split(/\s+/).filter((word) => word.length > 2);
    const trimmed = trimTo(title, TITLE_MAX);

    if (needed.every((word) => trimmed.toLowerCase().includes(word))) {
      title = trimmed;
    } else {
      const suffix = ` ${categorySingular}`;
      let core = trimTo(title, Math.max(1, TITLE_MAX - suffix.length));
      // Drop trailing fragments of the category so re-appending it cannot produce
      // "…Varsity Varsity Jacket".
      const trailing = new RegExp(`(\\s+(${needed.join('|')}))+$`, 'i');
      core = core.replace(trailing, '').replace(/[\s,;:—-]+$/, '');
      title = `${core}${suffix}`;
    }
  }
  if (title.length > TITLE_MAX) title = trimTo(title, TITLE_MAX);

  // ── Description ──
  // Opens with a verb so it reads as an invitation, names the colour + category
  // so it carries the terms the page targets, and ends on what makes the product
  // orderable. The product name keeps it unique across the catalogue.
  const material = body && sleeves && body !== sleeves
    ? `${body.toLowerCase()} body with ${sleeves.toLowerCase()} sleeves`
    : (body || sleeves).toLowerCase();

  const focus = colour
    ? `${colour.toLowerCase()} ${categoryLower}`
    : `custom ${categoryLower}`;

  const opening = `Shop the ${name} at Easy Jackets.`;
  const middle = material
    ? ` Custom ${focus} in ${material},`
    : ` Custom ${focus},`;
  const closing = ' made to order with embroidery, patches, and sizes XS to 5XL.';

  let description = `${opening}${middle}${closing}`;

  if (description.length > DESC_MAX) {
    // Shed the least valuable clause first — the material detail — before the
    // call to action or the keyword phrase.
    description = `${opening} Custom ${focus},${closing}`;
  }
  if (description.length > DESC_MAX) {
    description = `${trimTo(opening, DESC_MAX - closing.length - 1)}${closing}`;
  }

  return {
    title: title.trim(),
    description: description.replace(/\s+/g, ' ').trim(),
    keywords: deriveProductKeywords(product),
  };
};

/** A product's meta description, following the same fallback chain the storefront uses. */
export const deriveProductDescription = (product) =>
  stripHtml(product?.metaDescription)
  || stripHtml(product?.shortdescription)
  || stripHtml(product?.description);

/**
 * One product → one page record, in the shape `collectPages()` returns.
 *
 * `source: 'product'` is what tells the save path to write back to the product
 * document instead of creating a metadata row that would silently shadow it.
 */
export const productSeoPage = (product) => {
  const keywords = String(product?.metaKeywords || '').trim();
  const derivedKeywords = keywords ? '' : deriveProductKeywords(product);

  return {
    route: productRouteFor(product.slug),
    title: stripHtml(product?.metaTitle) || String(product?.name || '').trim(),
    description: deriveProductDescription(product),
    keywords: keywords || derivedKeywords,
    keywordsDerived: Boolean(derivedKeywords),
    ogImage: String(product?.ogImage || product?.frontImage || '').trim(),
    noIndex: product?.noIndex === true,
    // Product pages are always in the product sitemap unless noindexed —
    // there is no per-product sitemap toggle, and adding one would give two
    // controls for the same outcome.
    sitemapEnabled: product?.noIndex !== true,
    sitemapOrder: 300,
    sitemapPriority: 0.7,
    sitemapChangefreq: 'weekly',
    routeType: 'Product Page',
    source: 'product',
    saveTarget: 'product',
    productId: String(product._id),
    productName: String(product?.name || '').trim(),
    hasMetadata: Boolean(stripHtml(product?.metaTitle) && stripHtml(product?.metaDescription)),
    updatedAt: product?.updatedAt || null,
  };
};

// Only the fields the projection reads — products carry a lot of design data.
// `category` and `color` must stay in the list or their populate() calls resolve
// to null, which would silently empty every derived keyword set.
const SEO_PROJECTION = 'slug name metaTitle metaDescription metaKeywords noIndex ogImage frontImage shortdescription description material category color updatedAt';

export const ACTIVE_PRODUCT_FILTER = {
  isActive: { $ne: false },
  slug: { $exists: true, $nin: ['', null] },
};

/** Every live product as a page record. Rebuilt per call, so a new product appears immediately. */
export const fetchProductSeoPages = async () => {
  const products = await productModel
    .find(ACTIVE_PRODUCT_FILTER)
    .populate('category', 'name section')
    .populate('color', 'name')
    .select(SEO_PROJECTION)
    .lean();

  return dedupeByRoute(products.map(productSeoPage));
};

/**
 * Two products can carry the same slug — `unique: true` is declared on the schema
 * but no unique index was ever built on the collection, so nothing enforces it.
 * Only one of the pair is reachable at that URL, and listing both would put a
 * duplicate <loc> in the sitemap. The most recently updated one wins, which is
 * the one an admin editing the pair would expect to survive.
 */
export const dedupeByRoute = (pages) => {
  const byRoute = new Map();
  const collisions = [];

  pages.forEach((page) => {
    const existing = byRoute.get(page.route);
    if (!existing) {
      byRoute.set(page.route, page);
      return;
    }
    collisions.push(page.route);
    const keepNew = new Date(page.updatedAt || 0) > new Date(existing.updatedAt || 0);
    byRoute.set(page.route, keepNew ? page : existing);
  });

  if (collisions.length) {
    console.warn(
      `productSeo: ${collisions.length} duplicate product slug(s) skipped — ${[...new Set(collisions)].join(', ')}`
    );
  }

  return [...byRoute.values()];
};
