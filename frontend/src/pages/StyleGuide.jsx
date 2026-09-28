// Converted from design/Easy Jackets Style Guide.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function StyleGuide() {

  function renderVals() {
    return { cartCount: 2, footerNoop: e => e.preventDefault() };
  }

  const { cartCount } = renderVals();

  return (
    <div className="pg-style-guide">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Style guide header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Style guide</span>
        </div>
        <div style={{ marginTop: '16px', maxWidth: '54ch' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Internal reference · v1.0
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>
            Easy Jackets design system
          </h1>
          <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '17px' }}>
            Every font, size, color and component used across the 27 redesigned pages. Values here are the live ones — copy them straight into development.
          </p>
        </div>
      </section>
      {/* Brand kit */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Brand kit
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          The mark
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
          <div>
            <div style={{ background: 'var(--cream)', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '34px', display: 'grid', placeItems: 'center', minHeight: '170px' }}>
              <img src="/easy-jacket-logo.png" alt="Easy Jackets logo on cream" style={{ height: '78px', width: 'auto' }} loading="lazy" decoding="async" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--ink)' }}>Primary</strong>
              {' '}— full color on cream #f4efe6. The default everywhere.
            </div>
          </div>
          <div>
            <div style={{ background: 'var(--ink)', borderRadius: '4px', padding: '34px', display: 'grid', placeItems: 'center', minHeight: '170px' }}>
              <img src="/easy-jacket-logo.png" alt="Easy Jackets logo on ink" style={{ height: '78px', width: 'auto', filter: 'brightness(0) invert(1)' }} loading="lazy" decoding="async" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--ink)' }}>Reversed</strong>
              {' '}— knocked out to cream on ink #14110f. Footer, dark bands.
            </div>
          </div>
          <div>
            <div style={{ background: 'var(--gold)', borderRadius: '4px', padding: '34px', display: 'grid', placeItems: 'center', minHeight: '170px' }}>
              <img src="/easy-jacket-logo.png" alt="Easy Jackets logo on gold" style={{ height: '78px', width: 'auto', filter: 'brightness(0)' }} loading="lazy" decoding="async" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--ink)' }}>One color</strong>
              {' '}— solid ink on gold #c9a227. Merch, stamps, embroidery.
            </div>
          </div>
          <div>
            <div style={{ background: '#fbf8f2', border: '1px dashed var(--muted)', borderRadius: '4px', padding: '34px', display: 'grid', placeItems: 'center', minHeight: '170px', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '26px', border: '1px dashed var(--gold-2)', borderRadius: '2px' }} />
              <img src="/easy-jacket-logo.png" alt="Easy Jackets logo clear space" style={{ height: '60px', width: 'auto', position: 'relative' }} loading="lazy" decoding="async" />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: '1.5' }}>
              <strong style={{ color: 'var(--ink)' }}>Clear space</strong>
              {' '}— keep free space equal to the logo's cap height on all four sides.
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px', marginTop: '28px', fontSize: '14px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <strong>Minimum sizes</strong>
            <br />
            Desktop header 72px tall · mobile 52px · print 20mm wide · favicon 32px (mark only, no wordmark).
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <strong>File formats</strong>
            <br />
            SVG for web and signage, PNG with transparency for documents, EPS or AI for embroidery digitising and garment tags.
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '14px' }}>
            <strong>Never</strong>
            <br />
            Recolor it outside these three lockups, stretch or rotate it, add a shadow or outline, or place it on a busy photo without a solid plate behind it.
          </div>
        </div>
      </section>
      {/* Color values */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Brand kit
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Print & thread values
        </h2>
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>Color</th>
                <th>HEX</th>
                <th>RGB</th>
                <th>CMYK</th>
                <th>Pantone (nearest)</th>
                <th>Thread / felt</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ink</td>
                <td>#14110F</td>
                <td>20 · 17 · 15</td>
                <td>0 · 15 · 25 · 92</td>
                <td>Black 6 C</td>
                <td>Madeira 1000 Black</td>
              </tr>
              <tr>
                <td>Cream</td>
                <td>#F4EFE6</td>
                <td>244 · 239 · 230</td>
                <td>0 · 2 · 6 · 4</td>
                <td>11-0602 TCX</td>
                <td>Madeira 1082 Ecru</td>
              </tr>
              <tr>
                <td>Gold</td>
                <td>#C9A227</td>
                <td>201 · 162 · 39</td>
                <td>0 · 19 · 81 · 21</td>
                <td>7555 C</td>
                <td>Madeira 1024 Old Gold</td>
              </tr>
              <tr>
                <td>Gold 2</td>
                <td>#A8861C</td>
                <td>168 · 134 · 28</td>
                <td>0 · 20 · 83 · 34</td>
                <td>872 C</td>
                <td>Madeira 1126 Antique Gold</td>
              </tr>
              <tr>
                <td>Muted</td>
                <td>#6B635A</td>
                <td>107 · 99 · 90</td>
                <td>0 · 7 · 16 · 58</td>
                <td>Warm Gray 9 C</td>
                <td>Madeira 1359 Taupe</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={{ margin: '14px 0 0', fontSize: '13px', color: 'var(--muted)', maxWidth: '70ch', lineHeight: '1.6' }}>
          Pantone and thread references are nearest matches for coated stock and polyester thread — always approve a physical strike-off before a production run.
        </p>
      </section>
      {/* Voice */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Brand kit
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Voice & imagery
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '30px clamp(24px,4vw,64px)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', marginBottom: '12px' }}>
              How we write
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)' }}>
              Plain, specific and confident, the way a good workshop talks. State the fact, give the number, stop. No hype, no exclamation marks, no emoji.
            </p>
            <div style={{ display: 'grid', gap: '10px', fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ borderTop: '1px solid var(--cream-2)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--muted)' }}>Say</span>
                <br />
                <strong>24 oz melton wool, cut after you approve the proof.</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--cream-2)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--muted)' }}>Not</span>
                <br />
                <span style={{ color: 'var(--muted)' }}>Unleash your style with our premium quality jackets!</span>
              </div>
              <div style={{ borderTop: '1px solid var(--cream-2)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--muted)' }}>Headlines</span>
                <br />
                <strong>Two to five words, uppercase, no period.</strong>
              </div>
              <div style={{ borderTop: '1px solid var(--cream-2)', paddingTop: '10px' }}>
                <span style={{ color: 'var(--muted)' }}>Buttons</span>
                <br />
                <strong>Verb first — Design your jacket, Get a team quote, Track order.</strong>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Photography
            </div>
            <div style={{ aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="brand-photo" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Team_1024x1024.webp?v=1775220777" placeholder="Brand photography reference" />
            </div>
            <ul style={{ margin: '14px 0 0', paddingLeft: '20px', fontSize: '14px', lineHeight: '1.7', color: 'var(--ink-2)' }}>
              <li>Real customers and real workshop work — never staged stock imagery.</li>
              <li>Natural daylight, warm neutral grade; no heavy filters or duotones.</li>
              <li>Fixed ratios only: 4:5 product, 4:3 editorial, 16:9 and 21:9 banners.</li>
              <li>Detail shots earn their place — chenille, stitching, lining, hardware.</li>
              <li>4px radius maximum; never a circular crop or a drop shadow.</li>
            </ul>
          </div>
        </div>
      </section>
      {/* Typefaces */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Fonts
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Typefaces
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '32px clamp(24px,4vw,64px)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(64px,8vw,110px)', lineHeight: '0.85', textTransform: 'uppercase' }}>
              Big Shoulders Display
            </div>
            <div style={{ marginTop: '16px', fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)' }}>
              <div>
                <strong>Role</strong>
                {' '}— display / headline. Every h1–h3, button, nav item, table header, stat figure and price.
              </div>
              <div>
                <strong>Weights loaded</strong>
                {' '}— 700, 800, 900.
              </div>
              <div>
                <strong>Always</strong>
                {' '}— uppercase, line-height 0.88–0.95, letter-spacing 0 to 0.1em.
              </div>
              <div>
                <strong>Token</strong>
                {' '}—{' '}
                <code>--display</code>
              </div>
              <div>
                <strong>Fallback</strong>
                {' '}— Impact, sans-serif
              </div>
              <div style={{ marginTop: '10px', color: 'var(--muted)' }}>
                Condensed athletic grotesque — the jersey-number voice. Google Fonts, free for commercial use.
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'clamp(34px,4vw,52px)', lineHeight: '1.1', fontWeight: '500' }}>Instrument Sans</div>
            <div style={{ marginTop: '16px', fontSize: '15px', lineHeight: '1.7', color: 'var(--ink-2)' }}>
              <div>
                <strong>Role</strong>
                {' '}— body, labels, form fields, captions, prose.
              </div>
              <div>
                <strong>Weights loaded</strong>
                {' '}— 400, 500, 600, plus 400 italic.
              </div>
              <div>
                <strong>Always</strong>
                {' '}— sentence case, line-height 1.5–1.7, letter-spacing 0 (0.12–0.14em only on small uppercase kickers).
              </div>
              <div>
                <strong>Token</strong>
                {' '}—{' '}
                <code>--body</code>
              </div>
              <div>
                <strong>Fallback</strong>
                {' '}— system-ui, sans-serif
              </div>
              <div style={{ marginTop: '10px', color: 'var(--muted)' }}>
                Neutral, slightly technical grotesque that stays out of the display font's way.
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '28px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '20px', fontSize: '13px', lineHeight: '1.7', color: 'var(--ink-2)', overflowX: 'auto' }}>
          <code>
            {'<'}link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap"{'>'}
          </code>
        </div>
      </section>
      {/* Type scale */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Sizes
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Type scale
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,88px)', lineHeight: '0.88', textTransform: 'uppercase' }}>
              Custom varsity
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Page title (h1)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Big Shoulders 900 · clamp(52px, 7.5vw, 112px) · lh 0.88 · uppercase
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase' }}>
              Shop by type
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Section heading (h2)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Big Shoulders 900 · clamp(38px, 5vw, 72px) · lh 0.90 · uppercase
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase' }}>
              Wool & leather varsity
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Card / sub heading (h3)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Big Shoulders 800–900 · 24–30px · lh 0.95 · uppercase
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '56px', lineHeight: '1' }}>
              25k
              <span style={{ color: 'var(--gold)' }}>+</span>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Stat figure
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Big Shoulders 900 · clamp(38px, 5vw, 72px) · lh 1
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Materials & colors
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Kicker / eyebrow
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Instrument Sans 600 · 12–13px · ls 0.14em · uppercase · --gold-2 or --muted
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <p style={{ margin: '0', fontSize: '17px', lineHeight: '1.65', color: 'var(--ink-2)', maxWidth: '52ch' }}>
              Design custom letterman jackets for schools, teams and businesses. Free proof, no minimum order.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Lead paragraph
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Instrument Sans 400 · 16–17px · lh 1.65 · --ink-2 · max 56ch
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div>
            <p style={{ margin: '0', fontSize: '16px', lineHeight: '1.7', color: 'var(--ink-2)', maxWidth: '60ch' }}>
              Every jacket is made to order after you approve your digital proof. Production begins on approval, not at checkout.
            </p>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Body / prose
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Instrument Sans 400 · 15–16px · lh 1.7 · --ink-2 · max 72ch
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div><div style={{ fontSize: '14px', color: 'var(--muted)' }}>Placed 12 Sep 2026 · Est. 29 Sep</div></div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Small / meta
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Instrument Sans 400–600 · 13–14px · --muted
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div><span className="ez-btn ez-btn-ink">Start designing</span></div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Button label
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Big Shoulders 800 · 17–20px · ls 0.06em · uppercase
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(220px,300px)', gap: '16px clamp(20px,3vw,48px)', alignItems: 'baseline', padding: '20px 0', borderTop: '1px solid var(--cream-2)' }}>
          <div><div className="ez-label">Email address</div></div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', textTransform: 'uppercase', lineHeight: '1' }}>
              Field label
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
              Instrument Sans 600 · 12px · ls 0.12em · uppercase · --muted
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--cream-2)' }} />
      </section>
      {/* Color */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Tokens
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Color palette
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '26px' }}>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#14110f', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Ink
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--ink · #14110f</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Primary text, dark bands, primary buttons, borders
            </div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#2a2521', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Ink 2
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--ink-2 · #2a2521</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>Body copy and prose on cream</div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#f4efe6', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Cream
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--cream · #f4efe6</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>Page background, text on ink</div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#e9e1d2', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Cream 2
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--cream-2 · #e9e1d2</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Hairline borders, image placeholders, dividers
            </div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#c9a227', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Gold
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--gold · #c9a227</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Accent band, button hover, focus ring, highlights
            </div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#a8861c', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Gold 2
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--gold-2 · #a8861c</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Kickers and link hover — the readable gold on cream
            </div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#6b635a', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Muted
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>--muted · #6b635a</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Meta text, captions, placeholder copy
            </div>
          </div>
          <div>
            <div style={{ height: '88px', borderRadius: '3px', background: '#fbf8f2', border: '1px solid var(--cream-2)' }} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px', lineHeight: '1' }}>
              Panel
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>literal · #fbf8f2</div>
            <div style={{ fontSize: '13px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>
              Form panels, cards, table row hover
            </div>
          </div>
        </div>
        <div style={{ marginTop: '26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px', fontSize: '14px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <strong>Two grounds only.</strong>
            {' '}Cream (#f4efe6) for the page, Ink (#14110f) for bands and the footer. Gold is a band background, never a page background.
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <strong>Gold is a spot color.</strong>
            {' '}Kickers, one underline, one stat rule, button hover. Never gold body text on cream — use --gold-2.
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '14px' }}>
            <strong>Status tints</strong>
            {' '}— production #efe0a8/#5c4a08, shipped #cfe3ec/#12455c, delivered #d7e6d3/#1f4a2f, proof #f0d9e2/#6b1436.
          </div>
        </div>
      </section>
      {/* Layout */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Grid
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Layout & spacing
        </h2>
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Max width</td>
                <td>1280px</td>
                <td>Every section; centered with margin 0 auto</td>
              </tr>
              <tr>
                <td>Page gutter</td>
                <td>clamp(16px, 4vw, 48px)</td>
                <td>Horizontal padding on all sections</td>
              </tr>
              <tr>
                <td>Section rhythm</td>
                <td>clamp(56px, 7vw, 96px)</td>
                <td>Top padding between sections; 96px before the footer</td>
              </tr>
              <tr>
                <td>Header rhythm</td>
                <td>clamp(32px, 4vw, 56px)</td>
                <td>Breadcrumb to h1</td>
              </tr>
              <tr>
                <td>Grid gap</td>
                <td>20–28px cards · clamp(24px, 4vw, 72px) columns</td>
                <td>Always flex/grid gap, never margins</td>
              </tr>
              <tr>
                <td>Card min width</td>
                <td>minmax(230px, 1fr)</td>
                <td>auto-fit repeat — wraps without media queries</td>
              </tr>
              <tr>
                <td>Sticky offset</td>
                <td>top: 104–110px</td>
                <td>Sidebars and TOC, clearing the sticky nav</td>
              </tr>
              <tr>
                <td>Radius</td>
                <td>2px controls · 3–4px cards and images</td>
                <td>--radius equivalents; nothing is pill-shaped except status badges</td>
              </tr>
              <tr>
                <td>Breakpoints</td>
                <td>960px (two-col → one) · 900px (dashboard, footer) · 820px (header) · 720px (nav collapse)</td>
                <td>Content-driven, not device-driven</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* Components */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Classes
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Components
        </h2>
        <div style={{ display: 'grid', gap: '34px' }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Buttons —{' '}
              <code style={{ fontFamily: 'var(--body)', fontSize: '14px' }}>.ez-btn</code>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <span className="ez-btn ez-btn-ink">Primary · .ez-btn-ink</span>
              <span className="ez-btn">Outline · .ez-btn</span>
              <span className="ez-btn ez-btn-gold">Gold · .ez-btn-gold</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: '1.6' }}>
              min-height 52px (44–48px compact) · padding 0 26px · border 2px solid --ink · radius 2px · hover lifts translateY(-2px) and swaps to gold.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Chips & segmented —{' '}
              <code style={{ fontFamily: 'var(--body)', fontSize: '14px' }}>.ez-chip · .ez-seg</code>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span className="ez-chip" aria-pressed="true">Selected</span>
              <span className="ez-chip">Default</span>
              <span className="ez-chip">Filter</span>
              <span className="ez-seg">
                <button type="button" aria-pressed="true">Inches</button>
                <button type="button">CM</button>
              </span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: '1.6' }}>
              Chip: 14px 600, 1.5px --cream-2 border, ink fill when pressed. Segmented for binary unit or view switches.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Form fields —{' '}
              <code style={{ fontFamily: 'var(--body)', fontSize: '14px' }}>.ez-label · .ez-input · .ez-radio · .ez-drop</code>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', maxWidth: '760px' }}>
              <label className="ez-label">
                Full name
                <input className="ez-input" placeholder="Jordan Lee" />
              </label>
              <label className="ez-label">
                Quantity
                <select className="ez-input">
                  <option>1 jacket</option>
                  <option>10+ (team)</option>
                </select>
              </label>
              <div className="ez-label">
                Choice
                <div className="ez-radio" aria-checked="true">
                  <span className="dot" />
                  <span style={{ fontFamily: 'var(--body)', fontWeight: '600', fontSize: '15px', letterSpacing: '0', textTransform: 'none', color: 'var(--ink)' }}>
                    Melton wool
                  </span>
                </div>
              </div>
              <div className="ez-label">
                Upload
                <div className="ez-drop">Drop your logo — PNG, PDF, AI or SVG</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: '1.6' }}>
              Input height 50px · 1.5px --cream-2 border on #fbf8f2 · focus borders --ink. Label 12px 600 uppercase --muted.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Table —{' '}
              <code style={{ fontFamily: 'var(--body)', fontSize: '14px' }}>.ez-table</code>
            </div>
            <div className="ez-wrap">
              <table className="ez-table">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest</th>
                    <th>Length</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>S</td>
                    <td>38 in</td>
                    <td>25 in</td>
                  </tr>
                  <tr>
                    <td>M</td>
                    <td>40 in</td>
                    <td>26 in</td>
                  </tr>
                  <tr>
                    <td>L</td>
                    <td>42 in</td>
                    <td>27 in</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: '1.6' }}>
              Header 18px display uppercase over a 2px ink rule; first column display 900 at 20px; rows hover to #fbf8f2.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Other patterns
            </div>
            <div className="ez-wrap">
              <table className="ez-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>What it is</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>.ez-nav</td>
                    <td>Sticky header — display font, gold underline wipes in on hover</td>
                  </tr>
                  <tr>
                    <td>.ez-dd / .ez-sub</td>
                    <td>Dropdown and flyout menus (Support, Shop by type)</td>
                  </tr>
                  <tr>
                    <td>.ez-card</td>
                    <td>Any clickable card — lifts 6px on hover</td>
                  </tr>
                  <tr>
                    <td>.ez-prose</td>
                    <td>16px / 1.7 long-form copy, max 72ch, display-font h2s</td>
                  </tr>
                  <tr>
                    <td>.ez-toc</td>
                    <td>Sticky contents rail with a left hairline that turns gold</td>
                  </tr>
                  <tr>
                    <td>.ez-qty</td>
                    <td>Quantity stepper, 36px square controls</td>
                  </tr>
                  <tr>
                    <td>.ez-side</td>
                    <td>Dashboard sidebar nav; ink fill marks the active view</td>
                  </tr>
                  <tr>
                    <td>.ez-wrap</td>
                    <td>Horizontal scroll container for tables on narrow screens</td>
                  </tr>
                  <tr>
                    <td>image-slot</td>
                    <td>Drag-and-drop image placeholder used for every photo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      {/* Motion */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Interaction
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.6vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 28px' }}>
          Motion & states
        </h2>
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Treatment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Button hover</td>
                <td>translateY(-2px), background → --gold, 150ms</td>
              </tr>
              <tr>
                <td>Card hover</td>
                <td>translateY(-6px), 250ms ease</td>
              </tr>
              <tr>
                <td>Nav link hover</td>
                <td>Gold 3px underline wipes left → right, 250ms</td>
              </tr>
              <tr>
                <td>Dropdown open</td>
                <td>Opacity + 8px translate, 180ms ease</td>
              </tr>
              <tr>
                <td>Focus ring</td>
                <td>2px solid --gold, offset 2px, on :focus-visible</td>
              </tr>
              <tr>
                <td>Accordion</td>
                <td>Plus glyph rotates 45° when open</td>
              </tr>
              <tr>
                <td>Link hover</td>
                <td>Color → --gold-2 (--gold on dark grounds)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      {/* Rules */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Do
            </h2>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '15px', lineHeight: '1.75', color: 'var(--ink-2)' }}>
              <li>Set every heading in Big Shoulders, uppercase, tight line-height.</li>
              <li>Let whitespace and the type scale carry hierarchy.</li>
              <li>Use full-width ink or gold bands to break long pages.</li>
              <li>Keep photos in 4:5, 4:3, 16:9 or 21:9 — never free-form.</li>
              <li>Use gap-based flex and grid for every group of siblings.</li>
            </ul>
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.6vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 16px' }}>
              Don't
            </h2>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '15px', lineHeight: '1.75', color: 'var(--ink-2)' }}>
              <li>Add a third typeface or a third accent color.</li>
              <li>Set body copy in the display font, or headings in sentence case.</li>
              <li>Use gold for text on cream — that's --gold-2's job.</li>
              <li>Box every section; borders are for tables, fields and cards only.</li>
              <li>Round anything past 4px, or add gradients behind content.</li>
            </ul>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
