import productModel from "../models/productModel.js";
import Blog from "../models/blogs.js";
import Metadata from "../models/metaData.js";
import { ACTIVE_PRODUCT_FILTER } from "../helpers/productSeo.js";
import {
  buildRequiredMetadataRoutes,
  normalizeRoute,
  SYSTEM_ROUTES,
} from "./metaDataController.js";

const SITE_URL = (process.env.SITEMAP_SITE_URL || process.env.FRONTEND_URL || "https://easyjackets.com").replace(/\/+$/, "");

// Every sitemap below is generated from Mongo at request time. Nothing is
// pre-built, so a new product, category, colour, material, size, blog post, or
// admin page is listed the moment it is saved — and a page switched to noindex
// disappears from here on the next crawl instead of lingering until a rebuild.
const sitemapIndexEntries = [
  { loc: "/page-sitemap.xml", type: "pages" },
  { loc: "/product-sitemap.xml", type: "products" },
  { loc: "/blog-sitemap.xml", type: "blogs" },
  { loc: "/category-sitemap.xml", type: "filter", filter: "category" },
  { loc: "/color-sitemap.xml", type: "filter", filter: "color" },
  { loc: "/material-sitemap.xml", type: "filter", filter: "material" },
  { loc: "/size-sitemap.xml", type: "filter", filter: "size" },
];

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const encodePathSegment = (value = "") =>
  encodeURIComponent(String(value).trim().replace(/^\/+|\/+$/g, ""));

const sendXml = (res, xml) => {
  res.set("Content-Type", "application/xml; charset=utf-8");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  return res.status(200).send(xml);
};

/**
 * `<lastmod>` is optional in the sitemap protocol, and Google discounts the hint
 * entirely on sites where it looks fabricated. Routes with no real modification
 * date are emitted without one rather than stamped with today's.
 */
const urlEntry = ({ loc, lastmod, priority, changefreq }) => {
  const lines = [`    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`);
  if (priority !== undefined && priority !== null) {
    lines.push(`    <priority>${Number(priority).toFixed(1)}</priority>`);
  }
  return `  <url>\n${lines.join("\n")}\n  </url>`;
};

const urlsetXml = (label, entries) => `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- EasyJackets live ${label}. URLs: ${entries.length} -->

${entries.join("\n\n")}

</urlset>
`;

// ── Route classification ─────────────────────────────────────────────────────

const FILTER_TYPES = ["category", "color", "material", "size"];
const FILTER_PATTERN = /^\/(?:shop|sports-spirit-wears)\/(category|color|material|size)\/[^/]+$/;

/** Which sitemap does this route belong in? */
const bucketFor = (route) => {
  if (route.startsWith("/product/")) return "product";
  if (route.startsWith("/new-blog/")) return "blog";
  const match = FILTER_PATTERN.exec(route);
  return match ? match[1] : "page";
};

/**
 * Every non-product, non-blog route the site should list, bucketed by sitemap.
 *
 * Merges the saved metadata rows with live route discovery so a colour that only
 * exists because a product was added five minutes ago is already here. Saved rows
 * win on conflicts, since they carry the admin's own priority and noindex choices.
 */
const collectRouteBuckets = async () => {
  const [metadataDocs, discovered] = await Promise.all([
    Metadata.find().select("route sitemapEnabled sitemapPriority sitemapChangefreq noIndex updatedAt").lean(),
    buildRequiredMetadataRoutes().catch((error) => {
      console.error("Sitemap: route discovery failed —", error.message);
      return [];
    }),
  ]);

  const routes = new Map();

  discovered.forEach((entry) => {
    const route = normalizeRoute(entry.route);
    if (!route || SYSTEM_ROUTES.has(route)) return;
    routes.set(route, {
      route,
      priority: entry.sitemapPriority ?? 0.5,
      changefreq: entry.sitemapChangefreq || "monthly",
      lastmod: "",
      excluded: false,
    });
  });

  metadataDocs.forEach((doc) => {
    const route = normalizeRoute(doc.route);
    if (!route || SYSTEM_ROUTES.has(route)) return;
    routes.set(route, {
      route,
      priority: doc.sitemapPriority ?? 0.5,
      changefreq: doc.sitemapChangefreq || "monthly",
      lastmod: toDateOnly(doc.updatedAt),
      // Two separate ways to keep a URL out, and both must be honoured: a page
      // can be indexable but deliberately unlisted, or noindexed entirely.
      excluded: doc.noIndex === true || doc.sitemapEnabled === false,
    });
  });

  const buckets = { page: [], category: [], color: [], material: [], size: [] };

  [...routes.values()]
    .filter((entry) => !entry.excluded)
    .forEach((entry) => {
      const bucket = bucketFor(entry.route);
      // Product and blog routes are generated from their own collections, so a
      // stray metadata row for one must not duplicate it into another sitemap.
      if (!buckets[bucket]) return;
      buckets[bucket].push(entry);
    });

  Object.values(buckets).forEach((list) => list.sort((a, b) => a.route.localeCompare(b.route)));
  return buckets;
};

