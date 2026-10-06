// GET /api/v1/order/track?orderId=ABC12345&email=you@example.com
//
// Guest order tracking for the storefront: the order number from the
// confirmation email plus the email it was sent to. Only what the tracking page
// shows is returned (helpers/orderShipping.js publicTracking): the status, the
// courier and tracking number, the dates and updates, and the items. Never the
// address, phone, payment details, buyer record or admin fields. A wrong email
// gets the same answer as an order that does not exist.
import orderModel from "../models/orderModel.js";
import { publicTracking } from "../helpers/orderShipping.js";

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
    const raw = String(req.query.orderId || '').trim().slice(0, 64);
    const email = norm(req.query.email).slice(0, 254);
    if (!raw || !email) {
      return res.status(400).json({ success: false, message: 'Enter the order number and the email address used for the order.' });
    }
    // order numbers are upper case; one typed in lower case still matches
    const orderIds = [...new Set([raw.toUpperCase(), raw])];
    const order = await orderModel.findOne({ orderId: { $in: orderIds }, isDeleted: { $ne: true } })
      .select('+statusHistory')
      .populate('buyer', 'email')
      .lean();
    if (!order || !emailsOn(order).includes(email)) {
      return res.status(404).json({ success: false, message: 'No order matches that number and email.' });
    }
    res.status(200).json({ success: true, order: publicTracking(order) });
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ success: false, message: 'Could not look up that order right now.' });
  }
};
