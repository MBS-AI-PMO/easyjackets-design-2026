// What a Site Tag (Admin → Site Tags) may be. Site tags are written into every storefront page, so a stolen
// admin session could use them to put a card skimmer or a fake sign-in box on every page. They now take:
//   - scripts from an outside address only from the known analytics and marketing hosts below (plus any listed
//     in SITE_TAG_SCRIPT_HOSTS); inline scripts (analytics snippets) stay possible, and every change to a site
//     tag emails the admin address (helpers/adminLedger.js)
//   - no event-handler attributes (onload, onerror …) and no javascript: or data: addresses on any tag
// The storefront applies the same rules when it writes the tags (frontend/server.mjs, src/lib/analytics.js),
// so a tag saved before these rules is not written either.
export const SCRIPT_HOST_ROOTS = [
  'googletagmanager.com', 'google-analytics.com', 'googleadservices.com', 'google.com', 'gstatic.com', 'doubleclick.net',
  'facebook.net', 'hotjar.com', 'clarity.ms', 'ahrefs.com', 'bing.com', 'licdn.com', 'tiktok.com', 'pinimg.com',
  'sc-static.net', 'klaviyo.com', 'hs-scripts.com', 'hs-analytics.net', 'trustpilot.com', 'tawk.to',
];
const extraHosts = () => String(process.env.SITE_TAG_SCRIPT_HOSTS || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

const hostAllowed = (host) => [...SCRIPT_HOST_ROOTS, ...extraHosts()].some((root) => host === root || host.endsWith(`.${root}`));

/** Whether a script may load from `src` (https, an allowed host). */
export const scriptSourceAllowed = (src) => {
  try {
    const url = new URL(String(src));
    return url.protocol === 'https:' && !url.username && !url.password && hostAllowed(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};

const ATTRIBUTE_NAME = /^[A-Za-z_:][-A-Za-z0-9_:.]*$/;
const URL_ATTRIBUTES = new Set(['src', 'href', 'action', 'formaction', 'xlink:href', 'poster', 'data']);
const MAX_CONTENT = { script: 20000, style: 50000, noscript: 5000, title: 300 };

/**
 * The tag as it may be saved, or { error } saying why not.
 * @param {{ tagType: string, attributes?: object, content?: string }} tag
 */
export const checkSiteTag = ({ tagType, attributes, content }) => {
  const attrs = {};
  if (attributes && typeof attributes === 'object' && !Array.isArray(attributes)) {
    for (const [key, value] of Object.entries(attributes)) {
      if (!ATTRIBUTE_NAME.test(key)) return { error: `"${key}" is not a valid attribute name.` };
      if (/^on/i.test(key)) return { error: `Event attributes such as "${key}" are not allowed: they run code.` };
      if (value !== null && typeof value === 'object') return { error: `The value of "${key}" must be text.` };
      const text = typeof value === 'boolean' ? value : String(value ?? '');
      if (URL_ATTRIBUTES.has(key.toLowerCase()) && typeof text === 'string' && /^\s*(javascript|data|vbscript):/i.test(text)) {
        return { error: `"${key}" cannot be a javascript:, data: or vbscript: address.` };
      }
      attrs[key] = text;
    }
  }
  if (tagType === 'script' && attrs.src && !scriptSourceAllowed(attrs.src)) {
    return { error: 'Scripts can only load from known analytics and marketing services (Google, Meta, Hotjar, Microsoft Clarity, Ahrefs …). Ask your developer to add another service to SITE_TAG_SCRIPT_HOSTS.' };
  }
  if (tagType === 'link' && /^(preload|modulepreload|prefetch)$/i.test(String(attrs.rel || '')) && /script/i.test(String(attrs.as || 'script')) && attrs.href && !scriptSourceAllowed(attrs.href)) {
    return { error: 'A script preload can only point at a known analytics or marketing service.' };
  }
  const body = typeof content === 'string' ? content : '';
  const max = MAX_CONTENT[tagType];
  if (max && body.length > max) return { error: `The tag's content is too long (at most ${max} characters).` };
  return { attributes: attrs, content: body };
};
