// Converted from design/Easy Jackets Shipping Returns.dc.html
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function ShippingReturns() {

  function renderVals() {
    return { cartCount: 2, footerNoop: e => e.preventDefault() };
  }

  const { cartCount } = renderVals();

  return (
    <div className="pg-shipping-returns">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Shipping header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Shipping & Returns</span>
        </div>
        <div style={{ marginTop: '16px', maxWidth: '52ch' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            Shipping
            <br />
            & returns
          </h1>
          <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            How long your jacket takes, what delivery costs, and what happens if the fit or the finish is not right.
          </p>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px' }}>Last updated 22 September 2026</p>
        </div>
      </section>
      {/* Shipping body */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 64px', display: 'grid', gridTemplateColumns: 'minmax(0,220px) minmax(0,1fr)', gap: '32px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <aside className="ez-toc ez-side" style={{ position: 'sticky', top: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            On this page
          </div>
          <A href="#times">Production times</A>
          <A href="#rates">Delivery & rates</A>
          <A href="#duties">Duties & taxes</A>
          <A href="#tracking">Tracking</A>
          <A href="#exchanges">Size exchanges</A>
          <A href="#refunds">Refunds</A>
          <A href="#faults">Faults & remakes</A>
          <A href="#cancel">Cancellations</A>
        </aside>
        <div className="ez-prose">
          <h2 id="times">Production times</h2>
          <p>Every jacket is made to order after you approve your digital proof. Production begins on approval, not at checkout.</p>
          <ul>
            <li>
              <strong>Blank jackets</strong>
              {' '}— 10–12 business days.
            </li>
            <li>
              <strong>Chenille or embroidery</strong>
              {' '}— 2–3 weeks.
            </li>
            <li>
              <strong>Rush production</strong>
              {' '}— 7–10 business days, available at checkout for an additional fee.
            </li>
            <li>
              <strong>Team orders of 25+</strong>
              {' '}— add 3–5 business days.
            </li>
          </ul>
          <p>Custom measurements add roughly three days. We email you when your order moves into cutting and again when it ships.</p>
          <h2 id="rates">Delivery & rates</h2>
          <p>We ship worldwide from our workshop in Sialkot by DHL Express and FedEx, fully tracked and insured.</p>
          <ul>
            <li>
              <strong>Standard</strong>
              {' '}— 4–5 business days. Free on orders over $150 to the US, UK, Canada, Australia and the EU; otherwise $19.
            </li>
            <li>
              <strong>Express</strong>
              {' '}— 2–3 business days, $39.
            </li>
            <li>
              <strong>Rest of world</strong>
              {' '}— 5–8 business days, quoted at checkout.
            </li>
          </ul>
          <p>
            We ship to residential addresses, schools, field houses and business addresses alike. PO boxes cannot be used for express services.
          </p>
          <h2 id="duties">Duties & taxes</h2>
          <p>
            US orders under $800 clear duty-free. In other countries local import duty or VAT may apply and is payable to the carrier on delivery. We declare the full order value on every shipment and cannot mark parcels as gifts.
          </p>
          <h2 id="tracking">Tracking your order</h2>
          <p>
            A tracking number is emailed the day your jacket leaves the workshop, and every order can be followed from proof to doorstep on the{' '}
            <A href="/track-order">order tracking page</A>
            {' '}or from your account dashboard.
          </p>
          <h2 id="exchanges">Size exchanges</h2>
          <p>
            Every custom jacket includes{' '}
            <strong>one free size exchange</strong>
            . Email us within 14 days of delivery with a photo of the jacket and your measurements. We confirm the new size, make it, and ship it once the original is on its way back to us. You cover return postage; we cover the remake and the outbound shipping.
          </p>
          <p>Jackets must be unworn, unwashed and free of alterations, with all tags attached.</p>
          <h2 id="refunds">Refunds</h2>
          <p>
            Custom jackets are made to your specification and cannot be returned for a refund. Ready-made, non-customized items may be returned unworn within 30 days for a refund less shipping. Sale items are exchange-only. Approved refunds are issued to the original payment method within 5–7 business days.
          </p>
          <h2 id="faults">Faults & remakes</h2>
          <p>
            If your jacket does not match the proof you approved, or arrives damaged or defective, we remake or repair it at our cost, including shipping both ways. Send photographs within 14 days of delivery and we will arrange it immediately.
          </p>
          <h2 id="cancel">Cancellations</h2>
          <p>
            Cancel for a full refund any time before you approve your proof. Once the proof is approved, materials are cut and the order can no longer be cancelled, although size changes may still be possible within 48 hours.
          </p>
        </div>
      </section>
      {/* Related */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 96px' }}>
        <div style={{ borderTop: '2px solid var(--ink)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: '6px' }}>
            Also read
          </span>
          <A href="/privacy-policy" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Privacy policy
          </A>
          <A href="/terms" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Terms & conditions
          </A>
          <A href="/size-chart" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Size chart
          </A>
          <A href="/faq" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            FAQ
          </A>
        </div>
      </section>
      <Footer />
    </div>
  );
}
