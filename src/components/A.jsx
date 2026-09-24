import { Link, useLocation } from 'react-router-dom';
import { scrollToHash } from '../lib/scroll';

const EXTERNAL = /^(https?:|mailto:|tel:)/i;

/**
 * The one anchor used everywhere. Internal paths become client-side
 * navigations, same-page hashes scroll without a reload, and a bare "#"
 * (placeholder links in the design) does nothing instead of jumping to top.
 */
export default function A({ href = '#', onClick, children, ...rest }) {
  const location = useLocation();

  if (EXTERNAL.test(href)) {
    return <a href={href} onClick={onClick} {...rest}>{children}</a>;
  }
  if (href === '#') {
    const handle = (e) => { e.preventDefault(); onClick?.(e); };
    return <a href={href} onClick={handle} {...rest}>{children}</a>;
  }
  if (href.startsWith('#')) {
    const handle = (e) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      // Same hash twice would not change the location, so scroll directly.
      if (location.hash === href) { e.preventDefault(); scrollToHash(href); }
    };
    return <Link to={{ hash: href }} onClick={handle} {...rest}>{children}</Link>;
  }
  return <Link to={href} onClick={onClick} {...rest}>{children}</Link>;
}
