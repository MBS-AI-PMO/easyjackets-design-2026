// The "under construction" screen (components/SiteGate.jsx): shown while any of the four apps is being
// deployed (backend controllers/siteStatusController.js; each app's Coolify pre- and post-deployment
// commands report the start and the end). The headline comes from the admin (Settings → Site Status).
import { api } from './api';

const LAST_KEY = 'ej-site-status';

// A purchase in progress is never interrupted (components/SiteGate.jsx): a visitor who reached checkout
// with something in the cart, came back from paying, or arrived at the cart from the builder's Add to
// cart keeps the site for TRANSACTION_MS, refreshed while they stay on those pages.
const TRANSACTION_KEY = 'easyjackets.transactionInProgress';
const TRANSACTION_MS = 60 * 60 * 1000;

export const startTransaction = () => {
  try { localStorage.setItem(TRANSACTION_KEY, JSON.stringify({ expiresAt: Date.now() + TRANSACTION_MS })); } catch { /* storage blocked */ }
};

export const transactionInProgress = () => {
  try {
    const lock = JSON.parse(localStorage.getItem(TRANSACTION_KEY) || 'null');
    if (lock && Number(lock.expiresAt) > Date.now()) return true;
    localStorage.removeItem(TRANSACTION_KEY);
  } catch { /* storage blocked */ }
  return false;
};

/** Pages that are part of paying: always open while a purchase is under way. */
export const isTransactionPage = (pathname, search, cartCount) => (
  (pathname.startsWith('/checkout') && cartCount > 0)
  || pathname.startsWith('/order-confirmation')
  || pathname.startsWith('/success/')
  || (pathname.startsWith('/cart') && new URLSearchParams(search).has('index')) // from the builder's Add to cart
);

/** The last answer this browser got, so a returning visitor sees the right thing at once. */
export const lastSiteStatus = () => {
  try { return JSON.parse(localStorage.getItem(LAST_KEY) || 'null'); } catch { return null; }
};

export const fetchSiteStatus = async () => {
  const data = await api.get('/site-status', { auth: false });
  const status = { underConstruction: Boolean(data?.underConstruction), message: String(data?.message || '') };
  try { localStorage.setItem(LAST_KEY, JSON.stringify(status)); } catch { /* storage blocked */ }
  return status;
};
