import { countHit } from '../helpers/counters.js';
import { recordSecurityEvent } from '../helpers/securityEvents.js';

// A simple limit on how often one visitor (IP address, as Coolify's proxy reports it: server.mjs sets
// "trust proxy") may use a route, e.g. one that sends email, so the shop's address cannot be used to send
// floods of mail. Over `max` within `windowMs`, the request is answered 429. A real customer never comes
// near these limits. The counts live in the database (helpers/counters.js), so a restart or a second
// container does not reset or split them.
export const rateLimit = ({ name, max, windowMs, message = 'Too many requests. Please wait a few minutes and try again.' }) =>
  async (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const { count, resetAt } = await countHit(`rl:${name}:${ip}`, windowMs);
    if (count > max) {
      // logged once per visitor and window, not on every refused request (helpers/securityEvents.js)
      if (count === max + 1) recordSecurityEvent({ type: 'rate-limited', req, details: { route: name, max } });
      res.set('Retry-After', String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))));
      return res.status(429).json({ success: false, message, error: message });
    }
    return next();
  };

const TEN_MINUTES = 10 * 60 * 1000;

/** The routes that send email (routes/*.js). */
export const emailFormLimit = (name) => rateLimit({ name, max: 8, windowMs: TEN_MINUTES });
