// IndexNow (SEO audit G-4): tells Bing — and the AI answer engines that read Bing's index, such as ChatGPT
// search and Copilot — about new and changed pages within minutes instead of waiting for a recrawl.
// A minute after an admin change (any successful write to the product or blog routes, indexNowWatcher),
// the products and posts updated since the last ping are sent. Product views and clicks do not change a
// product's updatedAt, so they never trigger one.
// Off unless INDEXNOW_ENABLED=true (turn it on at launch, on the API serving easyjackets.com) and
// INDEXNOW_KEY matches the storefront's public key file (frontend/public/<key>.txt).
import productModel from '../models/productModel.js';
import Blog from '../models/blogs.js';
import { stripApostrophes } from './slugMatch.js';

const SITE = 'https://easyjackets.com';
const DELAY_MS = 60 * 1000;

let since = new Date();
let timer = null;

const enabled = () => process.env.INDEXNOW_ENABLED === 'true' && /^[a-zA-Z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY || '');

async function submit() {
  timer = null;
  const from = since;
  since = new Date();
  try {
    const [products, blogs] = await Promise.all([
      productModel.find({ updatedAt: { $gt: from }, isActive: { $ne: false }, noIndex: { $ne: true } }).select('slug').lean(),
      Blog.find({ updatedAt: { $gt: from }, isActive: true }).select('slug').lean(),
    ]);
    const urls = [
      ...products.map((p) => `${SITE}/product/${encodeURIComponent(stripApostrophes(p.slug).toLowerCase())}`),
      ...blogs.map((b) => `${SITE}/new-blog/${encodeURIComponent(b.slug)}`),
    ];
    if (!urls.length) return;
    const key = process.env.INDEXNOW_KEY;
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: 'easyjackets.com', key, keyLocation: `${SITE}/${key}.txt`, urlList: urls.slice(0, 10000) }),
      signal: AbortSignal.timeout(15000),
    });
    console.log(`IndexNow: ${urls.length} URL(s) submitted → HTTP ${res.status}`);
  } catch (error) {
    console.error(`IndexNow: not submitted (${error.message})`);
  }
}

export const scheduleIndexNow = () => {
  if (!enabled() || timer) return;
  timer = setTimeout(submit, DELAY_MS);
  timer.unref?.();
};

/** Express middleware for the product and blog routes: a successful write schedules a submission. */
export const indexNowWatcher = (req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.on('finish', () => { if (res.statusCode >= 200 && res.statusCode < 300) scheduleIndexNow(); });
  }
  next();
};
