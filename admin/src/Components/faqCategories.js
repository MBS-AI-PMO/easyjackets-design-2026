// FAQ categories for the storefront pages that group their questions. Mirrors
// frontend/src/lib/faqGroups.js in the storefront: same names, same rule for a
// question that has no category yet, so this screen shows the grouping the site
// actually uses. Keep the two files in step.

const stripHtml = (html) => (html ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '');

const FAQ_PAGE_GROUPS = ['Ordering & payment', 'Design & artwork', 'Sizing & fit', 'Shipping & delivery', 'Returns & exchanges', 'Care & cleaning'];
const guessFaqPageGroup = (question, answer) => {
    const t = `${question} ${stripHtml(answer)}`.toLowerCase();
    if (/\b(return|refund|exchange|remake|damaged|mistake)/.test(t)) return 'Returns & exchanges';
    if (/\b(wash|clean|iron|dry[- ]clean|storage|store it|condition)/.test(t)) return 'Care & cleaning';
    if (/\b(ship|deliver|arrive|tracking|customs|dut(y|ies)|rush|how long|turnaround|production time)/.test(t)) return 'Shipping & delivery';
    if (/\b(size|sizing|measure|fit\b|chest|sleeve length|youth|women)/.test(t)) return 'Sizing & fit';
    if (/\b(design|logo|artwork|patch|embroider|chenille|proof|mockup|customi[sz]|names? and numbers|colou?rs?|materials?|fabric|leather|wool|satin)/.test(t)) return 'Design & artwork';
    return 'Ordering & payment';
};

const BULK_FAQ_GROUPS = ['Quotes, pricing & payment', 'Design & customization', 'Sizes & team orders', 'Production & shipping', 'Schools, brands & organizations'];
const guessBulkGroup = (question) => {
    const t = String(question || '').toLowerCase();
    if (/private label|fraternit|sororit|fundrais|clothing brand|why choose|booster/.test(t)) return 'Schools, brands & organizations';
    if (/\bsizes?\b|sizing|youth|reorder|combine|roster/.test(t)) return 'Sizes & team orders';
    if (/mock-?ups?|proofs?\b|pantone|file formats?|decoration|embroider|chenille|names? and numbers?|logo/.test(t)) return 'Design & customization';
    if (/minimum|quote|discount|payment|\bpay\b|setup|\bfees?\b|samples?\b|price|pricing|cost|start my order|deposit|invoic/.test(t)) return 'Quotes, pricing & payment';
    if (/production|ship|deliver|packag|photos before|turnaround|how long|arrive|deadline/.test(t)) return 'Production & shipping';
    return 'Design & customization';
};

/** Page key -> the headings that page groups its questions under, and the rule for an uncategorised question. */
const GROUPED_PAGES = {
    '/faq': { label: 'the FAQ page', groups: FAQ_PAGE_GROUPS, guess: guessFaqPageGroup },
    '/bulk-order': { label: 'the bulk order page', groups: BULK_FAQ_GROUPS, guess: guessBulkGroup },
};

/** True when the storefront groups this page's questions by category. */
export const isGroupedPage = (pageKey) => Boolean(GROUPED_PAGES[pageKey]);

/** The category names to suggest while editing a question on this page. */
export const categorySuggestions = (pageKey) => (GROUPED_PAGES[pageKey] || GROUPED_PAGES['/faq']).groups;

/** Which page the category groups ("the bulk order page"), for labels. */
export const groupedPageLabel = (pageKey) => GROUPED_PAGES[pageKey]?.label || 'this page';

/** The heading the storefront files an uncategorised question under ('' on pages that do not group). */
export const autoCategory = (pageKey, question, answer) => {
    const page = GROUPED_PAGES[pageKey];
    return page ? page.guess(question || '', answer || '') : '';
};
