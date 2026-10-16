// Removes every key that starts with "$" from what a request sends (JSON body and query string), at any
// depth. Sent by a client such a key turns a value into a database operator: {"email": {"$ne": null}}
// matches any email, {"$regex": "^a"} guesses one letter at a time. No form or app of this site sends keys
// like that, so nothing legitimate is lost. (server.mjs, before the routes.)
const MAX_DEPTH = 32;

class TooDeep extends Error {}

const strip = (value, depth = 0) => {
  if (!value || typeof value !== 'object' || Buffer.isBuffer(value)) return;
  // deeper than any form or design of this site: refused rather than passed on unchecked
  if (depth > MAX_DEPTH) throw new TooDeep();
  if (Array.isArray(value)) {
    value.forEach((item) => strip(item, depth + 1));
    return;
  }
  for (const key of Object.keys(value)) {
    if (key.startsWith('$')) delete value[key];
    else strip(value[key], depth + 1);
  }
};

export const sanitizeInput = (req, res, next) => {
  try {
    strip(req.body);
    strip(req.query);
  } catch (error) {
    if (error instanceof TooDeep) return res.status(400).json({ success: false, message: 'The request is nested too deeply.' });
    throw error;
  }
  next();
};
