import mongoose from 'mongoose';

/**
 * Newsletter subscribers (the storefront's footer form, POST /features/subscribe), listed in the
 * admin under People -> Subscribers. One row per address; unsubscribing keeps the row (status),
 * so a later sign-up turns it back on instead of creating a duplicate.
 */
const newsletterSubscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ['subscribed', 'unsubscribed'], default: 'subscribed' },
    source: { type: String, default: 'Website footer' },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
