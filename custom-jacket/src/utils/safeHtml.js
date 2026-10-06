// Admin-authored HTML (FAQ answers from the admin's rich-text editor) goes through here before it
// reaches the page: nothing executable survives, and pasted-in inline styling is dropped so the
// page's own typography applies. The storefront has the same rules in frontend/src/lib/html.js;
// this builder ships separately and cannot import from it.
// DOMPurify does the cleaning (the hand-made filter before it could be tricked, e.g. by markup hidden
// inside <noscript> that only turned into a live <img onerror> once on the page); the rest is tidying.
import DOMPurify from 'dompurify';
import { uploadUrl } from '../config/url';

const BLOCKED_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta'];
// tags that read differently once on the page than when cleaned, or change how the page resolves links
const PURIFY = {
  FORBID_TAGS: [...BLOCKED_TAGS, 'noscript', 'xmp', 'noembed', 'noframes', 'base', 'template', 'math'],
  RETURN_DOM: true,
};
const OUR_UPLOAD = /^(https?:\/\/api2?\.easyjackets\.com)?\/uploads\//i;
const PASTE_ATTRS = ['style', 'dir', 'class', 'lang', 'align', 'width', 'height', 'face', 'size', 'color', 'bgcolor'];

export const hasMarkup = (s) => /<[a-z][\s\S]*>/i.test(String(s || ''));

export function safeHtml(html) {
  if (typeof window === 'undefined') return '';
  const doc = { body: DOMPurify.sanitize(String(html || ''), PURIFY) };
  for (const tag of BLOCKED_TAGS) for (const el of [...doc.body.querySelectorAll(tag)]) el.remove();
  for (const el of doc.body.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(attr.value))) el.removeAttribute(attr.name);
      else if (PASTE_ATTRS.includes(name) || (name === 'id' && /^docs-internal/.test(attr.value))) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      const href = el.getAttribute('href') || '';
      if (OUR_UPLOAD.test(href)) el.setAttribute('href', uploadUrl(href));
      else if (/^https?:/i.test(href) && !href.includes(window.location.host)) { el.setAttribute('rel', 'noopener noreferrer'); el.setAttribute('target', '_blank'); }
    }
    if (el.tagName === 'IMG') {
      el.setAttribute('loading', 'lazy');
      el.setAttribute('decoding', 'async');
      const src = el.getAttribute('src');
      if (src && OUR_UPLOAD.test(src)) el.setAttribute('src', uploadUrl(src));
      el.removeAttribute('srcset');
    }
  }
  // Google Docs wraps everything in a span and pads with empty paragraphs
  for (const el of [...doc.body.querySelectorAll('span')]) if (!el.attributes.length) el.replaceWith(...el.childNodes);
  for (const p of [...doc.body.querySelectorAll('p')]) if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
  return doc.body.innerHTML;
}

export const stripHtml = (html) => (html ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : '');
