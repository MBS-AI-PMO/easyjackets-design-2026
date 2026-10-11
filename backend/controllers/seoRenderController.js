import Metadata from '../models/metaData.js';
import productModel from '../models/productModel.js';
import Blog from '../models/blogs.js';
import ProductReview from '../models/productReviewModel.js';
import PageFaq from '../models/pageFaq.js';
import CategoryModel from '../models/CategoryModel.js';
import '../models/color.js';
import Website from '../models/websiteModal.js';
import ShippingRate from '../models/shippingRateModel.js';
import { buildRequiredMetadataRoutes, normalizeRoute } from './metaDataController.js';
import { KEYWORD_LANDING_FAQ_DEFAULTS } from '../data/keywordLandingFaqDefaults.js';
import { priceProduct } from '../helpers/cartPricing.js';
import { escapeHtml, faqHtml, linkList, sanitizeArticleHtml } from '../helpers/ssrHtml.js';
import { slugIgnoringApostrophes, stripApostrophes } from '../helpers/slugMatch.js';

// Everything the storefront server writes into a page's HTML before sending it (storefront server.mjs):
// title, description, canonical, robots, Open Graph and schema, plus `content` — the page's main text as
// plain HTML for crawlers and AI answer engines that do not run JavaScript — and `known` (false when no
// page or metadata exists for the address, which the server answers as a 404 where it should).

const SITE_URL = 'https://easyjackets.com';
const SITE_NAME = 'Easy Jackets';
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/social-card.jpg`;
const LOGO_URL = `${SITE_URL}/logo.webp`;

const PRODUCT_PREFIX = '/product/';
const BLOG_PREFIX = '/new-blog/';

const cleanText = (value = '') =>
  String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();

const stripSiteName = (value = '') =>
  cleanText(value).replace(/\s*[-|]\s*Easy\s*Jackets?$/i, '').trim();

const absoluteUrl = (value = '') => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${SITE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
};

const slugify = (value = '') => String(value).trim().toLowerCase().replace(/&/g, ' and ').replace(/\//g, '-')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const titleCase = (value = '') => String(value).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

const productRouteFor = (slug = '') =>
  `/product/${stripApostrophes(String(slug || '').trim().replace(/^\/+|\/+$/g, '')).toLowerCase()}`;

const money = (value) => `$${Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/** A loader whose answer is kept for `ttlMs` (the last good answer is reused if a refresh fails). */
const cached = (ttlMs, load) => {
  let value;
  let at = 0;
  let pending = null;
  return async () => {
    if (value !== undefined && Date.now() - at < ttlMs) return value;
    if (!pending) {
      pending = load()
        .then((next) => { value = next; at = Date.now(); pending = null; return next; })
        .catch((error) => { pending = null; if (value !== undefined) return value; throw error; });
    }
    return pending;
  };
};

// ── Organization and WebSite (every page) ────────────────────────────────────

// The admin's Settings → Website (contact information and social profiles) drives the Organization
// schema, so the site footer, the Contact page and the schema always show the same details (B-S2, P-2).
const siteDetails = cached(5 * 60 * 1000, async () => Website.findOne().sort({ updatedAt: -1 }).lean());

const FALLBACK_FACEBOOK = 'https://www.facebook.com/easyjackets';

const profileUrl = (raw = '') => {
  try {
    const url = new URL(String(raw).trim());
    if (!/^https?:$/.test(url.protocol)) return '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
};

/** The business's own profiles: tracking parameters removed; a share link or a person's LinkedIn is not one. */
const organizationProfiles = (site) => {
  const links = site?.socialLinks || {};
  const on = site?.isActive || {};
  return ['instagram', 'facebook', 'twitter', 'linkedin']
    .map((network) => {
      if (on[network] === false) return '';
      const url = profileUrl(links[network]);
      if (!url) return '';
      if (/facebook\.com\/share\//i.test(url)) return FALLBACK_FACEBOOK;
      if (/linkedin\.com\/in\//i.test(url)) return '';
      return url;
    })
    .filter((url, index, all) => url && all.indexOf(url) === index);
};

const ADDRESS_LABEL = /\b(office|address|factory|workshop|warehouse|headquarters)\b/i;

/** "USA office\nEasy Jackets\n5900 BALCONES AUSTIN TX 78731" → a PostalAddress. */
const postalAddress = (text = '') => {
  const lines = String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    .filter((line) => !ADDRESS_LABEL.test(line) && !/^easy\s*jackets?$/i.test(line));
  if (!lines.length) return null;
  const joined = lines.join(', ');
  const us = joined.match(/^(.*\S)\s*,?\s+([A-Za-z.'-]+)\s*,?\s+([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/);
  if (us) {
    return { '@type': 'PostalAddress', streetAddress: titleCase(us[1]), addressLocality: titleCase(us[2]), addressRegion: us[3], postalCode: us[4], addressCountry: 'US' };
  }
  if (/sialkot/i.test(joined)) return { '@type': 'PostalAddress', streetAddress: joined, addressLocality: 'Sialkot', addressCountry: 'PK' };
  return { '@type': 'PostalAddress', streetAddress: joined };
};

const globalSchemas = (site) => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: LOGO_URL },
    email: site?.email,
    telephone: site?.phoneNumber,
    contactPoint: site?.email || site?.phoneNumber
      ? [{ '@type': 'ContactPoint', contactType: 'customer service', email: site?.email, telephone: site?.phoneNumber, availableLanguage: ['English'] }]
      : undefined,
    address: [postalAddress(site?.address1), postalAddress(site?.address)].filter(Boolean),
    sameAs: organizationProfiles(site),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': `${SITE_URL}/#organization` },
    // the shop's search box reads ?q= (N-S2)
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  },
];

const breadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.item),
  })),
});