const routeEntries = (list) =>
  list.map((entry) => urlEntry({
    loc: `${SITE_URL}${entry.route === "/" ? "/" : entry.route}`,
    lastmod: entry.lastmod,
    changefreq: entry.changefreq,
    priority: entry.priority,
  }));

// ── Individual sitemaps ──────────────────────────────────────────────────────

const productSitemapFilter = {
  ...ACTIVE_PRODUCT_FILTER,
  noIndex: { $ne: true },
};

export const productSitemapController = async (req, res) => {
  try {
    const products = await productModel
      .find(productSitemapFilter)
      .select("slug updatedAt createdAt")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    // Slugs are not uniquely indexed on the collection, so a handful are shared by
    // two products. Both resolve to the same URL, and a repeated <loc> makes the
    // whole sitemap invalid — keep the first, which is the most recently updated.
    const seen = new Set();
    const entries = products.reduce((acc, product) => {
      const slug = encodePathSegment(String(product.slug).toLowerCase());
      if (!slug || seen.has(slug)) return acc;
      seen.add(slug);
      acc.push(urlEntry({
        loc: `${SITE_URL}/product/${slug}`,
        lastmod: toDateOnly(product.updatedAt || product.createdAt),
        changefreq: "weekly",
        priority: 0.7,
      }));
      return acc;
    }, []);

    return sendXml(res, urlsetXml("product sitemap", entries));
  } catch (error) {
    console.error("Error generating product sitemap:", error);
    return res.status(500).json({ success: false, message: "Error generating product sitemap", error: error.message });
  }
};

export const pageSitemapController = async (req, res) => {
  try {
    const buckets = await collectRouteBuckets();
    return sendXml(res, urlsetXml("page sitemap", routeEntries(buckets.page)));
  } catch (error) {
    console.error("Error generating page sitemap:", error);
    return res.status(500).json({ success: false, message: "Error generating page sitemap", error: error.message });
  }
};

/** One controller for all four filter sitemaps — they differ only by bucket. */
export const filterSitemapController = (type) => async (req, res) => {
  try {
    const buckets = await collectRouteBuckets();
    return sendXml(res, urlsetXml(`${type} filter landing pages`, routeEntries(buckets[type] || [])));
  } catch (error) {
    console.error(`Error generating ${type} sitemap:`, error);
    return res.status(500).json({ success: false, message: `Error generating ${type} sitemap`, error: error.message });
  }
};

export const blogSitemapController = async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: { $ne: false }, slug: { $exists: true, $nin: ["", null] } })
      .select("slug updatedAt createdAt")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const entries = blogs.map((blog) => urlEntry({
      loc: `${SITE_URL}/new-blog/${encodePathSegment(blog.slug)}`,
      lastmod: toDateOnly(blog.updatedAt || blog.createdAt),
      changefreq: "monthly",
      priority: 0.6,
    }));

    return sendXml(res, urlsetXml("blog sitemap", entries));
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
    return res.status(500).json({ success: false, message: "Error generating blog sitemap", error: error.message });
  }
};

export const sitemapIndexController = async (req, res) => {
  try {
    const [latestProduct, latestBlog, latestMetadata] = await Promise.all([
      productModel.findOne(productSitemapFilter).select("updatedAt createdAt").sort({ updatedAt: -1 }).lean(),
      Blog.findOne({ isActive: { $ne: false } }).select("updatedAt createdAt").sort({ updatedAt: -1 }).lean(),
      Metadata.findOne().select("updatedAt").sort({ updatedAt: -1 }).lean(),
    ]);

    const lastmodFor = (entry) => {
      if (entry.type === "products") return toDateOnly(latestProduct?.updatedAt || latestProduct?.createdAt);
      if (entry.type === "blogs") return toDateOnly(latestBlog?.updatedAt || latestBlog?.createdAt);
      // Page and filter sitemaps are driven by metadata edits and by the product
      // catalogue, so they change whenever either does.
      const metaDate = toDateOnly(latestMetadata?.updatedAt);
      const productDate = toDateOnly(latestProduct?.updatedAt || latestProduct?.createdAt);
      return metaDate > productDate ? metaDate : productDate;
    };

    const entries = sitemapIndexEntries.map((entry) => {
      const lastmod = lastmodFor(entry);
      const lines = [`    <loc>${escapeXml(`${SITE_URL}${entry.loc}`)}</loc>`];
      if (lastmod) lines.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
      return `  <sitemap>\n${lines.join("\n")}\n  </sitemap>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- EasyJackets live sitemap index. Every child sitemap is generated from Mongo on request. -->

${entries.join("\n\n")}

</sitemapindex>
`;

    return sendXml(res, xml);
  } catch (error) {
    console.error("Error generating sitemap index:", error);
    return res.status(500).json({ success: false, message: "Error generating sitemap index", error: error.message });
  }
};

export { FILTER_TYPES };
