// The one place the frontend talks to the API.
//
// Base URL: VITE_API_URL at build time (Coolify sets it per environment); in
// `npm run dev` it is empty and Vite proxies /api and /uploads to the local
// backend (see vite.config.js). Every call returns the parsed JSON body and
// throws an ApiError carrying the status and the server's message otherwise.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'ej-auth';

export class ApiError extends Error {
  constructor(status, message, body) { super(message); this.status = status; this.body = body; }
}

export const getStoredAuth = () => {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null'); } catch { return null; }
};
export const setStoredAuth = (auth) => {
  try { if (auth) localStorage.setItem(TOKEN_KEY, JSON.stringify(auth)); else localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
};

async function request(method, path, { body, params, auth = true, signal } = {}) {
  const url = new URL(`${BASE}/api/v1${path}`, window.location.origin);
  if (params) for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  const headers = {};
  if (body !== undefined && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = auth ? getStoredAuth()?.token : null;
  if (token) headers.Authorization = token;
  const res = await fetch(url, { method, headers, body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined, signal });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!res.ok || (data && data.success === false)) {
    throw new ApiError(res.status, data?.message || data?.error || `Request failed (${res.status})`, data);
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
};

// The catalogue still stores the live site's upload URLs; this API mirrors
// those files and can resize them, so they are served from here.
// our uploads, on the live API's address (older rows) or the 2026 API's (api2, e.g. the
// background-removed product photos): always served by the API this build talks to
const LEGACY_UPLOADS = /^https?:\/\/api2?\.easyjackets\.com\/uploads\//i;
export const uploadUrl = (p) => {
  if (!p) return '';
  if (LEGACY_UPLOADS.test(p)) return `${BASE}/uploads/${p.replace(LEGACY_UPLOADS, '')}`;
  if (/^https?:\/\//.test(p)) return p;
  return `${BASE}${p.startsWith('/') ? '' : '/'}${p}`;
};
/** The same upload at a given width (the API snaps to 320/480/640/768/960/1280). */
export const imageUrl = (p, w) => {
  const u = uploadUrl(p);
  if (!w || !u || !u.startsWith(`${BASE}/uploads/`) || !/\.(webp|jpe?g|png)$/i.test(u)) return u;
  return `${u}?w=${w}`;
};
