import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import A from './A';
import PageFaqs from './PageFaqs';
import { fetchWebsiteDetails, isEmail, subscribeNewsletter, telHref } from '../lib/site';
import { useAsync } from '../lib/useAsync';
import { imageUrl } from '../lib/api';
import { FALLBACK_FOOTER_LOGO, useSiteIdentity } from '../lib/siteIdentity';
import './footer.css';

const COLUMNS = [
  { title: 'Shop', links: [['Varsity Jackets', '/shop'], ['Bomber Jackets', '/shop'], ['Fleece Hoodies', '/shop'], ['Coach Jackets', '/shop'], ['Bestsellers', '/#bestsellers']] },
  { title: 'Custom', links: [['Design Your Own', '/design-custom-jacket'], ['Materials & Colors', '/material-colors'], ['Patches & Embroidery', '/embroidery-and-patches'], ['Bulk & Team Orders', '/bulk-order'], ['Size Guide', '/sizechart']] },
  { title: 'Help', links: [['FAQ', '/faq'], ['Track Order', '/track-order'], ['Shipping & Returns', '/shipping'], ['Contact Us', '/contact-us'], ['Blog', '/new-blog']] },
];

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
  // footer logo + size from the admin (Site Identity & Logos), shown white like the admin's preview
  const { footerLogo, footerLogoHeight } = useSiteIdentity();
  // contact details + social links from the admin (Website Details), shared with the Contact page
  const { data: site } = useAsync(fetchWebsiteDetails, []);
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
          <img className="ez-footer-logo" src={footerLogo ? imageUrl(footerLogo, 480) : FALLBACK_FOOTER_LOGO} alt="Easy Jackets" height={footerLogoHeight || 64} loading="lazy" decoding="async" style={{ '--ez-footer-logo-h': `${footerLogoHeight || 64}px` }} onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_FOOTER_LOGO)) e.currentTarget.src = FALLBACK_FOOTER_LOGO; }} />
          <p style={{ margin: '16px 0 0', color: 'rgba(244,239,230,0.7)', lineHeight: '1.6', maxWidth: '34ch' }}>
            Custom varsity and letterman jackets in melton wool and genuine leather. Made to order, no minimums, shipped worldwide.
          </p>
          {/* the admin's social profiles that are switched on (Website Details -> Social Media Profiles) */}
          {site?.socials?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
              {site.socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Easy Jackets on ${s.name}`} title={s.name} className="ez-footer-social">{s.abbr}</a>
              ))}
            </div>
          ) : null}
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="ez-footer-title">{col.title}</div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {col.links.map(([label, href]) => <A key={label} href={href} style={link}>{label}</A>)}
            </div>
          </div>
        ))}

        {/* Contact: the admin's phone, email and addresses (Website Details -> Contact Information) */}
        <div>
          <div className="ez-footer-title">Contact</div>
          <div className="ez-footer-contact">
            {site?.phone ? <a href={telHref(site.phone)} style={link}>{site.phone}</a> : null}
            {site?.email ? <a href={`mailto:${site.email}`} style={link}>{site.email}</a> : null}
            <div className="ez-footer-hours">Mon–Fri, 9am–6pm ET</div>
            {(site?.addresses || []).map((a, i) => (
              <div key={i} className="ez-footer-addr">
                {a.label ? <div className="ez-footer-addr-label">{a.label}</div> : null}
                {a.lines.map((l, j) => <div key={j}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>

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
