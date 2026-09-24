// Converted from design/Easy Jackets Product.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Product.css';

const INITIAL_STATE = { img: 0, tab: 'fixed', body: 'black', sleeveMat: 'leather', sleeve: 'black', name: '', number: '', letter: '', logo: false, size: '', qty: 1, cart: 0, needSize: false, added: false };

export default function Product() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const footerNoop = e => e.preventDefault();
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    const s = state;
    const colors = [['black', 'Black', '#1a1a1a'], ['white', 'White', '#f2f0ea'], ['navy', 'Navy', '#1f2a4a'], ['royal', 'Royal blue', '#2f4fb5'], ['red', 'Red', '#a8222a'], ['maroon', 'Maroon', '#5e1a26'], ['green', 'Forest green', '#1f4d33'], ['gold', 'Gold', '#c9a227'], ['grey', 'Heather grey', '#8b8b8b'], ['cream', 'Cream', '#e8dcc2']];
    const name = k => colors.find(c => c[0] === k)[1];
    const gallery = [
      { src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981', alt: 'Front view' },
      { src: TJM + 'Patches_41cb68d9-f7c0-4b04-8ac9-08cca6394fa0_1024x1024.webp?v=1775219898', alt: 'Chest detail' },
      { src: CL + 'full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg', alt: 'Leather sleeve' },
      { src: CL + 'polyester-satin-quilted-lining-options-clothoo.jpg', alt: 'Quilted lining' },
    ];
    const sleeveMats = [['leather', 'Cowhide leather', 0], ['vegan', 'Vegan leather', -30], ['wool', 'Wool', -38]];
    const base = 150, was = 200;
    const custom = s.tab === 'custom';
    const extras = custom ? (sleeveMats.find(m => m[0] === s.sleeveMat)[2]) + (s.name ? 15 : 0) + (s.number ? 12 : 0) + (s.letter ? 35 : 0) + (s.logo ? 45 : 0) : 0;
    const unit = base + extras;
    const total = unit * s.qty;
    const parts = [];
    if (custom) { const m = sleeveMats.find(m => m[0] === s.sleeveMat); if (m[2]) parts.push(m[1] + ' ' + (m[2] > 0 ? '+' : '−') + '$' + Math.abs(m[2])); if (s.name) parts.push('name +$15'); if (s.number) parts.push('number +$12'); if (s.letter) parts.push('letter +$35'); if (s.logo) parts.push('logo +$45'); }
    const breakdown = (parts.length ? 'Base $' + base + ' · ' + parts.join(' · ') : 'Base price, blank jacket') + (s.qty > 1 ? ' · ×' + s.qty : '');
    const set = o => () => setState({ ...o, added: false });
    return {
      footerNoop,
      cartCount: s.cart,
      thumbs: gallery.map((g, i) => ({ ...g, slot: 'pdp-thumb-' + i, active: s.img === i, select: set({ img: i }) })),
      mainSlot: 'pdp-main-' + s.img, mainSrc: gallery[s.img].src, mainAlt: gallery[s.img].alt,
      bodyName: name(s.body), sleeveName: name(s.sleeve),
      totalLabel: '$' + total, wasLabel: '$' + Math.round(was * s.qty + extras * s.qty / 0.75), breakdown,
      tabFixed: s.tab === 'fixed', tabCustom: custom, pickFixed: set({ tab: 'fixed' }), pickCustom: set({ tab: 'custom' }),
      bodyOpts: colors.map(([k, n, hex]) => ({ name: n, hex, active: s.body === k, select: set({ body: k }) })),
      sleeveOpts: colors.map(([k, n, hex]) => ({ name: n, hex, active: s.sleeve === k, select: set({ sleeve: k }) })),
      sleeveMatOpts: sleeveMats.map(([k, label, d]) => ({ label, delta: d ? (d > 0 ? '+$' : '−$') + Math.abs(d) : '', active: s.sleeveMat === k, select: set({ sleeveMat: k }) })),
      sleeveMatLabel: sleeveMats.find(m => m[0] === s.sleeveMat)[1],
      nameText: s.name, setName: e => setState({ name: e.target.value, added: false }),
      numberText: s.number, setNumber: e => setState({ number: e.target.value.replace(/\D/g, ''), added: false }),
      letterOpts: [['', 'None'], ['left', 'Left chest'], ['right', 'Right chest'], ['back', 'Back']].map(([k, label]) => ({ label, active: s.letter === k, select: set({ letter: k }) })),
      logoOn: s.logo, toggleLogo: () => setState({ logo: !s.logo, added: false }),
      sizeOpts: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(z => ({ label: z, active: s.size === z, select: set({ size: z, needSize: false }) })),
      qty: s.qty, inc: () => setState({ qty: Math.min(50, s.qty + 1), added: false }), dec: () => setState({ qty: Math.max(1, s.qty - 1), added: false }),
      addLabel: 'Add to cart · $' + total,
      addToCart: () => { if (!s.size) return setState({ needSize: true }); setState({ cart: s.cart + s.qty, added: true }); },
      needSize: s.needSize, added: s.added,
      related: [
        { slot: 'rel-1', name: 'Black & White Letterman, Leather Sleeves', price: '$150', src: TJM + 'Patches_41cb68d9-f7c0-4b04-8ac9-08cca6394fa0_1024x1024.webp?v=1775219898' },
        { slot: 'rel-2', name: 'Royal Blue Wool, White Leather Sleeves', price: '$150', src: TJM + 'Logo-Varsity_1_1024x1024.webp?v=1775219897' },
        { slot: 'rel-3', name: 'All-Black Wool Letterman', price: '$112', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
        { slot: 'rel-4', name: 'Retro Leather Letterman, Shirt Collar', price: '$307', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      ],
      faqs: [
        { q: 'Can I add patches after I receive it?', a: 'Yes. Chenille and embroidered patches can be sewn on by any local tailor; we also sell matching patches separately.' },
        { q: 'Is the leather real?', a: 'Cowhide sleeves are full-grain leather. Choose vegan leather in the Customize tab for an animal-free build.' },
        { q: 'How does sizing run?', a: 'True to the chart above, cut to layer over a hoodie. Between sizes, go up.' },
        { q: 'Can I return a custom jacket?', a: 'Custom jackets are made to your spec, so returns are for defects or a size that does not match your order — in which case we remake it.' },
      ],
    };
  }

  const { addLabel, addToCart, added, bodyName, bodyOpts, breakdown, cartCount, dec, faqs, inc, letterOpts, logoOn, mainAlt, mainSlot, mainSrc, nameText, needSize, numberText, pickCustom, pickFixed, qty, related, setName, setNumber, sizeOpts, sleeveMatLabel, sleeveMatOpts, sleeveName, sleeveOpts, tabCustom, tabFixed, thumbs, toggleLogo, totalLabel, wasLabel } = renderVals();

  return (
    <div className="pg-product">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Product */}
      <section className="ez-pdp" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(24px,3vw,40px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: '40px clamp(24px,4vw,64px)', alignItems: 'start' }}>
        {/* gallery */}
        <div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
            <span>/</span>
            <A href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>Varsity Jackets</A>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Classic All-Black</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: '14px' }}>
            <div style={{ display: 'grid', gap: '10px', alignContent: 'start' }}>
              {thumbs.map((t, tIdx) => (
                <button key={tIdx} type="button" className="ez-thumb" aria-pressed={t.active} onClick={t.select} aria-label={t.alt}>
                  <ImageSlot slot={t.slot} shape="rect" src={t.src} placeholder="" style={{ pointerEvents: 'none' }} />
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot={mainSlot} shape="rect" src={mainSrc} placeholder="Product photo" role="img" aria-label={mainAlt} />
              <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px' }}>
                Bestseller
              </span>
              <span style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(20,17,15,0.85)', color: 'var(--cream)', fontSize: '12px', padding: '6px 10px', borderRadius: '2px' }}>
                Preview shows body{' '}
                <strong>{bodyName}</strong>
                {' '}· sleeves{' '}
                <strong>{sleeveName}</strong>
              </span>
            </div>
          </div>
          {/* details below gallery */}
          <div style={{ marginTop: '56px', display: 'grid', gap: '40px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 20px' }}>
                Built from the inside out
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px' }}>
                <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>
                    24 oz melton wool
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                    Dense felted body cloth that holds its shape and takes chenille without puckering.
                  </p>
                </div>
                <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>
                    Full-grain cowhide
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                    Sleeves cut from single hides so the grain matches left to right.
                  </p>
                </div>
                <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>
                    Quilted satin lining
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                    Diamond-quilted, with an inside pocket and metal snap front.
                  </p>
                </div>
                <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '14px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>
                    Striped rib knit
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                    Acrylic-wool collar, cuffs and waistband in your two colors.
                  </p>
                </div>
              </div>
            </div>
            <div id="size">
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Size chart
              </h2>
              <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '14px' }}>
                Unisex fit, measured flat in inches. Between sizes? Go up — a varsity jacket should layer over a hoodie.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="ez-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>XS</th>
                      <th>S</th>
                      <th>M</th>
                      <th>L</th>
                      <th>XL</th>
                      <th>2XL</th>
                      <th>3XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Chest</td>
                      <td>38</td>
                      <td>40</td>
                      <td>42</td>
                      <td>44</td>
                      <td>46</td>
                      <td>49</td>
                      <td>52</td>
                    </tr>
                    <tr>
                      <td>Length</td>
                      <td>24</td>
                      <td>25</td>
                      <td>26</td>
                      <td>27</td>
                      <td>28</td>
                      <td>29</td>
                      <td>30</td>
                    </tr>
                    <tr>
                      <td>Sleeve</td>
                      <td>24</td>
                      <td>24.5</td>
                      <td>25</td>
                      <td>25.5</td>
                      <td>26</td>
                      <td>26.5</td>
                      <td>27</td>
                    </tr>
                    <tr>
                      <td>Shoulder</td>
                      <td>17</td>
                      <td>18</td>
                      <td>19</td>
                      <td>20</td>
                      <td>21</td>
                      <td>22</td>
                      <td>23</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 8px' }}>
                Questions
              </h2>
              {faqs.map((f, fIdx) => (
                <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '14px 0' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '16px' }}>
                    <span>{f.q}</span>
                    <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                      +
                    </span>
                  </summary>
                  <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch', fontSize: '15px' }}>{f.a}</p>
                </details>
              ))}
              <div style={{ borderTop: '1px solid var(--ink)' }} />
            </div>
          </div>
        </div>
        {/* buy box */}
        <div className="ez-buy" style={{ position: 'sticky', top: '104px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Wool & leather varsity
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,5vw,72px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>
            Classic All-Black Varsity Jacket
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', fontSize: '14px' }}>
            <span style={{ color: 'var(--gold-2)', letterSpacing: '0.08em' }}>★★★★★</span>
            <strong>4.9</strong>
            <A href="#" style={{ color: 'var(--muted)' }}>173 reviews</A>
            <span style={{ color: 'var(--muted)' }}>·</span>
            <span style={{ color: 'var(--muted)' }}>Ships in 2–3 weeks</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '24px' }}>
            <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '56px', lineHeight: '1' }}>{totalLabel}</span>
            <s style={{ fontSize: '18px', color: 'var(--muted)' }}>{wasLabel}</s>
            <span style={{ background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', padding: '4px 8px' }}>
              -25%
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)' }}>{breakdown}</p>
          {/* tabs */}
          <div style={{ display: 'flex', gap: '28px', borderBottom: '1px solid var(--cream-2)', marginTop: '28px' }}>
            <button type="button" className="ez-tab" role="tab" aria-selected={tabFixed} onClick={pickFixed}>As shown</button>
            <button type="button" className="ez-tab" role="tab" aria-selected={tabCustom} onClick={pickCustom}>Customize</button>
          </div>
          {tabFixed ? (
            <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '15px' }}>
              Black melton wool body, black cowhide sleeves, black-and-white striped rib knit, quilted black satin lining. Blank — ready for your patches, or add your letter later.
            </p>
          ) : null}
          {tabCustom ? (
            <div style={{ display: 'grid', gap: '22px', marginTop: '22px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                  <span>Body color</span>
                  <span style={{ color: 'var(--ink)' }}>{bodyName}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {bodyOpts.map((c, cIdx) => (
                    <button key={cIdx} type="button" className="ez-swatch" aria-pressed={c.active} onClick={c.select} aria-label={c.name} title={c.name} style={{ background: c.hex }} />
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                  <span>Sleeve material</span>
                  <span style={{ color: 'var(--ink)' }}>{sleeveMatLabel}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {sleeveMatOpts.map((o, oIdx) => (
                    <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.select}>
                      {o.label}{' '}
                      <span style={{ fontWeight: '500', opacity: '0.7' }}>{o.delta}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                  <span>Sleeve color</span>
                  <span style={{ color: 'var(--ink)' }}>{sleeveName}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {sleeveOpts.map((c, cIdx) => (
                    <button key={cIdx} type="button" className="ez-swatch" aria-pressed={c.active} onClick={c.select} aria-label={c.name} title={c.name} style={{ background: c.hex }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'grid', gap: '8px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Name on chest{' '}
                  <span style={{ fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>+$15</span>
                  <input className="ez-input" maxLength="14" placeholder="e.g. Carter" value={nameText} onChange={setName} />
                </label>
                <label style={{ display: 'grid', gap: '8px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Number on sleeve{' '}
                  <span style={{ fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>+$12</span>
                  <input className="ez-input" maxLength="3" placeholder="e.g. 24" value={numberText} onChange={setNumber} />
                </label>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
                  Chenille letter{' '}
                  <span style={{ fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>+$35</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {letterOpts.map((o, oIdx) => (
                    <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.select}>{o.label}</button>
                  ))}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', cursor: 'pointer' }}>
                <input type="checkbox" checked={logoOn} onChange={toggleLogo} style={{ width: '18px', height: '18px', accentColor: 'var(--ink)' }} />
                Add my school or team logo on the back{' '}
                <span style={{ color: 'var(--muted)' }}>+$45 · upload after checkout, proof included</span>
              </label>
            </div>
          ) : null}
          {/* size + qty */}
          <div style={{ marginTop: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
              <span>Size</span>
              <A href="#size" style={{ color: 'var(--gold-2)', textTransform: 'none', letterSpacing: '0', fontWeight: '600' }}>Size chart</A>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sizeOpts.map((o, oIdx) => (
                <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.select}>{o.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '12px', marginTop: '22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--ink)', borderRadius: '2px' }}>
              <button type="button" onClick={dec} aria-label="Decrease" style={{ width: '48px', height: '48px', border: '0', background: 'none', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', cursor: 'pointer', color: 'var(--ink)' }}>
                −
              </button>
              <span style={{ minWidth: '36px', textAlign: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>
                {qty}
              </span>
              <button type="button" onClick={inc} aria-label="Increase" style={{ width: '48px', height: '48px', border: '0', background: 'none', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', cursor: 'pointer', color: 'var(--ink)' }}>
                +
              </button>
            </div>
            <button type="button" className="ez-btn ez-btn-ink" onClick={addToCart} style={{ width: '100%' }}>{addLabel}</button>
          </div>
          {needSize ? (
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#a8222a', fontWeight: '600' }}>Pick a size to add to cart.</p>
          ) : null}
          {added ? (
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--gold-2)', fontWeight: '600' }}>
              Added. You’ll approve a free design proof before we stitch.
            </p>
          ) : null}
          {/* shipping */}
          <div style={{ marginTop: '28px', display: 'grid', gap: '10px', fontSize: '14px', color: 'var(--ink-2)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold-2)', width: '36px' }}>2–3w</span>
              Production, then 4–5 business days tracked shipping. Rush available at checkout.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold-2)', width: '36px' }}>Free</span>
              Digital design proof within two business days. Nothing is cut until you approve.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold-2)', width: '36px' }}>Fit</span>
              Wrong size as specified? We remake it.
            </div>
          </div>
          <div style={{ marginTop: '22px', padding: '16px', background: 'var(--cream-2)', borderRadius: '4px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span>
              Ordering{' '}
              <strong>10+</strong>
              {' '}for a team?
            </span>
            <A href="/bulk-orders" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '18px', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Get bulk pricing →
            </A>
          </div>
        </div>
      </section>
      {/* related */}
      {/* Related */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            You might also letter
          </h2>
          <A href="/shop" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All varsity jackets →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 20px' }}>
          {related.map((p, pIdx) => (
            <A key={pIdx} href="/product" className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={p.slot} shape="rect" src={p.src} placeholder={p.name} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'start', marginTop: '14px' }}>
                <h3 style={{ fontWeight: '600', fontSize: '16px', lineHeight: '1.35', margin: '0' }}>{p.name}</h3>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', lineHeight: '1' }}>{p.price}</span>
              </div>
            </A>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
