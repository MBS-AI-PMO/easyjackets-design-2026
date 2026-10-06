import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import axios from "axios";
import { sendEmailInBackground } from "../helpers/email.js";
import { getAdminEmail } from "../helpers/emailSettings.js";
import { isOneEmail } from "../helpers/emailAddress.js";
import { STATUSES, normalizeCarrier, normalizeStatus, publicTracking, trackingUrlFor } from "../helpers/orderShipping.js";

// The admin's order PDF loads design images through here (a plain <img>, so no login can be sent). It only
// ever fetches an image from an exact list of image hosts: https, no redirects, image types only, at most
// PROXY_MAX_BYTES. (It used to fetch any address that merely contained one of the names, e.g.
// http://169.254.169.254/?x=res.cloudinary.com, letting anyone make the server read internal addresses.)
const PROXY_MAX_BYTES = 15 * 1024 * 1024;
const hostOf = (value) => {
  try { return value ? new URL(value).hostname.toLowerCase() : ''; } catch { return ''; }
};
const proxyHosts = () => new Set([
  'api.easyjackets.com',
  'api2.easyjackets.com',
  'easyjacket.s3.amazonaws.com',
  'res.cloudinary.com',
  hostOf(process.env.AWS_FILE_PATH),
  hostOf(process.env.UPLOADS_PUBLIC_BASE_URL),
].filter(Boolean));

export const proxyImage = async (req, res) => {
  try {
    const raw = typeof req.query.url === 'string' ? req.query.url : '';
    let target;
    try { target = new URL(raw); } catch { return res.status(400).send("A full image address is required"); }

    if (target.protocol !== 'https:' || target.username || target.password || target.port
      || !proxyHosts().has(target.hostname.toLowerCase())) {
      console.warn(`🛑 Blocked proxy request for: ${raw.slice(0, 200)}`);
      return res.status(403).send("Forbidden: Domain not allowed");
    }

    const response = await axios({
      url: target.toString(),
      method: 'GET',
      responseType: 'stream',
      timeout: 10000,
      maxRedirects: 0,
      maxContentLength: PROXY_MAX_BYTES,
    });

    const type = String(response.headers['content-type'] || '');
    if (!type.startsWith('image/')) {
      response.data.destroy();
      return res.status(415).send("Not an image");
    }

    res.set('Content-Type', type);
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24h

    let sent = 0;
    response.data.on('data', (chunk) => {
      sent += chunk.length;
      if (sent > PROXY_MAX_BYTES) response.data.destroy();
    });
    response.data.pipe(res);
  } catch (error) {
    console.error('❌ Proxy image error:', error.message);
    if (!res.headersSent) res.status(502).send("Failed to proxy image");
  }
};

export const getOrder = async (req, res) => {
  try {
    const getOrders = await orderModel.findOne({ _id: req.params.id })
      .select('+statusHistory') // the admin's Status & Shipping panel lists it (models/orderModel.js)
      .populate({
        path: 'cartData.id',
        model: 'Products'
        // No select - return all fields for full product data
      }).populate({
        path: 'cartData.designId',
        model: 'design'
        // No select - return all fields for design specs
      });

    // Debug logging
    if (getOrders?.cartData) {
      console.log('📋 Order fetched:', getOrders._id, '- Cart items:', getOrders.cartData.length);
      getOrders.cartData.forEach((item, idx) => {
        const productPopulated = item.id && typeof item.id === 'object';
        const designPopulated = item.designId && typeof item.designId === 'object';
        console.log(`  📦 Item ${idx + 1}: ${item.name} | Product: ${productPopulated ? '✅' : '❌'} | Design: ${designPopulated ? '✅' : '❌'} | Image: ${productPopulated && item.id.frontImage ? '✅' : (designPopulated && item.designId.custom_image ? '✅' : '❌')}`);
      });
    }

    res.status(200).json({
      success: true,
      message: 'order detail by id',
      data: getOrders
    })
  }
  catch (error) {
    res.status(500).send({
      success: false,
      message: "failed to get order detail by id",
      error,
    });
  }
}

