// Where this admin talks to: the NEW 2026 backend (database easyjackets2026) and the new
// storefront. There is deliberately no fallback to the live site (api.easyjackets.com):
// a build without settings still reaches the new deployment, never the live database.
//   - on localhost: the local new backend (REACT_APP_LOCAL_API_URL, default :8080)
//   - elsewhere: REACT_APP_API_URL, else the new backend's current address below
// When the new site moves to its own domains, set the REACT_APP_* build variables
// (Coolify) or change these two defaults.
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

export const BASE_URL = trimTrailingSlash(
  useLocalBackend ? localBackendUrl : deployedBackendUrl
);
/** The backend's own address (BASE_URL without /api/v1): its /uploads serve every image. */
export const API_ORIGIN = BASE_URL.replace(/\/api\/v\d+$/i, '');

export const FRONTEND_URL = trimTrailingSlash(
  process.env.REACT_APP_FRONTEND_URL || NEW_STOREFRONT_URL
);
/** Product and design pages linked from orders: the new storefront. */
export const STOREFRONT_URL = trimTrailingSlash(
  process.env.REACT_APP_STOREFRONT_URL || FRONTEND_URL
);
// The jacket builder: this repo's custom-jacket/ app (npm start there runs on :3001), never the
// live one on custom.easyjackets.com. Must match the storefront's (frontend/src/lib/catalog.js).
const NEW_CUSTOMIZER_URL = 'https://custom.145.223.75.247.sslip.io';
export const CUSTOM_FRONT_URL = trimTrailingSlash(
  useLocalBackend
    ? process.env.REACT_APP_LOCAL_CUSTOM_URL || 'http://localhost:3001'
    : process.env.REACT_APP_CUSTOM_URL || NEW_CUSTOMIZER_URL
);
export const CUSTOM_URL = CUSTOM_FRONT_URL;

// Stored image addresses name the live API (older rows) or the 2026 API's planned domain
// (api2, e.g. the background-removed product photos). Both are files of THIS backend's
// /uploads, so show them from it. Display only: the stored value is never rewritten.
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
