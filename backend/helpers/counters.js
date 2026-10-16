import RateCounter from '../models/rateCounter.js';

// Counters shared by every container, kept in the database (models/rateCounter.js): rate limits
// (middlewares/rateLimit.js), sign-in lockouts (helpers/loginGuard.js), alert de-duplication
// (helpers/securityAlerts.js). If the database cannot be reached, a count in this process stands in.
const memory = new Map(); // key -> { count, resetAt, lockedUntil }

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of memory) if (bucket.resetAt <= now && (bucket.lockedUntil || 0) <= now) memory.delete(key);
}, 60 * 1000).unref();

const countInMemory = (key, windowMs) => {
  const now = Date.now();
  let bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs, lockedUntil: bucket?.lockedUntil || 0 };
    memory.set(key, bucket);
  }
  bucket.count += 1;
  return { count: bucket.count, resetAt: bucket.resetAt };
};

/**
 * One more hit on `key` within a window of `windowMs`: { count, resetAt } (resetAt in ms). The window starts
 * at the first hit, and the count starts again once it has ended.
 */
export const countHit = async (key, windowMs) => {
  const now = new Date();
  const bump = () => RateCounter.findOneAndUpdate(
    { key },
    [{
      $set: {
        count: { $cond: [{ $gt: ['$expiresAt', now] }, { $add: ['$count', 1] }, 1] },
        expiresAt: { $cond: [{ $gt: ['$expiresAt', now] }, '$expiresAt', new Date(now.getTime() + windowMs)] },
      },
    }],
    { upsert: true, new: true, lean: true }
  );
  try {
    let doc;
    try {
      doc = await bump();
    } catch (error) {
      if (error?.code !== 11000) throw error;
      doc = await bump(); // two first hits at once: the second upsert finds the first one's counter
    }
    return { count: doc.count, resetAt: new Date(doc.expiresAt).getTime() };
  } catch (error) {
    console.error('counters: counting in memory,', error.message);
    return countInMemory(key, windowMs);
  }
};

/** The current count of `key` without adding to it (0 once its window has ended). */
export const peekCount = async (key) => {
  try {
    const doc = await RateCounter.findOne({ key }).select('count expiresAt').lean();
    return doc && new Date(doc.expiresAt).getTime() > Date.now() ? doc.count : 0;
  } catch (error) {
    const bucket = memory.get(key);
    return bucket && bucket.resetAt > Date.now() ? bucket.count : 0;
  }
};

/** Locks `key` until `until` (a Date); the counter is kept at least that long. */
export const lockKey = async (key, until) => {
  try {
    await RateCounter.updateOne(
      { key },
      [{ $set: { lockedUntil: until, expiresAt: { $max: [{ $ifNull: ['$expiresAt', until] }, until] }, count: { $ifNull: ['$count', 0] } } }],
      { upsert: true }
    );
  } catch (error) {
    console.error('counters: lock kept in memory,', error.message);
    const bucket = memory.get(key) || { count: 0, resetAt: until.getTime() };
    bucket.lockedUntil = until.getTime();
    memory.set(key, bucket);
  }
};

/** When `key` is locked: the end of the lock (ms), else 0. */
export const lockedUntil = async (key) => {
  const now = Date.now();
  try {
    const doc = await RateCounter.findOne({ key }).select('lockedUntil').lean();
    const until = doc?.lockedUntil ? new Date(doc.lockedUntil).getTime() : 0;
    if (until > now) return until;
  } catch (error) {
    console.error('counters: reading the lock from memory,', error.message);
  }
  const fromMemory = memory.get(key)?.lockedUntil || 0;
  return fromMemory > now ? fromMemory : 0;
};

/** Forgets `key` (its count and any lock). */
export const clearKey = async (key) => {
  memory.delete(key);
  try {
    await RateCounter.deleteOne({ key });
  } catch (error) {
    console.error('counters: could not clear a counter,', error.message);
  }
};
