import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    transactionId: { type: String, unique: true },
    orderId: { type: String },
    products: [{ type: mongoose.ObjectId, ref: "design" }],
    totalAmount: { type: Number },
    totalItems: { type: Number },
    currency: { type: String },
    buyer: {
      type: mongoose.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "Processing", "Shipped", "delivered", "cancel"],
    },
    paymentStatus: {
      type: String,
      default: "unpaid",
      enum: ["paid", "unpaid", "pending"]
    },
    paymentMethod: {
      type: String,
      default: "Stripe",
      enum: ["Stripe", "COD"]
    },
    isCOD: {
      type: Boolean,
      default: false
    },
    codVerificationCode: {
      type: String,
      select: false
    },
    codVerified: {
      type: Boolean,
      default: false
    },
    cardLast4: { type: String },
    cartData: [{
      id: { type: mongoose.ObjectId, ref: 'Products' },
      designId: { type: mongoose.ObjectId, ref: 'design' },
      name: { type: String },
      quantity: { type: Number },
      price: { type: Number },
      frontImage: { type: String },
      // The storefront product page is addressed by slug, and the cart payload
      // does not carry one. Without this the confirmation email has no way to
      // link a catalogue line back to its product.
      slug: { type: String },
      size: { type: String },
      color: { type: String },
      materials: { type: mongoose.Schema.Types.Mixed },
    }],
    shipping_details: { type: Array },
    billing_Details: { type: Array },
    // The courier and tracking number the admin enters when the order ships (Orders → order →
    // Status & Shipping). The tracking link is built from the courier's own tracking page
    // (helpers/orderShipping.js), never from typed text.
    shipping: {
      carrier: { type: String, default: '' }, // UPS | DHL | FedEx | Other
      carrierName: { type: String, default: '' }, // shown when carrier is Other
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      note: { type: String, default: '' }, // a line for the customer, e.g. "expected in 4–5 days"
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    // Every status change, oldest first: what the tracking page and the emails show. Left out of every
    // query unless asked for (select: false): it names the admin who made each change, and the buyer's
    // own order list (/auth/orders) returns whole orders.
    statusHistory: {
      type: [{
        status: { type: String },
        note: { type: String, default: '' },
        carrier: { type: String, default: '' },
        trackingNumber: { type: String, default: '' },
        at: { type: Date, default: Date.now },
        by: { type: String, default: '' }, // the admin's name or email
        customerNotified: { type: Boolean, default: false },
      }],
      select: false,
    },
    isDeleted: { type: Boolean, default: false },
    hiddenByUser: { type: Boolean, default: false }
  },
  { timestamps: true }
);

orderSchema.index({ 'buyer.name': 'text' });

export default mongoose.model("Order", orderSchema);
