import { clearKey, countHit, lockKey, lockedUntil } from './counters.js';

// Wrong passwords (sign-in, and the "current password" checks on the account pages) and the lockout they
// lead to. Kept in the database (helpers/counters.js), so a restart does not reset them.
//   - one account from one address: LOCK_AFTER wrong passwords within WINDOW lock that account from that
//     address for LOCK_MINUTES. Someone guessing from elsewhere does not lock the real owner out (the lock
//     used to be per account only, so anyone who knew an admin's email could keep that admin locked out).
//   - one account from everywhere: ACCOUNT_LOCK_AFTER within WINDOW (guessing spread over many addresses)
//     locks the account from every address for LOCK_MINUTES.
// A successful sign-in clears its own address's count; a password reset clears the account's.
export const LOCK_AFTER = 10;
export const ACCOUNT_LOCK_AFTER = 50;
export const LOCK_MINUTES = 15;
const WINDOW = LOCK_MINUTES * 60 * 1000;
export const LOCKED_MESSAGE = `Too many wrong passwords. Please wait ${LOCK_MINUTES} minutes, or reset your password.`;

const accountOf = (email) => String(email || '').trim().toLowerCase();
const ipOf = (req) => String(req?.ip || req?.socket?.remoteAddress || 'unknown');
const pairKey = (email, req) => `login:pair:${accountOf(email)}|${ipOf(req)}`;
const accountKey = (email) => `login:account:${accountOf(email)}`;

/** Whether sign-in for this account is locked for this request's address. */
export const isLockedOut = async (email, req) => {
  if (!accountOf(email)) return false;
  const [pair, account] = await Promise.all([lockedUntil(pairKey(email, req)), lockedUntil(accountKey(email))]);
  return Boolean(pair || account);
};

/** Counts one wrong password; returns true when this one caused a lock. */
export const noteFailedLogin = async (email, req) => {
  if (!accountOf(email)) return false;
  const until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
  const [pair, account] = await Promise.all([countHit(pairKey(email, req), WINDOW), countHit(accountKey(email), WINDOW)]);
  let locked = false;
  if (pair.count >= LOCK_AFTER) {
    await lockKey(pairKey(email, req), until);
    locked = pair.count === LOCK_AFTER;
  }
  if (account.count >= ACCOUNT_LOCK_AFTER) {
    await lockKey(accountKey(email), until);
    locked = locked || account.count === ACCOUNT_LOCK_AFTER;
  }
  return locked;
};

/** After a successful sign-in from this address. */
export const clearFailedLogins = (email, req) => clearKey(pairKey(email, req));

/** After a password reset (the owner proved they read the account's email): every count for the account. */
export const clearAccountLock = async (email, req) => {
  await Promise.all([clearKey(accountKey(email)), req ? clearKey(pairKey(email, req)) : null]);
};
