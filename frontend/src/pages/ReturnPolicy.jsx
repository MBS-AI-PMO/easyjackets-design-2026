// /return-policy: the live site's own "Return & Exchange Policy" address, kept as a page (N-O10) because
// Merchant Center and the Product schema (merchantReturnLink) point at it. The text is the Shipping &
// Returns page's returns section (components/ReturnsPolicy.jsx).
import A from '../components/A';
import Footer from '../components/Footer';
import Nav from '../components/Nav';
import ReturnsPolicy from '../components/ReturnsPolicy';
import { usePageTitle } from '../lib/usePageTitle';

export default function ReturnPolicy() {
  usePageTitle('Return & Exchange Policy', 'Custom-made jackets are final sale; plain stock jackets can be returned within 10 days of delivery. The Easy Jackets return and exchange policy.');
  return (
    <div className="pg-return-policy">
      <Nav cta="cart" />
      <main id="main">
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span aria-hidden="true">/</span>
          <A href="/shipping" style={{ textDecoration: 'none', color: 'inherit' }}>Shipping & Returns</A>
          <span aria-hidden="true">/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }} aria-current="page">Return policy</span>
        </nav>
        <div style={{ marginTop: '16px', maxWidth: '52ch' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            Return &
            <br />
            exchange policy
          </h1>
          <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            What can be returned, within how long, and what to do if a jacket arrives damaged.
          </p>
        </div>
      </section>
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(16px,4vw,48px) 64px' }}>
        <div className="ez-prose" style={{ maxWidth: '760px' }}>
          <ReturnsPolicy />
          <p>
            Delivery times, rates and tracking are on the <A href="/shipping">Shipping & Returns</A> page. Questions about a return? <A href="/contact-us">Contact us</A> with your order number.
          </p>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
