import Metadata from '../models/metaData.js';
import productModel from '../models/productModel.js';
// Imported for their side effect: buildFilterMetadataRoutes populates 'category'
// and 'color', which fails unless those schemas are registered on mongoose. They
// happen to be registered by other route files today, but relying on import
// order makes route discovery fail silently if that ever changes.
import '../models/CategoryModel.js';
import '../models/color.js';
import { fetchProductSeoPages, resolveSaveTarget, isProductRoute } from '../helpers/productSeo.js';

import uploadToS3 from '../helpers/fileUpload.js';
import formidable from 'formidable';

export const SYSTEM_ROUTES = new Set(['/global-settings']);

export const normalizeRoute = (route = '') => {
  const trimmed = String(route || '').trim();
  if (!trimmed) return '';
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
};

const slugifyFilterValue = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const titleCase = (value = '') =>
  String(value)
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const catalogSeoProfiles = {
  'jackets:category:varsity-jackets': {
    title: 'Custom Varsity Jackets | Design Your Own',
    h1: 'Custom Varsity Jackets',
    description: 'Shop custom varsity jackets with wool, leather, satin, colors, embroidery, patches, names and numbers from Easy Jackets.',
  },
  'jackets:category:bomber-jackets': {
    title: 'Custom Bomber Jackets',
    h1: 'Custom Bomber Jackets',
    description: 'Design custom bomber jackets with satin, fleece, nylon, leather, embroidery, patches, colors, logos and team details.',
  },
  'jackets:category:coach-jackets': {
    title: 'Custom Coach Jackets',
    h1: 'Custom Coach Jackets',
    description: 'Shop custom coach jackets for teams, clubs, schools and businesses with personalized colors, logos and embroidery.',
  },
  'jackets:category:hoodies': {
    title: 'Custom Hoodies',
    h1: 'Custom Hoodies',
    description: 'Create custom hoodies with fleece, colors, logos, embroidery, patches, names and numbers for teams, schools and groups.',
  },
  'jackets:category:cropped-varsity-jackets': {
    title: 'Cropped Varsity Jackets',
    h1: 'Cropped Varsity Jackets',
    description: 'Shop cropped varsity jackets with custom colors, materials, embroidery, patches and personalized design options.',
  },
  'jackets:material:melton-wool': {
    title: 'Melton Wool Varsity Jackets',
    h1: 'Melton Wool Varsity Jackets',
    description: 'Design melton wool varsity jackets with premium wool bodies, leather sleeve options, rib trim, embroidery and patches.',
  },
  'jackets:material:cowhide-leather': {
    title: 'Cowhide Leather Varsity Jackets',
    h1: 'Cowhide Leather Varsity Jackets',
    description: 'Shop cowhide leather varsity jackets and leather sleeve letterman styles with custom colors, patches and embroidery.',
  },
  'jackets:material:sheep-leather': {
    title: 'Sheep Leather Varsity Jackets',
    h1: 'Sheep Leather Varsity Jackets',
    description: 'Create sheep leather varsity jackets with soft leather sleeves, wool bodies, custom colors, names, patches and logos.',
  },
  'jackets:material:satin': {
    title: 'Satin Varsity Jackets',
    h1: 'Satin Varsity Jackets',
    description: 'Shop satin varsity jackets and satin bomber styles with lightweight fabric, team colors, embroidery and custom patches.',
  },
  'jackets:material:cotton-twill': {
    title: 'Cotton Twill Varsity Jackets',
    h1: 'Cotton Twill Varsity Jackets',
    description: 'Customize cotton twill varsity jackets with durable fabric, colors, embroidery, patches, names and team logos.',
  },
  'jackets:material:cotton-fleece': {
    title: 'Cotton Fleece Jackets and Hoodies',
    h1: 'Cotton Fleece Jackets and Hoodies',
    description: 'Shop cotton fleece custom jackets and hoodies with soft fabric, personalized colors, logos, embroidery and patches.',
  },
  'jackets:material:nylon': {
    title: 'Nylon Varsity Jackets',
    h1: 'Nylon Varsity Jackets',
    description: 'Design nylon varsity jackets with lightweight material, custom colors, logos, patches, embroidery and team details.',
  },
  'jackets:material:soft-shell': {
    title: 'Soft Shell Jackets',
    h1: 'Soft Shell Jackets',
    description: 'Customize soft shell jackets for teams, clubs and businesses with logos, colors, embroidery and practical outerwear details.',
  },
  'jackets:color:yellow': {
    title: 'Yellow Varsity Jackets',
    h1: 'Yellow Varsity Jackets',
    description: 'Shop yellow varsity jackets with custom materials, patches, embroidery, names, numbers and school color combinations.',
  },
  'jackets:color:royal-blue': {
    title: 'Royal Blue Varsity Jackets',
    h1: 'Royal Blue Varsity Jackets',
    description: 'Design royal blue varsity jackets with wool, leather, satin, embroidery, patches, names and team color details.',
  },
  'jackets:color:crimson': {
    title: 'Crimson Varsity Jackets',
    h1: 'Crimson Varsity Jackets',
    description: 'Create crimson varsity jackets with custom sleeves, trim colors, embroidery, chenille patches, names and numbers.',
  },
  'jackets:color:old-gold': {
    title: 'Old Gold Varsity Jackets',
    h1: 'Old Gold Varsity Jackets',
    description: 'Shop old gold varsity jackets with personalized materials, leather sleeve options, patches, embroidery and team colors.',
  },
  'jackets:color:light-gray': {
    title: 'Light Gray Varsity Jackets',
    h1: 'Light Gray Varsity Jackets',
    description: 'Design light gray varsity jackets with custom wool, leather, satin, embroidery, patches, names and numbers.',
  },
  'jackets:color:dark-purple': {
    title: 'Dark Purple Varsity Jackets',
    h1: 'Dark Purple Varsity Jackets',
    description: 'Shop dark purple varsity jackets with personalized materials, embroidery, custom patches, logos and team colors.',
  },
};

