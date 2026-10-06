// Orders, checkout and the account: the current site's endpoints, wrapped.
import { useEffect, useMemo, useState } from 'react';
import { api, uploadUrl } from './api';
import { stripHtml } from './html';

export const money = (n, currency = 'usd') => {
  const v = Number(n) || 0;
  const symbol = (currency || 'usd').toLowerCase() === 'usd' ? '$' : `${currency.toUpperCase()} `;
  return `${symbol}${Number.isInteger(v) ? v : v.toFixed(2)}`;
};

// Country codes the shipping rates know: US has its own tiers, everything
// else is "worldwide".
export const COUNTRIES = [
  ['US', 'United States'], ['CA', 'Canada'], ['GB', 'United Kingdom'], ['AU', 'Australia'], ['DE', 'Germany'], ['FR', 'France'],
  ['NL', 'Netherlands'], ['IE', 'Ireland'], ['NZ', 'New Zealand'], ['AE', 'United Arab Emirates'], ['SA', 'Saudi Arabia'], ['ZZ', 'Other'],
];
export const countryName = (code) => (COUNTRIES.find(([c]) => c === code) || [])[1] || code;

// Shipping is worked out here from the admin's rate table (GET /shipping-rates/public) with the
// backend's own rules (backend/helpers/shippingRates.js). The table is remembered in the browser
// and refreshed quietly on each visit, so the price shows at once and follows the country and the
// quantity without a round trip each time.
const RATES_KEY = 'ej-shipping-rates';
let ratesRequest = null;
const storedRates = () => { try { return JSON.parse(localStorage.getItem(RATES_KEY) || 'null'); } catch { return null; } };
export const fetchShippingRates = ({ fresh = false } = {}) => {
  if (!ratesRequest || fresh) {
    ratesRequest = api.get('/shipping-rates/public', { auth: false })
      .then((r) => {
        const rates = r?.rates || null;
        try { if (rates) localStorage.setItem(RATES_KEY, JSON.stringify(rates)); } catch { /* private mode */ }
        return rates;
      })
      .catch((e) => { ratesRequest = null; throw e; });
  }
  return ratesRequest;
};

const DOMESTIC = new Set(['us', 'usa', 'u.s.', 'u.s.a.', 'united states', 'united states of america', 'america']);
const rateForQuantity = (tiers, quantity, fallbackRate = 0) => {
  const qty = Math.max(0, Math.trunc(Number(quantity) || 0));
  if (!qty) return 0;
  const sorted = [...(tiers || [])]
    .filter((t) => Number.isFinite(Number(t?.minQty)) && Number.isFinite(Number(t?.rate)))
    .sort((a, b) => Number(a.minQty) - Number(b.minQty));
  for (const t of sorted) {
    const max = t.maxQty === null || t.maxQty === undefined || t.maxQty === '' ? Infinity : Number(t.maxQty);
    if (qty >= Number(t.minQty) && qty <= max) return t.perItem ? Number(t.rate) * qty : Number(t.rate);
  }
  return Number(fallbackRate) || 0;
};
/** The shipping charge for `quantity` jackets to `country`, as the backend works it out. */
export const shippingFor = (rates, quantity, country, subtotal = 0) => {
  if (!rates || rates.enabled === false) return 0;
  if (rates.freeShippingOver > 0 && Number(subtotal) >= rates.freeShippingOver) return 0;
  return DOMESTIC.has(String(country || '').trim().toLowerCase())
    ? rateForQuantity(rates.usaTiers, quantity, rates.usaFallbackRate)
    : rateForQuantity(rates.worldwideTiers, quantity, rates.worldwideFallbackRate);
};

/** Shipping for the cart, at once: { cost, label }, or null only on the very first visit while the table loads. */
export function useShipping(quantity, country = 'US', subtotal = 0) {
  const [rates, setRates] = useState(storedRates);
  useEffect(() => {
    let alive = true;
    fetchShippingRates({ fresh: true }).then((r) => { if (alive && r) setRates(r); }).catch(() => { /* keep the remembered table */ });
    return () => { alive = false; };
  }, []);
  return useMemo(() => (rates ? { cost: quantity ? shippingFor(rates, quantity, country, subtotal) : 0, label: '' } : null), [rates, quantity, country, subtotal]);
}

/** Shipping for a cart: the admin's rate tiers, by quantity and destination (server round trip; the admin preview). */
export const previewShipping = async (quantity, country = 'US', subtotal = 0, signal) => {
  const r = await api.get('/shipping-rates/preview', { params: { quantity, country, subtotal }, auth: false, signal });
  const pick = (v) => (typeof v === 'number' ? v : Number(v?.rate ?? v?.amount ?? v?.total ?? v?.cost ?? 0));
  const resolved = r?.resolved ?? r?.shipping ?? 0;
  return { cost: pick(resolved), label: resolved?.label || '', raw: r };
};

