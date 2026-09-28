// controllers/seoHealthController.js
import formidable from 'formidable';
import Metadata from '../models/metaData.js';
import SeoAudit from '../models/seoAuditModel.js';
import { uploadSocialCard, SOCIAL_CARD_WIDTH, SOCIAL_CARD_HEIGHT } from '../helpers/fileUpload.js';
import { auditPage, gradeFor } from '../helpers/seoAudit.js';
import { fetchProductSeoPages, resolveSaveTarget } from '../helpers/productSeo.js';
import productModel from '../models/productModel.js';
import {
  buildRequiredMetadataRoutes,
  normalizeRoute,
  SYSTEM_ROUTES,
} from './metaDataController.js';

// Routes contain slashes, so they travel in the body or query string rather than
// as a path parameter — no %2F round-tripping to get wrong.
const readRoute = (req) => normalizeRoute(req.body?.route || req.query?.route || '');

/**
 * Every page the site knows about, from three directions:
 *
 *  1. `product`    — one per live product, SEO read from the product document
 *  2. `metadata`   — routes with a Metadata record (editable, auditable)
 *  3. `discovered` — routes the site exposes but that have no metadata yet
 *
 * Sources 1 and 3 are rebuilt from live products on every call, so a new
 * product — and any new category, colour, material, or size it introduces —
 * shows up here the moment it is saved. There is no sync job to fall behind.
 *
 * Order matters. Products are seeded first, then metadata rows layer on top,
 * because that is the precedence the storefront actually renders: `SEO.jsx`
 * resolves `adminMetadata?.title || title`, so a Metadata row for a product
 * route overrides the product's own metaTitle. Modelling it the other way
 * round would show the admin a title the visitor never sees.
 */
const collectPages = async () => {
  const [metadataDocs, requiredRoutes, productPages] = await Promise.all([
    Metadata.find().lean(),
    // Discovery walks the product catalogue, so it can fail independently of the
    // saved metadata. Degrade to "configured routes only" rather than failing the
    // whole screen — but never silently.
    buildRequiredMetadataRoutes().catch((error) => {
      console.error('SEO Health: route discovery failed —', error.message);
      return [];
    }),
    fetchProductSeoPages().catch((error) => {
      console.error('SEO Health: product page collection failed —', error.message);
      return [];
    }),
  ]);

  const pages = new Map();

  productPages.forEach((page) => {
    const route = normalizeRoute(page.route);
    if (!route || SYSTEM_ROUTES.has(route)) return;
    pages.set(route, { ...page, route });
  });

  metadataDocs.forEach((doc) => {
    const route = normalizeRoute(doc.route);
    if (!route || SYSTEM_ROUTES.has(route)) return;

    const product = pages.get(route);
    const metadataValues = {
      title: doc.title || '',
      description: doc.description || '',
      keywords: doc.keywords || '',
      ogImage: doc.ogImage || '',
      noIndex: doc.noIndex === true,
      sitemapEnabled: doc.sitemapEnabled !== false,
      sitemapOrder: doc.sitemapOrder ?? 100,
      sitemapPriority: doc.sitemapPriority ?? 0.5,
      sitemapChangefreq: doc.sitemapChangefreq || 'monthly',
      updatedAt: doc.updatedAt || null,
    };

    if (product) {
      // A metadata row exists for a product route. It wins on the storefront,
      // so it wins here too — and the save target flips with it, otherwise
      // editing would write to the product and change nothing visible.
      pages.set(route, {
        ...product,
        ...metadataValues,
        keywordsDerived: false,
        saveTarget: 'metadata',
        metadataOverride: true,
        hasMetadata: true,
      });
      return;
    }

    pages.set(route, {
      route,
      ...metadataValues,
      keywordsDerived: false,
      routeType: 'Configured',
      source: 'metadata',
      saveTarget: 'metadata',
      hasMetadata: true,
    });
  });

  requiredRoutes.forEach((entry) => {
    const route = normalizeRoute(entry.route);
    if (!route || SYSTEM_ROUTES.has(route)) return;

    const existing = pages.get(route);
    if (existing) {
      // Keep the saved values, but adopt the richer route type label.
      existing.routeType = entry.routeType || existing.routeType;
      return;
    }

    pages.set(route, {
      route,
      title: '',
      description: '',
      keywords: '',
      keywordsDerived: false,
      ogImage: '',
      noIndex: false,
      sitemapEnabled: true,
      sitemapOrder: entry.sitemapOrder ?? 100,
      sitemapPriority: entry.sitemapPriority ?? 0.5,
      sitemapChangefreq: entry.sitemapChangefreq || 'monthly',
      routeType: entry.routeType || 'Discovered',
      source: 'discovered',
      saveTarget: 'metadata',
      hasMetadata: false,
      updatedAt: null,
      // What the seeder would fill in, so the admin can one-click accept it.
      suggested: {
        title: entry.title || '',
        description: entry.description || '',
        keywords: entry.keywords || '',
      },
    });
  });

  return [...pages.values()].sort((a, b) => a.route.localeCompare(b.route));
};