const breadcrumbHtml = (items = []) => `<nav aria-label="Breadcrumb"><ol>${items
  .map((item, index) => (index === items.length - 1
    ? `<li aria-current="page">${escapeHtml(item.name)}</li>`
    : `<li><a href="${escapeHtml(item.item)}">${escapeHtml(item.name)}</a></li>`))
  .join('')}</ol></nav>`;

const faqSchema = (faqs = []) => {
  const mainEntity = faqs
    .filter((faq) => faq?.question && faq?.answer)
    .map((faq) => ({
      '@type': 'Question',
      name: cleanText(faq.question),
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(faq.answer),
      },
    }));

  if (!mainEntity.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
};

const pageFaqsForRoute = async (route, limit = 5) => {
  const faqs = await PageFaq.find({ pageKey: route, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .limit(limit)
    .lean();

  if (faqs.length) return faqs;
  return KEYWORD_LANDING_FAQ_DEFAULTS
    .filter((faq) => faq.pageKey === route && faq.isActive !== false)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .slice(0, limit);
};

const compact = (value) => {
  if (Array.isArray(value)) return value.map(compact).filter((item) => item !== undefined && item !== null);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value).reduce((acc, [key, next]) => {
    if (next === undefined || next === null || next === '') return acc;
    if (Array.isArray(next) && next.length === 0) return acc;
    acc[key] = compact(next);
    return acc;
  }, {});
};

const basePayload = ({
  route,
  title,
  description,
  keywords = '',
  h1 = '',
  canonicalPath = route,
  image = '',
  imageAlt = 'Easy Jackets custom varsity jackets',
  type = 'website',
  noIndex = false,
  jsonLd = [],
  globals = [],
  content = '',
  preloadImage = '',
  known = true,
}) => {
  const cleanTitle = stripSiteName(title) || SITE_NAME;
  // the brand goes on every title that stays within 65 characters with it (the storefront's withBrand)
  const branded = `${cleanTitle} | ${SITE_NAME}`;
  const fullTitle = cleanTitle === SITE_NAME || /easy\s*jackets?\b/i.test(cleanTitle) ? cleanTitle : branded.length <= 65 ? branded : cleanTitle;
  const canonical = normalizeRoute(canonicalPath || route || '/');

  return {
    route: normalizeRoute(route || canonical),
    title: cleanTitle,
    fullTitle,
    description: cleanText(description),
    keywords: cleanText(keywords),
    h1: cleanText(h1) || cleanTitle,
    canonicalPath: canonical,
    canonicalUrl: absoluteUrl(canonical),
    image: absoluteUrl(image || DEFAULT_SOCIAL_IMAGE),
    imageAlt: cleanText(imageAlt) || 'Easy Jackets custom varsity jackets',
    type,
    noIndex: noIndex === true,
    jsonLd: compact([...globals, ...jsonLd]),
    content,
    preloadImage: preloadImage ? absoluteUrl(preloadImage) : '',
    known,
  };
};

const metadataForRoute = async (route) => {
  const normalized = normalizeRoute(route);
  const withoutSlash = normalized.startsWith('/') ? normalized.slice(1) : normalized;

  const existing = await Metadata.findOne({
    $or: [
      { route: normalized },
      { route: withoutSlash },
      { route: normalized.startsWith('/') ? normalized : `/${normalized}` },
    ],
  }).lean();

  if (existing) return existing;

  const generated = await buildRequiredMetadataRoutes();
  return generated.find((entry) => entry.route === normalized) || null;
};

// ── Products ─────────────────────────────────────────────────────────────────

// Settings → Shipping rates and the Shipping & Returns page: one jacket ships to the US for the first US
// tier's rate (DHL Express / FedEx, 4–5 business days after 10–12 business days of production). Returns: the
// live site's terms, within 10 days of delivery at the customer's cost with a restocking fee; custom-made
// jackets are final sale (B-S1).
const shippingRates = cached(5 * 60 * 1000, async () => ShippingRate.findOne({ key: 'default' }).lean());

const firstTierRate = (tiers = [], fallback = 0) => {
  const one = (tiers || []).find((tier) => Number(tier.minQty) <= 1 && (tier.maxQty == null || Number(tier.maxQty) >= 1));
  return Number(one?.rate ?? fallback) || 0;
};

const shippingDetailsSchema = (rates) => {
  if (!rates || rates.enabled === false) return undefined;
  const days = (min, max) => ({ '@type': 'QuantitativeValue', minValue: min, maxValue: max, unitCode: 'DAY' });
  const delivery = (transitMin, transitMax) => ({
    '@type': 'ShippingDeliveryTime',
    handlingTime: days(10, 12),
    transitTime: days(transitMin, transitMax),
    businessDays: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['https://schema.org/Monday', 'https://schema.org/Tuesday', 'https://schema.org/Wednesday', 'https://schema.org/Thursday', 'https://schema.org/Friday'],
    },
  });
  return [
    {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: firstTierRate(rates.usaTiers, rates.usaFallbackRate).toFixed(2), currency: 'USD' },
      shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
      deliveryTime: delivery(4, 5),
    },
  ];
};

