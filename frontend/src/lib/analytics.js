// Analytics, as on the live site (N-T15): the Google Analytics tags from the admin's Site Tags screen,
// loaded after the first tap or key press (or 12 s), never in the first paint; the first-party visitor
// tracking behind the admin's Visitor Analytics screen (live utils/visitorTracker.js); and real-user page
// speed (LCP, INP, CLS) sent to Google Analytics, which Google has no data for yet (B-T3).
// The storefront server writes the other site tags (verification metas …) into the HTML itself.
// Nothing here throws into the app: blocked storage, ad blockers or a failed request mean no tracking.
import { api, getStoredAuth } from './api';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const COLLECT_URL = `${BASE}/api/v1/visitor-analytics/collect`;

// ── Google Analytics (deferred) ──────────────────────────────────────────────

const isAnalyticsScript = (tag) => {
  const src = String(tag?.attributes?.src || '').toLowerCase();
  const content = String(tag?.content || '').toLowerCase();
  return tag?.tagType === 'script' && (src.includes('googletagmanager.com') || src.includes('google-analytics.com') || content.includes('gtag(') || content.includes('datalayer'));
};

let gaReady;
const gaLoaded = new Promise((resolve) => { gaReady = resolve; });

function injectAnalytics(tags) {
  tags.forEach((tag) => {
    const script = document.createElement('script');
    Object.entries(tag.attributes || {}).forEach(([key, value]) => { if (value !== false && value != null) script.setAttribute(key, value === true ? '' : value); });
    script.async = true;
    if (tag.content) script.text = tag.content;
    document.head.appendChild(script);
  });
  gaReady();
}

function deferAnalytics() {
  api.get('/sitetags/active', { auth: false })
    .then((r) => {
      const tags = (r?.tags || []).filter(isAnalyticsScript);
      if (!tags.length) return;
      let done = false;
      const run = () => { if (done) return; done = true; injectAnalytics(tags); };
      ['pointerdown', 'keydown', 'touchstart'].forEach((name) => window.addEventListener(name, run, { once: true, passive: true }));
      window.setTimeout(() => ('requestIdleCallback' in window ? window.requestIdleCallback(run, { timeout: 3000 }) : run()), 12000);
    })
    .catch(() => {});
}

// ── real-user speed → Google Analytics (B-T3) ────────────────────────────────

function reportWebVitals() {
  import('web-vitals').then(({ onCLS, onINP, onLCP }) => {
    const send = (metric) => gaLoaded.then(() => {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_rating: metric.rating,
        non_interaction: true,
      });
    });
    onCLS(send);
    onINP(send);
    onLCP(send);
  }).catch(() => {});
}

// ── first-party visitor tracking (the admin's Visitor Analytics) ─────────────

const VISITOR_KEY = 'ej_visitor_id';
const SESSION_KEY = 'ej_session_id';
const SESSION_TS_KEY = 'ej_session_ts';
const SESSION_IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 30 * 1000;

const randomId = () => {
  try { if (window.crypto?.randomUUID) return window.crypto.randomUUID(); } catch { /* fall through */ }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
};
const safeGet = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
const safeSet = (storage, key, value) => { try { window[storage].setItem(key, value); } catch { /* storage unavailable */ } };

let returning = false;
const visitorId = () => {
  const existing = safeGet('localStorage', VISITOR_KEY);
  if (existing) { returning = true; return existing; }
  const created = randomId();
  safeSet('localStorage', VISITOR_KEY, created);
  return created;
};
const sessionId = () => {
  const now = Date.now();
  const existing = safeGet('sessionStorage', SESSION_KEY);
  const lastSeen = Number(safeGet('sessionStorage', SESSION_TS_KEY) || 0);
  if (existing && now - lastSeen < SESSION_IDLE_MS) { safeSet('sessionStorage', SESSION_TS_KEY, String(now)); return existing; }
  const created = randomId();
  safeSet('sessionStorage', SESSION_KEY, created);
  safeSet('sessionStorage', SESSION_TS_KEY, String(now));
  return created;
};
const readUtm = () => {
  try {
    const p = new URLSearchParams(window.location.search);
    return { source: p.get('utm_source') || '', medium: p.get('utm_medium') || '', campaign: p.get('utm_campaign') || '' };
  } catch { return { source: '', medium: '', campaign: '' }; }
};
const signedInUser = () => {
  const user = getStoredAuth()?.user;
  if (!user) return {};
  return { userId: user._id || user.id || '', name: [user.name, user.lastName].filter(Boolean).join(' ') || user.name || '', email: user.email || '' };
};

// a beacon survives the page closing; sent as text/plain (no CORS preflight), which the collect route reads as JSON
const post = (payload, beacon = false) => {
  const body = JSON.stringify(payload);
  if (beacon && navigator.sendBeacon) {
    try { navigator.sendBeacon(COLLECT_URL, new Blob([body], { type: 'text/plain;charset=UTF-8' })); return; } catch { /* fall through */ }
  }
  try { fetch(COLLECT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: beacon }).catch(() => {}); } catch { /* offline */ }
};

let currentPath = '';
let enteredAt = Date.now();
let started = false;

const heartbeat = () => {
  if (document.visibilityState !== 'visible') return;
  safeSet('sessionStorage', SESSION_TS_KEY, String(Date.now()));
  post({ type: 'heartbeat', sessionId: sessionId(), visitorId: visitorId(), path: currentPath });
};
const leave = () => post({ type: 'leave', sessionId: sessionId(), visitorId: visitorId(), path: currentPath, secondsOnPage: Math.round((Date.now() - enteredAt) / 1000) }, true);

/** A page view; called on every route change (components/Analytics.jsx). */
export function trackPageView(path) {
  currentPath = path;
  enteredAt = Date.now();
  post({
    type: 'pageview',
    sessionId: sessionId(),
    visitorId: visitorId(),
    path,
    title: document.title,
    referrer: document.referrer || '',
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    utm: readUtm(),
    isReturning: returning,
    ...signedInUser(),
  });
  if (!started) {
    started = true;
    window.setInterval(heartbeat, HEARTBEAT_MS);
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', () => (document.visibilityState === 'hidden' ? leave() : heartbeat()));
  }
}

let booted = false;
/**
 * Once per page load: deferred Google Analytics and the speed reports — on easyjackets.com only. The
 * admin's GA tag is the live site's property, so staging (sslip.io) and local runs never send to it.
 */
export function startAnalytics() {
  if (booted || typeof window === 'undefined') return;
  booted = true;
  if (!/(^|\.)easyjackets\.com$/i.test(window.location.hostname)) return;
  deferAnalytics();
  reportWebVitals();
}
