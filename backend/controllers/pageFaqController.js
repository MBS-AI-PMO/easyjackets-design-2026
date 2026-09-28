// controllers/pageFaqController.js
//
// CRUD for the FAQ block on any page, plus the grouped read the storefront uses.
//
// The collection is seeded once from data/faqDefaults.js — the content that used
// to be hardcoded in the storefront — so switching the site over to this API is a
// no-op visually. After that seed the collection is authoritative and the
// defaults file is never consulted again.

import PageFaq from '../models/pageFaq.js';
import CustomJacketFaq from '../models/customJacketFaq.js';
import { FAQ_DEFAULTS } from '../data/faqDefaults.js';
import {
  FAQ_TEMPLATES,
  KNOWN_FAQ_PAGES,
  isTemplateKey,
  normalizePageKey,
  labelForPageKey,
} from '../helpers/faqPages.js';

const SORT = { sortOrder: 1, createdAt: 1 };

const cleanText = (value) => String(value ?? '').trim();

/**
 * Answers are written in the admin's rich text editor, so HTML is expected and
 * kept — links, bold, lists. Scripts, styles, frames, inline event handlers and
 * javascript: URLs are never a legitimate part of an answer, and the storefront
 * renders answers with innerHTML, so they are stripped here rather than trusted.
 */
const cleanAnswerHtml = (value) => String(value ?? '')
  .replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/<\/?(script|style|iframe|object|embed)\b[^>]*>/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*"[^"]*"/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*'[^']*'/gi, '')
  .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
  .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
  .trim();

/** '<p><br></p>' is an empty answer, even though it is not an empty string. */
const hasVisibleText = (value) => String(value ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim().length > 0;

const cleanPoints = (value) => {
  if (!Array.isArray(value)) return undefined;
  const points = value.map(cleanText).filter(Boolean);
  return points.length ? points : undefined;
};

/**
 * The jacket builder's FAQs were already editable, in their own collection, so
 * they get migrated rather than re-seeded from the defaults file.
 *
 * This matters: in production one of those five is deliberately deactivated.
 * Seeding from FAQ_DEFAULTS would have silently put it back on the live page.
 */
const BUILDER_PAGE_KEY = 'jacket-builder';

const migratedBuilderFaqs = async () => {
  const existing = await CustomJacketFaq.find().sort(SORT).lean();
  if (!existing.length) return null;

  return existing.map((faq, index) => ({
    pageKey: BUILDER_PAGE_KEY,
    question: faq.question,
    answer: faq.answer,
    sortOrder: Number.isFinite(Number(faq.sortOrder)) ? Number(faq.sortOrder) : index + 1,
    isActive: faq.isActive !== false,
  }));
};

/**
 * Seed once, and only into a genuinely empty collection.
 *
 * Guarded on a total count rather than per page: if an admin deletes every FAQ
 * from a page on purpose, re-seeding that page would resurrect content they
 * removed. An empty collection can only mean "never seeded".
 */
let seedPromise = null;
const ensureSeeded = async () => {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const count = await PageFaq.estimatedDocumentCount();
    if (count > 0) return;

    const builder = await migratedBuilderFaqs();
    const seed = builder
      ? [...FAQ_DEFAULTS.filter((faq) => faq.pageKey !== BUILDER_PAGE_KEY), ...builder]
      : FAQ_DEFAULTS;

    await PageFaq.insertMany(seed);
    console.log(
      `pageFaq: seeded ${seed.length} FAQs`
      + (builder ? ` (${builder.length} migrated from customjacketfaqs)` : '')
    );
  })().catch((error) => {
    // Let the next request retry rather than caching a failure forever.
    seedPromise = null;
    throw error;
  });
  return seedPromise;
};

const publicFaq = (faq) => ({
  _id: faq._id,
  question: faq.question,
  answer: faq.answer,
  category: faq.category || '',
  ...(faq.points?.length ? { points: faq.points } : {}),
});

const nextSortOrder = async (pageKey) => {
  const last = await PageFaq.findOne({ pageKey }).sort({ sortOrder: -1, createdAt: -1 }).lean();
  return (Number(last?.sortOrder) || 0) + 1;
};

/**
 * Storefront read. Returns active FAQs for one page, or for every page at once.
 *
 * The bulk form exists so a page that renders more than one FAQ block, and the
 * admin preview, do not need a request per page.
 */
export const getPageFaqsController = async (req, res) => {
  try {
    await ensureSeeded();

    const requested = normalizePageKey(req.query.pageKey || req.query.page || '');

    if (requested) {
      const faqs = await PageFaq.find({ pageKey: requested, isActive: true }).sort(SORT).lean();
      return res.status(200).json({ success: true, pageKey: requested, faqs: faqs.map(publicFaq) });
    }

    const all = await PageFaq.find({ isActive: true }).sort(SORT).lean();
    const byPage = all.reduce((acc, faq) => {
      (acc[faq.pageKey] ||= []).push(publicFaq(faq));
      return acc;
    }, {});

    res.status(200).json({ success: true, faqs: byPage });
  } catch (error) {
    console.error('Error fetching page FAQs:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQs.' });
  }
};