const RETURN_POLICY = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'US',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 10,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  merchantReturnLink: `${SITE_URL}/return-policy`,
};

/**
 * A short product code for the schema. Products store a generated value made of the name plus random
 * letters ("All Black Letterman Jacket Leather SleevesBtF8OiY"); only the random part identifies it.
 */
const schemaSku = (product) => {
  const raw = String(product?.sku || '').trim();
  const name = String(product?.name || '').trim();
  const tail = raw && name && raw.startsWith(name) ? raw.slice(name.length).trim() : '';
  if (/^[A-Za-z0-9_-]{4,16}$/.test(tail)) return `EJ-${tail.toUpperCase()}`;
  if (/^[A-Za-z0-9_-]{2,30}$/.test(raw)) return raw.toUpperCase();
  return `EJ-${String(product?._id || '').slice(-8).toUpperCase()}`;
};

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'M/TALL', 'L', 'L/TALL', 'XL', 'XL/TALL', '2XL', '2XL/TALL', '3XL', '3XL/TALL', '4XL', '5XL', '6XL'];

/** The sizes a product is sold in, each at the price the checkout charges for it. */
const sizePrices = (product) => {
  const seen = new Set();
  const sizes = (product?.sizes || [])
    .filter((entry) => entry?.size)
    .map((entry) => String(entry.size).trim().toUpperCase())
    .filter((size) => (seen.has(size) ? false : seen.add(size)))
    .sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a); const ib = SIZE_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((size) => ({ size, price: priceProduct(product, size) }))
    .filter((entry) => entry.price > 0);
  if (sizes.length) return sizes;
  const price = priceProduct(product);
  return price > 0 ? [{ size: '', price }] : [];
};