const auditInputFrom = (page) => ({
  route: page.route,
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  ogImage: page.ogImage,
  noIndex: page.noIndex,
  sitemapEnabled: page.sitemapEnabled,
  sitemapOrder: page.sitemapOrder,
  sitemapPriority: page.sitemapPriority,
  sitemapChangefreq: page.sitemapChangefreq,
});

const persistAudit = async (report, page) => {
  await SeoAudit.findOneAndUpdate(
    { route: report.route },
    {
      $set: {
        route: report.route,
        noIndex: report.noIndex,
        score: report.score,
        grade: report.grade,
        label: report.label,
        totalWeight: report.totalWeight,
        totalEarned: report.totalEarned,
        checks: report.checks,
        counts: report.counts,
        snapshot: {
          title: page.title,
          description: page.description,
          keywords: page.keywords,
          ogImage: page.ogImage,
          noIndex: page.noIndex === true,
        },
        auditedAt: report.auditedAt,
      },
    },
    { upsert: true, new: true }
  );
};

/** Has the metadata changed since the stored audit was taken? */
const isStale = (audit, page) => {
  if (!audit) return false;
  const snap = audit.snapshot || {};
  return (
    (snap.title || '') !== (page.title || '') ||
    (snap.description || '') !== (page.description || '') ||
    (snap.keywords || '') !== (page.keywords || '') ||
    (snap.ogImage || '') !== (page.ogImage || '') ||
    (snap.noIndex === true) !== (page.noIndex === true)
  );
};