const staticMetadataRoutes = [
  {
    route: '/',
    title: 'Custom Varsity Jackets & Letterman Jackets',
    h1: 'Custom Varsity Jackets & Letterman Jackets',
    description: 'Design custom varsity and letterman jackets with premium materials, personalized embroidery, custom colors and worldwide shipping from Easy Jackets.',
    keywords: 'custom varsity jackets, letterman jackets, custom letterman jackets',
    sitemapOrder: 1,
    sitemapPriority: 1,
    sitemapChangefreq: 'weekly',
    routeType: 'Static Page',
  },
  {
    route: '/shop',
    title: 'Shop Custom Varsity & Letterman Jackets',
    h1: 'Shop Custom Varsity & Letterman Jackets',
    description: 'Browse custom varsity jackets, letterman jackets, bomber jackets and hoodies made with premium materials, custom colors and personalized design options.',
    keywords: 'shop custom varsity jackets, shop letterman jackets, custom jackets',
    sitemapOrder: 10,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'weekly',
    routeType: 'Static Page',
  },
  {
    route: '/sports-spirit-wears',
    title: 'Sports and Spirit Wear Jackets',
    h1: 'Sports and Spirit Wear Jackets',
    description: 'Shop sports team jackets and spirit wear styles for schools, teams, clubs, and fan apparel.',
    keywords: 'sports jackets, spirit wear, team jackets',
    sitemapOrder: 11,
    sitemapPriority: 0.9,
    sitemapChangefreq: 'weekly',
    routeType: 'Static Page',
  },
  {
    route: '/design-custom-jacket',
    title: 'Design Your Own Custom Varsity Jacket',
    h1: 'Design Your Own Custom Varsity Jacket',
    description: 'Design your own custom varsity jacket online with Easy Jackets. Choose materials, colors, patches, embroidery, names, numbers and sizing.',
    keywords: 'design your own varsity jacket, varsity jacket maker, custom jacket maker',
    sitemapOrder: 20,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/how-to-design-jacket',
    title: 'How to Design Your Own Custom Jacket',
    h1: 'How to Design Your Custom Jacket',
    description: 'Learn how to design a custom varsity or letterman jacket with the right style, materials, colors, patches, embroidery and sizing.',
    keywords: 'how to design jacket, design varsity jacket, custom jacket guide',
    sitemapOrder: 30,
    sitemapPriority: 0.7,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/bulk-order',
    title: 'Bulk Custom Jacket Orders',
    h1: 'Bulk Custom Jacket Orders',
    description: 'Order custom varsity jackets in bulk for schools, teams, businesses, clubs, and organizations.',
    keywords: 'bulk varsity jackets, team jacket orders, school jackets bulk',
    sitemapOrder: 22,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/sizechart',
    title: 'Varsity Jacket Size Chart & Sizing Guide',
    h1: 'Varsity Jacket Size Chart',
    description: 'Check the Easy Jackets varsity jacket size chart and measurement guide to choose the right custom jacket fit before ordering.',
    keywords: 'varsity jacket size chart, letterman jacket size chart, jacket sizing guide',
    sitemapOrder: 31,
    sitemapPriority: 0.7,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/fabrics',
    title: 'Varsity Jacket Fabrics',
    h1: 'Varsity Jacket Fabrics',
    description: 'Explore wool, leather, satin, fleece, and other premium materials used in Easy Jackets custom jackets.',
    keywords: 'varsity jacket fabrics, jacket materials, wool leather satin jackets',
    sitemapOrder: 32,
    sitemapPriority: 0.7,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/material-colors',
    title: 'Jacket Materials & Color Options',
    h1: 'Custom Jacket Materials & Colors',
    description: 'Explore jacket material and color options for custom varsity jackets, including wool, leather, satin, fleece, cotton twill and nylon.',
    keywords: 'jacket materials, varsity jacket colors, custom jacket colors',
    sitemapOrder: 33,
    sitemapPriority: 0.7,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/faq',
    title: 'Custom Jacket FAQs',
    h1: 'Frequently Asked Questions',
    description: 'Find answers about Easy Jackets custom jacket orders, sizing, materials, design options, shipping, returns and bulk orders.',
    keywords: 'custom jacket faq, varsity jacket questions, Easy Jackets help',
    sitemapOrder: 40,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/gallery',
    title: 'Custom Jacket Gallery',
    h1: 'Custom Jacket Gallery',
    description: 'Browse Easy Jackets gallery images for custom varsity jacket inspiration and finished jacket examples.',
    keywords: 'custom jacket gallery, varsity jacket examples',
    sitemapOrder: 41,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/photo-gallery',
    title: 'Customer Photo Gallery',
    h1: 'Customer Photo Gallery',
    description: 'See real customer photos and completed custom varsity jackets from Easy Jackets.',
    keywords: 'customer jacket photos, varsity jacket photo gallery',
    sitemapOrder: 42,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/new-blog',
    title: 'Varsity & Letterman Jacket Blog',
    h1: 'Easy Jackets Blog',
    description: 'Read Easy Jackets blog articles about varsity jackets, letterman jackets, custom jacket design, styling, sizing, materials and team orders.',
    keywords: 'varsity jacket blog, letterman jacket blog, custom jacket articles',
    sitemapOrder: 43,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'weekly',
    routeType: 'Static Page',
  },
  {
    route: '/about-us',
    title: 'About Easy Jackets | Custom Jacket Specialists',
    h1: 'About Easy Jackets',
    description: 'Learn about Easy Jackets, our custom varsity jacket craftsmanship, premium materials, personalized design support and team order service.',
    keywords: 'about Easy Jackets, custom jacket specialists, varsity jacket company',
    sitemapOrder: 44,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/contact-us',
    title: 'Contact Easy Jackets | Custom Jacket Support',
    h1: 'Contact Easy Jackets',
    description: 'Contact Easy Jackets for custom jacket support, design help, bulk order quotes, sizing questions, shipping updates and order assistance.',
    keywords: 'contact Easy Jackets, custom jacket support, varsity jacket help',
    sitemapOrder: 45,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/shipping',
    title: 'Shipping & Delivery Information',
    h1: 'Shipping & Delivery Information',
    description: 'Review Easy Jackets shipping and delivery information for custom jacket orders, production time, tracking and worldwide delivery.',
    keywords: 'Easy Jackets shipping, jacket delivery, custom jacket shipping',
    sitemapOrder: 46,
    sitemapPriority: 0.5,
    sitemapChangefreq: 'monthly',
    routeType: 'Static Page',
  },
  {
    route: '/terms-and-conditions',
    title: 'Terms and Conditions',
    h1: 'Terms and Conditions',
    description: 'Read the Easy Jackets terms and conditions for using our website and ordering custom jackets.',
    keywords: 'easy jackets terms, terms and conditions',
    sitemapOrder: 47,
    sitemapPriority: 0.4,
    sitemapChangefreq: 'yearly',
    routeType: 'Static Page',
  },
  {
    route: '/privacypolicy',
    title: 'Privacy Policy',
    h1: 'Privacy Policy',
    description: 'Read the Easy Jackets privacy policy and learn how customer information is collected and protected.',
    keywords: 'easy jackets privacy policy, customer privacy',
    sitemapOrder: 48,
    sitemapPriority: 0.4,
    sitemapChangefreq: 'yearly',
    routeType: 'Static Page',
  },
  {
    route: '/return-policy',
    title: 'Return & Exchange Policy',
    h1: 'Return & Exchange Policy',
    description: 'Read the Easy Jackets return and exchange policy for custom jacket orders, sizing concerns, order changes and customer support.',
    keywords: 'Easy Jackets return policy, custom jacket returns, exchange policy',
    sitemapOrder: 49,
    sitemapPriority: 0.4,
    sitemapChangefreq: 'yearly',
    routeType: 'Static Page',
  },
  {
    route: '/letterman-jackets',
    title: 'Custom Letterman Jackets',
    h1: 'Custom Letterman Jackets',
    description: 'Shop and design custom letterman jackets with wool, leather, satin, chenille patches, embroidery, names, numbers and school colors.',
    keywords: 'letterman jacket, custom letterman jackets, personalized letterman jacket',
    sitemapOrder: 50,
    sitemapPriority: 0.85,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/school-jackets',
    title: 'Custom School Jackets',
    h1: 'Custom School Jackets',
    description: 'Create custom school jackets for students, clubs, teams and graduation groups with colors, patches, embroidery and bulk order support.',
    keywords: 'school jackets, high school letterman jackets, custom school jackets',
    sitemapOrder: 51,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/senior-jackets',
    title: 'Custom Senior Jackets',
    h1: 'Custom Senior Jackets',
    description: 'Design senior jackets for class groups with school colors, names, numbers, mascots, patches, embroidery and bulk ordering help.',
    keywords: 'senior jackets, custom senior jackets, class jackets',
    sitemapOrder: 52,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/team-jackets',
    title: 'Custom Team Jackets',
    h1: 'Custom Team Jackets',
    description: 'Order custom team jackets for sports teams, clubs, schools and businesses with coordinated colors, logos, names and numbers.',
    keywords: 'team jackets, custom team jackets, sports team jackets',
    sitemapOrder: 53,
    sitemapPriority: 0.8,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/mens-varsity-jackets',
    title: "Men's Varsity Jackets",
    h1: "Men's Varsity Jackets",
    description: "Shop men's varsity jackets and design custom letterman styles with premium materials, colors, patches, embroidery and inclusive sizing.",
    keywords: "varsity jacket men, men's varsity jacket, men's letterman jacket",
    sitemapOrder: 54,
    sitemapPriority: 0.75,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/womens-varsity-jackets',
    title: "Women's Varsity Jackets",
    h1: "Women's Varsity Jackets",
    description: "Shop women's varsity jackets and personalized letterman styles with custom colors, patches, embroidery, fleece, satin, wool and leather.",
    keywords: "women's varsity jacket, girls letterman jacket, women's custom jacket",
    sitemapOrder: 55,
    sitemapPriority: 0.75,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/leather-varsity-jackets',
    title: 'Custom Leather Varsity Jackets',
    h1: 'Custom Leather Varsity Jackets',
    description: 'Design leather varsity jackets with cowhide or sheep leather sleeves, wool bodies, custom colors, chenille patches and embroidery.',
    keywords: 'leather varsity jacket, custom leather varsity jacket, varsity jacket leather sleeves',
    sitemapOrder: 56,
    sitemapPriority: 0.75,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/wool-and-leather-varsity-jackets',
    title: 'Wool and Leather Varsity Jackets',
    h1: 'Wool and Leather Varsity Jackets',
    description: 'Shop wool and leather varsity jackets with melton wool bodies, leather sleeves, rib trim, custom patches, embroidery and school colors.',
    keywords: 'wool and leather varsity jacket, melton wool leather jacket, custom wool varsity jacket',
    sitemapOrder: 57,
    sitemapPriority: 0.75,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
  {
    route: '/satin-bomber-jackets',
    title: 'Custom Satin Bomber Jackets',
    h1: 'Custom Satin Bomber Jackets',
    description: 'Shop custom satin bomber jackets with smooth satin fabric, team colors, logos, embroidery, patches and lightweight varsity styling.',
    keywords: 'custom satin bomber jacket, satin varsity jacket, bomber varsity jacket',
    sitemapOrder: 58,
    sitemapPriority: 0.75,
    sitemapChangefreq: 'weekly',
    routeType: 'Keyword Landing Page',
  },
];

const catalogBasePath = (section = 'jackets') =>
  section === 'sports' ? '/sports-spirit-wears' : '/shop';

const addFilterRoute = (routes, seen, section, type, rawValue, labelValue = rawValue) => {
  const slug = slugifyFilterValue(rawValue);
  if (!slug) return;

  const route = `${catalogBasePath(section)}/${type}/${encodeURIComponent(slug)}`;
  if (seen.has(route)) return;
  seen.add(route);

  const label = titleCase(labelValue || rawValue || slug);
  const sectionTitle = section === 'sports' ? 'Sports and Spirit Wear' : 'Varsity Jackets';
  const typeTitle = titleCase(type);
  const profile = catalogSeoProfiles[`${section}:${type}:${slug}`] || {};
  const title = profile.title || (type === 'category' ? label : `${label} ${sectionTitle}`);
  const h1 = profile.h1 || title;
  const description = profile.description || (type === 'category'
    ? `Shop ${label.toLowerCase()} at Easy Jackets. Browse premium custom styles, sizes, colors, and materials.`
    : `Shop ${label.toLowerCase()} ${sectionTitle.toLowerCase()} at Easy Jackets. Browse premium custom styles, sizes, colors, and materials.`);

  routes.push({
    route,
    title,
    h1,
    description,
    keywords: `${label.toLowerCase()} jackets, ${typeTitle.toLowerCase()} jackets, ${sectionTitle.toLowerCase()}`,
    sitemapEnabled: true,
    sitemapOrder: 200,
    sitemapPriority: 0.6,
    sitemapChangefreq: 'weekly',
    routeType: `${typeTitle} Filter`,
  });
};

const buildFilterMetadataRoutes = async () => {
  const products = await productModel
    .find({ isActive: { $ne: false } })
    .populate('category', 'name slug section')
    .populate('color', 'name')
    .select('category color material sizes')
    .lean();

  const routes = [];
  const seen = new Set();

  products.forEach((product) => {
    const section = product?.category?.section === 'sports' ? 'sports' : 'jackets';
    addFilterRoute(routes, seen, section, 'category', product?.category?.slug || product?.category?.name, product?.category?.name);
    addFilterRoute(routes, seen, section, 'color', product?.color?.name);
    addFilterRoute(routes, seen, section, 'material', product?.material?.body);
    addFilterRoute(routes, seen, section, 'material', product?.material?.sleeves);

    (product?.sizes || []).forEach((size) => {
      addFilterRoute(routes, seen, section, 'size', size?.size);
    });
  });

  return routes.sort((a, b) => a.route.localeCompare(b.route));
};

/**
 * Static and filter routes only — deliberately NOT products.
 *
 * `seedRequiredMetadata` creates a Metadata row for everything this returns, and a
 * Metadata row *overrides* a product's own metaTitle/metaDescription on the live
 * page. Seeding products here would silently shadow all ~149 product editors with
 * frozen copies, so product pages are surfaced through
 * `buildProductMetadataRoutes` instead, which nothing seeds from.
 */
export const buildRequiredMetadataRoutes = async () => {
  const filterRoutes = await buildFilterMetadataRoutes();
  return [...staticMetadataRoutes, ...filterRoutes].map((entry, index) => ({
    sitemapEnabled: true,
    sitemapPriority: 0.5,
    sitemapChangefreq: 'monthly',
    sitemapOrder: 100 + index,
    ...entry,
    route: normalizeRoute(entry.route),
  }));
};

/**
 * Every live product as a Route Metadata row.
 *
 * Rebuilt from the products collection on each call, so adding a product makes it
 * appear here with no sync step. `source: 'product'` is what tells the table to
 * label the row and hide Delete, and what tells the save path to write back to the
 * product document rather than create a shadowing Metadata row.
 */
export const buildProductMetadataRoutes = async () => {
  const pages = await fetchProductSeoPages();
  return pages.map((page) => ({
    route: normalizeRoute(page.route),
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    ogImage: page.ogImage,
    noIndex: page.noIndex,
    sitemapEnabled: page.sitemapEnabled,
    sitemapOrder: page.sitemapOrder,
    sitemapPriority: page.sitemapPriority,
    sitemapChangefreq: page.sitemapChangefreq,
    routeType: 'Product Page',
    source: 'product',
    productId: page.productId,
    productName: page.productName,
    hasMetadata: page.hasMetadata,
    updatedAt: page.updatedAt,
  }));
};

const publicMetadataPayload = (entry) => ({
  route: entry.route,
  title: entry.title,
  h1: entry.h1,
  description: entry.description,
  keywords: entry.keywords,
  ogImage: entry.ogImage,
  // The storefront turns this into <meta name="robots" content="noindex, nofollow">.
  noIndex: entry.noIndex === true,
  sitemapEnabled: entry.sitemapEnabled,
  sitemapOrder: entry.sitemapOrder,
  sitemapPriority: entry.sitemapPriority,
  sitemapChangefreq: entry.sitemapChangefreq,
});

/**
 * Save a product route's SEO onto the product document.
 *
 * Only the four meta fields are written. `noIndex` belongs to Index Control and
 * `sitemapEnabled` is derived from it for products, so neither is touched here —
 * otherwise editing a title in Route Metadata would silently re-list a page
 * somebody deliberately hid.
 */
const writeProductSeo = async (productId, body = {}) => {
  const product = await productModel.findByIdAndUpdate(
    productId,
    {
      $set: {
        metaTitle: String(body.title || '').trim(),
        metaDescription: String(body.description || '').trim(),
        metaKeywords: String(body.keywords || '').trim(),
        ogImage: String(body.ogImage || '').trim(),
      },
    },
    { new: true }
  ).select('slug name metaTitle metaDescription metaKeywords ogImage noIndex').lean();

  return product;
};

// Create Metadata
export const createMetadata = async (req, res) => {
  try {
    const route = normalizeRoute(req.body.route);

    // A product page's SEO lives on the product, which is what the product editor
    // writes and what the storefront falls back to. Creating a Metadata row here
    // would shadow it, leaving two screens disagreeing about the live page.
    const target = await resolveSaveTarget(route);
    if (target.kind === 'product') {
      const product = await writeProductSeo(target.productId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Product SEO saved to the product',
        savedTo: 'product',
        product,
      });
    }

    const payload = { ...req.body, route };
    const metadata = new Metadata(payload);
    await metadata.save();
    res.status(201).json({ success: true, message: 'Metadata created successfully', savedTo: 'metadata', metadata });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Metadata already exists for this route' });
    }
    res.status(500).json({ success: false, message: 'Error creating metadata', error: error.message });
  }
};

