/**
 * Numbered pages: Prev, 1 … around the current page … last, Next. Renders
 * nothing for a single page. `onChange(n)` receives the page to open.
 * `hrefFor(n)`: when given, every page is a real link (`?page=2` …) that crawlers
 * can follow (N-A8); a plain click still goes through `onChange`, and a
 * ctrl/cmd/middle click opens the page in a new tab as any link would.
 */
export default function Pagination({ page, pages, onChange, disabled = false, label = 'Pages', hrefFor }) {
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

  // one page control: a link when hrefFor is given (a span when it leads nowhere), a button otherwise
  const control = (n, { key, className = 'ez-page', children, off = false, current = false, ...rest }) => {
    if (!hrefFor) {
      return <button key={key} type="button" className={className} aria-current={current ? 'page' : undefined} onClick={() => go(n)} disabled={off || disabled} {...rest}>{children}</button>;
    }
    if (off || current) {
      return <span key={key} className={className} aria-current={current ? 'page' : undefined} aria-disabled={off ? 'true' : undefined} {...rest}>{children}</span>;
    }
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      go(n);
    };
    return <a key={key} href={hrefFor(n)} className={className} onClick={onClick} aria-disabled={disabled ? 'true' : undefined} {...rest}>{children}</a>;
  };

  return (
    <nav className="ez-pages" aria-label={label}>
      {/* the names hold the visible words ("Prev", "Next"), so voice control finds the controls */}
      {control(page - 1, { key: 'prev', className: 'ez-page ez-page-step', off: page <= 1, 'aria-label': 'Prev page', rel: hrefFor && page > 1 ? 'prev' : undefined, children: '← Prev' })}
      {list.map((item) => (typeof item === 'string'
        ? <span key={item} className="ez-page-gap" aria-hidden="true">…</span>
        : control(item, { key: item, current: item === page, children: item })))}
      {control(page + 1, { key: 'next', className: 'ez-page ez-page-step', off: page >= pages, 'aria-label': 'Next page', rel: hrefFor && page < pages ? 'next' : undefined, children: 'Next →' })}
      <span className="ez-page-status">Page {page} of {pages}</span>
    </nav>
  );
}
