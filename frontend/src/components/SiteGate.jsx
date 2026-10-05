import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnderConstruction from '../pages/UnderConstruction';
import { useCart } from '../lib/cart';
import {
  fetchSiteStatus,
  isTransactionPage,
  lastSiteStatus,
  startTransaction,
  takePreviewParam,
  transactionInProgress,
} from '../lib/siteStatus';

// The whole storefront, or the holding page while the site is under construction (lib/siteStatus.js).
// Checked on load and every 30 seconds, so switching it off in the admin opens the site without a
// reload: the holding page lifts away (LEAVE_MS) and the site fades in. A first visit waits for the
// answer (a blank page for that moment) rather than flash the site; if the API cannot be reached then,
// the holding page shows, as the site could not work anyway.
// A purchase in progress is never interrupted: checkout, the pages after paying and the cart reached
// from the builder stay open, and so does the rest of the site for that visitor for an hour.
// On localhost (development) the site always shows; ?uc=1 shows the holding page there.
const onLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const showOnLocalhost = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('uc');
const CHECK_EVERY_MS = 30 * 1000;
const LEAVE_MS = 600; // .ez-uc--leaving in pages/UnderConstruction.css

takePreviewParam();

export default function SiteGate({ children }) {
  const { pathname, search } = useLocation();
  const { count } = useCart();
  const [status, setStatus] = useState(lastSiteStatus);
  const [unreachable, setUnreachable] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    let alive = true;
    const check = () => fetchSiteStatus()
      .then((next) => { if (alive) { setStatus(next); setUnreachable(false); } })
      .catch(() => { if (alive) setUnreachable(true); });
    check();
    const timer = window.setInterval(check, CHECK_EVERY_MS);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const paying = isTransactionPage(pathname, search, count);
  useEffect(() => { if (paying) startTransaction(); }, [paying, pathname]);
  const inTransaction = paying || transactionInProgress();

  const blocked = onLocalhost
    ? showOnLocalhost
    : inTransaction
      ? false
      : status
        ? status.underConstruction && !status.preview
        : unreachable;
  const waiting = !onLocalhost && !inTransaction && !status && !unreachable;

  // the site opening while the holding page shows: let it lift away, then fade the site in
  const wasBlocked = useRef(blocked);
  useEffect(() => {
    const opened = wasBlocked.current && !blocked;
    wasBlocked.current = blocked;
    if (!opened) return undefined;
    setLeaving(true);
    const timer = window.setTimeout(() => { setLeaving(false); setRevealed(true); }, LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [blocked]);

  if (waiting) return <div style={{ minHeight: '100vh' }} />;
  if (blocked || leaving) return <UnderConstruction message={status?.message} leaving={leaving && !blocked} />;

  return (
    <div className={revealed ? 'ez-site-reveal' : undefined}>
      {children}
      {status?.underConstruction && status?.preview && (
        // the team's preview: a reminder that visitors still see the holding page
        <div className="ez-preview-pill" role="status">
          Preview · visitors see “under construction”
        </div>
      )}
    </div>
  );
}