/** Cart lines → the products array every checkout endpoint takes (plus the shipping line, as the current site sends it). */
export const checkoutProducts = (lines, shippingCost) => {
  const products = lines.map((l) => ({
    id: l.id || null,
    designId: l.designId || null,
    name: l.name,
    quantity: l.quantity,
    price: Number(l.price) || 0,
    size: l.size || '',
    color: l.color || '',
    slug: l.slug || '',
    frontImage: l.image || '',
  }));
  if (shippingCost > 0) products.push({ id: 'shipping_fee', name: 'Shipping & Handling', quantity: 1, price: shippingCost });
  return products;
};

/** Cash on delivery: the order is created at once. */
export const createCodOrder = async ({ products, user, formDetails, country }) => {
  const r = await api.post('/payment/cod-order', { products, user: user || null, formDetails, country }, { auth: false });
  return r.orderId;
};

/** Card: a Stripe Checkout session; the browser is sent to its URL and comes back to /success/:sessionId. */
export const createStripeSession = async ({ products, user, country }) => {
  const path = user ? '/payment/create-checkout-session' : '/payment/create-guest-checkout-session';
  const r = await api.post(path, { products, userId: user?._id, country }, { auth: !!user });
  const url = r?.url || r?.sessionUrl || r?.session?.url;
  if (!url) throw new Error('The payment page could not be opened. Please try again.');
  return url;
};

export const verifyStripeSession = (sessionId) => api.post('/payment/verify-session', { session_id: sessionId }, { auth: false });

const STATUS = {
  pending: { label: 'Order placed', step: 0 },
  processing: { label: 'In production', step: 1 },
  shipped: { label: 'Shipped', step: 2 },
  delivered: { label: 'Delivered', step: 3 },
  cancel: { label: 'Cancelled', step: -1 },
  cancelled: { label: 'Cancelled', step: -1 },
};
export const orderStatus = (s) => STATUS[String(s || 'pending').toLowerCase()] || { label: s, step: 0 };
export const ORDER_STAGES = [
  ['Order placed', 'Payment confirmed, order sent to the art team.'],
  ['In production', 'Proof, cutting, chenille, embroidery and stitching in the workshop.'],
  ['Shipped', 'Handed to the courier with tracking.'],
  ['Delivered', 'Signed for at your door.'],
];

const dateLabel = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');
const timeLabel = (d) => (d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '');

// The couriers' own tracking pages, as the backend builds them (backend/helpers/orderShipping.js). A
// tracking link is only ever made from this list, never read from the order, so it can only open the
// courier's site. Other couriers show their name and number without a link.
const COURIER_TRACKING = {
  UPS: (n) => `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(n)}`,
  DHL: (n) => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
};
// the tracking lookup sends `courier` (a name); the buyer's own orders carry the admin's `shipping`
const courierOf = (o) => {
  if (o.courier) return String(o.courier);
  const s = o.shipping || {};
  return s.carrier === 'Other' ? String(s.carrierName || 'Courier') : String(s.carrier || '');
};

/** One order, in the shape the pages render (works for the buyer's list, the confirmation and tracking). */
export function normalizeOrder(o) {
  if (!o) return null;
  const ship = Array.isArray(o.shipping_details) ? o.shipping_details[0] : o.shipTo || null;
  const items = (o.cartData || o.items || []).map((i, n) => ({
    key: `${i.id || i.designId || i.name}-${n}`,
    // designed in the builder (its render carries a white ground); the tracking lookup says so itself
    custom: typeof i.custom === 'boolean' ? i.custom : !i.id && Boolean(i.designId),
    name: i.name,
    quantity: i.quantity || 1,
    price: Number(i.price) || 0,
    image: uploadUrl(i.frontImage || ''),
    slug: i.slug || '',
    size: i.size || '',
    color: i.color || '',
    spec: [i.color, i.size ? `Size ${i.size}` : ''].filter(Boolean).join(' · '),
  }));
  const status = orderStatus(o.status);
  const courier = courierOf(o);
  const trackingNumber = String(o.trackingNumber || o.shipping?.trackingNumber || '').trim();
  const shippedAt = o.shippedAt || o.shipping?.shippedAt || null;
  const deliveredAt = o.deliveredAt || o.shipping?.deliveredAt || null;
  return {
    id: o._id,
    orderId: o.orderId,
    status: o.status,
    statusLabel: status.label,
    step: status.step,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod,
    isCod: !!o.isCOD || o.paymentMethod === 'COD',
    cardLast4: o.cardLast4 && o.cardLast4 !== 'N/A' ? o.cardLast4 : '',
    total: Number(o.totalAmount) || 0,
    currency: o.currency || 'usd',
    createdAt: o.createdAt,
    dateLabel: dateLabel(o.createdAt),
    items,
    subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
    shipTo: ship ? {
      name: ship.name || '',
      email: ship.email || '',
      phone: ship.phone || '',
      line1: ship.address?.line1 || '',
      city: ship.address?.city || ship.city || '',
      state: ship.address?.state || ship.state || '',
      zip: ship.address?.postal_code || '',
      country: ship.address?.country || ship.country || '',
    } : null,
    // shipping, as the admin entered it (Orders → Status & Shipping)
    trackingNumber: trackingNumber || null,
    courier: courier || null,
    trackingUrl: COURIER_TRACKING[courier] && trackingNumber ? COURIER_TRACKING[courier](trackingNumber) : '',
    shippingNote: String(o.note || o.shipping?.note || ''),
    shippedLabel: dateLabel(shippedAt),
    deliveredLabel: dateLabel(deliveredAt),
    // status updates, newest first (the tracking lookup only)
    history: (Array.isArray(o.history) ? o.history : []).map((h, n) => ({
      key: `${h.at || ''}-${n}`,
      label: h.statusLabel || orderStatus(h.status).label,
      when: timeLabel(h.at),
      courier: h.carrier || '',
      trackingNumber: h.trackingNumber || '',
      note: h.note || '',
    })).reverse(),
  };
}

