import A from './A';
import './footer.css';

const COLUMNS = [
  { title: 'Shop', links: [['Varsity Jackets', '/shop'], ['Bomber Jackets', '/shop'], ['Fleece Hoodies', '/shop'], ['Coach Jackets', '/shop'], ['Bestsellers', '/#bestsellers']] },
  { title: 'Custom', links: [['Design Your Own', '/design'], ['Materials & Colors', '/#materials'], ['Patches & Embroidery', '/#materials'], ['Bulk & Team Orders', '/#bulk'], ['Size Guide', '/product#size']] },
  { title: 'Help', links: [['FAQ', '/faq'], ['Shipping & Delivery', '/#faq'], ['Returns & Exchanges', '/#faq'], ['Contact Us', '/contact'], ['Blog', '/blog']] },
];
const SOCIAL = [['IG', 'Instagram'], ['FB', 'Facebook'], ['TT', 'TikTok'], ['PT', 'Pinterest']];

const link = { textDecoration: 'none', color: 'rgba(244,239,230,0.8)' };

export default function Footer() {
  return (
    <footer className="ez-footer">
      <div className="ez-footer-grid">
        <div className="ez-footer-news">
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>Newsletter</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', marginTop: '8px' }}>
              Get 10% off your first jacket
            </div>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="ez-footer-form">
            <input type="email" placeholder="you@school.edu" aria-label="Email" />
            <button type="submit" className="ez-btn ez-btn-gold" style={{ borderRadius: '0 2px 2px 0' }}>Join</button>
          </form>
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
            <A href="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</A>
            <A href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</A>
            <span>Visa · Mastercard · Amex · PayPal</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