const categoryPath = (category) => (category?.slug || category?.name
  ? `${category?.section === 'sports' ? '/sports-spirit-wears' : '/shop'}/category/${slugify(category.slug || category.name)}`
  : '/shop');

const productSeo = async (route, globals) => {
  const raw = route.slice(PRODUCT_PREFIX.length);
  let slug = raw;
  try { slug = decodeURIComponent(raw); } catch { /* keep it as sent */ }
  const product = await productModel
    .findOne({ slug: slugIgnoringApostrophes(slug) })
    .sort({ updatedAt: -1 })
    .populate('category', 'name section slug')
    .populate('color', 'name')
    .lean();

  if (!product) return null;

  let canonicalPath = productRouteFor(product.slug || slug);
  // a "-2" copy of a product with the same name points at the original, so the pair counts as one page (B-O1)
  const copyOf = /^(.+)-\d+$/.exec(String(product.slug || ''));
  if (copyOf) {
    const original = await productModel.findOne({ slug: slugIgnoringApostrophes(copyOf[1]), isActive: { $ne: false } }).select('slug name').lean();
    if (original && cleanText(original.name).toLowerCase() === cleanText(product.name).toLowerCase()) canonicalPath = productRouteFor(original.slug);
  }
  // " - Custom Made to Order" (added to stored titles by an old backfill) pushed 50 product titles past 65
  // characters; it is dropped here, the description says it (SEO audit L-O2)
  const title = String(product.metaTitle || product.name || '').replace(/\s*[-–|]\s*Custom Made to Order\s*$/i, '') || product.name;
  const description = product.metaDescription || product.shortdescription || product.description || product.name;
  const image = product.ogImage || product.frontImage || DEFAULT_SOCIAL_IMAGE;
  const productName = cleanText(product.name);
  const reviews = await ProductReview.find({ product: product._id, status: 'approved' })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  const reviewCount = await ProductReview.countDocuments({ product: product._id, status: 'approved' });
  const ratingAgg = reviewCount
    ? await ProductReview.aggregate([
      { $match: { product: product._id, status: 'approved' } },
      { $group: { _id: '$product', averageRating: { $avg: '$rating' } } },
    ])
    : [];
  const averageRating = Number(ratingAgg?.[0]?.averageRating || 0);

  const sku = schemaSku(product);
  const prices = sizePrices(product);
  const shippingDetails = shippingDetailsSchema(await shippingRates().catch(() => null));
  const availability = product.isActive === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock';
  const priceValidUntil = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
  // One Offer per size: each size has its own price, so a single "from" price misstated most of them (B-S1).
  const offers = prices.map(({ size, price }) => ({
    '@type': 'Offer',
    name: size ? `${productName}, size ${size}` : productName,
    sku: size ? `${sku}-${size.replace(/\//g, '')}` : sku,
    url: absoluteUrl(canonicalPath),
    priceCurrency: 'USD',
    price: price.toFixed(2),
    priceValidUntil,
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': `${SITE_URL}/#organization` },
    shippingDetails,
    hasMerchantReturnPolicy: RETURN_POLICY,
  }));

  const category = product.category;
  const crumbs = [
    { name: 'Home', item: '/' },
    { name: category?.name || 'Shop', item: categoryPath(category) },
    { name: productName, item: canonicalPath },
  ];

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: [product.frontImage, ...(product.otherImages || [])].filter(Boolean).map(absoluteUrl),
    description: cleanText(product.shortdescription || product.description || description),
    sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    color: product.color?.name,
    material: [product.material?.body, product.material?.sleeves].filter(Boolean).join(' / '),
    category: category?.name,
    offers: offers.length === 1 ? offers[0] : offers,
  };

  // Ratings only from approved reviews; the imported sample reviews are all pending (P-1).
  if (reviewCount > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
    productSchema.review = reviews.map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1',
      },
      author: { '@type': 'Person', name: review.name || 'Easy Jackets customer' },
      datePublished: review.createdAt,
      name: review.title || `${productName} review`,
      reviewBody: review.comment,
    }));
  }

  const low = prices.length ? Math.min(...prices.map((p) => p.price)) : 0;
  const high = prices.length ? Math.max(...prices.map((p) => p.price)) : 0;
  const specs = [
    product.material?.body && ['Body', product.material.body],
    product.material?.sleeves && ['Sleeves', product.material.sleeves],
    product.color?.name && ['Colour', product.color.name],
    category?.name && ['Style', category.name],
    prices.length > 1 && ['Sizes', `${prices[0].size} to ${prices[prices.length - 1].size}`],
  ].filter(Boolean);
  const longText = sanitizeArticleHtml(product.description || '');
  const content = [
    breadcrumbHtml(crumbs),
    `<h1>${escapeHtml(productName)}</h1>`,
    low ? `<p><strong>${low === high ? money(low) : `${money(low)} – ${money(high)}`}</strong> USD${prices.length > 1 ? ', depending on size' : ''}. Made to order; ships to the US in 4–5 business days after production.</p>` : '',
    product.shortdescription ? `<p>${escapeHtml(cleanText(product.shortdescription))}</p>` : '',
    specs.length ? `<ul>${specs.map(([label, value]) => `<li><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</li>`).join('')}</ul>` : '',
    longText ? `<section>${longText}</section>` : '',
    linkList([
      { href: categoryPath(category), label: `More ${category?.name || 'jackets'}` },
      { href: '/design-custom-jacket', label: 'Design your own jacket' },
      { href: '/sizechart', label: 'Size chart' },
      { href: '/shipping', label: 'Shipping & returns' },
    ]),
  ].filter(Boolean).join('\n');

  return basePayload({
    route,
    title,
    description,
    keywords: product.metaKeywords,
    canonicalPath,
    image,
    imageAlt: product.imageAlt || productName,
    type: 'product',
    noIndex: product.noIndex === true,
    globals,
    jsonLd: [productSchema, breadcrumbSchema(crumbs)],
    content,
    preloadImage: product.frontImage || '',
  });
};

