import crypto from 'crypto';

// The keys this API signs its tokens with, one per purpose, each derived (HKDF-SHA256) from JWT_SECRET.
//   - Purposes cannot stand in for each other: a design ticket is never a sign-in, and so on.
//   - The derivation is this site's own ('easyjackets-2026'), so its tokens mean nothing to any other
//     backend that happens to hold the same JWT_SECRET (the live site's .env had the same value), and the
//     other's tokens mean nothing here. Giving each site its own JWT_SECRET is still the better setting.
// A missing JWT_SECRET throws, so nothing is ever signed or accepted without one.
const SITE = 'easyjackets-2026';
const cache = new Map();

export const tokenKey = (purpose) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const id = `${purpose}\n${secret}`;
  if (!cache.has(id)) {
    cache.set(id, Buffer.from(crypto.hkdfSync('sha256', secret, SITE, `jwt:${purpose}`, 32)));
  }
  return cache.get(id);
};

/** Sign-in tokens (authController, authMiddleware). */
export const loginKey = () => tokenKey('login');
/** The admin's builder tickets for catalogue designs (designController). */
export const designTicketKey = () => tokenKey('design-ticket');

// A short or guessable JWT_SECRET weakens every key above: said once at start-up.
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️ JWT_SECRET is shorter than 32 characters: set a long random value (e.g. 48 random bytes in base64) in the environment.');
}
