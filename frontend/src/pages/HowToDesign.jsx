// How to design: the live site's walkthrough of the jacket builder
// (easyjackets.com/how-to-design-jacket), same wording, in this site's design.
// The screenshots are static files in public/images/how-to-design.
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { usePageTitle } from '../lib/usePageTitle';
import './HowToDesign.css';

const IMG = '/images/how-to-design';

const JACKET_STYLES = ['Custom Varsity Jackets', 'Custom Bomber Jackets', 'Custom Fleece Jackets', 'Custom Coach Jackets'];

const STEPS = [
  {
    num: '01',
    title: 'Choose Your Material',
    desc: 'The tool will ask which material you want for your jacket. Choose from premium options including our famous cowhide leather.',
    image: `${IMG}/1-material.webp`,
  },
  {
    num: '02',
    title: 'Select Your Style',
    desc: 'Customize every detail of your jacket with 6 different styling options across various parts.',
    substeps: [
      { label: 'Collar Type', detail: '6 various collar types to choose from', image: `${IMG}/2-collar.webp` },
      { label: 'Sleeve Style', detail: '2 sleeve styles available', image: `${IMG}/2-sleeves.webp` },
      { label: 'Front Closure', detail: 'Zipper or button options', image: `${IMG}/2-front-closure.webp` },
      { label: 'Pocket Style', detail: '6 pocket options to choose from', image: `${IMG}/2-pockets.webp` },
      { label: 'Knit / Trim', detail: '5 options to choose from', image: `${IMG}/2-knit-trim.webp` },
      { label: 'Lining', detail: '3 lining options available', image: `${IMG}/2-lining.webp` },
    ],
  },
  {
    num: '03',
    title: 'Advanced Options',
    desc: 'Add extra details to make your jacket truly unique.',
    bullets: ['Add a chest pocket', 'Shoulder inserts available', 'Piping can be added', 'Cuffs pro/simple options'],
    image: `${IMG}/3-advanced.webp`,
  },
  {
    num: '04',
    title: 'Pick Your Colors',
    desc: 'Color every part of the jacket body to match your personal style or team colors.',
    image: `${IMG}/4-colors.webp`,
    resultImage: `${IMG}/4-colors-result.webp`,
    resultCaption: 'After choosing colors, here’s a sample result:',
  },
  {
    num: '05',
    title: 'Add Custom Designs',
    desc: 'Upload your custom logos, patches, or embroidery for the shoulder, arm area, collar, and more.',
    image: `${IMG}/5-designs.webp`,
    resultImage: `${IMG}/5-designs-result.webp`,
    resultCaption: 'With custom patches and text applied:',
  },
  {
    num: '06',
    title: 'Review & Order',
    desc: 'Preview your fully designed jacket in 360° and place your order. We’ll handcraft it and deliver it to you.',
    image: `${IMG}/6-review.webp`,
  },
];

const Shot = ({ src, alt, slot }) => (
  <div className="htd-shot">
    <ImageSlot slot={slot} shape="rect" src={src} fit="contain" placeholder={alt} aria-label={alt} />
  </div>
);

export default function HowToDesign() {
  usePageTitle('How To Design Custom Jackets', 'Step-by-step guide to designing your custom varsity jacket. Learn how to use our jacket builder to choose materials, colors, styles, and add personalized embroidery.');

  return (
    <div className="pg-how-to-design">
      <Nav cta="cart" />
      {/* Header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>How to design</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)', marginBottom: '12px' }}>Design guide</div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              How to design
              <br />
              <span style={{ color: 'var(--gold-2)' }}>your jacket.</span>
            </h1>
            <p style={{ maxWidth: '48ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              A step-by-step walkthrough of our Design Lab — choose materials, styles, colors, and add your personal touch.
            </p>
            <ul className="htd-chips" aria-label="Jacket styles you can design">
              {JACKET_STYLES.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="howto-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.85) 18%,rgba(20,17,15,0.35) 42%,rgba(20,17,15,0) 65%)', pointerEvents: 'none' }} />
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

      {/* Overview: the jacket styles the builder starts from */}
      <section className="htd-wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)' }}>
        <div className="htd-overview">
          <ImageSlot slot="howto-overview" shape="rect" src={`${IMG}/overview.webp`} fit="contain" placeholder="Jacket styles overview" aria-label="Select custom jacket style: varsity jacket, bomber jacket, fleece hoodie and coach jacket" />
        </div>
      </section>

      {/* Steps */}
      <section className="htd-wrap htd-steps">
        {STEPS.map((step, i) => (
          step.substeps ? (
            <div key={step.num} className="htd-step-block">
              <div className="htd-num">{step.num}</div>
              <h2 className="htd-title">{step.title}</h2>
              <p className="htd-desc">{step.desc}</p>
              <div className="htd-substeps">
                {step.substeps.map((sub) => (
                  <figure key={sub.label} className="htd-substep">
                    <Shot src={sub.image} alt={sub.label} slot={`howto-${sub.label}`} />
                    <figcaption>
                      <strong>{sub.label}</strong>
                      <span>{sub.detail}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : (
            <div key={step.num} className={`htd-step${i % 2 === 1 ? ' is-reverse' : ''}`}>
              <div className="htd-step-copy">
                <div className="htd-num">{step.num}</div>
                <h2 className="htd-title">{step.title}</h2>
                <p className="htd-desc">{step.desc}</p>
                {step.bullets ? (
                  <ul className="htd-bullets">
                    {step.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
              <div className="htd-step-visual">
                <Shot src={step.image} alt={step.title} slot={`howto-${step.num}`} />
                {step.resultImage ? (
                  <div className="htd-result">
                    <div className="htd-result-caption">{step.resultCaption}</div>
                    <Shot src={step.resultImage} alt={`${step.title} result`} slot={`howto-${step.num}-result`} />
                  </div>
                ) : null}
              </div>
            </div>
          )
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
              Start designing
              <br />
              <span style={{ color: 'var(--gold)' }}>your dream jacket.</span>
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Jump into our Design Lab and bring your vision to life with premium materials and endless customization.
            </p>
          </div>
          <div className="htd-cta-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Launch Design Lab →</A>
            <A href="/fabrics" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>View Fabrics</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
