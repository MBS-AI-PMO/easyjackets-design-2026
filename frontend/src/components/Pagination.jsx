/**
 * Numbered pages: Prev, 1 … around the current page … last, Next. Renders
 * nothing for a single page. `onChange(n)` receives the page to open.
 */
export default function Pagination({ page, pages, onChange, disabled = false, label = 'Pages' }) {
  if (!pages || pages <= 1) return null;
  const near = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const list = [];
  let prev = 0;
  for (let n = 1; n <= pages; n += 1) {
    if (!near.has(n)) continue;
    if (n - prev > 1) list.push(n - prev === 2 ? prev + 1 : `gap-${n}`);
    list.push(n);
    prev = n;
  }
  const go = (n) => { if (!disabled && n >= 1 && n <= pages && n !== page) onChange(n); };
  return (
    <nav className="ez-pages" aria-label={label}>
      {/* the names hold the visible words ("Prev", "Next"), so voice control finds the buttons */}
      <button type="button" className="ez-page ez-page-step" onClick={() => go(page - 1)} disabled={disabled || page <= 1} aria-label="Prev page">← Prev</button>
      {list.map((item) => (typeof item === 'string'
        ? <span key={item} className="ez-page-gap" aria-hidden="true">…</span>
        : <button key={item} type="button" className="ez-page" aria-current={item === page ? 'page' : undefined} onClick={() => go(item)} disabled={disabled}>{item}</button>))}
      <button type="button" className="ez-page ez-page-step" onClick={() => go(page + 1)} disabled={disabled || page >= pages} aria-label="Next page">Next →</button>
      <span className="ez-page-status">Page {page} of {pages}</span>
    </nav>
  );
}
