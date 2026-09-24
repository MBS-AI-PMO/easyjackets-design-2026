// Converted from design/Easy Jackets How To Design.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function HowToDesign() {

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    return { footerNoop: e => e.preventDefault(), cartCount: 0, steps: [
      { n: '01', slot: 'ht-1', title: 'Pick a style', desc: 'Varsity, cropped, bomber, coach or hoodie. The silhouette sets the price range and which materials are available.', tip: 'Not sure? Classic varsity is 80% of what we make.', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
      { n: '02', slot: 'ht-2', title: 'Choose body & sleeves', desc: 'Pick a cloth for the body and a material for the sleeves, then a color for each. The preview updates live.', tip: 'Dark body, light sleeves is the traditional two-tone.', src: CL + 'melton-wool-fabric-for-varsity-jackets-clothoo.jpg' },
      { n: '03', slot: 'ht-3', title: 'Set trim & lining', desc: 'Rib knit collar, cuffs and waistband take your second color in one- or two-stripe patterns. Lining is quilted satin in ten colors.', tip: 'Match the stripe to your lettering color.', src: CL + 'polyester-satin-quilted-lining-options-clothoo.jpg' },
      { n: '04', slot: 'ht-4', title: 'Add letters & patches', desc: 'Chenille letter on the chest, mascot on the sleeve, big artwork on the back. Drag to place; choose felt colors.', tip: 'Upload a vector logo for the sharpest result.', src: CL + 'custom-chenille-triple-felt-clothoo.jpg' },
      { n: '05', slot: 'ht-5', title: 'Names & numbers', desc: 'Embroidered name on the right chest, number on the sleeve, class year on the cuff. Pick a font and thread color.', tip: 'Script fonts read best above 1.5 in tall.', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      { n: '06', slot: 'ht-6', title: 'Size, order, approve', desc: 'Pick a size (or enter custom measurements), add to cart and check out. Our artists send a free digital proof within 2 days; nothing is cut until you approve.', tip: 'Between sizes? Go up.', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
    ] };
  }

  const { cartCount, steps } = renderVals();

  return (
    <div className="pg-how-to-design">
      <Nav cta="cart" cartCount={cartCount} />
      {/* How to design header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>How to design</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              How to design
              <br />
              your jacket
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              A five-minute walkthrough of the design lab: pick a style, choose materials and colors, add letters, names and logos, then approve a free proof.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="howto-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* Video */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ position: 'relative', aspectRatio: '21/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)' }}>
          <div style={{ position: 'absolute', inset: '0', opacity: '0.55' }}>
            <ImageSlot slot="howto-video" shape="rect" src="https://clothoo.com/frontend/images/home/design-your-own-varsity-jacket-builder-online-clothoo-800.jpg" placeholder="Design lab walkthrough video" />
          </div>
          <div style={{ position: 'absolute', inset: '0', display: 'grid', placeItems: 'center' }}>
            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center' }}>
              <svg width="28" height="32" viewBox="0 0 28 32" fill="var(--ink)"><path d="M0 0l28 16L0 32z" /></svg>
            </div>
          </div>
          <div style={{ position: 'absolute', left: '24px', bottom: '20px', color: 'var(--cream)', fontSize: '13px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Watch · 4:32
          </div>
        </div>
      </section>
      {/* Steps */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gap: 'clamp(48px,6vw,80px)' }}>
        {steps.map((s, sIdx) => (
          <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px clamp(24px,4vw,72px)', alignItems: 'center' }}>
            <div style={{ aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot={s.slot} shape="rect" src={s.src} placeholder={`${s.title} screenshot`} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '64px', lineHeight: '1', color: 'var(--gold-2)' }}>
                {s.n}
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                {s.title}
              </h2>
              <p style={{ margin: '16px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '16px', maxWidth: '52ch' }}>{s.desc}</p>
              <div style={{ marginTop: '16px', padding: '14px 16px', background: '#fbf8f2', borderLeft: '3px solid var(--gold)', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.55' }}>
                <strong style={{ color: 'var(--ink)' }}>Tip:</strong>
                {' '}{s.tip}
              </div>
            </div>
          </div>
        ))}
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Ready?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Open the design lab
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Pick a style and start building. Save your design and come back any time.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design" className="ez-btn ez-btn-gold">Start designing</A>
            <A href="/contact" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Send us a sketch →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