// GET /api/v1/seo-health/pages
export const getSeoPages = async (req, res) => {
  try {
    const pages = await collectPages();
    const audits = await SeoAudit.find().lean();
    const auditByRoute = new Map(audits.map((item) => [item.route, item]));

    const rows = pages.map((page) => {
      const audit = auditByRoute.get(page.route) || null;
      return {
        ...page,
        audited: Boolean(audit),
        stale: isStale(audit, page),
        score: audit?.score ?? null,
        grade: audit?.grade ?? null,
        healthLabel: audit?.label ?? null,
        counts: audit?.counts ?? null,
        improvements: audit ? (audit.counts?.failed || 0) + (audit.counts?.warnings || 0) : null,
        auditedAt: audit?.auditedAt ?? null,
      };
    });

    // Pages hidden from search are excluded from every headline number. Their
    // meta title length is irrelevant to traffic they will never receive, and
    // counting them would make deliberately hiding a page look like a regression.
    const indexable = rows.filter((row) => !row.noIndex);
    const scored = indexable.filter((row) => row.score !== null);
    const averageScore = scored.length
      ? Math.round(scored.reduce((sum, row) => sum + row.score, 0) / scored.length)
      : 0;

    const bySource = rows.reduce((acc, row) => {
      acc[row.source] = (acc[row.source] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      summary: {
        totalPages: rows.length,
        indexablePages: indexable.length,
        noIndexPages: rows.length - indexable.length,
        averageScore,
        averageGrade: gradeFor(averageScore).label,
        strongPages: scored.filter((row) => row.score >= 75).length,
        needImprovement: scored.filter((row) => row.score < 75).length,
        notAudited: indexable.length - scored.length,
        missingMetadata: indexable.filter((row) => !row.hasMetadata).length,
        staleAudits: rows.filter((row) => row.stale).length,
        totalIssues: scored.reduce((sum, row) => sum + (row.improvements || 0), 0),
        bySource,
      },
      pages: rows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading SEO pages', error: error.message });
  }
};

// POST /api/v1/seo-health/audit   body: { route }
export const auditSeoRoute = async (req, res) => {
  try {
    const route = readRoute(req);
    if (!route) {
      return res.status(400).json({ success: false, message: 'A route is required' });
    }

    const pages = await collectPages();
    const page = pages.find((item) => item.route === route);
    if (!page) {
      return res.status(404).json({ success: false, message: `No page found for route ${route}` });
    }

    const siblings = pages.map(auditInputFrom);
    const report = auditPage(auditInputFrom(page), siblings);
    await persistAudit(report, page);

    res.status(200).json({ success: true, report: { ...report, hasMetadata: page.hasMetadata, routeType: page.routeType } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error auditing route', error: error.message });
  }
};

// POST /api/v1/seo-health/audit-all
export const auditAllRoutes = async (req, res) => {
  try {
    const pages = await collectPages();
    const siblings = pages.map(auditInputFrom);

    const reports = pages.map((page) => auditPage(auditInputFrom(page), siblings));
    await Promise.all(reports.map((report, index) => persistAudit(report, pages[index])));

    // Drop audits for routes that no longer exist, so the summary stays honest.
    const liveRoutes = pages.map((page) => page.route);
    await SeoAudit.deleteMany({ route: { $nin: liveRoutes } });

    const averageScore = reports.length
      ? Math.round(reports.reduce((sum, report) => sum + report.score, 0) / reports.length)
      : 0;

    res.status(200).json({
      success: true,
      message: `Audited ${reports.length} page${reports.length === 1 ? '' : 's'}`,
      audited: reports.length,
      averageScore,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error running site audit', error: error.message });
  }
};

/**
 * POST /api/v1/seo-health/upload-social-image
 *
 * Separate from /metadata/upload because that endpoint converts to WebP, which
 * WhatsApp will not render in a link preview. This one emits JPEG at 1200×630.
 */
export const uploadSocialImage = async (req, res) => {
  const form = formidable({ maxFileSize: 12 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ success: false, message: 'Could not read the uploaded file' });
    }

    try {
      const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
      if (!uploaded) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
      }
      if (!String(uploaded.mimetype || '').startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'That file is not an image' });
      }

      const key = await uploadSocialCard(uploaded);
      const base = process.env.UPLOADS_PUBLIC_BASE_URL || process.env.AWS_FILE_PATH || '';

      res.status(200).json({
        success: true,
        url: `${base}${key}`,
        width: SOCIAL_CARD_WIDTH,
        height: SOCIAL_CARD_HEIGHT,
      });
    } catch (error) {
      console.error('Social card upload failed:', error);
      res.status(500).json({ success: false, message: 'Could not process the image', error: error.message });
    }
  });
};

/**
 * PUT /api/v1/seo-health/metadata   body: { route, title, description, ... }
 *
 * Upserts metadata for a route. This exists instead of reusing
 * `PUT /metadata/:route` because a route is a path, not a path *segment*:
 * the homepage `/` collapses to an empty segment (404), and nested filter
 * routes like `/shop/category/varsity` depend on %2F surviving every proxy in
 * front of the app. Carrying the route in the body sidesteps both.
 */
export const saveSeoMetadata = async (req, res) => {
  try {
    const route = readRoute(req);
    if (!route) {
      return res.status(400).json({ success: false, message: 'A route is required' });
    }
    if (SYSTEM_ROUTES.has(route)) {
      return res.status(400).json({ success: false, message: `${route} is managed elsewhere` });
    }

    const { title, description, keywords, ogImage } = req.body || {};
    if (!String(title || '').trim()) {
      return res.status(400).json({ success: false, message: 'A meta title is required' });
    }

    // Product pages store their SEO on the product, not in `metadatas` — that is
    // what the product editor writes and what the storefront falls back to. Writing
    // a metadata row instead would leave the product editor showing stale copy
    // that no longer matches the live page.
    const target = await resolveSaveTarget(route);
    if (target.kind === 'product') {
      const product = await productModel.findByIdAndUpdate(
        target.productId,
        {
          $set: {
            metaTitle: String(title).trim(),
            metaDescription: String(description || '').trim(),
            metaKeywords: String(keywords || '').trim(),
            ogImage: String(ogImage || '').trim(),
          },
        },
        { new: true }
      ).select('slug name metaTitle metaDescription metaKeywords ogImage noIndex').lean();

      return res.status(200).json({
        success: true,
        message: 'Product SEO saved',
        savedTo: 'product',
        product,
      });
    }

    const priority = Number(req.body.sitemapPriority);
    const order = Number(req.body.sitemapOrder);

    const payload = {
      route,
      title: String(title).trim(),
      description: String(description || '').trim(),
      keywords: String(keywords || '').trim(),
      ogImage: String(ogImage || '').trim(),
      sitemapEnabled: req.body.sitemapEnabled !== false,
      sitemapOrder: Number.isFinite(order) ? order : 100,
      sitemapPriority: Number.isFinite(priority) ? Math.min(1, Math.max(0, priority)) : 0.5,
      sitemapChangefreq: req.body.sitemapChangefreq || 'monthly',
    };

    // noIndex is owned by the Index Control screen, so it is only written when the
    // caller explicitly sends it. Otherwise saving a title from Edit SEO would
    // silently re-index a page somebody deliberately hid.
    if (typeof req.body.noIndex === 'boolean') {
      payload.noIndex = req.body.noIndex;
    }

    const metadata = await Metadata.findOneAndUpdate(
      { route },
      { $set: payload },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: 'SEO metadata saved', savedTo: 'metadata', metadata });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ success: false, message: 'Metadata already exists for this route' });
    }
    res.status(500).json({ success: false, message: 'Error saving SEO metadata', error: error.message });
  }
};

