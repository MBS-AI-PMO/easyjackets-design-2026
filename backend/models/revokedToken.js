import mongoose from 'mongoose';

// Sign-in tokens ended by logging out (POST /auth/logout): a token whose id (jti) is here is refused
// (middlewares/authMiddleware.js). Each entry removes itself when the token would have expired anyway.
const revokedTokenSchema = new mongoose.Schema({
  jti: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export default mongoose.models.RevokedToken || mongoose.model('RevokedToken', revokedTokenSchema);
