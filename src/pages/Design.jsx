// Converted from design/Easy Jackets Design.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Design.css';

export default function Design() {

  function renderVals() {
    const footerNoop = e => e.preventDefault();
    const CU = 'https://custom.easyjackets.com/?id=', TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    const types = [
      { id: 5893, name: 'Varsity Jackets', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
      { id: 5894, name: 'Cropped Varsity Jackets', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
      { id: 5895, name: 'Coach Jackets', src: CL + 'design-your-own-varsity-jacket-builder-online-clothoo-800.jpg' },
      { id: 5896, name: 'Bomber Jackets', src: TJM + 'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
      { id: 5897, name: 'Hoodies', src: TJM + 'Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114' },
    ];
    return {
      footerNoop,
      types: types.map(t => ({ ...t, slot: 'dz-' + t.id, href: CU + t.id })),
      faqs: [
        { q: 'Can I order just one jacket for myself?', a: 'Yes. There is no minimum order. Design a single jacket in the design lab or pick a ready style and add your letter and name.' },
        { q: 'How do I design a letterman jacket online?', a: 'Pick a style above, choose materials and colors for body, sleeves and trim, upload your logo, and watch the live preview update. Add to cart when you are happy.' },
        { q: 'How do I add my school logo or team patch?', a: 'Upload artwork in the design lab. Our artists redraw it for chenille or embroidery and send a digital proof for approval before production.' },
        { q: 'How much does a custom jacket cost?', a: 'Fleece and satin start around $100; wool and leather builds from $150. Patches, names and numbers add to the total, shown live in the design lab.' },
        { q: 'How long does it take?', a: 'Blank jackets 10–12 days; with embroidery or patches 2–3 weeks. Shipping adds 4–5 business days. Rush production is available at checkout.' },
        { q: 'How can I order for my school or team?', a: 'Request a bulk quote and we will confirm pricing, a sizing run and a production timeline for your date.' },
      ],
    };
  }

  const { faqs, types } = renderVals();

  return (
    <div className="pg-design">
      <Nav active="/design" cta="shop" />
      {/* Select a style */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,48px) clamp(56px,7vw,96px)', textAlign: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Choose your style
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,7vw,96px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '12px 0 0' }}>
          Select a{' '}
          <span style={{ color: 'var(--gold-2)' }}>jacket style</span>
        </h1>
        <p style={{ margin: '18px auto 0', maxWidth: '48ch', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
          Pick a style below and launch the design lab to fully customize it.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px', marginTop: 'clamp(36px,5vw,56px)', textAlign: 'left' }}>
          {types.map((t, tIdx) => (
            <A key={tIdx} href={t.href} className="ez-type">
              <div className="ez-type-img" style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: '2px' }}>
                <ImageSlot slot={t.slot} shape="rect" src={t.src} fit="contain" placeholder={t.name} />
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', margin: '0', textAlign: 'center' }}>
                {t.name}
              </h2>
              <span className="ez-type-cta ez-btn ez-btn-ink" style={{ minHeight: '46px', fontSize: '18px', marginTop: 'auto' }}>
                Design now →
              </span>
            </A>
          ))}
        </div>
      </section>
      {/* send us your idea */}
      {/* Free proof */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,48px)' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '28px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Not sure where to start?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Send us your idea, we'll draw it
            </h2>
          </div>
          <div>
            <p style={{ margin: '0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px' }}>
              Email a sketch, a photo of an old jacket, or your school colors and logo. Our artists send back a free digital proof within two business days — no commitment until you love it.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '20px' }}>
              <A href="/contact" className="ez-btn" style={{ background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)' }}>
                Get a free proof
              </A>
              <A href="/bulk-orders" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Team order? →</A>
            </div>
          </div>
        </div>
      </section>
      {/* how it works */}
      {/* Steps */}
      <section id="how" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          What happens next
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>01</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Pick a jacket type
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Choose the silhouette above. You can change materials later.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>02</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Customize live
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Colors, sleeves, trim, lining, letters, names, numbers and logos. Price updates as you go.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>03</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Approve the proof
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              We send a digital illustration of your exact jacket. Nothing is cut until you sign off.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>04</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Made & shipped
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              2–3 weeks in production, then tracked delivery. Rush available.
            </p>
          </div>
        </div>
      </section>
      {/* faq */}
      {/* FAQ */}
      <section id="faq" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            FAQ
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            Before you design
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '36ch' }}>
            Still stuck? Chat with us any time — we answer within the hour during business days.
          </p>
        </div>
        <div>
          {faqs.map((f, fIdx) => (
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
      <Footer />
    </div>
  );
}