/**
 * Apply a noIndex value to one route, writing to whichever store owns it.
 *
 * For a route with no Metadata row and no product, this upserts a Metadata row
 * carrying only the flag. That row has no title, which would normally score 0 —
 * but a noindexed page is excluded from the average, so it costs nothing and it
 * gives the flag somewhere to live.
 */
const applyIndexing = async (route, noIndex) => {
  const target = await resolveSaveTarget(route);

  if (target.kind === 'product') {
    await productModel.updateOne({ _id: target.productId }, { $set: { noIndex } });
    return { route, noIndex, savedTo: 'product' };
  }

  await Metadata.findOneAndUpdate(
    { route },
    { $set: { noIndex }, $setOnInsert: { route } },
    { upsert: true, setDefaultsOnInsert: true }
  );
  return { route, noIndex, savedTo: 'metadata' };
};

// PUT /api/v1/seo-health/indexing   body: { route, noIndex }
export const setRouteIndexing = async (req, res) => {
  try {
    const route = readRoute(req);
    if (!route) {
      return res.status(400).json({ success: false, message: 'A route is required' });
    }
    if (SYSTEM_ROUTES.has(route)) {
      return res.status(400).json({ success: false, message: `${route} is managed elsewhere` });
    }
    if (typeof req.body?.noIndex !== 'boolean') {
      return res.status(400).json({ success: false, message: 'noIndex must be true or false' });
    }

    const result = await applyIndexing(route, req.body.noIndex);
    res.status(200).json({
      success: true,
      message: req.body.noIndex
        ? `${route} is now hidden from search engines`
        : `${route} is now indexable`,
      ...result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating indexing', error: error.message });
  }
};

// PUT /api/v1/seo-health/indexing/bulk   body: { routes: [], noIndex }
export const setBulkIndexing = async (req, res) => {
  try {
    const { routes, noIndex } = req.body || {};
    if (!Array.isArray(routes) || !routes.length) {
      return res.status(400).json({ success: false, message: 'At least one route is required' });
    }
    if (typeof noIndex !== 'boolean') {
      return res.status(400).json({ success: false, message: 'noIndex must be true or false' });
    }

    const normalized = [...new Set(routes.map(normalizeRoute))]
      .filter((route) => route && !SYSTEM_ROUTES.has(route));

    if (!normalized.length) {
      return res.status(400).json({ success: false, message: 'No valid routes supplied' });
    }

    // Sequential on purpose. Each route resolves its own target with two lookups,
    // and firing 200 of those at Mongo at once to save a few hundred milliseconds
    // is not a trade worth making on an admin action.
    const results = [];
    for (const route of normalized) {
      results.push(await applyIndexing(route, noIndex));
    }

    res.status(200).json({
      success: true,
      message: `${results.length} page${results.length === 1 ? '' : 's'} ${noIndex ? 'hidden from' : 'restored to'} search`,
      updated: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating indexing', error: error.message });
  }
};

// GET /api/v1/seo-health/report?route=/shop
export const getSeoReport = async (req, res) => {
  try {
    const route = readRoute(req);
    if (!route) {
      return res.status(400).json({ success: false, message: 'A route is required' });
    }

    const pages = await collectPages();
    const page = pages.find((item) => item.route === route);
    if (!page) {
      return res.status(404).json({ success: false, message: `No page found for route ${route}` });
    }

    const stored = await SeoAudit.findOne({ route }).lean();

    // Always recompute for the report view — it is cheap, and it means the panel
    // can never show a report that contradicts the metadata currently on screen.
    const siblings = pages.map(auditInputFrom);
    const report = auditPage(auditInputFrom(page), siblings);

    res.status(200).json({
      success: true,
      report: {
        ...report,
        hasMetadata: page.hasMetadata,
        routeType: page.routeType,
        suggested: page.suggested || null,
      },
      previous: stored
        ? { score: stored.score, auditedAt: stored.auditedAt }
        : null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error loading SEO report', error: error.message });
  }
};
