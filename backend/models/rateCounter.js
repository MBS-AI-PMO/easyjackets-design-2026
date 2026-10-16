import mongoose from 'mongoose';

// Counters for rate limits and sign-in lockouts (middlewares/rateLimit.js, helpers/loginGuard.js), kept in
// the database so a restart or a second container does not reset or split them. Each counter deletes
// itself when its window ends (TTL index on expiresAt).
const rateCounterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    lockedUntil: { type: Date, default: null },
  },
  { versionKey: false }
);

rateCounterSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RateCounter', rateCounterSchema);
