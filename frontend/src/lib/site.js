// Site-wide details and the two visitor forms (contact, newsletter): the
// Features API behind the Contact page and the footer.
import { api } from './api';
import { onRevalidate } from './useAsync';

const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'X (Twitter)', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', pinterest: 'Pinterest' };
// the short label on the footer's square social buttons
const SOCIAL_ABBR = { facebook: 'FB', instagram: 'IG', twitter: 'X', linkedin: 'IN', youtube: 'YT', tiktok: 'TT', pinterest: 'PT' };

export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());

/** "+1-718-255-7191" → "tel:+17182557191" ('' when there is no number). */
export const telHref = (phone) => {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : '';
};

/**
 * The admin types an address as lines ("Factory Address\nEasy Jackets\nCiti
 * Villas, Sialkot"). A first line that reads like a heading becomes the label.
 */
const parseAddress = (text) => {
  const lines = String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const heading = lines.length > 1 && lines[0].length <= 40 && /address|office|workshop|factory|warehouse|store|hq/i.test(lines[0]);
  return { label: heading ? lines[0] : '', lines: heading ? lines.slice(1) : lines };
};

/**
 * Contact details the admin keeps in Website Details (Contact Information, Checkout Settings,
 * Social Media Profiles): email, phone, addresses, the social links switched on, and whether
 * cash on delivery is offered. Used by the footer on every page, the Contact page, the Privacy
 * Policy and checkout, so one request is shared; it refreshes with the site's live data.
 */
let websiteCache = null;
if (typeof window !== 'undefined') onRevalidate(() => { websiteCache = null; });
export const fetchWebsiteDetails = (signal) => {
  if (!websiteCache) {
    websiteCache = api.get('/features/website/details', { auth: false })
      .then((r) => {
        const w = r?.website;
        if (!w) return null;
        const socials = Object.entries(w.socialLinks || {})
          .filter(([key, url]) => String(url || '').trim() && (w.isActive?.[key] ?? true))
          .map(([key, url]) => ({ key, name: SOCIAL_NAMES[key] || key, abbr: SOCIAL_ABBR[key] || key.slice(0, 2).toUpperCase(), url: String(url).trim() }));
        return {
          email: String(w.email || '').trim(),
          phone: String(w.phoneNumber || '').trim(),
          addresses: [w.address, w.address1].map(parseAddress).filter(Boolean),
          socials,
          cod: w.checkout?.cod !== false,
        };
      })
      .catch((error) => { websiteCache = null; throw error; });
  }
  // callers may abort their own wait; the shared request carries on for the others
  return signal ? Promise.race([websiteCache, new Promise((_, reject) => signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true }))]) : websiteCache;
};

/**
 * Customer testimonials the admin keeps with the site features (GET /features →
 * features[0].review, each { comment, author }): the live site shows them all,
 * in stored order, on About, Design and the landing page. Entries without text
 * are skipped, as is any entry flagged inactive or unpublished; rating, role and
 * photo are optional and only carried through when the admin supplies them.
 */
export const fetchTestimonials = async (signal) => {
  const r = await api.get('/features', { auth: false, signal });
  const feature = Array.isArray(r?.features) ? r.features[0] : null;
  const list = Array.isArray(feature?.review) ? feature.review : [];
  const text = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
  return list
    .filter((x) => x && typeof x === 'object'
      && x.isActive !== false && x.active !== false && x.published !== false
      && !(x.status && !/^(active|approved|published)$/i.test(x.status)))
    .map((x, i) => {
      const name = text(x.author ?? x.name) || 'Anonymous';
      const rating = Number(x.rating);
      return {
        id: String(x._id ?? i),
        quote: text(x.comment ?? x.text ?? x.quote),
        name,
        initial: name.charAt(0).toUpperCase(),
        role: text(x.role ?? x.school ?? x.designation),
        rating: rating > 0 && rating <= 5 ? rating : null,
        photo: text(x.image ?? x.photo ?? x.avatar),
      };
    })
    .filter((t) => t.quote);
};

/**
 * POST /features/contact: the API emails the workshop and a copy to the
 * sender. Its templates render firstName, lastName, email and message, so
 * anything else the form collects goes into the message text.
 */
export const submitContact = ({ firstName, lastName, email, message }) =>
  api.post('/features/contact', { firstName, lastName, email, message }, { auth: false });

/** POST /features/subscribe: the API validates the address and sends the welcome email. */
export const subscribeNewsletter = (email) =>
  api.post('/features/subscribe', { email: String(email || '').trim() }, { auth: false });
