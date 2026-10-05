import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SiteStatus from '../models/siteStatus.js';
import Metadata from '../models/metaData.js';
import website from '../models/websiteModal.js';
import { isDeploying } from '../controllers/deploymentStatusController.js';

// The "under construction" holding page at the API's own address (GET /, server.mjs) while any of the four
// apps is being deployed (controllers/siteStatusController.js): the same page as the storefront's and the
// builder's (holdingPage.css is a copy of frontend/src/pages/UnderConstruction.css), refreshing itself
// every 30 seconds until the deployment is over. Only the address itself: every /api route, /uploads and
// the payment webhooks keep working. Sent with 200, as a health check may call this address.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSS = fs.readFileSync(path.join(__dirname, 'holdingPage.css'), 'utf8');
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Instrument+Sans:wght@400;600;700&display=swap';
const DEFAULT_HEADLINE = 'Something new is being stitched';
// stored upload addresses on the live or the 2026 API: served by this API's /uploads
const OUR_UPLOADS = /^https?:\/\/api2?\.easyjackets\.com\/uploads\//i;

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const logoUrl = (stored) => {
  const value = String(stored || '').trim();
  if (!value) return '';
  if (OUR_UPLOADS.test(value)) return value.replace(OUR_UPLOADS, '/uploads/');
  if (/^https?:\/\//i.test(value) || value.startsWith('/uploads/')) return value;
  return '';
};

/** Is an app being deployed right now, and the admin's headline (models/siteStatus.js). */
export const siteUnderConstruction = async () => {
  const [on, status] = await Promise.all([isDeploying(), SiteStatus.findOne({ key: 'global' }).lean()]);
  return { on, message: status?.message || '' };
};

export const renderHoldingPage = async (message) => {
  const [identity, details] = await Promise.all([
    Metadata.findOne({ route: '/global-settings' }).lean().catch(() => null),
    website.findOne().lean().catch(() => null),
  ]);
  const logo = logoUrl(identity?.navbarLogo);
  const email = String(details?.email || '').trim();
  const phone = String(details?.phoneNumber || '').trim();
  const headline = String(message || '').trim() || DEFAULT_HEADLINE;
  const words = headline.split(/\s+/);
  const after = (step) => `animation-delay:${(0.15 + step * 0.12).toFixed(2)}s`;
  const textStep = 2 + words.length * 0.6;

  const contact = email || phone
    ? `<p class="ez-uc-contact ez-uc-in" style="${after(textStep + 2)}">Questions or an order in progress?
        ${email ? `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : ''}
        ${email && phone ? '<span class="ez-uc-sep"> · </span>' : ''}
        ${phone ? `<a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ''))}">${escapeHtml(phone)}</a>` : ''}
      </p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="refresh" content="30">
<title>Under construction | Easy Jackets</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_HREF}">
<style>body{margin:0}${CSS}</style>
</head>
<body>
<main class="ez-uc" aria-labelledby="ez-uc-title">
  <div class="ez-uc-glow" aria-hidden="true"></div>
  <div class="ez-uc-inner">
    ${logo ? `<img class="ez-uc-logo ez-uc-in" style="${after(0)}" src="${escapeHtml(logo)}" alt="Easy Jackets">` : ''}
    <span class="ez-uc-label ez-uc-in" style="${after(1)}"><span class="ez-uc-dot" aria-hidden="true"></span>Under construction</span>
    <h1 id="ez-uc-title" class="ez-uc-title" aria-label="${escapeHtml(headline)}">${words
      .map((word, i) => `<span class="ez-uc-word" aria-hidden="true"><span style="${after(2 + i * 0.6)}">${escapeHtml(word)}</span></span>`)
      .join('')}</h1>
    <p class="ez-uc-text ez-uc-in" style="${after(textStep)}">We're updating Easy Jackets right now. The site will be back in a few minutes, all by itself.</p>
    <svg class="ez-uc-seam ez-uc-in" style="${after(textStep + 1)}" viewBox="0 0 320 28" aria-hidden="true">
      <defs><clipPath id="ez-uc-sewn"><rect class="ez-uc-sewn" x="0" y="0" width="320" height="28"></rect></clipPath></defs>
      <line class="ez-uc-seam-line" x1="6" y1="16" x2="314" y2="16"></line>
      <g class="ez-uc-thread" clip-path="url(#ez-uc-sewn)"><line x1="6" y1="16" x2="314" y2="16"></line></g>
      <g class="ez-uc-needle"><g class="ez-uc-needle-bob"><path d="M1 17 L-7 -5"></path><circle cx="-6.1" cy="-2.4" r="1.6"></circle></g></g>
    </svg>
    ${contact}
  </div>
</main>
</body>
</html>`;
};
