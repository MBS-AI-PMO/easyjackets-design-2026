// "Under construction" (admin: Settings → Site Status; backend controllers/siteStatusController.js).
// While it is on, the whole storefront shows the holding page (pages/UnderConstruction.jsx), except in a
// browser that opened the private preview link (any address with ?preview=<key>): the key is kept here
// and sent with every check, and the API answers whether it is right (the key is never sent back).
// ?preview=off forgets it. The builder links carry the key along (lib/catalog.js builderUrl), so a
// preview continues into the jacket builder.
import { api } from './api';

const PREVIEW_KEY = 'ej-preview';
const LAST_KEY = 'ej-site-status';

export const getPreviewKey = () => {
  try { return localStorage.getItem(PREVIEW_KEY) || ''; } catch { return ''; }
};

/** Keeps (or with "off", forgets) ?preview=<key> from the address, then removes it from the address bar. */
export const takePreviewParam = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  const value = url.searchParams.get('preview');
  if (value === null) return;
  try {
    if (value && value !== 'off') localStorage.setItem(PREVIEW_KEY, value);
    else localStorage.removeItem(PREVIEW_KEY);
  } catch { /* storage blocked: the preview lasts for this page only */ }
  url.searchParams.delete('preview');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
};

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
  const data = await api.get('/site-status', { auth: false, params: { preview: getPreviewKey() } });
  const status = {
    underConstruction: Boolean(data?.underConstruction),
    message: String(data?.message || ''),
    preview: Boolean(data?.preview),
  };
  try { localStorage.setItem(LAST_KEY, JSON.stringify(status)); } catch { /* storage blocked */ }
  return status;
};
