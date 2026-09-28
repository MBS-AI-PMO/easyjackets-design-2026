// Site-wide details and the two visitor forms (contact, newsletter): the
// Features API behind the Contact page and the footer.
import { api } from './api';

const SOCIAL_NAMES = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter', linkedin: 'LinkedIn' };

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

/** Contact details the admin keeps in Website Details: email, phone, addresses, live social links. */
export const fetchWebsiteDetails = async (signal) => {
  const r = await api.get('/features/website/details', { auth: false, signal });
  const w = r?.website;
  if (!w) return null;
  const socials = Object.entries(w.socialLinks || {})
    .filter(([key, url]) => url && (w.isActive?.[key] ?? true))
    .map(([key, url]) => ({ key, name: SOCIAL_NAMES[key] || key, url }));
  return {
    email: String(w.email || '').trim(),
    phone: String(w.phoneNumber || '').trim(),
    addresses: [w.address, w.address1].map(parseAddress).filter(Boolean),
    socials,
  };
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
