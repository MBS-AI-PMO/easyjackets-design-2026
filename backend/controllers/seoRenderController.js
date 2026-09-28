import Metadata from '../models/metaData.js';
import productModel from '../models/productModel.js';
import Blog from '../models/blogs.js';
import ProductReview from '../models/productReviewModel.js';
import PageFaq from '../models/pageFaq.js';
import '../models/CategoryModel.js';
import '../models/color.js';
import { buildRequiredMetadataRoutes, normalizeRoute } from './metaDataController.js';
import { KEYWORD_LANDING_FAQ_DEFAULTS } from '../data/keywordLandingFaqDefaults.js';

const SITE_URL = 'https://easyjackets.com';
const SITE_NAME = 'Easy Jackets';
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/social-card.jpg`;

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

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const productRouteFor = (slug = '') =>
  `/product/${String(slug || '').trim().replace(/^\/+|\/+$/g, '').toLowerCase()}`;

const priceForProduct = (product) => {
  const standard = Number(product?.standardPrice) || 0;
  const discount = Number(product?.discountPrice) || 0;
  if (!standard) return 0;
  if (!discount) return standard;
  return Math.round((standard - (standard * discount / 100)) * 100) / 100;
};

const globalSchemas = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    email: 'info@easyjackets.com',
    sameAs: [
      'https://www.facebook.com/easyjackets',
      'https://www.instagram.com/easyjackets',
      'https://www.pinterest.com/easyjackets',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.webp` },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/shop?search={search_term_string}`,
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

const faqSchema = (faqs = []) => {
  const mainEntity = faqs
    .filter((faq) => faq?.question && faq?.answer)
    .slice(0, 5)
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

const pageFaqsForRoute = async (route) => {
  const faqs = await PageFaq.find({ pageKey: route, isActive: true })
    .sort({ sortOrder: 1, createdAt: 1 })
    .limit(5)
    .lean();

  if (faqs.length) return faqs;
  return KEYWORD_LANDING_FAQ_DEFAULTS
    .filter((faq) => faq.pageKey === route && faq.isActive !== false)
    .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0))
    .slice(0, 5);
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
}) => {
  const cleanTitle = stripSiteName(title) || SITE_NAME;
  const fullTitle = cleanTitle === SITE_NAME ? SITE_NAME : `${cleanTitle} | ${SITE_NAME}`;
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
    jsonLd: compact([...globalSchemas(), ...jsonLd]),
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

const productSeo = async (route) => {
  const slug = route.slice(PRODUCT_PREFIX.length);
  const product = await productModel
    .findOne({ slug: new RegExp(`^${escapeRegex(slug)}$`, 'i') })
    .sort({ updatedAt: -1 })
    .populate('category', 'name section slug')
    .populate('color', 'name')
    .lean();

  if (!product) return null;

  const canonicalPath = productRouteFor(product.slug || slug);
  const title = product.metaTitle || product.name;
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    image: [product.frontImage, ...(product.otherImages || [])].filter(Boolean).map(absoluteUrl),
    description: cleanText(product.shortdescription || product.description || description),
    sku: product.sku || String(product._id),
    mpn: product.sku || String(product._id),
    brand: { '@type': 'Brand', name: SITE_NAME },
    color: product.color?.name,
    material: [product.material?.body, product.material?.sleeves].filter(Boolean).join(' / '),
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(canonicalPath),
      priceCurrency: 'USD',
      price: priceForProduct(product).toFixed(2),
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: product.isActive === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  };

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
    jsonLd: [
      productSchema,
      breadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: product.category?.name || 'Shop', item: '/shop' },
        { name: productName, item: canonicalPath },
      ]),
    ],
  });
};

const blogSeo = async (route) => {
  const slug = route.slice(BLOG_PREFIX.length);
  const blog = await Blog.findOne({ slug, isActive: true }).lean();
  if (!blog) return null;

  const canonicalPath = `/new-blog/${blog.slug || slug}`;
  const description = blog.excerpt || blog.title;
  const title = blog.title;

  return basePayload({
    route,
    title,
    description,
    canonicalPath,
    image: blog.image,
    imageAlt: blog.title,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: cleanText(blog.title),
        description: cleanText(description),
        image: blog.image ? [absoluteUrl(blog.image)] : undefined,
        author: { '@type': 'Person', name: blog.author || SITE_NAME },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.webp` },
        },
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        mainEntityOfPage: absoluteUrl(canonicalPath),
      },
      breadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: 'Blog', item: '/new-blog' },
        { name: blog.title, item: canonicalPath },
      ]),
    ],
  });
};

const staticSeo = async (route) => {
  const metadata = await metadataForRoute(route);
  if (!metadata) {
    return basePayload({
      route,
      title: 'Easy Jackets',
      description: 'Design and shop premium custom varsity jackets and letterman jackets from Easy Jackets.',
      canonicalPath: '/',
      noIndex: true,
    });
  }

  const pageFaqs = await pageFaqsForRoute(metadata.route || route);

  return basePayload({
    route,
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    h1: metadata.h1,
    canonicalPath: metadata.route || route,
    image: metadata.ogImage,
    noIndex: metadata.noIndex === true,
    jsonLd: metadata.route === '/'
      ? [faqSchema(pageFaqs)]
      : [breadcrumbSchema([
        { name: 'Home', item: '/' },
        { name: metadata.h1 || metadata.title || 'Page', item: metadata.route || route },
      ]), faqSchema(pageFaqs)],
  });
};

export const getSeoRenderController = async (req, res) => {
  try {
    const route = normalizeRoute(req.query.path || '/');
    const seo = route.startsWith(PRODUCT_PREFIX)
      ? await productSeo(route)
      : route.startsWith(BLOG_PREFIX)
        ? await blogSeo(route)
        : await staticSeo(route);

    if (!seo) {
      return res.status(404).json({
        success: false,
        seo: await staticSeo('/404'),
      });
    }

    res.status(200).json({ success: true, seo });
  } catch (error) {
    console.error('SEO render lookup failed:', error);
    res.status(500).json({ success: false, message: 'SEO render lookup failed', error: error.message });
  }
};
