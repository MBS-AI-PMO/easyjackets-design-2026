// Converted from design/Easy Jackets Material Colors.dc.html
import { useRef } from 'react';
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { toast: '', on: false };

export default function MaterialColors() {
  const [state, setState] = useDcState(INITIAL_STATE);
  const timer = useRef(null);

  function renderVals() {
    const G = (id, name, use, note, colors) => ({ id, name, use, note, count: colors.length, colors: colors.map(([n, h]) => ({ name: n, hex: h, copy: () => { try { navigator.clipboard.writeText(n); } catch (e) {} clearTimeout(timer.current); setState({ toast: n + ' copied', on: true }); timer.current = setTimeout(() => setState({ on: false }), 1400); } })) });
    const wool = [['Black','#16161a'],['Navy','#1c2541'],['Royal Blue','#1f4fb8'],['Columbia Blue','#9bc4e6'],['Maroon','#5c1a2a'],['Cardinal','#a4192e'],['Scarlet','#c8102e'],['Forest Green','#1f4d2e'],['Kelly Green','#1a8a3e'],['Purple','#4b2a7a'],['Vegas Gold','#c5b358'],['Athletic Gold','#f2b705'],['Orange','#e85d04'],['Charcoal','#3d3d42'],['Heather Grey','#8b8b90'],['Silver Grey','#c3c3c7'],['Cream','#efe6d2'],['White','#f7f7f4']];
    const cow = [['Black','#121214'],['Dark Brown','#3a2417'],['Tan','#a87a4a'],['Cognac','#8b4a1f'],['Oxblood','#4e1a1f'],['Navy','#1a2440'],['Cream','#ece2cc'],['White','#f4f2ee'],['Grey','#6b6b70'],['Forest','#1d3d2a']];
    const faux = [['Black','#141416'],['White','#f5f4f0'],['Cream','#ede4cf'],['Tan','#b58a5a'],['Brown','#4a2e1c'],['Navy','#1b2542'],['Royal','#2456b8'],['Red','#b8121f'],['Maroon','#5a1b28'],['Grey','#8a8a8f'],['Green','#1e4a2f'],['Purple','#4b2c78']];
    const satin = [['Black','#101014'],['White','#f7f7f5'],['Navy','#182242'],['Royal','#1e4fc0'],['Sky','#8fc1ea'],['Red','#c81a2c'],['Maroon','#5e1d2c'],['Kelly','#1d8b40'],['Forest','#1d4a2e'],['Purple','#4d2b80'],['Gold','#e8b820'],['Orange','#ee6a10'],['Pink','#e77aa8'],['Silver','#c9c9cd'],['Charcoal','#3b3b40'],['Teal','#127a7a']];
    const fleece = [['Black','#18181b'],['Charcoal Heather','#4a4a4f'],['Grey Heather','#9a9a9e'],['White','#f4f4f1'],['Navy','#1c2544'],['Royal','#2350b0'],['Red','#bd1c2b'],['Maroon','#5c1f2c'],['Forest','#20492f'],['Kelly','#1f8a44'],['Purple','#4a2b7c'],['Gold','#dcaa1e'],['Orange','#e56412'],['Sand','#d8c7a5']];
    const knit = [['Black','#131316'],['White','#f6f5f2'],['Navy','#1a2443'],['Royal','#2050b5'],['Red','#c0182a'],['Maroon','#5b1c2a'],['Kelly','#1e8842'],['Forest','#1f4a2f'],['Purple','#4a2a7b'],['Athletic Gold','#f0b60a'],['Vegas Gold','#c4b25a'],['Orange','#e86412'],['Grey','#8d8d92'],['Columbia','#98c2e4']];
    const lining = [['Black quilted','#15151a'],['Gold quilted','#d9a821'],['Silver quilted','#bfbfc4'],['Navy quilted','#1a2544'],['Red quilted','#b81a2a'],['Royal quilted','#2352b6'],['White quilted','#f3f2ee'],['Maroon quilted','#5a1b29'],['Kelly quilted','#1f8743'],['Purple quilted','#492b7a']];
    return { footerNoop: e => e.preventDefault(), toast: state.toast, toastOpacity: state.on ? 1 : 0,
      groups: [
        G('melton-wool', 'Melton Wool', 'Body · 18 colors', 'Our widest range. Heathers are yarn-dyed; solids are piece-dyed for a deep, even tone.', wool),
        G('cowhide-leather', 'Cowhide Leather', 'Sleeves · 10 colors', 'Drum-dyed full grain. Natural grain variation is part of the look.', cow),
        G('faux-leather', 'Faux Leather', 'Sleeves · 12 colors', 'Consistent color, water-resistant, wipe-clean.', faux),
        G('polyester-satin', 'Polyester Satin', 'Body · 16 colors', 'High sheen; colors read brighter than the same name in wool.', satin),
        G('cotton-fleece', 'Cotton Fleece', 'Body & hoodies · 14 colors', 'Heathers have a soft mottled surface.', fleece),
        G('rib-knit', 'Rib Knit Trim', 'Collar, cuffs, waistband · 14 colors', 'Combine any two for striped trim. Acrylic-wool blend, colorfast.', knit),
        G('lining', 'Quilted Lining', 'Inside · 10 colors', 'Diamond-quilted satin over light polyfill.', lining)] };
  }

  const { groups, toast, toastOpacity } = renderVals();

  return (
    <div className="pg-material-colors">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* Material colors header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Material colors</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Every color
              <br />
              we stock
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Body, sleeve, rib knit and lining colors by material. Screens vary — order a free swatch pack to see the real thing. Click a swatch to copy its name for the design lab.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="colors-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* Color filter */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {groups.map((g, gIdx) => (
            <A key={gIdx} href={`#${g.id}`} className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {g.name}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{g.count}</span>
            </A>
          ))}
        </div>
      </section>
      {/* Color groups */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0', display: 'grid', gap: 'clamp(48px,6vw,80px)' }}>
        {groups.map((g, gIdx) => (
          <div key={gIdx} id={g.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,3fr)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'start' }} className="ez-two">
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {g.use}
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                {g.name}
              </h2>
              <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>{g.note}</p>
              <A href={`/fabrics#${g.id}`} style={{ display: 'inline-block', marginTop: '14px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)', fontSize: '14px' }}>
                About this material →
              </A>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: '16px' }}>
              {g.colors.map((c, cIdx) => (
                <button key={cIdx} type="button" className="ez-swatch" onClick={c.copy} title={c.name} style={{ background: 'none', border: '0', padding: '0', font: 'inherit', textAlign: 'left', color: 'inherit' }}>
                  <div className="ez-swatch-color" style={{ background: c.hex }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.2' }}>{c.name}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
      <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: '40', background: 'var(--ink)', color: 'var(--cream)', padding: '12px 20px', borderRadius: '2px', fontWeight: '600', fontSize: '14px', boxShadow: '0 12px 32px -12px rgba(0,0,0,0.5)', opacity: toastOpacity, transition: 'opacity .25s', pointerEvents: 'none' }}>
        {toast}
      </div>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Screens lie
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Order a free swatch pack
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Pick up to five colors across any material and we post them free, anywhere in the world.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact" className="ez-btn ez-btn-gold">Request swatches</A>
            <A href="/design" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Open the design lab →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
