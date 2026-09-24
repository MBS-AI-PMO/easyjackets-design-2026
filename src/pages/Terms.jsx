// Converted from design/Easy Jackets Terms.dc.html
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Terms() {

  function renderVals() {
    return { cartCount: 2, footerNoop: e => e.preventDefault() };
  }

  const { cartCount } = renderVals();

  return (
    <div className="pg-terms">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Terms header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Terms & Conditions</span>
        </div>
        <div style={{ marginTop: '16px', maxWidth: '52ch' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            Terms &
            <br />
            conditions
          </h1>
          <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            The agreement between you and Easy Jackets when you place an order, written to be read.
          </p>
          <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px' }}>Last updated 22 September 2026</p>
        </div>
      </section>
      {/* Terms body */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 64px', display: 'grid', gridTemplateColumns: 'minmax(0,220px) minmax(0,1fr)', gap: '32px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <aside className="ez-toc ez-side" style={{ position: 'sticky', top: '110px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            On this page
          </div>
          <A href="#orders">Orders & acceptance</A>
          <A href="#pricing">Pricing & payment</A>
          <A href="#proofs">Proofs & approval</A>
          <A href="#ip">Artwork & IP</A>
          <A href="#colors">Colors & materials</A>
          <A href="#sizing">Sizing responsibility</A>
          <A href="#delivery-terms">Delivery</A>
          <A href="#bulk-terms">Team & bulk orders</A>
          <A href="#liability">Liability</A>
          <A href="#law">Governing law</A>
        </aside>
        <div className="ez-prose">
          <h2 id="orders">Orders & acceptance</h2>
          <p>
            Your order is an offer to buy. It is accepted when we send the order confirmation email. We may decline or cancel and refund any order we cannot make as specified, including orders for artwork we are not permitted to reproduce.
          </p>
          <h2 id="pricing">Pricing & payment</h2>
          <p>
            Prices are in US dollars and include production and decoration as specified at checkout. Payment is taken in full at checkout, except team orders, which may pay a 50% deposit with the balance due before shipping. Schools, districts and universities may order on a purchase order with net 30 terms after proof approval. Quoted prices hold for 30 days.
          </p>
          <h2 id="proofs">Proofs & approval</h2>
          <p>
            We email a digital proof within two business days of checkout. You may request unlimited revisions before approving it. Production begins at approval, and after approval the design is fixed: spelling, placement, colors and sizes shown on the approved proof are the specification we build to. Please check names and numbers carefully.
          </p>
          <h2 id="ip">Artwork & intellectual property</h2>
          <p>
            You keep ownership of the artwork you send and grant us the licence needed to produce and proof your order. You warrant that you have the right to use it. We do not reproduce third-party trademarks, school marks or licensed logos without written permission from the rights holder, and we may ask you for that permission before production. Designs our artists draw for you are yours to use on jackets we make; the site, its photography and its text remain ours.
          </p>
          <h2 id="colors">Colors & materials</h2>
          <p>
            Screens vary, so colors shown online are approximate. Request a free swatch pack for exact matching. Natural materials — particularly full-grain leather and melton wool — carry small variations in grain and tone that are part of the material, not a defect. If a material is out of stock we contact you with the closest alternative before proceeding.
          </p>
          <h2 id="sizing">Sizing responsibility</h2>
          <p>
            You are responsible for the size or measurements you supply. Use the{' '}
            <A href="/size-chart">size chart</A>
            {' '}and measure a jacket you already wear. Every custom jacket includes one free size exchange if the fit is wrong; see{' '}
            <A href="/shipping-returns#exchanges">shipping & returns</A>
            .
          </p>
          <h2 id="delivery-terms">Delivery</h2>
          <p>
            Delivery estimates are estimates, not guarantees. We are not liable for delays caused by carriers, customs or events outside our control, though we will chase any late shipment with the carrier on your behalf. Risk passes to you on delivery.
          </p>
          <h2 id="bulk-terms">Team & bulk orders</h2>
          <p>
            Team pricing starts at ten jackets. A full size and name list is required before production; late changes to the roster may incur a charge. Orders of 25 or more may request a physical pre-production sample, credited against the order. Deposits on team orders are non-refundable once the proof is approved.
          </p>
          <h2 id="liability">Liability</h2>
          <p>
            Our liability for any order is limited to the amount you paid for it. We are not liable for indirect or consequential losses, such as missed events. Nothing in these terms limits your statutory consumer rights or excludes liability we cannot exclude by law.
          </p>
          <h2 id="law">Governing law & changes</h2>
          <p>
            These terms are governed by the laws of Pakistan, without affecting any mandatory consumer protections in your country of residence. We may update these terms; the version in force is the one published when you place your order. Questions:{' '}
            <A href="/contact">contact us</A>
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
          <A href="/privacy-policy" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Privacy policy
          </A>
          <A href="/bulk-orders" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Team orders
          </A>
        </div>
      </section>
      <Footer />
    </div>
  );
}
