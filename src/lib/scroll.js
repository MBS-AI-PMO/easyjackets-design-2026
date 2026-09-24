/** Scrolls to the element a "#hash" names; "#top" or no id means the page top. */
export function scrollToHash(hash) {
  const id = decodeURIComponent(hash.replace(/^#/, ''));
  if (!id || id === 'top') { window.scrollTo({ top: 0 }); return true; }
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ block: 'start' });
  return true;
}
