// Converted from design/Easy Jackets Listing.dc.html
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Shop.css';

const INITIAL_STATE = { type: 'all', materials: [], colors: [], styles: [], fits: [], maxPrice: 450, sort: 'popular' };

// The header's Shop menu links here with ?style= / ?material=; map those
// labels onto the page's own filter keys.
const STYLE_TO_TYPE = { 'Varsity Jackets': 'varsity', 'Cropped Varsity Jackets': 'varsity', 'Bomber Jackets': 'bomber', 'Coach Jackets': 'coach', Hoodies: 'hoodie' };
const MATERIAL_TO_KEY = { 'Melton Wool': 'wool', 'Faux Leather': 'faux', 'Polyester Satin': 'satin', 'Cotton Fleece': 'fleece', 'Sheep Leather': 'leather', 'Cowhide Leather': 'leather', Nylon: 'nylon' };
const filtersFromQuery = (params) => ({
  type: STYLE_TO_TYPE[params.get('style')] ?? 'all',
  materials: MATERIAL_TO_KEY[params.get('material')] ? [MATERIAL_TO_KEY[params.get('material')]] : [],
});

export default function Shop() {
  const [params] = useSearchParams();
  const fromQuery = useMemo(() => filtersFromQuery(params), [params]);
  const [state, setState] = useDcState({ ...INITIAL_STATE, ...fromQuery });
  useEffect(() => { setState(fromQuery); }, [fromQuery, setState]);

  function renderVals() {
    const footerNoop = e => e.preventDefault();
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    const C = { black: '#1a1a1a', white: '#f2f0ea', navy: '#1f2a4a', royal: '#2f4fb5', red: '#a8222a', maroon: '#5e1a26', green: '#1f4d33', gold: '#c9a227', grey: '#8b8b8b', pink: '#e8b7c4', cream: '#e8dcc2', brown: '#5b3a24' };
    const all = [
      { id: 1, type: 'varsity', name: 'Classic All-Black Varsity, Leather Sleeves', material: 'Wool & leather', mat: 'wool-leather', colors: ['black'], styles: ['classic'], fit: 'unisex', was: 200, price: 150, rating: 4.9, reviews: 173, pop: 100, added: 9, badge: 'Bestseller', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
      { id: 2, type: 'varsity', name: 'Black & White Letterman, Leather Sleeves', material: 'Wool & leather', mat: 'wool-leather', colors: ['black', 'white'], styles: ['classic'], fit: 'unisex', was: 200, price: 150, rating: 4.9, reviews: 141, pop: 96, added: 8, badge: '', src: TJM + 'Patches_41cb68d9-f7c0-4b04-8ac9-08cca6394fa0_1024x1024.webp?v=1775219898' },
      { id: 3, type: 'varsity', name: 'Red Wool, Gold Leather Sleeves', material: 'Wool & leather', mat: 'wool-leather', colors: ['red', 'gold'], styles: ['classic'], fit: 'unisex', was: 200, price: 150, rating: 4.8, reviews: 96, pop: 88, added: 7, badge: '', src: TJM + 'Embroidery_2_1024x1024.webp?v=1775219897' },
      { id: 4, type: 'varsity', name: 'Royal Blue Wool, White Leather Sleeves', material: 'Wool & leather', mat: 'wool-leather', colors: ['royal', 'white'], styles: ['classic'], fit: 'unisex', was: 200, price: 150, rating: 4.9, reviews: 88, pop: 85, added: 6, badge: '', src: TJM + 'Logo-Varsity_1_1024x1024.webp?v=1775219897' },
      { id: 5, type: 'varsity', name: 'All-Black Wool Letterman', material: 'Melton wool', mat: 'wool', colors: ['black'], styles: ['classic'], fit: 'unisex', was: 150, price: 112, rating: 4.8, reviews: 64, pop: 70, added: 5, badge: '', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
      { id: 6, type: 'varsity', name: 'Baby Pink & Beige Wool Varsity', material: 'Melton wool', mat: 'wool', colors: ['pink', 'cream'], styles: ['classic'], fit: 'women', was: 150, price: 112, rating: 4.9, reviews: 52, pop: 66, added: 10, badge: 'New', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
      { id: 7, type: 'varsity', name: 'Black & Gold Satin Baseball Jacket', material: 'Polyester satin', mat: 'satin', colors: ['black', 'gold'], styles: ['baseball'], fit: 'unisex', was: 130, price: 97, rating: 4.7, reviews: 77, pop: 72, added: 4, badge: '', src: CL + 'customize-your-jacket.jpg' },
      { id: 8, type: 'varsity', name: 'Retro Leather Letterman, Shirt Collar', material: 'Full leather', mat: 'leather', colors: ['black', 'gold'], styles: ['retro'], fit: 'men', was: 410, price: 307, rating: 5.0, reviews: 39, pop: 60, added: 3, badge: '', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      { id: 9, type: 'varsity', name: 'Navy Wool Hooded Varsity', material: 'Melton wool', mat: 'wool', colors: ['navy', 'white'], styles: ['hooded'], fit: 'unisex', was: 170, price: 127, rating: 4.8, reviews: 44, pop: 58, added: 11, badge: 'New', src: TJM + 'Cotton_fabric_material_texture_close_up_for_custom_varisty_jackets_1024x1024.webp?v=1775238632' },
      { id: 10, type: 'varsity', name: 'Maroon Wool, Cream Leather Sleeves', material: 'Wool & leather', mat: 'wool-leather', colors: ['maroon', 'cream'], styles: ['classic'], fit: 'unisex', was: 200, price: 150, rating: 4.9, reviews: 58, pop: 64, added: 2, badge: '', src: TJM + 'Suede_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238171' },
      { id: 11, type: 'varsity', name: 'Forest Green Vegan-Leather Varsity', material: 'Vegan leather', mat: 'faux', colors: ['green', 'white'], styles: ['classic'], fit: 'unisex', was: 160, price: 120, rating: 4.7, reviews: 31, pop: 50, added: 12, badge: 'New', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
      { id: 12, type: 'varsity', name: 'Red & White Fleece Jacket', material: 'Cotton fleece', mat: 'fleece', colors: ['red', 'white'], styles: ['classic'], fit: 'unisex', was: 130, price: 97, rating: 4.6, reviews: 48, pop: 55, added: 1, badge: '', src: CL + 'sublimation-printing-clothoo.jpg' },
      { id: 13, type: 'bomber', name: 'Black Nylon Bomber', material: 'Nylon', mat: 'nylon', colors: ['black'], styles: ['bomber'], fit: 'men', was: 160, price: 120, rating: 4.9, reviews: 115, pop: 80, added: 6, badge: '', src: TJM + 'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
      { id: 14, type: 'bomber', name: 'Light Blue Suede Bomber', material: 'Suede', mat: 'leather', colors: ['royal'], styles: ['bomber'], fit: 'unisex', was: 240, price: 180, rating: 4.8, reviews: 27, pop: 45, added: 5, badge: '', src: TJM + 'Suede_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238171' },
      { id: 15, type: 'hoodie', name: 'Pullover Fleece Hoodie, Sleeve Stripes', material: 'Cotton fleece', mat: 'fleece', colors: ['grey', 'black'], styles: ['hooded'], fit: 'unisex', was: 140, price: 105, rating: 4.9, reviews: 83, pop: 74, added: 7, badge: '', src: TJM + 'Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114' },
      { id: 16, type: 'coach', name: 'Red Hooded Coach Jacket', material: 'Nylon', mat: 'nylon', colors: ['red'], styles: ['hooded'], fit: 'unisex', was: 110, price: 82, rating: 4.7, reviews: 36, pop: 48, added: 4, badge: '', src: CL + 'design-your-own-varsity-jacket-builder-online-clothoo-800.jpg' },
      { id: 17, type: 'denim', name: 'Blue Denim Varsity, Striped Collar', material: 'Denim', mat: 'denim', colors: ['royal', 'white'], styles: ['classic'], fit: 'unisex', was: 150, price: 112, rating: 4.8, reviews: 22, pop: 40, added: 8, badge: '', src: TJM + 'Denim_and_cotton_fabric_options_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238196' },
      { id: 18, type: 'puffer', name: 'Black Hooded Puffer', material: 'Nylon', mat: 'nylon', colors: ['black'], styles: ['hooded'], fit: 'unisex', was: 190, price: 142, rating: 4.7, reviews: 19, pop: 38, added: 9, badge: '', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
    ];
    const s = state;
    const toggle = (key, v) => () => setState(st => ({ [key]: st[key].includes(v) ? st[key].filter(x => x !== v) : [...st[key], v] }));
    const types = [['all', 'All'], ['varsity', 'Varsity'], ['bomber', 'Bomber'], ['hoodie', 'Hoodies'], ['coach', 'Coach'], ['denim', 'Denim'], ['puffer', 'Puffer']];
    const typeTabs = types.map(([v, label]) => ({ label, active: s.type === v, count: v === 'all' ? all.length : all.filter(p => p.type === v).length, select: () => setState({ type: v }) }));
    const mk = (key, arr) => arr.map(([v, label]) => ({ label, active: s[key].includes(v), toggle: toggle(key, v) }));
    const materialOpts = mk('materials', [['wool-leather', 'Wool & leather'], ['wool', 'All wool'], ['leather', 'Full leather'], ['faux', 'Vegan leather'], ['satin', 'Satin'], ['fleece', 'Fleece'], ['nylon', 'Nylon'], ['denim', 'Denim']]);
    const styleOpts = mk('styles', [['classic', 'Classic'], ['hooded', 'Hooded'], ['retro', 'Retro'], ['baseball', 'Baseball'], ['bomber', 'Bomber']]);
    const fitOpts = mk('fits', [['unisex', 'Unisex'], ['men', 'Men'], ['women', 'Women']]);
    const colorOpts = Object.entries(C).map(([v, hex]) => ({ label: v[0].toUpperCase() + v.slice(1), hex, active: s.colors.includes(v), toggle: toggle('colors', v) }));
    let results = all.filter(p => (s.type === 'all' || p.type === s.type) && (!s.materials.length || s.materials.includes(p.mat)) && (!s.colors.length || p.colors.some(c => s.colors.includes(c))) && (!s.styles.length || p.styles.some(c => s.styles.includes(c))) && (!s.fits.length || s.fits.includes(p.fit)) && p.price <= s.maxPrice);
    const sorters = { popular: (a, b) => b.pop - a.pop, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, new: (a, b) => b.added - a.added };
    results = results.sort(sorters[s.sort]).map(p => ({ ...p, slot: 'lst-' + p.id, priceLabel: '$' + p.price, wasLabel: '$' + p.was, swatches: p.colors.map(c => C[c]) }));
    return {
      footerNoop,
      typeTabs, materialOpts, styleOpts, fitOpts, colorOpts, results,
      resultCount: results.length, hasResults: results.length > 0, noResults: results.length === 0,
      maxPrice: s.maxPrice, maxPriceLabel: s.maxPrice >= 450 ? 'Any' : '$' + s.maxPrice,
      setMaxPrice: e => setState({ maxPrice: Number(e.target.value) }),
      sort: s.sort, setSort: e => setState({ sort: e.target.value }),
      clearAll: () => setState({ type: 'all', materials: [], colors: [], styles: [], fits: [], maxPrice: 450 }),
    };
  }

  const { clearAll, colorOpts, fitOpts, hasResults, materialOpts, maxPrice, maxPriceLabel, noResults, resultCount, results, setMaxPrice, setSort, sort, styleOpts, typeTabs } = renderVals();

  return (
    <div className="pg-shop">
      <Nav active="/shop" cta="cart" />
      {/* header */}
      {/* Listing header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Jackets</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Custom
              <br />
              Jackets
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every jacket here is made to order in your colors. Pick a base, then add letters, names and patches on the product page — or start from scratch in the builder.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="lst-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
        {/* type tabs */}
        <div id="picks" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '32px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {typeTabs.map((t, tIdx) => (
            <button key={tIdx} type="button" className="ez-chip" aria-pressed={t.active} onClick={t.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {t.label}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{t.count}</span>
            </button>
          ))}
        </div>
      </section>
      {/* layout */}
      {/* Listing */}
      <section className="ez-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: '40px clamp(24px,4vw,56px)', alignItems: 'start' }}>
        {/* filters */}
        <aside className="ez-side" style={{ position: 'sticky', top: '104px', display: 'grid', gap: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter
            </div>
            <button type="button" onClick={clearAll} style={{ background: 'none', border: '0', font: 'inherit', fontSize: '13px', fontWeight: '600', color: 'var(--gold-2)', cursor: 'pointer', padding: '0', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Clear all
            </button>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Material
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {materialOpts.map((o, oIdx) => (
                <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.toggle}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Body color
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {colorOpts.map((c, cIdx) => (
                <button key={cIdx} type="button" className="ez-swatch" aria-pressed={c.active} onClick={c.toggle} title={c.label} aria-label={c.label} style={{ background: c.hex }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Style
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {styleOpts.map((o, oIdx) => (
                <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.toggle}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Fit
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {fitOpts.map((o, oIdx) => (
                <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.toggle}>{o.label}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Max price
              </span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>{maxPriceLabel}</span>
            </div>
            <input type="range" min="50" max="450" step="10" value={maxPrice} onChange={setMaxPrice} style={{ width: '100%', accentColor: 'var(--ink)' }} />
          </div>
        </aside>
        {/* results */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px 20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--ink)', fontFamily: 'var(--display)', fontSize: '22px', fontWeight: '900' }}>{resultCount}</strong>
              {' '}jackets
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)' }}>
              Sort
              <select className="ez-select" value={sort} onChange={setSort}>
                <option value="popular">Most popular</option>
                <option value="rating">Top rated</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="new">Newest</option>
              </select>
            </label>
          </div>
          {hasResults ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '32px 20px' }}>
              {results.map((p, pIdx) => (
                <A key={pIdx} href="/product" className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                  {p.badge ? (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px' }}>
                      {p.badge}
                    </span>
                  ) : null}
                  <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                    <ImageSlot slot={p.slot} shape="rect" src={p.src} placeholder={p.name} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                    {p.swatches.map((s, sIdx) => (
                      <span key={sIdx} style={{ width: '14px', height: '14px', borderRadius: '50%', boxShadow: '0 0 0 1px var(--cream-2)', background: s }} />
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'start', marginTop: '10px' }}>
                    <div>
                      <h3 style={{ fontWeight: '600', fontSize: '16px', lineHeight: '1.35', margin: '0' }}>{p.name}</h3>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                        {p.material} ·{' '}
                        <span style={{ color: 'var(--gold-2)' }}>★</span>
                        {' '}{p.rating} ({p.reviews})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <s style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>{p.wasLabel}</s>
                      <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1' }}>{p.priceLabel}</span>
                    </div>
                  </div>
                </A>
              ))}
            </div>
          ) : null}
          {noResults ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', border: '1.5px dashed var(--cream-2)', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', textTransform: 'uppercase' }}>
                Nothing in that combination
              </div>
              <p style={{ color: 'var(--muted)', margin: '10px 0 24px' }}>Loosen a filter, or build exactly this jacket from scratch.</p>
              <A href="/design" className="ez-btn ez-btn-ink">Design your own</A>
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
}
