// Material colors: every colour the design lab offers (GET /property/colors),
// grouped by the material it is available in. The photographed fabric swatches
// live on /fabrics; the landing page's /material-colors#<fabric section key>
// links still land on the matching material here. Clicking a colour copies its
// name for the design lab, as in the design.
import { useEffect, useRef, useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchMaterials } from '../lib/catalog';
import { fetchFabricSections } from '../lib/content';
import { fetchColorOptions, sectionForMaterial, slugify } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { scrollToHash } from '../lib/scroll';
import './MaterialColors.css';
import { usePageTitle } from '../lib/usePageTitle';

const isLight = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 200;
};

export default function MaterialColors() {
  usePageTitle('Material Colors', 'Every colour the design lab offers for custom varsity jackets, by material — melton wool, cowhide and sheep leather, satin, fleece, twill, nylon and soft shell.');
  const { data: colors, loading, error } = useAsync(fetchColorOptions, []);
  const { data: materials } = useAsync(fetchMaterials, []);
  const { data: sections } = useAsync(fetchFabricSections, []);
  const [toast, setToast] = useState({ text: '', on: false });
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = (name) => {
    try { navigator.clipboard.writeText(name); } catch { /* clipboard blocked */ }
    clearTimeout(timer.current);
    setToast({ text: `${name} copied`, on: true });
    timer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), 1400);
  };

  // One group per material, in the admin's order; a colour appears under every material it comes in.
  const groups = (materials || []).map((m) => {
    const name = String(m.name || '').trim();
    const list = (colors || []).filter((c) => c.materials.some((x) => x.toLowerCase() === name.toLowerCase()));
    const section = sectionForMaterial(name, sections || []);
    return { id: slugify(name), alias: section && section.key !== slugify(name) ? section.key : '', name, count: list.length, colors: list, photosHref: section ? `/fabrics#${slugify(name)}` : '' };
  }).filter((g) => g.colors.length);
  const totalColors = new Set((colors || []).map((c) => c.id)).size;
  const ready = !loading && materials && colors;

  return (
    <div className="pg-material-colors">
      <Nav active="/faq" cta="shop" />
      {/* Material colors header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Material colors</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Every color
              <br />
              we stock
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              {totalColors ? `${totalColors} colors across ${groups.length} materials — ` : 'Our colors by material — '}
              the same swatches you pick from in the design lab. Screens vary; order a free swatch pack to see the real thing. Click a color to copy its name.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="colors-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* Jump chips */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div className="mc-jump" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {!ready ? Array.from({ length: 6 }, (_, i) => <div key={i} className="ez-skeleton" style={{ width: '150px', height: '44px' }} />) : groups.map((g) => (
            <A key={g.id} href={`#${g.id}`} className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {g.name}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{g.count}</span>
            </A>
          ))}
          {/* phones: the materials as the device's own dropdown; choosing one scrolls to it */}
          {ready ? (
            <select className="ez-input mc-jump-select" aria-label="Jump to a material" defaultValue="" onChange={(e) => { const id = e.target.value; if (!id) return; window.history.replaceState(null, '', `#${id}`); scrollToHash(`#${id}`); }}>
              <option value="" disabled>Jump to a material…</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.count})</option>)}
            </select>
          ) : null}
        </div>
      </section>
      {/* Color groups */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0', display: 'grid', gap: 'clamp(48px,6vw,80px)' }}>
        {error ? <p style={{ color: 'var(--muted)', margin: '0' }}>The colors could not be loaded ({error.message}).</p> : null}
        {!ready && !error ? Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="ez-two" aria-busy="true" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,3fr)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'start' }}>
            <div>
              <div className="ez-skeleton" style={{ height: '14px', width: '40%' }} />
              <div className="ez-skeleton" style={{ height: '48px', width: '70%', marginTop: '12px' }} />
            </div>
            <div className="mc-swatches" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: '16px' }}>
              {Array.from({ length: 12 }, (_, j) => <div key={j} className="ez-skeleton" style={{ aspectRatio: '1' }} />)}
            </div>
          </div>
        )) : groups.map((g) => (
          <div key={g.id} id={g.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,3fr)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'start' }} className="ez-two">
            <div style={{ position: 'relative' }}>
              {g.alias ? <span id={g.alias} aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0 }} /> : null}
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {g.count} color{g.count === 1 ? '' : 's'}
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                {g.name}
              </h2>
              <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>Available on the parts of the jacket the design lab offers in {g.name.toLowerCase()}.</p>
              {g.photosHref ? (
                <A href={g.photosHref} style={{ display: 'inline-block', marginTop: '14px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)', fontSize: '14px' }}>
                  Fabric photos & details →
                </A>
              ) : null}
            </div>
            <div className="mc-swatches" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: '16px' }}>
              {g.colors.map((c) => (
                <button key={c.id} type="button" className="ez-swatch ez-reveal" onClick={() => copy(c.name)} title={`Copy "${c.name}"`} style={{ background: 'none', border: '0', padding: '0', font: 'inherit', textAlign: 'left', color: 'inherit', cursor: 'pointer' }}>
                  <div className="ez-swatch-color" style={{ background: c.code || 'var(--cream-2)', borderColor: isLight(c.code) ? 'rgba(20,17,15,0.25)' : undefined }} aria-label={`${c.name} ${c.code}`} />
                  <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.2', marginTop: '8px' }}>{c.name}</div>
                  {c.code ? <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', letterSpacing: '0.04em' }}>{c.code.toUpperCase()}</div> : null}
                </button>
              ))}
            </div>
          </div>
        ))}
        {ready && !error && !groups.length ? <p style={{ color: 'var(--muted)', margin: '0' }}>No colors have been published yet.</p> : null}
      </section>
      <div role="status" aria-live="polite" style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: '40', background: 'var(--ink)', color: 'var(--cream)', padding: '12px 20px', borderRadius: '2px', fontWeight: '600', fontSize: '14px', boxShadow: '0 12px 32px -12px rgba(0,0,0,0.5)', opacity: toast.on ? 1 : 0, transition: 'opacity .25s', pointerEvents: 'none' }}>
        {toast.text}
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
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact-us" className="ez-btn ez-btn-gold">Request swatches</A>
            <A href="/fabrics" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>See the fabrics →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