/** Admin read: every FAQ including inactive ones, grouped into the screen's tabs. */
export const getAdminPageFaqsController = async (req, res) => {
  try {
    await ensureSeeded();

    const all = await PageFaq.find().sort(SORT).lean();
    const counts = all.reduce((acc, faq) => {
      acc[faq.pageKey] = (acc[faq.pageKey] || 0) + 1;
      return acc;
    }, {});

    // Tabs are every page that has FAQs, plus the known and template pages even
    // when empty — otherwise a page whose FAQs were all deleted would vanish from
    // the screen with no way to add one back.
    const pageKeys = [...new Set([
      ...Object.keys(FAQ_TEMPLATES),
      ...KNOWN_FAQ_PAGES.map((page) => page.pageKey),
      ...Object.keys(counts),
    ])];

    const pages = pageKeys.map((pageKey) => ({
      pageKey,
      label: labelForPageKey(pageKey),
      isTemplate: isTemplateKey(pageKey),
      template: FAQ_TEMPLATES[pageKey] || null,
      total: counts[pageKey] || 0,
      active: all.filter((faq) => faq.pageKey === pageKey && faq.isActive).length,
    }));

    res.status(200).json({ success: true, pages, faqs: all });
  } catch (error) {
    console.error('Error fetching admin page FAQs:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQs.' });
  }
};

export const createPageFaqController = async (req, res) => {
  try {
    const pageKey = normalizePageKey(req.body.pageKey);
    const question = cleanText(req.body.question);
    const answer = cleanAnswerHtml(req.body.answer);

    if (!pageKey) {
      return res.status(400).json({ success: false, message: 'A page is required.' });
    }
    if (!question || !hasVisibleText(answer)) {
      return res.status(400).json({ success: false, message: 'Question and answer are required.' });
    }

    const faq = await PageFaq.create({
      pageKey,
      question,
      answer,
      points: cleanPoints(req.body.points),
      category: cleanText(req.body.category || '').slice(0, 60),
      sortOrder: Number.isFinite(Number(req.body.sortOrder))
        ? Number(req.body.sortOrder)
        : await nextSortOrder(pageKey),
      isActive: req.body.isActive !== false,
    });

    res.status(201).json({ success: true, message: 'FAQ added.', faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ success: false, message: 'Error creating FAQ.' });
  }
};

export const updatePageFaqController = async (req, res) => {
  try {
    const faq = await PageFaq.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found.' });
    }

    const has = (field) => Object.prototype.hasOwnProperty.call(req.body, field);

    if (has('question')) {
      const question = cleanText(req.body.question);
      if (!question) return res.status(400).json({ success: false, message: 'Question is required.' });
      faq.question = question;
    }

    if (has('answer')) {
      const answer = cleanAnswerHtml(req.body.answer);
      if (!hasVisibleText(answer)) {
        return res.status(400).json({ success: false, message: 'Answer is required.' });
      }
      faq.answer = answer;
    }

    if (has('points')) faq.points = cleanPoints(req.body.points);
    if (has('category')) faq.category = cleanText(req.body.category || '').slice(0, 60);
    if (has('isActive')) faq.isActive = Boolean(req.body.isActive);
    if (has('sortOrder') && Number.isFinite(Number(req.body.sortOrder))) {
      faq.sortOrder = Number(req.body.sortOrder);
    }

    // Moving an FAQ to another page is allowed, but it goes to the end of that
    // page rather than keeping a sortOrder that means nothing there.
    if (has('pageKey')) {
      const pageKey = normalizePageKey(req.body.pageKey);
      if (!pageKey) return res.status(400).json({ success: false, message: 'A page is required.' });
      if (pageKey !== faq.pageKey) {
        faq.pageKey = pageKey;
        faq.sortOrder = await nextSortOrder(pageKey);
      }
    }

    await faq.save();
    res.status(200).json({ success: true, message: 'FAQ updated.', faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, message: 'Error updating FAQ.' });
  }
};

export const deletePageFaqController = async (req, res) => {
  try {
    const faq = await PageFaq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found.' });
    }
    res.status(200).json({ success: true, message: 'FAQ deleted.' });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, message: 'Error deleting FAQ.' });
  }
};

/**
 * Legacy endpoint kept for the jacket builder app, which ships separately and
 * still calls /features/custom-jacket-faqs. It now reads the unified collection,
 * so the builder's FAQs are managed from the same screen as every other page
 * instead of drifting in their own store.
 */
export const getBuilderFaqsController = async (req, res) => {
  try {
    await ensureSeeded();

    const requestedLimit = Number(req.query.limit);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20) : 5;

    const faqs = await PageFaq.find({ pageKey: BUILDER_PAGE_KEY, isActive: true })
      .sort(SORT)
      .limit(limit)
      .lean();

    res.status(200).json({ success: true, faqs: faqs.map(publicFaq) });
  } catch (error) {
    console.error('Error fetching jacket builder FAQs:', error);
    res.status(500).json({ success: false, message: 'Error fetching FAQs.' });
  }
};

/** Persist a drag-reordered list in one round trip. */
export const reorderPageFaqsController = async (req, res) => {
  try {
    const order = Array.isArray(req.body.order) ? req.body.order : [];
    if (!order.length) {
      return res.status(400).json({ success: false, message: 'An ordered list of FAQ ids is required.' });
    }

    await PageFaq.bulkWrite(
      order.map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { sortOrder: index + 1 } } },
      })),
      { ordered: false }
    );

    res.status(200).json({ success: true, message: 'Order saved.' });
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    res.status(500).json({ success: false, message: 'Error saving order.' });
  }
};
