const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isBrowserLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const useLocalBackend =
  process.env.REACT_APP_USE_LOCAL_BACKEND === 'true' ||
  (process.env.REACT_APP_USE_LOCAL_BACKEND !== 'false' && isBrowserLocalhost);
const localBackendUrl = process.env.REACT_APP_LOCAL_API_URL || 'http://localhost:8080/api/v1';
const liveBackendUrl = process.env.REACT_APP_API_URL || 'https://api.easyjackets.com/api/v1';

export const BASE_URL = trimTrailingSlash(
  useLocalBackend ? localBackendUrl : liveBackendUrl
);
export const FRONTEND_URL = trimTrailingSlash(
  process.env.REACT_APP_FRONTEND_URL || 'https://easyjackets.com'
);
export const CUSTOM_FRONT_URL = trimTrailingSlash(
  process.env.REACT_APP_CUSTOM_URL || 'https://custom.easyjackets.com'
);
export const CUSTOM_URL = CUSTOM_FRONT_URL;
