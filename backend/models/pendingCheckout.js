import mongoose from 'mongoose';

// The cart behind a Stripe Checkout session, as it was priced here (controllers/paymentController.js), kept
// until the order is made from it. Stripe's metadata holds only 500 characters, so a big cart used to be cut
// and its paid order saved without items. Each record deletes itself after a week.
const pendingCheckoutSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    lines: { type: mongoose.Schema.Types.Mixed, default: [] },
    shipCountry: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, expires: 7 * 24 * 60 * 60 },
  },
  { versionKey: false }
);

export default mongoose.models.PendingCheckout || mongoose.model('PendingCheckout', pendingCheckoutSchema);
