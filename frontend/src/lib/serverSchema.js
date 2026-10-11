// True when the storefront server (server.mjs) wrote this page and already put FAQPage schema in its head:
// the app then adds no second FAQPage block (duplicate structured data). Only on the page the server
// wrote: its canonical carries data-ssr-path until the first in-app navigation (components/Seo.jsx).
export const serverWroteFaq = () => {
  if (typeof document === 'undefined') return false;
  const canonical = document.head.querySelector('link[rel="canonical"][data-ssr-path]');
  if (!canonical) return false;
  const path = (window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
  if (String(canonical.getAttribute('data-ssr-path')).toLowerCase() !== path) return false;
  return [...document.head.querySelectorAll('script[type="application/ld+json"]')].some((s) => s.textContent.includes('"FAQPage"'));
};
