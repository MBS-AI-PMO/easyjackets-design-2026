// FAQ categories for the pages that group their questions: the FAQ page and the
// bulk-order page. A question's group is the category set in the admin's
// Storefront FAQs screen; until one is set it is filed by what it asks about.
// The admin (admin/src/Components/faqCategories.js) carries the same names and
// rules, so it shows exactly the grouping the storefront uses. Keep them in step.
import { stripHtml } from './html';

export const faqSlug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** /faq */
export const FAQ_PAGE_GROUPS = ['Ordering & payment', 'Design & artwork', 'Sizing & fit', 'Shipping & delivery', 'Returns & exchanges', 'Care & cleaning'];
export const guessFaqPageGroup = (f) => {
  const t = `${f.q} ${stripHtml(f.a)}`.toLowerCase();
  if (/\b(return|refund|exchange|remake|damaged|mistake)/.test(t)) return 'Returns & exchanges';
  if (/\b(wash|clean|iron|dry[- ]clean|storage|store it|condition)/.test(t)) return 'Care & cleaning';
  if (/\b(ship|deliver|arrive|tracking|customs|dut(y|ies)|rush|how long|turnaround|production time)/.test(t)) return 'Shipping & delivery';
  if (/\b(size|sizing|measure|fit\b|chest|sleeve length|youth|women)/.test(t)) return 'Sizing & fit';
  if (/\b(design|logo|artwork|patch|embroider|chenille|proof|mockup|customi[sz]|names? and numbers|colou?rs?|materials?|fabric|leather|wool|satin)/.test(t)) return 'Design & artwork';
  return 'Ordering & payment';
};

/** /bulk-order — judged on the question alone (bulk answers mention quotes and shipping everywhere). */
export const BULK_FAQ_GROUPS = ['Quotes, pricing & payment', 'Design & customization', 'Sizes & team orders', 'Production & shipping', 'Schools, brands & organizations'];
export const guessBulkGroup = (f) => {
  const t = String(f.q || '').toLowerCase();
  if (/private label|fraternit|sororit|fundrais|clothing brand|why choose|booster/.test(t)) return 'Schools, brands & organizations';
  if (/\bsizes?\b|sizing|youth|reorder|combine|roster/.test(t)) return 'Sizes & team orders';
  if (/mock-?ups?|proofs?\b|pantone|file formats?|decoration|embroider|chenille|names? and numbers?|logo/.test(t)) return 'Design & customization';
  if (/minimum|quote|discount|payment|\bpay\b|setup|\bfees?\b|samples?\b|price|pricing|cost|start my order|deposit|invoic/.test(t)) return 'Quotes, pricing & payment';
  if (/production|ship|deliver|packag|photos before|turnaround|how long|arrive|deadline/.test(t)) return 'Production & shipping';
  return 'Design & customization';
};

/**
 * Group a list: the page's own groups in their order first, then any other
 * category an admin typed. `groups` and `guess` default to the FAQ page's.
 */
export function groupFaqs(faqs, groups = FAQ_PAGE_GROUPS, guess = guessFaqPageGroup) {
  const byName = new Map();
  for (const f of faqs) {
    const name = (f.category || '').trim() || guess(f);
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(f);
  }
  const order = [...groups.filter((g) => byName.has(g)), ...[...byName.keys()].filter((g) => !groups.includes(g))];
  return order.map((name) => ({ name, id: faqSlug(name), items: byName.get(name) }));
}
