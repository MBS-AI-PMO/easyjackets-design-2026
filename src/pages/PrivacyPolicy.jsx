// Converted from design/Easy Jackets Privacy Policy.dc.html
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {

  function renderVals() {
    return { cartCount: 2, footerNoop: e => e.preventDefault() };
  }

  const { cartCount } = renderVals();

  return (
    <div className="pg-privacy-policy">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Privacy header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Privacy Policy</span>
        </div>
        <div style={{ marginTop: '16px', maxWidth: '52ch' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            Privacy
            <br />
            policy
          </h1>
          <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            What we collect when you order a jacket, why we need it, and how you control it.
          </p>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px' }}>Last updated 22 September 2026</p>
        </div>
      </section>
      {/* Privacy body */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 64px', display: 'grid', gridTemplateColumns: 'minmax(0,220px) minmax(0,1fr)', gap: '32px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <aside className="ez-toc ez-side" style={{ position: 'sticky', top: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            On this page
          </div>
          <A href="#collect">What we collect</A>
          <A href="#use">How we use it</A>
          <A href="#artwork">Your artwork</A>
          <A href="#payments">Payments</A>
          <A href="#cookies">Cookies</A>
          <A href="#sharing">Who we share with</A>
          <A href="#retention">How long we keep it</A>
          <A href="#rights">Your rights</A>
          <A href="#children">Children</A>
          <A href="#contact-dpo">Contact</A>
        </aside>
        <div className="ez-prose">
          <h2 id="collect">What we collect</h2>
          <p>We collect only what is needed to make and deliver your jacket:</p>
          <ul>
            <li>
              <strong>Contact details</strong>
              {' '}— name, email, phone, billing and shipping address.
            </li>
            <li>
              <strong>Order details</strong>
              {' '}— sizes, body measurements, jacket specification and any names or numbers you ask us to apply.
            </li>
            <li>
              <strong>Artwork</strong>
              {' '}— logos, sketches and photographs you upload.
            </li>
            <li>
              <strong>Account data</strong>
              {' '}— saved designs, addresses and order history if you create an account.
            </li>
            <li>
              <strong>Technical data</strong>
              {' '}— IP address, device and browser type, and anonymous analytics about how the site is used.
            </li>
          </ul>
          <h2 id="use">How we use it</h2>
          <p>
            To produce your order, send proofs, process payment, ship the jacket, answer your questions, and — only if you opt in — email you occasional offers. We do not sell your personal information, ever.
          </p>
          <h2 id="artwork">Your artwork</h2>
          <p>
            Artwork you upload is used to produce your order and to create your proof. We may show a finished jacket in our gallery or social channels; tell us at checkout or by email if you would rather we did not, and we will mark your order private. You confirm you hold the rights to any logo you send; we do not reproduce trademarked marks without the owner's permission.
          </p>
          <h2 id="payments">Payments</h2>
          <p>
            Card payments are processed by our payment providers. We never see or store your full card number — only the last four digits and the card type, so you can recognise the transaction.
          </p>
          <h2 id="cookies">Cookies</h2>
          <p>
            We use strictly necessary cookies to keep your cart and session working, and anonymous analytics cookies to understand which pages help people order. No advertising trackers are placed without your consent, and you can refuse non-essential cookies without losing any functionality.
          </p>
          <h2 id="sharing">Who we share with</h2>
          <p>
            Only the parties needed to fulfil your order: our payment providers, shipping carriers (DHL, FedEx), and the email and analytics tools we use to run the site. Each is bound by contract to use your data only on our instructions. We may disclose information where the law requires it.
          </p>
          <h2 id="retention">How long we keep it</h2>
          <p>
            Order records are kept for seven years to meet tax and accounting obligations. Artwork and saved designs are kept while your account is open so you can reorder, and deleted on request. Marketing contacts are removed as soon as you unsubscribe.
          </p>
          <h2 id="rights">Your rights</h2>
          <p>
            You can ask us to give you a copy of your data, correct it, delete it, or stop using it for marketing. Email{' '}
            <A href="mailto:privacy@easyjackets.com">privacy@easyjackets.com</A>
            {' '}and we will respond within 30 days. If you are in the EU or UK, you may also complain to your local data protection authority.
          </p>
          <h2 id="children">Children</h2>
          <p>
            The site is not intended for children under 13. School and youth orders are placed by a parent, coach or school staff member, who provides the sizing details on the student's behalf.
          </p>
          <h2 id="contact-dpo">Contact</h2>
          <p>
            Questions about this policy:{' '}
            <A href="mailto:privacy@easyjackets.com">privacy@easyjackets.com</A>
            , or through the{' '}
            <A href="/contact">contact page</A>
            .
          </p>
        </div>
      </section>
      {/* Related */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 96px' }}>
        <div style={{ borderTop: '2px solid var(--ink)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: '6px' }}>
            Also read
          </span>
          <A href="/shipping-returns" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Shipping & returns
          </A>
          <A href="/terms" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Terms & conditions
          </A>
          <A href="/contact" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Contact us
          </A>
        </div>
      </section>
      <Footer />
    </div>
  );
}
