import mongoose from 'mongoose';

// Security events for every account, customers included (helpers/securityEvents.js): failed and locked
// sign-ins, password resets and changes, email changes, refused admin access, rate limits hit. The admin activity ledger (models/adminLog.js) only covers admins; this is where an attack on
// customer accounts shows up. Read in Admin → Activity Log → Security events. Kept for RETENTION_DAYS.
const RETENTION_DAYS = 180;

const securityEventSchema = new mongoose.Schema(
  {
    at: { type: Date, default: Date.now },
    type: { type: String, required: true },
    email: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null },
    admin: { type: Boolean, default: false },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { versionKey: false, minimize: false }
);

securityEventSchema.index({ at: -1 });
securityEventSchema.index({ type: 1, at: -1 });
securityEventSchema.index({ email: 1, at: -1 });
securityEventSchema.index({ at: 1 }, { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60, name: 'retention' });

export default mongoose.models.SecurityEvent || mongoose.model('SecurityEvent', securityEventSchema);
