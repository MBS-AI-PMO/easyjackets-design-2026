// GET /api/v1/order/track?orderId=ABC12345&email=you@example.com
//
// Guest order tracking for the storefront: the order number from the
// confirmation email plus the email it was sent to. Only what a customer needs
// is returned — never the buyer record, payment references or admin fields.
import orderModel from "../models/orderModel.js";

const norm = (s) => String(s || '').trim().toLowerCase();

const emailsOn = (order) => {
  const out = [];
  for (const list of [order.shipping_details, order.billing_Details]) {
    for (const d of Array.isArray(list) ? list : []) if (d?.email) out.push(norm(d.email));
  }
  if (order.buyer?.email) out.push(norm(order.buyer.email));
  return out;
};

export const trackOrderController = async (req, res) => {
  try {
    const orderId = String(req.query.orderId || '').trim().toUpperCase();
    const email = norm(req.query.email);
    if (!orderId || !email) {
      return res.status(400).json({ success: false, message: 'Enter the order number and the email address used for the order.' });
    }
    const order = await orderModel.findOne({ orderId, isDeleted: { $ne: true } }).populate('buyer', 'email').lean();
    if (!order || !emailsOn(order).includes(email)) {
      return res.status(404).json({ success: false, message: 'No order matches that number and email.' });
    }
    const ship = Array.isArray(order.shipping_details) ? order.shipping_details[0] : null;
    res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        totalItems: order.totalItems,
        currency: order.currency || 'usd',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        trackingNumber: order.trackingNumber || order.tracking?.number || null,
        courier: order.courier || order.tracking?.courier || null,
        items: (order.cartData || []).map((i) => ({ name: i.name, quantity: i.quantity, price: i.price, frontImage: i.frontImage, slug: i.slug, size: i.size, color: i.color })),
        shipTo: ship ? { name: ship.name, city: ship.address?.city, state: ship.address?.state, country: ship.address?.country } : null,
      },
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'Could not look up that order right now.' });
  }
};
