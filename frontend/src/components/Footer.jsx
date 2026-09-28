import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import A from './A';
import PageFaqs from './PageFaqs';
import { isEmail, subscribeNewsletter } from '../lib/site';
import './footer.css';

const COLUMNS = [
  { title: 'Shop', links: [['Varsity Jackets', '/shop'], ['Bomber Jackets', '/shop'], ['Fleece Hoodies', '/shop'], ['Coach Jackets', '/shop'], ['Bestsellers', '/#bestsellers']] },
  { title: 'Custom', links: [['Design Your Own', '/design-custom-jacket'], ['Materials & Colors', '/material-colors'], ['Patches & Embroidery', '/embroidery-and-patches'], ['Bulk & Team Orders', '/bulk-order'], ['Size Guide', '/sizechart']] },
  { title: 'Help', links: [['FAQ', '/faq'], ['Track Order', '/track-order'], ['Shipping & Returns', '/shipping'], ['Contact Us', '/contact-us'], ['Blog', '/new-blog']] },
];
const SOCIAL = [['IG', 'Instagram'], ['FB', 'Facebook'], ['TT', 'TikTok'], ['PT', 'Pinterest']];

const link = { textDecoration: 'none', color: 'rgba(244,239,230,0.8)' };

/** The newsletter sign-up: POST /features/subscribe, with the API's reply shown under the field. */
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ sending: false, ok: false, message: '' });
  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) { setState({ sending: false, ok: false, message: 'Enter a valid email address.' }); return; }
    setState({ sending: true, ok: false, message: '' });
    try {
      const r = await subscribeNewsletter(email);
      setState({ sending: false, ok: true, message: r?.message || 'Successfully subscribed to newsletter!' });
      setEmail('');
    } catch (err) {
      setState({ sending: false, ok: false, message: err?.message || 'Failed to subscribe. Please try again.' });
    }
  };
  return (
    <div>
      <form onSubmit={submit} noValidate className="ez-footer-form">
        <input type="email" placeholder="you@school.edu" aria-label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state.sending} aria-invalid={!state.ok && !!state.message} />
        <button type="submit" className="ez-btn ez-btn-gold" disabled={state.sending} style={{ borderRadius: '0 2px 2px 0', opacity: state.sending ? 0.7 : 1 }}>{state.sending ? 'Joining…' : 'Join'}</button>
      </form>
      {state.message ? (
        <p role={state.ok ? 'status' : 'alert'} style={{ margin: '10px 0 0', fontSize: '13px', lineHeight: '1.5', color: state.ok ? 'var(--gold)' : '#f2b8b5' }}>{state.message}</p>
      ) : null}
    </div>
  );
}

// Pages that draw their own FAQ section; the route-keyed block would double them.
const OWN_FAQ_ROUTES = new Set(['/', '/faq', '/bulk-order', '/design-custom-jacket', '/shop']);
const OWN_FAQ_PREFIXES = ['/product/'];

/**
 * The footer, preceded by the page's FAQ block (as on the live site, where an
 * admin can attach FAQs to any route). `faq`: leave out for the FAQs attached
 * to this route, pass { pageKeys, values, title, intro } for a page's own
 * choice (product and catalog templates), or false for none.
 */
export default function Footer({ faq }) {
  const { pathname } = useLocation();
  const route = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  let block = null;
  if (faq && typeof faq === 'object') block = <PageFaqs {...faq} />;
  else if (faq !== false && !OWN_FAQ_ROUTES.has(route) && !OWN_FAQ_PREFIXES.some((p) => route.startsWith(p))) block = <PageFaqs pageKeys={[route]} />;
  return (
    <>
    {block}
    <footer className="ez-footer">
      <div className="ez-footer-grid">
        <div className="ez-footer-news">
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>Newsletter</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', marginTop: '8px' }}>
              Get 10% off your first jacket
            </div>
          </div>
          <NewsletterForm />
        </div>

        <div>
          <img src="/easy-jacket-logo.png" alt="Easy Jacket" width="77" height="64" loading="lazy" decoding="async" style={{ height: '64px', width: 'auto', filter: 'invert(1) brightness(1.1)' }} />
          <p style={{ margin: '16px 0 0', color: 'rgba(244,239,230,0.7)', lineHeight: '1.6', maxWidth: '34ch' }}>
            Custom varsity and letterman jackets in melton wool and genuine leather. Made to order, no minimums, shipped worldwide.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {SOCIAL.map(([abbr, name]) => (
              <A key={name} href="#" aria-label={name} className="ez-footer-social">{abbr}</A>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="ez-footer-title">{col.title}</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {col.links.map(([label, href]) => <A key={label} href={href} style={link}>{label}</A>)}
            </div>
            {col.title === 'Help' ? (
              <div style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(244,239,230,0.6)', lineHeight: '1.6' }}>
                Mon–Fri, 9am–6pm ET
                <br />
                <A href="mailto:hello@easyjackets.com" style={{ color: 'var(--cream)', textDecoration: 'none' }}>hello@easyjackets.com</A>
              </div>
            ) : null}
          </div>
        ))}

        <div className="ez-footer-legal">
          <span>© 2020–2026 Easy Jackets. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '20px' }}>
            <A href="/privacypolicy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</A>
            <A href="/terms-and-conditions" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</A>
            <span>Visa · Mastercard · Amex · PayPal</span>
          </span>
        </div>
      </div>
    </footer>
    </>
  );
}