// ── Blog posts ───────────────────────────────────────────────────────────────

const blogSeo = async (route, globals) => {
  const slug = route.slice(BLOG_PREFIX.length);
  const blog = await Blog.findOne({ slug, isActive: true }).lean();
  if (!blog) return null;

  const canonicalPath = `/new-blog/${blog.slug || slug}`;
  // the post's own SEO entry (admin SEO screen) when it has one: a shorter title than the headline (N-O2)
  const meta = await Metadata.findOne({ route: canonicalPath }).select('title description noIndex').lean();
  const description = meta?.description || blog.excerpt || blog.title;
  const title = meta?.title || blog.title;
  const crumbs = [
    { name: 'Home', item: '/' },
    { name: 'Blog', item: '/new-blog' },
    { name: blog.title, item: canonicalPath },
  ];
  const published = blog.createdAt ? new Date(blog.createdAt) : null;

  return basePayload({
    route,
    title,
    description,
    canonicalPath,
    image: blog.image,
    imageAlt: blog.title,
    type: 'article',
    noIndex: meta?.noIndex === true,
    globals,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: cleanText(blog.title),
        description: cleanText(description),
        image: blog.image ? [absoluteUrl(blog.image)] : undefined,
        author: blog.author && !/^easy\s*jackets?$/i.test(blog.author)
          ? { '@type': 'Person', name: blog.author }
          : { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@id': `${SITE_URL}/#organization` },
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      breadcrumbSchema(crumbs),
    ],
    content: [
      breadcrumbHtml(crumbs),
      `<article><h1>${escapeHtml(cleanText(blog.title))}</h1>`,
      published && !Number.isNaN(published.getTime())
        ? `<p>By ${escapeHtml(blog.author || SITE_NAME)} · <time datetime="${published.toISOString().slice(0, 10)}">${published.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></p>`
        : '',
      blog.excerpt ? `<p><strong>${escapeHtml(cleanText(blog.excerpt))}</strong></p>` : '',
      sanitizeArticleHtml(blog.content),
      '</article>',
    ].filter(Boolean).join('\n'),
    preloadImage: blog.image || '',
  });
};

