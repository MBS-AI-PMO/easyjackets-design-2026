// Plain HTML for the page text the storefront server writes into each page before JavaScript runs, so
// search engines and AI answer engines that do not run scripts still read the page (seo-render `content`).
// Admin-written article HTML is reduced to a safe subset: headings, paragraphs, lists, tables, emphasis
// and links. Every other tag goes, and so does every attribute except a link's address.

export const escapeHtml = (value = '') =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const KEPT_TAGS = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'br', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'];
const KEPT = new Set(KEPT_TAGS);
// removed together with everything inside them
const DROPPED_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|template|svg|math|select|textarea|button|form)\b[\s\S]*?<\/\1\s*>/gi;
// after the pass below only the exact tags it writes may remain; any other "<" is shown as text
const LEFTOVER_LT = new RegExp(`<(?!/?(?:${KEPT_TAGS.join('|')})(?: href="[^"<>]*")?>)`, 'g');

const safeHref = (raw = '') => {
  const href = String(raw).trim().replace(/&amp;/g, '&');
  if (href.startsWith('//')) return `https:${href}`;
  if (/^https?:\/\//i.test(href) || href.startsWith('/') || href.startsWith('#') || /^mailto:/i.test(href)) return href;
  return '';
};

/** Article HTML from the admin editor → the safe subset. An H1 inside a post becomes an H2: the title is the page's one H1. */
export const sanitizeArticleHtml = (html = '') =>
  String(html || '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(DROPPED_WITH_CONTENT, '')
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (tag, rawName, attrs) => {
      let name = rawName.toLowerCase();
      if (name === 'h1') name = 'h2';
      if (name === 'h5' || name === 'h6') name = 'h4';
      if (!KEPT.has(name)) return /^(div|section|article)$/.test(name) ? ' ' : '';
      if (tag.startsWith('</')) return name === 'br' ? '' : `</${name}>`;
      if (name === 'br') return '<br>';
      if (name === 'a') {
        const m = attrs.match(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = safeHref(m ? (m[1] ?? m[2] ?? m[3]) : '');
        return href ? `<a href="${escapeHtml(href)}">` : '<a>';
      }
      return `<${name}>`;
    })
    .replace(LEFTOVER_LT, '&lt;')
    .replace(/(\s*<p>\s*(?:&nbsp;|\s)*<\/p>)+/gi, '')
    .replace(/<(\/?)h([2-4])>/g, stepHeadings())
    .trim();

// heading levels never skip (an h4 straight after an h2 becomes an h3), as the storefront's prepareArticle does
function stepHeadings() {
  let previous = 1;
  let open = 2;
  return (tag, closing, raw) => {
    if (closing) return `</h${open}>`;
    open = Math.max(2, Math.min(Number(raw), previous + 1));
    previous = open;
    return `<h${open}>`;
  };
}

/** "<h2>Questions</h2><dl>…</dl>" for a page's FAQs (answers are admin HTML, reduced to the safe subset). */
export const faqHtml = (faqs = [], heading = 'Frequently asked questions') => {
  const items = (faqs || []).filter((f) => f?.question && f?.answer);
  if (!items.length) return '';
  return `<section><h2>${escapeHtml(heading)}</h2>${items
    .map((f) => `<h3>${escapeHtml(String(f.question).replace(/<[^>]+>/g, '').trim())}</h3><div>${sanitizeArticleHtml(f.answer)}</div>`)
    .join('')}</section>`;
};

export const linkList = (links = [], heading = '') => {
  const items = links.filter((l) => l?.href && l?.label);
  if (!items.length) return '';
  return `<nav${heading ? ` aria-label="${escapeHtml(heading)}"` : ''}>${heading ? `<h2>${escapeHtml(heading)}</h2>` : ''}<ul>${items
    .map((l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>${l.note ? ` — ${escapeHtml(l.note)}` : ''}</li>`)
    .join('')}</ul></nav>`;
};
