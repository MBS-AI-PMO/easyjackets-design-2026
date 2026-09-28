// Orders, checkout and the account: the current site's endpoints, wrapped.
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

/** Shipping for a cart: the admin's rate tiers, by quantity and destination. */
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
export const createCodOrder = async ({ products, user, formDetails }) => {
  const r = await api.post('/payment/cod-order', { products, user: user || null, formDetails }, { auth: false });
  return r.orderId;
};

/** Card: a Stripe Checkout session; the browser is sent to its URL and comes back to /success/:sessionId. */
export const createStripeSession = async ({ products, user }) => {
  const path = user ? '/payment/create-checkout-session' : '/payment/create-guest-checkout-session';
  const r = await api.post(path, { products, userId: user?._id }, { auth: !!user });
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

/** One order, in the shape the pages render (works for the buyer's list, the confirmation and tracking). */
export function normalizeOrder(o) {
  if (!o) return null;
  const ship = Array.isArray(o.shipping_details) ? o.shipping_details[0] : o.shipTo || null;
  const items = (o.cartData || o.items || []).map((i, n) => ({
    key: `${i.id || i.designId || i.name}-${n}`,
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
    trackingNumber: o.trackingNumber || null,
    courier: o.courier || null,
  };
}

/** The confirmation page: an order by its number or database id (public, as on the current site). */
export const fetchOrderById = async (id, signal) => normalizeOrder((await api.get(`/payment/order/${encodeURIComponent(id)}`, { auth: false, signal })).order);

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

/** Bulk quote: sent through the contact endpoint as one message the team can act on. */
export const submitBulkQuote = (f) => api.post('/features/contact', {
  name: f.name,
  firstName: String(f.name || '').trim().split(/\s+/)[0] || '',
  lastName: String(f.name || '').trim().split(/\s+/).slice(1).join(' '),
  email: f.email,
  phone: f.phone || '',
  subject: `Bulk quote request — ${f.org || f.name}`,
  // one line per answer (each line cleaned on its own, so the line breaks survive)
  message: [
    `BULK QUOTE REQUEST — ${f.org || f.name}`,
    `Phone: ${f.phone || '-'}`,
    `Organisation: ${f.org || '-'} (${f.orgType || '-'})`,
    `Jacket type: ${f.type || '-'}`,
    `Quantity: ${f.qty || '-'}`,
    `Front closure: ${f.closure || '-'}`,
    `Lining: ${f.lining || '-'}`,
    `½ Zipout lining: ${f.zipout || '-'}`,
    `Flap closure: ${f.flap || '-'}`,
    `Design locations: ${f.locations || '-'}`,
    `Needed by: ${f.date || '-'}`,
    `Budget per jacket: ${f.budget || '-'}`,
    '',
    f.details || '',
  ].map((line) => stripHtml(line)).join('\n'),
}, { auth: false });

/** Front-closure options the admin keeps (GET /property/closures), e.g. buttons, zipper, pullover, flap. */
export const fetchClosures = async () => {
  const r = await api.get('/property/closures', { auth: false });
  return (r?.closures || []).filter((c) => c && c.name && c.isActive !== false).map((c) => String(c.name));
};
