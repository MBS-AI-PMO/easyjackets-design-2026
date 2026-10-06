// A simple limit on how often one visitor (IP address, as Coolify's proxy reports it: server.mjs sets
// "trust proxy") may use a route that sends email, so the shop's address cannot be used to send floods of
// mail. Counts are kept in memory per route for `windowMs`; over `max`, the request is answered 429.
// A real customer never comes near these limits.
const buckets = new Map(); // `${name}:${ip}` -> { count, resetAt }

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(key);
}, 60 * 1000).unref();

export const rateLimit = ({ name, max, windowMs, message = 'Too many requests. Please wait a few minutes and try again.' }) =>
  (req, res, next) => {
    const key = `${name}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.set('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, message, error: message });
    }
    return next();
  };

const TEN_MINUTES = 10 * 60 * 1000;

/** The routes that send email (routes/*.js). */
export const emailFormLimit = (name) => rateLimit({ name, max: 8, windowMs: TEN_MINUTES });
