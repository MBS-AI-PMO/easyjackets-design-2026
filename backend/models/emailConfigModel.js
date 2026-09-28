import mongoose from 'mongoose';

/**
 * Site-wide outgoing email configuration, editable from the admin panel.
 *
 * SMTP login and the visible From address are stored separately on purpose: mailbox
 * providers authenticate one account but often allow sending as an alias, e.g. log in
 * as info@ and send as orders@. Where the provider refuses a mismatched From, set
 * fromEmail back to the login address and put the public address in replyTo instead.
 *
 * Only one document is ever kept - `key` is fixed and unique so upserts land on it.
 */
const emailConfigSchema = new mongoose.Schema({
    key: { type: String, default: 'default', unique: true, immutable: true },

    // SMTP transport / credentials
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 465 },
    smtpSecure: { type: Boolean, default: true },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '', select: false },

    // Visible addressing
    fromName: { type: String, default: 'Easy Jackets' },
    fromEmail: { type: String, default: '' },
    replyToEmail: { type: String, default: '' },

    // Where site notifications (orders, bulk quotes, contact, newsletter) are delivered
    adminEmail: { type: String, default: '' },

    // Master switch - when false, sends are skipped instead of attempted
    enabled: { type: Boolean, default: true },

    // Populated by the "Send test" action so the admin screen can show last known state
    lastTestedAt: { type: Date, default: null },
    lastTestStatus: { type: String, enum: ['success', 'failed', null], default: null },
    lastTestMessage: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('EmailConfig', emailConfigSchema);
