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
    isDeleted: { type: Boolean, default: false },
    hiddenByUser: { type: Boolean, default: false }
  },
  { timestamps: true }
);

orderSchema.index({ 'buyer.name': 'text' });

export default mongoose.model("Order", orderSchema);
