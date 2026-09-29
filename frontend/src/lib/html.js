// Admin-authored HTML (product descriptions, blog posts) goes through here
// before it reaches the page: nothing executable survives, and for articles
// the pasted-in inline styling is dropped so the site's own typography applies.
import { uploadUrl } from './api';

const BLOCKED_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta'];
// an uploaded file: https://api.easyjackets.com/uploads/…, https://api2.easyjackets.com/uploads/… or /uploads/…
const OUR_UPLOAD = /^(https?:\/\/api2?\.easyjackets\.com)?\/uploads\//i;
const PASTE_ATTRS = ['style', 'dir', 'class', 'lang', 'align', 'width', 'height', 'face', 'size', 'color', 'bgcolor'];

const parse = (html) => (typeof DOMParser === 'undefined' ? null : new DOMParser().parseFromString(String(html || ''), 'text/html'));

function scrub(doc, { stripStyles = false } = {}) {
  for (const tag of BLOCKED_TAGS) for (const el of [...doc.body.querySelectorAll(tag)]) el.remove();
  for (const el of doc.body.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attr.value))) el.removeAttribute(attr.name);
      else if (stripStyles && (PASTE_ATTRS.includes(name) || (name === 'id' && /^docs-internal/.test(attr.value)))) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A' && /^https?:/i.test(el.getAttribute('href') || '') && !el.getAttribute('href').includes(location.host)) { el.setAttribute('rel', 'noopener noreferrer'); el.setAttribute('target', '_blank'); }
    if (el.tagName === 'IMG') {
      el.setAttribute('loading', 'lazy');
      el.setAttribute('decoding', 'async');
      // uploaded images (the API's /uploads, on the api or api2 address) load from the API this site
      // talks to, like every other image; a bare api2 address would not resolve before that domain exists
      const src = el.getAttribute('src');
      if (src && OUR_UPLOAD.test(src)) el.setAttribute('src', uploadUrl(src));
      el.removeAttribute('srcset');
    }
    if (el.tagName === 'A' && OUR_UPLOAD.test(el.getAttribute('href') || '')) el.setAttribute('href', uploadUrl(el.getAttribute('href')));
  }
  if (stripStyles) {
    // Google Docs wraps everything in a span and pads with empty paragraphs
    for (const el of [...doc.body.querySelectorAll('span')]) if (!el.attributes.length) el.replaceWith(...el.childNodes);
    for (const p of [...doc.body.querySelectorAll('p')]) if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
  }
}

export function safeHtml(html, opts) {
  const doc = parse(html);
  if (!doc) return '';
  scrub(doc, opts);
  return doc.body.innerHTML;
}

export const stripHtml = (html) => (html ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '');

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';

/** Cleans an article and gives every h2 an id, returning the html plus its table of contents. */
export function prepareArticle(html) {
  const doc = parse(html);
  if (!doc) return { html: '', toc: [] };
  scrub(doc, { stripStyles: true });
  const toc = [];
  const seen = new Set();
  for (const h of doc.body.querySelectorAll('h2')) {
    const text = h.textContent.trim();
    if (!text) { h.remove(); continue; }
    let id = slugify(text);
    while (seen.has(id)) id += '-2';
    seen.add(id);
    h.id = id;
    toc.push({ id, text });
  }
  return { html: doc.body.innerHTML, toc };
}