/**
 * The confirmation page: an order by its number or database id. The API shows an order only to whoever
 * placed it: the email it was placed with (kept by the checkout in this browser, sessionStorage
 * 'ej-checkout') or the signed-in buyer.
 */
export const fetchOrderById = async (id, signal) => {
  let email = '';
  try { email = JSON.parse(sessionStorage.getItem('ej-checkout') || 'null')?.email || ''; } catch { /* private mode */ }
  return normalizeOrder((await api.get(`/payment/order/${encodeURIComponent(id)}`, { params: { email }, signal })).order);
};

/** Guest tracking: order number + the email the order was placed with. */
export const trackOrder = async (orderId, email, signal) => normalizeOrder((await api.get('/order/track', { params: { orderId, email }, auth: false, signal })).order);

// ----- signed-in account -----
export const fetchMyOrders = async (signal) => {
  const r = await api.get('/auth/orders', { signal });
  return (Array.isArray(r) ? r : r?.orders || []).map(normalizeOrder).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
export const hideOrder = (id) => api.put(`/auth/hide-order/${id}`);
export const updateProfile = async (fields) => (await api.put('/auth/profile', fields)).user;
export const changePassword = (currentPassword, newPassword, confirmPassword) => api.put('/auth/change-password', { currentPassword, newPassword, confirmPassword });
export const fetchPaymentMethods = async (signal) => {
  const r = await api.get('/payment-methods/list', { signal });
  return (r?.paymentMethods || r?.methods || r?.data || []).map((m) => ({ id: m.id || m._id, brand: m.card?.brand || m.brand || 'card', last4: m.card?.last4 || m.last4 || '', exp: m.card ? `${m.card.exp_month}/${String(m.card.exp_year).slice(-2)}` : m.exp || '' }));
};
export const deletePaymentMethod = (id) => api.delete(`/payment-methods/${id}`);

/**
 * Bulk quote: saved as a bulk order (POST /order/bulk), so it shows in the admin's Orders -> Bulk Order
 * list, and the backend emails the team and the customer. `quantity` is the range's lower bound
 * (the admin's Qty column); the range itself goes in `quantityRange`.
 */
export const submitBulkQuote = (f) => {
  const fd = new FormData();
  const text = (v) => stripHtml(String(v ?? '')).trim();
  fd.append('name', text(f.name));
  fd.append('email', text(f.email));
  fd.append('phone', text(f.phone));
  fd.append('organization', text(f.org));
  fd.append('orderType', text(f.orgType));
  fd.append('selectedProduct', text(f.type));
  fd.append('quantityRange', text(f.qty));
  fd.append('quantity', String(parseInt(String(f.qty || ''), 10) || 10));
  fd.append('selectedClosure', text(f.closure));
  fd.append('selectedLining', text(f.lining));
  fd.append('zipoutLining', String(Boolean(f.zipout)));
  fd.append('flapClosure', String(Boolean(f.flap)));
  fd.append('designLocations', JSON.stringify(f.designLocations || {}));
  fd.append('neededBy', text(f.date));
  fd.append('budget', text(f.budget));
  fd.append('message', text(f.details));
  return api.post('/order/bulk', fd, { auth: false });
};

/** Front-closure options the admin keeps (GET /property/closures), e.g. buttons, zipper, pullover, flap. */
export const fetchClosures = async () => {
  const r = await api.get('/property/closures', { auth: false });
  return (r?.closures || []).filter((c) => c && c.name && c.isActive !== false).map((c) => String(c.name));
};
