import DOMPurify from 'dompurify';

// Stored HTML (FAQ answers, blog posts, product descriptions) is cleaned before the admin puts it on the
// page or into an editor: nothing executable survives (the storefront and the builder clean it the same
// way: frontend/src/lib/html.js, custom-jacket/src/utils/safeHtml.js).
const PURIFY = {
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta', 'noscript', 'xmp', 'noembed', 'noframes', 'base', 'template', 'math'],
};

export const cleanHtml = (html) => DOMPurify.sanitize(String(html || ''), PURIFY);
