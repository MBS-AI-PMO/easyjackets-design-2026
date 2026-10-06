import orderModel from "../models/orderModel.js";
import axios from "axios";

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

export const updateOrder = async (req, res) => {
  try {
    const { status } = req.body

    await orderModel.findOneAndUpdate({ _id: req.params.id }, { status })

    res.status(200).json({
      success: true,
      message: 'update order details'
    })

  } catch (error) {
    res.status(500).send({
      success: false,
      message: "failed to update order detail by id",
      error,
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


