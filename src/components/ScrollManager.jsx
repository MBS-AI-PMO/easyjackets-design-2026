import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToHash } from '../lib/scroll';

/**
 * Restores the multi-page feel in a single-page app: a new path starts at the
 * top, a hash scrolls to its section (after the page has rendered), and a
 * query-only change (shop filters) leaves the scroll position alone.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  const lastPath = useRef(null);

  useEffect(() => {
    const pathChanged = lastPath.current !== pathname;
    lastPath.current = pathname;
    if (hash) {
      // Pages are lazy-loaded, so the target may not exist for a moment;
      // keep trying for up to ~2 s of frames, then give up at the top.
      let frame = 0, tries = 0;
      const attempt = () => {
        if (scrollToHash(hash)) return;
        if (++tries < 120) { frame = requestAnimationFrame(attempt); return; }
        if (pathChanged) window.scrollTo({ top: 0 });
      };
      frame = requestAnimationFrame(attempt);
      return () => cancelAnimationFrame(frame);
    }
    if (pathChanged) window.scrollTo({ top: 0 });
  }, [pathname, hash]);

  return null;
}
