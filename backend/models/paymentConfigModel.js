import mongoose from 'mongoose';

/**
 * Stripe settings, editable from the admin (Settings → Payment Configuration).
 *
 * Two sets of keys, one per Stripe mode: `live` takes real payments, `test` is the Stripe
 * sandbox. `mode` picks which set the site uses. Secret keys and webhook secrets are never
 * returned by the API (select: false; the admin sees only whether one is set and its last
 * four characters). Any value left empty falls back to the STRIPE_* environment variables,
 * so a deployment keeps working before anyone opens the screen.
 *
 * Only one document is kept: `key` is fixed and unique so upserts land on it.
 */
const paymentConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true, immutable: true },
    mode: { type: String, enum: ['live', 'test', null], default: null }, // null = from the environment

    livePublishableKey: { type: String, default: '' },
    liveSecretKey: { type: String, default: '', select: false },
    liveWebhookSecret: { type: String, default: '', select: false },

    testPublishableKey: { type: String, default: '' },
    testSecretKey: { type: String, default: '', select: false },
    testWebhookSecret: { type: String, default: '', select: false },

    // filled by the admin's "Test" button
    lastTestedAt: { type: Date, default: null },
    lastTestMode: { type: String, default: '' },
    lastTestStatus: { type: String, enum: ['success', 'failed', null], default: null },
    lastTestMessage: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('PaymentConfig', paymentConfigSchema);
