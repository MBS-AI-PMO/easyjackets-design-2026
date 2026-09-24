// Converted from design/Easy Jackets FAQ.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Faq() {

  function renderVals() {
    return { footerNoop: e => e.preventDefault(),
         ordering: [
           { q: 'Is there a minimum order?', a: 'No. Order a single jacket or a hundred. Team pricing starts at ten jackets.' },
           { q: 'How much does a custom jacket cost?', a: 'Fleece and satin start around $100; wool and leather builds from $150. Patches, names and numbers are shown live in the design lab total.' },
           { q: 'How do I pay?', a: 'Card, PayPal, Apple Pay and Google Pay. Team orders can pay a 50% deposit with the balance before shipping; institutions can use purchase orders.' },
           { q: 'Can I change my order after placing it?', a: 'Yes, until you approve the digital proof. After approval cutting starts and design changes are no longer possible; size changes may still be possible within 48 hours.' }],
         design: [
           { q: 'What file types can I upload for my logo?', a: 'PNG, JPG, PDF, AI or SVG. Vector files give the sharpest embroidery; if you only have a photo, our artists redraw it at no charge.' },
           { q: 'Will I see the jacket before it is made?', a: 'Always. You receive a free digital proof showing every panel, patch and placement, and nothing is cut until you approve it.' },
           { q: 'Can you copy an existing jacket?', a: 'Send photos and we will draw it up. We do not reproduce trademarked logos without the owner’s permission.' },
           { q: 'Chenille or embroidery — which should I choose?', a: 'Chenille for letters, mascots and big back patches; embroidery for names, numbers and fine logo detail. Most jackets use both.' }],
         sizing: [
           { q: 'How do I pick my size?', a: 'Measure a jacket you already like laid flat and compare it to our size chart. Between sizes, go up.' },
           { q: 'Do you make custom sizes?', a: 'Yes, at no extra charge. Enter chest, length, shoulder and sleeve at checkout; add three days to production.' },
           { q: 'Are there youth and women’s fits?', a: 'Both. Women’s is shaped through the waist with a narrower shoulder; youth runs from XS (age 8) to XL (age 14).' }],
         shipping: [
           { q: 'How long does it take?', a: 'Blank jackets 10–12 days in production; with chenille or embroidery 2–3 weeks. Shipping adds 4–5 business days by DHL or FedEx with tracking.' },
           { q: 'Where do you ship?', a: 'Worldwide. Shipping is free on orders over $150 to the US, UK, Canada, Australia and the EU.' },
           { q: 'Will I pay customs duties?', a: 'US orders under $800 are duty-free. Elsewhere, local import taxes may apply and are paid on delivery.' },
           { q: 'Can I rush an order?', a: 'Yes. Rush production (7–10 days) and express shipping are available at checkout.' }],
         returns: [
           { q: 'Can I return a custom jacket?', a: 'Custom jackets are made to your specification and cannot be returned for a refund, but every jacket has one free size exchange.' },
           { q: 'What if there is a mistake?', a: 'If the jacket does not match your approved proof, or arrives damaged, we remake or repair it at our cost, including shipping.' },
           { q: 'How do exchanges work?', a: 'Email us within 14 days of delivery with a photo and your measurements. We confirm the new size and ship it once we have your tracking number.' }],
         care: [
           { q: 'How do I clean a wool and leather jacket?', a: 'Spot clean wool with a damp cloth; dry clean only when needed and ask for a leather-safe cleaner. Condition leather sleeves twice a year.' },
           { q: 'Can a satin or fleece jacket go in the washer?', a: 'Satin: cold, gentle, inside out, hang dry. Fleece: cold wash, tumble low. Never iron over chenille or embroidery.' },
           { q: 'How should I store it?', a: 'On a wide hanger in a breathable garment bag, away from direct sun. Never in plastic.' }] };
  }

  const { care, design, ordering, returns, shipping, sizing } = renderVals();

  return (
    <div className="pg-faq">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* FAQ header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>FAQ</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Questions,
              <br />
              answered
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Everything about ordering, designing, sizing, shipping and caring for a custom jacket. Can’t find it? Contact us and a jacket maker will reply within a day.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="faq-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.9) 30%,rgba(20,17,15,0.15))', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '14px', pointerEvents: 'none' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Online builder · Free proof
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>
                  Design your Custom Letterman & Varsity Jacket
                </div>
              </div>
              <span className="ez-btn ez-btn-gold" style={{ minHeight: '44px', padding: '0 16px', fontSize: '17px', background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                Start →
              </span>
            </div>
          </A>
        </div>
      </section>
      {/* FAQ jump */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          <A href="#ordering" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ordering
          </A>
          <A href="#design" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Design & artwork
          </A>
          <A href="#sizing" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Sizing
          </A>
          <A href="#shipping" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Shipping
          </A>
          <A href="#returns" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Returns
          </A>
          <A href="#care" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Care
          </A>
        </div>
      </section>
      {/* FAQ Ordering */}
      <section id="ordering" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Ordering
        </h2>
        <div>
          {ordering.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* FAQ Design & artwork */}
      <section id="design" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Design & artwork
        </h2>
        <div>
          {design.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* FAQ Sizing */}
      <section id="sizing" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Sizing
        </h2>
        <div>
          {sizing.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* FAQ Shipping */}
      <section id="shipping" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Shipping
        </h2>
        <div>
          {shipping.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* FAQ Returns */}
      <section id="returns" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Returns
        </h2>
        <div>
          {returns.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* FAQ Care */}
      <section id="care" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Care
        </h2>
        <div>
          {care.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Still stuck?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Ask a jacket maker
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Email, WhatsApp or the contact form — a real person replies within one business day.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact" className="ez-btn ez-btn-gold">Contact us</A>
            <A href="/size-chart" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Size chart →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