// ── Static, landing and collection pages ─────────────────────────────────────

const MAIN_LINKS = [
  { href: '/shop', label: 'Shop all jackets' },
  { href: '/shop/category/varsity-jackets', label: 'Custom varsity jackets' },
  { href: '/letterman-jackets', label: 'Custom letterman jackets' },
  { href: '/shop/category/bomber-jackets', label: 'Custom bomber jackets' },
  { href: '/shop/category/coach-jackets', label: 'Custom coach jackets' },
  { href: '/shop/category/hoodies', label: 'Custom hoodies' },
  { href: '/design-custom-jacket', label: 'Design your own jacket' },
  { href: '/bulk-order', label: 'Team and bulk orders' },
  { href: '/embroidery-and-patches', label: 'Chenille patches and embroidery' },
  { href: '/sizechart', label: 'Size chart' },
  { href: '/faq', label: 'Questions and answers' },
];

const homeCategories = cached(5 * 60 * 1000, async () => CategoryModel.find({}).select('name slug section').sort({ name: 1 }).lean());

const staticSeo = async (route, globals) => {
  const metadata = await metadataForRoute(route);
  if (!metadata) {
    return basePayload({
      route,
      title: 'Easy Jackets',
      description: 'Design and shop premium custom varsity jackets and letterman jackets from Easy Jackets.',
      canonicalPath: route,
      noIndex: true,
      globals,
      known: false,
    });
  }

  const pageRoute = normalizeRoute(metadata.route || route);
  // Every active question, as the page itself lists them (usePageFaqs): the text and the FAQPage schema then
  // match what a visitor sees, and the app leaves its own copy of the schema out (SEO audit B-S3).
  const pageFaqs = await pageFaqsForRoute(pageRoute, 100);
  const h1 = cleanText(metadata.h1 || metadata.title || SITE_NAME);
  const crumbs = [{ name: 'Home', item: '/' }, { name: h1 || 'Page', item: pageRoute }];

  let links = [];
  if (pageRoute === '/') {
    const categories = await homeCategories().catch(() => []);
    links = [
      ...MAIN_LINKS,
      ...categories
        .filter((c) => c?.name && !MAIN_LINKS.some((l) => l.href.endsWith(`/${slugify(c.slug || c.name)}`)))
        .map((c) => ({ href: categoryPath(c), label: c.name })),
    ];
  } else if (!/^\/(shop|sports-spirit-wears)(\/|$)/.test(pageRoute)) {
    links = MAIN_LINKS.filter((l) => l.href !== pageRoute).slice(0, 6);
  }

  const content = [
    pageRoute === '/' ? '' : breadcrumbHtml(crumbs),
    `<h1>${escapeHtml(h1)}</h1>`,
    metadata.description ? `<p>${escapeHtml(cleanText(metadata.description))}</p>` : '',
    faqHtml(pageFaqs),
    linkList(links, pageRoute === '/' ? 'Shop and design' : 'More from Easy Jackets'),
  ].filter(Boolean).join('\n');

  return basePayload({
    route,
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    h1: metadata.h1,
    canonicalPath: pageRoute,
    image: metadata.ogImage,
    noIndex: metadata.noIndex === true,
    globals,
    jsonLd: pageRoute === '/'
      ? [faqSchema(pageFaqs)]
      : [breadcrumbSchema(crumbs), faqSchema(pageFaqs)],
    content,
  });
};

export const getSeoRenderController = async (req, res) => {
  try {
    const route = normalizeRoute(req.query.path || '/');
    const globals = globalSchemas(await siteDetails().catch(() => null));
    const seo = route.startsWith(PRODUCT_PREFIX)
      ? await productSeo(route, globals)
      : route.startsWith(BLOG_PREFIX)
        ? await blogSeo(route, globals)
        : await staticSeo(route, globals);

    if (!seo) {
      return res.status(404).json({
        success: false,
        seo: { ...(await staticSeo('/404', globals)), known: false },
      });
    }

    res.status(200).json({ success: true, seo });
  } catch (error) {
    console.error('SEO render lookup failed:', error);
    res.status(500).json({ success: false, message: 'SEO render lookup failed', error: error.message });
  }
};
