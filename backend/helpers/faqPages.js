// helpers/faqPages.js
//
// Describes the pages that can carry an FAQ section, and how each one is
// rendered. The admin screen builds its tabs from this plus whatever pageKeys
// already exist in the database, so an FAQ area can be added to any page on the
// site without a code change.

/**
 * Pages whose FAQ list is generated from a single template.
 *
 * A product FAQ is not written 149 times — it is written once with
 * `{productName}` in it, and the storefront substitutes the real name per page.
 * Same for catalog and filter pages, where `{productPhrase}` becomes
 * "black varsity jackets" or "custom varsity jackets" depending on the filter.
 */
export const FAQ_TEMPLATES = {
  'product-template': {
    label: 'Product Pages',
    scope: '/product/*',
    description: 'One template, applied to every product page. Placeholders are replaced with the jacket being viewed.',
    placeholders: [
      { token: '{productName}', example: 'Black and Red Varsity Jacket', note: "The product's name" },
    ],
  },
  'catalog-template': {
    label: 'Catalog & Filter Pages',
    scope: '/shop, /sports-spirit-wears and their colour, size, material, and category filters',
    description: 'One template, applied to every catalog and filter landing page.',
    placeholders: [
      { token: '{productPhrase}', example: 'black varsity jackets', note: 'The collection being browsed, including any active filter' },
    ],
  },
};

/**
 * Keys that are names rather than routes.
 *
 * An explicit allowlist, not a "has no slash" rule: the jacket builder is an area
 * inside another app with no route of its own, but 'contact' and 'faq' are real
 * routes typed without their slash, and treating those as named areas would split
 * one page's FAQs across two keys.
 */
export const NAMED_AREAS = new Set(['jacket-builder']);

/** Pages that ship with FAQs today. Any other route can be added from the admin screen. */
export const KNOWN_FAQ_PAGES = [
  { pageKey: '/faq', label: 'FAQ Page' },
  { pageKey: '/bulk-order', label: 'Bulk Order' },
  { pageKey: '/varsity-jackets', label: 'Varsity Jackets' },
  { pageKey: '/design-custom-jacket', label: 'Design Studio' },
  { pageKey: '/letterman-jackets', label: 'Letterman Jackets' },
  { pageKey: '/school-jackets', label: 'School Jackets' },
  { pageKey: '/senior-jackets', label: 'Senior Jackets' },
  { pageKey: '/team-jackets', label: 'Team Jackets' },
  { pageKey: '/mens-varsity-jackets', label: "Men's Varsity Jackets" },
  { pageKey: '/womens-varsity-jackets', label: "Women's Varsity Jackets" },
  { pageKey: '/leather-varsity-jackets', label: 'Leather Varsity Jackets' },
  { pageKey: '/wool-and-leather-varsity-jackets', label: 'Wool and Leather Varsity Jackets' },
  { pageKey: '/satin-bomber-jackets', label: 'Satin Bomber Jackets' },
  { pageKey: 'jacket-builder', label: 'Jacket Builder' },
];

export const isTemplateKey = (pageKey) =>
  Object.prototype.hasOwnProperty.call(FAQ_TEMPLATES, String(pageKey || ''));

/**
 * Normalise a page key.
 *
 * Template keys and named areas are literal strings; everything else is a route
 * and gets the same leading-slash / no-trailing-slash treatment metadata routes
 * get, so '/faq/', '/faq' and 'faq' cannot become three FAQ lists for one page.
 */
export const normalizePageKey = (pageKey = '') => {
  const trimmed = String(pageKey || '').trim();
  if (!trimmed) return '';
  if (isTemplateKey(trimmed) || NAMED_AREAS.has(trimmed)) return trimmed;
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withSlash === '/' ? '/' : withSlash.replace(/\/+$/, '');
};

export const labelForPageKey = (pageKey) => {
  if (isTemplateKey(pageKey)) return FAQ_TEMPLATES[pageKey].label;
  const known = KNOWN_FAQ_PAGES.find((page) => page.pageKey === pageKey);
  if (known) return known.label;
  return pageKey;
};

/** Substitute template placeholders. Unknown tokens are left alone rather than blanked. */
export const applyFaqTemplate = (text = '', values = {}) =>
  String(text || '').replace(/\{(\w+)\}/g, (match, token) =>
    (Object.prototype.hasOwnProperty.call(values, token) ? String(values[token] ?? '') : match));