/**
 * Every editable page, from both stores: `metadatas` rows and live products.
 *
 * A Metadata row for a product route wins over the product's own fields (that is
 * what the storefront renders), so where both exist only the metadata row is
 * listed — flagged `overridesProduct` so the table can warn that the product
 * editor is no longer what the page shows.
 *
 * Pass ?source=metadata to get the old behaviour, for callers that only want rows
 * that physically exist in the collection.
 */
export const getAllMetadata = async (req, res) => {
  try {
    const metadataList = await Metadata.find().sort({ sitemapOrder: 1, route: 1 }).lean();

    if (req.query.source === 'metadata') {
      return res.status(200).json({ success: true, metadata: metadataList });
    }

    const metadataRoutes = new Set(metadataList.map((entry) => normalizeRoute(entry.route)));
    const productRoutes = await buildProductMetadataRoutes();

    const rows = [
      ...metadataList.map((entry) => ({
        ...entry,
        source: 'metadata',
        routeType: isProductRoute(normalizeRoute(entry.route)) ? 'Product Page' : entry.routeType,
        overridesProduct: isProductRoute(normalizeRoute(entry.route)),
      })),
      ...productRoutes.filter((entry) => !metadataRoutes.has(entry.route)),
    ];

    res.status(200).json({ success: true, metadata: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching metadata', error: error.message });
  }
};

export const getAvailableMetadataRoutes = async (req, res) => {
  try {
    const requiredRoutes = await buildRequiredMetadataRoutes();
    const productRoutes = await buildProductMetadataRoutes();
    const existingMetadata = await Metadata.find().select('route').lean();
    const existingRoutes = new Set(existingMetadata.map((item) => normalizeRoute(item.route)));

    const routes = [...requiredRoutes, ...productRoutes]
      .filter((entry) => !SYSTEM_ROUTES.has(entry.route))
      .map((entry) => ({
        ...entry,
        source: entry.source || 'metadata',
        hasMetadata: existingRoutes.has(entry.route),
      }));

    res.status(200).json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching available routes', error: error.message });
  }
};

export const seedRequiredMetadata = async (req, res) => {
  try {
    const requiredRoutes = await buildRequiredMetadataRoutes();
    const created = [];
    const updated = [];

    for (const routeMeta of requiredRoutes) {
      const payload = publicMetadataPayload(routeMeta);
      const existing = await Metadata.findOne({ route: payload.route });

      if (!existing) {
        const metadata = await Metadata.create(payload);
        created.push(metadata.route);
        continue;
      }

      const missingFields = {};
      ['title', 'h1', 'description', 'keywords'].forEach((field) => {
        if (!String(existing[field] || '').trim() && payload[field]) {
          missingFields[field] = payload[field];
        }
      });

      if (Object.keys(missingFields).length) {
        await Metadata.updateOne({ _id: existing._id }, { $set: missingFields });
        updated.push(existing.route);
      }
    }

    await Metadata.updateOne(
      { route: '/global-settings' },
      { $set: { sitemapEnabled: false, sitemapOrder: 9999, sitemapPriority: 0, sitemapChangefreq: 'never' } }
    );

    res.status(200).json({
      success: true,
      message: 'Required SEO metadata routes synced',
      created,
      updated,
      totalRequired: requiredRoutes.length,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Some routes already exist. Refresh and try again.' });
    }
    res.status(500).json({ success: false, message: 'Error syncing required metadata routes', error: error.message });
  }
};

export const getMetadataByPath = async (req, res) => {
  try {
    const path = req.query.path || '';
    const normalized = normalizeRoute(path);
    const withoutSlash = normalized.startsWith('/') ? normalized.slice(1) : normalized;
    const withSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;

    const metadata = await Metadata.findOne({
      $or: [
        { route: normalized },
        { route: withoutSlash },
        { route: withSlash },
      ]
    });

    res.status(200).json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching metadata', error: error.message });
  }
};

// Get Metadata by Route
export const getMetadataByRoute = async (req, res) => {
  try {
    const routeParam = normalizeRoute(req.params.route);
    const searchRoute = routeParam.startsWith('/') ? routeParam : `/${routeParam}`;
    const withoutSlash = routeParam.startsWith('/') ? routeParam.slice(1) : routeParam;
    // Try finding exact or with slash
    const metadata = await Metadata.findOne({
      $or: [{ route: routeParam }, { route: searchRoute }, { route: withoutSlash }]
    });

    res.status(200).json({ success: true, metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching metadata', error: error.message });
  }
};

// Update Metadata by Route
export const updateMetadata = async (req, res) => {
  try {
    const routeParam = normalizeRoute(req.params.route);
    const searchRoute = routeParam.startsWith('/') ? routeParam : `/${routeParam}`;
    const withoutSlash = routeParam.startsWith('/') ? routeParam.slice(1) : routeParam;
    const payload = req.body?.route
      ? { ...req.body, route: normalizeRoute(req.body.route) }
      : req.body;

    // Product routes have no Metadata row to update — their SEO is on the product.
    // Without this the edit would 404 for every product page in the table.
    const target = await resolveSaveTarget(searchRoute);
    if (target.kind === 'product') {
      const product = await writeProductSeo(target.productId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Product SEO saved to the product',
        savedTo: 'product',
        product,
      });
    }

    const updatedMetadata = await Metadata.findOneAndUpdate(
      { $or: [{ route: routeParam }, { route: searchRoute }, { route: withoutSlash }] },
      payload,
      { new: true }
    );
    if (!updatedMetadata) {
      return res.status(404).json({ success: false, message: 'Metadata not found' });
    }
    res.status(200).json({ success: true, message: 'Metadata updated successfully', savedTo: 'metadata', metadata: updatedMetadata });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating metadata', error: error.message });
  }
};

// Delete Metadata by Route
export const deleteMetadata = async (req, res) => {
  try {
    const routeParam = normalizeRoute(req.params.route);
    const searchRoute = routeParam.startsWith('/') ? routeParam : `/${routeParam}`;
    const withoutSlash = routeParam.startsWith('/') ? routeParam.slice(1) : routeParam;

    const deletedMetadata = await Metadata.findOneAndDelete({
      $or: [{ route: routeParam }, { route: searchRoute }, { route: withoutSlash }]
    });
    if (!deletedMetadata) {
      // Product pages are generated from the products collection, so there is no
      // row to remove. Say that, rather than a bare "not found".
      if (isProductRoute(searchRoute)) {
        return res.status(400).json({
          success: false,
          message: 'Product pages cannot be deleted here. Remove or deactivate the product instead.',
        });
      }
      return res.status(404).json({ success: false, message: 'Metadata not found' });
    }

    // Deleting the override on a product route is not a deletion of the page — the
    // product's own SEO takes over again. Make that explicit so it does not look
    // like the page vanished.
    const message = isProductRoute(searchRoute)
      ? 'Override removed. This page now uses the SEO set on the product.'
      : 'Metadata deleted successfully';

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting metadata', error: error.message });
  }
};

// Upload Image to S3
export const uploadMetadataImage = async (req, res) => {
  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error parsing files' });
    }

    try {
      const { image } = files;
      // Formidable v3 returns an array of files
      const fileToUpload = Array.isArray(image) ? image[0] : image;

      if (!fileToUpload) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
      }

      // Upload to S3 (fileUpload helper handles the S3 logic)
      const imageUrl = await uploadToS3(fileToUpload);

      // If uploadToS3 returns just filename, we might need to prepend path if not done inside helper
      // Checking fileUpload.js, it returns `fileName` or `imageUrl` depending on implementation.
      // galleryController does: const imageUrl = `${process.env.AWS_FILE_PATH}${s3Key}`;
      // Let's verify what uploadToS3 returns. It returns `fileName` (key).

      // We need to construct the full URL.
      const fullUrl = `${process.env.AWS_FILE_PATH}${imageUrl}`;

      res.status(200).json({ success: true, url: fullUrl });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ success: false, message: 'Error uploading image', error: error.message });
    }
  });
};
