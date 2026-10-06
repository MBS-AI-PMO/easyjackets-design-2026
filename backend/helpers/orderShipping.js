// Shipping and status updates for orders: the couriers the shop uses (UPS, DHL, FedEx), the
// tracking link built from a tracking number, and what a status change means for the customer.
// Used by the admin's order update (orderController.updateOrder), the status emails
// (views/orderStatus.ejs) and the public tracking lookup (trackOrderController.js).

// The couriers' own tracking pages. A tracking link is only ever built from this list (https, a fixed
// address, the number encoded), never taken from text an admin typed, so a link in an email or on the
// tracking page can only open the courier's site. "Other" couriers show their name and number, no link.
export const CARRIERS = {
  UPS: (n) => `https://www.ups.com/track?loc=en_US&tracknum=${encodeURIComponent(n)}`,
  DHL: (n) => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
};
export const CARRIER_VALUES = [...Object.keys(CARRIERS), 'Other'];

// The stored status values (unchanged, so existing orders keep working) and how they read.
export const STATUSES = {
  pending: { label: 'Order placed', step: 0, subject: 'is confirmed', line: 'We have your order and it is with our team.' },
  Processing: { label: 'In production', step: 1, subject: 'is in production', line: 'Your jacket is being made in our workshop.' },
  Shipped: { label: 'Shipped', step: 2, subject: 'has shipped', line: 'Your order is on its way.' },
  delivered: { label: 'Delivered', step: 3, subject: 'has been delivered', line: 'Your order has been delivered. We hope you love it.' },
  cancel: { label: 'Cancelled', step: -1, subject: 'has been cancelled', line: 'Your order has been cancelled. If this is unexpected, reply to this email and we will help.' },
};
export const STATUS_VALUES = Object.keys(STATUSES);

// accepts "shipped", "Shipped", "SHIPPED", "cancelled", "canceled"
export const normalizeStatus = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return null;
  if (v === 'cancelled' || v === 'canceled' || v === 'cancel') return 'cancel';
  return STATUS_VALUES.find((s) => s.toLowerCase() === v) || null;
};

/** 'UPS' | 'DHL' | 'FedEx' | 'Other', or '' when no courier is set. */
export const normalizeCarrier = (value) => {
  const v = String(value || '').trim().toLowerCase();
  if (!v) return '';
  return CARRIER_VALUES.find((c) => c.toLowerCase() === v) || 'Other';
};

/** The courier's own tracking page for this number ('' for an "Other" courier or no number). */
export const trackingUrlFor = (carrier, trackingNumber) => {
  const n = String(trackingNumber || '').trim();
  const build = CARRIERS[normalizeCarrier(carrier)];
  return build && n ? build(n) : '';
};

/** The courier's name as the customer reads it ('' when there is none). */
export const carrierLabel = (shipping) => {
  const carrier = normalizeCarrier(shipping?.carrier);
  if (carrier !== 'Other') return carrier;
  return String(shipping?.carrierName || '').trim() || 'Courier';
};

/**
 * What the customer's tracking page and the status emails show for one order, and nothing more: no
 * address, phone, payment or admin details. The tracking link is rebuilt from the courier list, never
 * read back from the stored order.
 */
export const publicTracking = (order) => {
  const s = order?.shipping || {};
  const status = normalizeStatus(order?.status) || 'pending';
  return {
    orderId: order?.orderId,
    status,
    statusLabel: STATUSES[status].label,
    step: STATUSES[status].step,
    createdAt: order?.createdAt || null,
    courier: carrierLabel(s),
    trackingNumber: s.trackingNumber || '',
    trackingUrl: trackingUrlFor(s.carrier, s.trackingNumber),
    note: s.note || '',
    shippedAt: s.shippedAt || null,
    deliveredAt: s.deliveredAt || null,
    history: (Array.isArray(order?.statusHistory) ? order.statusHistory : []).map((h) => ({
      status: h.status,
      statusLabel: STATUSES[normalizeStatus(h.status) || 'pending'].label,
      note: h.note || '',
      carrier: h.carrier || '',
      trackingNumber: h.trackingNumber || '',
      at: h.at,
    })),
    items: (Array.isArray(order?.cartData) ? order.cartData : [])
      .filter((i) => i && String(i.id) !== 'shipping_fee')
      .map((i) => ({
        name: i.name,
        quantity: i.quantity,
        size: i.size || '',
        color: i.color || '',
        frontImage: i.frontImage || '',
        custom: !i.id && Boolean(i.designId), // designed in the builder (the page shows its render on white)
      })),
  };
};
