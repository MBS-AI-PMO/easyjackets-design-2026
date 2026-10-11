import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { startAnalytics, trackPageView } from '../lib/analytics';

/** Starts analytics once and records a page view on every route change (lib/analytics.js). */
export default function Analytics() {
  const { pathname } = useLocation();
  useEffect(() => { startAnalytics(); }, []);
  // after the page's own effects have set its title
  useEffect(() => {
    const id = window.setTimeout(() => trackPageView(pathname), 600);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}
