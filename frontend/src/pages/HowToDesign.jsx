// How to design: the live site's walkthrough of the jacket builder (easyjackets.com/how-to-design-jacket), in
// this site's design. Every text and image on the page comes from the admin (Content -> How to Design Page;
// stored in the database, backend helpers/pageContent.js); FALLBACK below is the content the page shipped
// with, shown only when the API cannot be reached. The campaign card is the shared one (Site Images).
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import SiteImage from '../components/SiteImage';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { usePageContent } from '../lib/pageContent';
import { usePageTitle } from '../lib/usePageTitle';
import './HowToDesign.css';

const IMG = '/images/how-to-design';

const FALLBACK = {
  header: {
    eyebrow: 'Design guide',
    titleLine1: 'How to design',
    titleLine2: 'your jacket.',
    intro: 'A step-by-step walkthrough of our Design Lab — choose materials, styles, colors, and add your personal touch.',
    chips: ['Custom Varsity Jackets', 'Custom Bomber Jackets', 'Custom Fleece Jackets', 'Custom Coach Jackets'],
  },
  overview: { image: `${IMG}/overview.webp`, alt: 'Select custom jacket style: varsity jacket, bomber jacket, fleece hoodie and coach jacket' },
  steps: [
    { title: 'Choose Your Material', desc: 'The tool will ask which material you want for your jacket. Choose from premium options including our famous cowhide leather.', image: `${IMG}/1-material.webp` },
    {
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
    { title: 'Advanced Options', desc: 'Add extra details to make your jacket truly unique.', bullets: ['Add a chest pocket', 'Shoulder inserts available', 'Piping can be added', 'Cuffs pro/simple options'], image: `${IMG}/3-advanced.webp` },
    { title: 'Pick Your Colors', desc: 'Color every part of the jacket body to match your personal style or team colors.', image: `${IMG}/4-colors.webp`, resultImage: `${IMG}/4-colors-result.webp`, resultCaption: 'After choosing colors, here’s a sample result:' },
    { title: 'Add Custom Designs', desc: 'Upload your custom logos, patches, or embroidery for the shoulder, arm area, collar, and more.', image: `${IMG}/5-designs.webp`, resultImage: `${IMG}/5-designs-result.webp`, resultCaption: 'With custom patches and text applied:' },
    { title: 'Review & Order', desc: 'Preview your fully designed jacket in 360° and place your order. We’ll handcraft it and deliver it to you.', image: `${IMG}/6-review.webp` },
  ],
  cta: {
    eyebrow: 'Ready?',
    titleLine1: 'Start designing',
    titleLine2: 'your dream jacket.',
    text: 'Jump into our Design Lab and bring your vision to life with premium materials and endless customization.',
    primaryLabel: 'Launch Design Lab →',
    primaryHref: '/design-custom-jacket',
    secondaryLabel: 'View Fabrics',
    secondaryHref: '/fabrics',
  },
};

const num = (i) => String(i + 1).padStart(2, '0');

// a screenshot, shown whole in its 16:9 frame; uploads come from the API's resizer
const Shot = ({ src, alt, slot }) => (
  <div className="htd-shot">
    <ImageSlot slot={slot} shape="rect" src={src} width={960} sizes="(max-width: 900px) 100vw, 640px" fit="contain" placeholder={alt} aria-label={alt} />
  </div>
);

const Bar = ({ w, h = 16, mt = 12 }) => <div className="ez-skeleton" style={{ width: w, height: `${h}px`, marginTop: `${mt}px` }} />;

export default function HowToDesign() {
  usePageTitle('How To Design Custom Jackets', 'Step-by-step guide to designing your custom varsity jacket. Learn how to use our jacket builder to choose materials, colors, styles, and add personalized embroidery.');
  const { content, ready } = usePageContent('how-to-design', FALLBACK);
  const header = content?.header || {};
  const overview = content?.overview || {};
  const steps = content?.steps || [];
  const cta = content?.cta || {};

  return (
    <div className="pg-how-to-design">
      <Nav cta="cart" />
      <main id="main" aria-busy={!ready}>
      {/* Header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>How to design</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          {ready ? (
            <div>
              {header.eyebrow ? <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)', marginBottom: '12px' }}>{header.eyebrow}</div> : null}
              <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
                {header.titleLine1}
                {header.titleLine2 ? <><br /><span style={{ color: 'var(--gold-2)' }}>{header.titleLine2}</span></> : null}
              </h1>
              {header.intro ? (
                <p style={{ maxWidth: '48ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>{header.intro}</p>
              ) : null}
              {header.chips?.length ? (
                <ul className="htd-chips" aria-label="Jacket styles you can design">
                  {header.chips.map((s, i) => <li key={`${i}-${s}`}>{s}</li>)}
                </ul>
              ) : null}
            </div>
          ) : (
            <div aria-hidden="true">
              <Bar w="120px" h={12} mt={0} />
              <Bar w="80%" h={72} mt={16} />
              <Bar w="60%" h={72} />
              <Bar w="70%" />
              <Bar w="55%" />
            </div>
          )}
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <SiteImage which="campaign" slot="howto-hero" shape="rect" fit="cover" width={640} sizes="(max-width: 720px) 100vw, 420px" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {ready && overview.image ? (
        <section className="htd-wrap" style={{ paddingTop: 'clamp(40px,5vw,64px)' }}>
          <div className="htd-overview">
            <ImageSlot slot="howto-overview" shape="rect" src={overview.image} width={1280} sizes="(max-width: 1000px) 100vw, 1000px" fit="contain" placeholder="Jacket styles overview" aria-label={overview.alt || 'Jacket styles overview'} />
          </div>
        </section>
      ) : null}

      {/* Steps */}
      <section className="htd-wrap htd-steps">
        {ready ? steps.map((step, i) => (
          step.substeps?.length ? (
            <div key={i} className="htd-step-block">
              <div className="htd-num">{num(i)}</div>
              <h2 className="htd-title">{step.title}</h2>
              {step.desc ? <p className="htd-desc">{step.desc}</p> : null}
              <div className="htd-substeps">
                {step.substeps.map((sub, j) => (
                  <figure key={j} className="htd-substep">
                    <Shot src={sub.image} alt={sub.label} slot={`howto-${i}-${j}`} />
                    <figcaption>
                      <strong>{sub.label}</strong>
                      <span>{sub.detail}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : (
            <div key={i} className={`htd-step${i % 2 === 1 ? ' is-reverse' : ''}`}>
              <div className="htd-step-copy">
                <div className="htd-num">{num(i)}</div>
                <h2 className="htd-title">{step.title}</h2>
                {step.desc ? <p className="htd-desc">{step.desc}</p> : null}
                {step.bullets?.length ? (
                  <ul className="htd-bullets">
                    {step.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
              <div className="htd-step-visual">
                {step.image ? <Shot src={step.image} alt={step.title} slot={`howto-${i}`} /> : null}
                {step.resultImage ? (
                  <div className="htd-result">
                    {step.resultCaption ? <div className="htd-result-caption">{step.resultCaption}</div> : null}
                    <Shot src={step.resultImage} alt={`${step.title} result`} slot={`howto-${i}-result`} />
                  </div>
                ) : null}
              </div>
            </div>
          )
        )) : (
          <div className="htd-step" aria-hidden="true">
            <div className="htd-step-copy"><Bar w="64px" h={48} mt={0} /><Bar w="80%" h={40} /><Bar w="90%" /><Bar w="70%" /></div>
            <div className="htd-step-visual"><div className="ez-skeleton" style={{ aspectRatio: '16 / 9', borderRadius: '4px' }} /></div>
          </div>
        )}
      </section>

      {/* CTA */}
      {ready ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
            <div>
              {cta.eyebrow ? (
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>{cta.eyebrow}</div>
              ) : null}
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                {cta.titleLine1}
                {cta.titleLine2 ? <><br /><span style={{ color: 'var(--gold)' }}>{cta.titleLine2}</span></> : null}
              </h2>
              {cta.text ? (
                <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>{cta.text}</p>
              ) : null}
            </div>
            <div className="htd-cta-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
              {cta.primaryLabel ? <A href={cta.primaryHref || '/design-custom-jacket'} className="ez-btn ez-btn-gold">{cta.primaryLabel}</A> : null}
              {cta.secondaryLabel ? <A href={cta.secondaryHref || '/fabrics'} className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>{cta.secondaryLabel}</A> : null}
            </div>
          </div>
        </section>
      ) : null}
      </main>
      <Footer />
    </div>
  );
}