export const getOrderlist = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;
    // the searched text as typed (not a pattern: "(" or a crafted pattern would fail or stall the database)
    const literal = (value) => String(value).slice(0, 200).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const name = req.query.name ? literal(req.query.name) : '';
    const address = req.query.address ? literal(req.query.address) : '';
    const phone = req.query.phone ? literal(req.query.phone) : '';

    // Build the query object based on filters
    const query = {};

    // Filter by buyer's name or name in shipping details (case-insensitive)
    if (name) {
      query['$or'] = [
        { 'buyer.name': { $regex: name, $options: 'i' } },
        { 'shipping_details.name': { $regex: name, $options: 'i' } },
      ];
    }

    // Filter by order date (assuming format as YYYY-MM-DD)
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    // Filter by address in shipping or billing details (case-insensitive)
    if (address) {
      query['$or'] = [
        { 'shipping_details.address.line1': { $regex: address, $options: 'i' } },
        { 'billing_Details.address.line1': { $regex: address, $options: 'i' } },
      ];
    }

    // Filter by phone in shipping or billing details (case-insensitive)
    if (phone) {
      query['$or'] = [
        { 'shipping_details.phone': { $regex: new RegExp(phone, 'i') } },
        { 'billing_Details.phone': { $regex: new RegExp(phone, 'i') } },
      ];
    }

    // Filter by status (exact match)
    if (status) {
      query.status = status;
    }

    // Default: Only show non-deleted orders (including legacy orders without the flag)
    query.isDeleted = { $ne: true };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;
    // Fetch orders based on query with populated cart data and buyer info
    const getOrders = await orderModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .populate({
        path: 'cartData.id',
        model: 'Products',
      })
      // Only the preview URL. A design document also holds a full base64
      // snapshot of every view, and pulling those into a ten-row list would
      // put megabytes on the wire for a set of 40px thumbnails.
      .populate({
        path: 'cartData.designId',
        model: 'design',
        select: 'custom_image',
      })
      .populate({
        path: 'buyer',
        model: 'User',
        select: 'name',
      });

    // Fetch status enum values from schema
    const statusEnum = await orderModel.schema.path('status').enumValues;
    const totalOrder = await orderModel.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Order list',
      data: getOrders,
      statusEnum,
      totalOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get order list',
      error,
    });
  }
};

export const getDeletedOrderlist = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { isDeleted: true };

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const getOrders = await orderModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ updatedAt: -1 })
      .populate({
        path: 'cartData.id',
        model: 'Products',
      })
      .populate({
        path: 'buyer',
        model: 'User',
        select: 'name',
      });

    const totalOrder = await orderModel.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Deleted Order list',
      data: getOrders,
      totalOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get deleted order list',
      error,
    });
  }
};

// Text an admin typed, as stored: control characters (line breaks too, unless keepLines) removed, trimmed, capped.
const cleanText = (value, max, keepLines = false) => String(value ?? '')
  .replace(keepLines ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]+/g, keepLines ? '' : ' ')
  .trim()
  .slice(0, max);

/**
 * Admin: status and shipping for one order. Body: { status, carrier, carrierName, trackingNumber, note,
 * notifyCustomer }. Every change is added to the order's statusHistory; the customer gets an email for the
 * change (unless notifyCustomer is false) and the owner always does. The tracking link is always built from
 * the courier's own tracking page (helpers/orderShipping.js), never taken from the request.
 */
