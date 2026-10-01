// Where this jacket builder talks to: the NEW 2026 backend (database easyjackets2026) and the
// new storefront. There is deliberately no fallback to the live site (api.easyjackets.com /
// easyjackets.com): a build without settings still reaches the new deployment, never the live
// database or the live cart.
//   - on localhost: the local new backend (REACT_APP_LOCAL_API_URL, default :8080) and the
//     local storefront (REACT_APP_LOCAL_FRONTEND_URL, default :5173)
//   - elsewhere: REACT_APP_API_URL / REACT_APP_FRONTEND_URL, else the new deployment below
// When the new site moves to its own domains, set the REACT_APP_* build variables (Coolify)
// or change these two defaults (they match admin/src/constant/url.js).
const NEW_API_URL = 'https://rpgwwda661mpz7dpxm7hst69.145.223.75.247.sslip.io/api/v1';
const NEW_STOREFRONT_URL = 'https://hlfhuuaoepy4uvcbysh4xlk6.145.223.75.247.sslip.io';

const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isBrowserLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const useLocalBackend =
  process.env.REACT_APP_USE_LOCAL_BACKEND === 'true' ||
  (process.env.REACT_APP_USE_LOCAL_BACKEND !== 'false' && isBrowserLocalhost);
const localBackendUrl = process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:8080/api/v1';
const deployedBackendUrl = process.env.REACT_APP_API_URL || NEW_API_URL;

// The API lives under /api/v1. A setting given as the backend's address alone, or ending in /api,
// still works (a build with REACT_APP_API_URL=https://host/api sent every request to /api/... and
// got 404s for all of them).
const apiBase = (value) => {
  const v = trimTrailingSlash(value);
  if (/\/api\/v\d+$/i.test(v)) return v;
  if (/\/api$/i.test(v)) return `${v}/v1`;
  return `${v}/api/v1`;
};

const BASE_URL = apiBase(useLocalBackend ? localBackendUrl : deployedBackendUrl);
export default BASE_URL;

/** The backend's own address (BASE_URL without /api/v1): its /uploads serve every image. */
export const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+$/i, '');

/** The storefront the builder hands off to: cart, design review, menu and footer links. */
export const FRONTEND_URL = trimTrailingSlash(
  useLocalBackend
    ? process.env.REACT_APP_LOCAL_FRONTEND_URL || 'http://localhost:5173'
    : process.env.REACT_APP_FRONTEND_URL || NEW_STOREFRONT_URL
);
export const frontendUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${FRONTEND_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// Stored image addresses name the 2026 API's planned domain (api2) or, in older rows, the live
// API. Both are files of THIS backend's /uploads, so show them from it. Display only: the stored
// value is never rewritten.
const OUR_UPLOADS = /^https?:\/\/api2?\.easyjackets\.com\/uploads\//i;
export const uploadUrl = (src) => {
  if (typeof src !== 'string') return src;
  const value = src.trim();
  if (!value || /^(blob:|data:)/i.test(value)) return value;
  if (OUR_UPLOADS.test(value)) return value.replace(OUR_UPLOADS, `${API_ORIGIN}/uploads/`);
  if (value.startsWith('/uploads/')) return `${API_ORIGIN}${value}`;
  if (value.startsWith('/images/')) return `${FRONTEND_URL}${value}`; // a file in the storefront's public folder
  return value;
};

/** The same upload at a given width (the API snaps to 320/480/640/768/960/1280). */
export const imageUrl = (src, w) => {
  const u = uploadUrl(src);
  if (!w || !u || !u.startsWith(`${API_ORIGIN}/uploads/`) || !/\.(webp|jpe?g|png)$/i.test(u)) return u;
  return `${u}?w=${w}`;
};