export const updateOrder = async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!/^[0-9a-f]{24}$/i.test(id)) return res.status(404).json({ success: false, message: 'Order not found' });
    const order = await orderModel.findById(id).select('+statusHistory').lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const status = body.status !== undefined ? normalizeStatus(body.status) : normalizeStatus(order.status) || 'pending';
    if (body.status !== undefined && !status) {
      return res.status(400).json({ success: false, message: 'Unknown order status' });
    }

    const before = { ...(order.shipping || {}) };
    const shipping = { ...before };
    if (body.carrier !== undefined) shipping.carrier = normalizeCarrier(body.carrier);
    if (body.carrierName !== undefined) shipping.carrierName = cleanText(body.carrierName, 60);
    if (body.trackingNumber !== undefined) shipping.trackingNumber = cleanText(body.trackingNumber, 80);
    if (body.note !== undefined) shipping.note = cleanText(body.note, 300, true);
    shipping.trackingUrl = trackingUrlFor(shipping.carrier, shipping.trackingNumber); // '' for an Other courier
    const now = new Date();
    if (status === 'Shipped' && !shipping.shippedAt) shipping.shippedAt = now;
    if (status === 'delivered' && !shipping.deliveredAt) shipping.deliveredAt = now;

    const previousStatus = normalizeStatus(order.status) || 'pending';
    const statusChanged = status !== previousStatus;
    const shippingChanged = ['carrier', 'carrierName', 'trackingNumber', 'note']
      .some((k) => String(shipping[k] || '') !== String(before[k] || ''));
    if (!statusChanged && !shippingChanged) {
      return res.status(200).json({ success: true, message: 'Nothing changed', order });
    }

    const notifyCustomer = body.notifyCustomer !== false && body.notifyCustomer !== 'false';
    const customerEmail = [order.billing_Details?.[0]?.email, order.shipping_details?.[0]?.email]
      .map((e) => String(e || '').trim())
      .find((e) => isOneEmail(e)) || '';
    const canEmailCustomer = notifyCustomer && Boolean(customerEmail);
    const admin = await userModel.findById(req.user?._id).select('name email').lean();
    const by = cleanText(admin?.name || admin?.email || 'admin', 80);

    // Only these paths are written, not the whole order: an older order that no longer passes every rule of
    // today's schema can still be updated (a full save() validates every field).
    const updated = await orderModel.findByIdAndUpdate(
      order._id,
      {
        $set: { status, shipping },
        $push: {
          statusHistory: {
            status,
            note: shipping.note || '',
            carrier: shipping.carrier === 'Other' ? shipping.carrierName : shipping.carrier,
            trackingNumber: shipping.trackingNumber || '',
            at: now,
            by,
            customerNotified: canEmailCustomer,
          },
        },
      },
      { new: true, runValidators: true },
    ).select('+statusHistory');
    if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

    // Emails go out in the background: a failure is logged by sendEmail and never fails the update. The
    // template (views/orderStatus.ejs) tells the two copies apart by teamCopy: sendEmail resets forAdmin
    // from the subject for every email with a cart (helpers/orderEmailData.js).
    const plain = updated.toObject();
    const payload = {
      orderId: plain.orderId,
      createdAt: plain.createdAt,
      cartData: plain.cartData, // pictures inlined, builder designs summarised (helpers/email.js)
      shipping_details: plain.shipping_details,
      billing_Details: plain.billing_Details,
      tracking: publicTracking(plain),
      customerEmail,
    };
    const subjectStatus = STATUSES[status].subject;
    if (canEmailCustomer) {
      sendEmailInBackground(`Your order #${plain.orderId} ${subjectStatus}`, customerEmail, { ...payload, teamCopy: false }, '/views/orderStatus.ejs');
    }
    const teamCopy = {
      ...payload,
      teamCopy: true,
      changedBy: by,
      statusChanged,
      previousStatusLabel: STATUSES[previousStatus].label,
      customerNotified: canEmailCustomer,
      // the full history, with who made each change: the team's copy only
      teamHistory: (plain.statusHistory || []).map((h) => ({
        at: h.at,
        statusLabel: STATUSES[normalizeStatus(h.status) || 'pending'].label,
        carrier: h.carrier || '',
        trackingNumber: h.trackingNumber || '',
        note: h.note || '',
        by: h.by || '',
        customerNotified: Boolean(h.customerNotified),
      })),
    };
    getAdminEmail()
      .then((adminEmail) => adminEmail && sendEmailInBackground(`Order #${plain.orderId} ${subjectStatus} (updated by ${by})`, adminEmail, teamCopy, '/views/orderStatus.ejs'))
      .catch(() => {});

    res.status(200).json({
      success: true,
      message: statusChanged ? `Status changed to ${STATUSES[status].label}` : 'Shipping details saved',
      order: updated,
      customerNotified: canEmailCustomer,
    });
  } catch (error) {
    console.error('updateOrder failed:', error);
    res.status(500).send({
      success: false,
      message: "failed to update order detail by id",
      error: error?.message,
    });
  }
}

export const softDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await orderModel.findByIdAndUpdate(id, { isDeleted: true });
    res.status(200).json({
      success: true,
      message: "Order Moved to Recycle Bin",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error moving order to recycle bin",
      error,
    });
  }
};

export const restoreOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await orderModel.findByIdAndUpdate(id, { isDeleted: false });
    res.status(200).json({
      success: true,
      message: "Order Restored Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error restoring order",
      error,
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await orderModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Order Deleted Permanently",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in permanent delete order",
      error,
    });
  }
};

export const clearAllDeletedOrders = async (req, res) => {
  try {
    const result = await orderModel.deleteMany({ isDeleted: true });
    res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} orders from recycle bin`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error clearing recycle bin",
      error,
    });
  }
};


