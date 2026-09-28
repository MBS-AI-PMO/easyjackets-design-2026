// Size chart: the admin's sizes (GET /property/sizes) — the body each size
// fits and the finished jacket's measurements — in inches or cm, with the row
// for your chest highlighted. The diagram is the client's own. Below: the
// youth, cropped and coach guides (components/SizeGuides.jsx).
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchSizes, inchRange, money, toCm } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { fetchProducts } from '../lib/catalog';
import SizeGuides from '../components/SizeGuides';
import './SizeChart.css';
import { usePageTitle } from '../lib/usePageTitle';

const IMG = '/images/site';

// The cropped guide shows a real catalog jacket (the live site's search order): its front photo links to its page.
const CROPPED_TERMS = ['Baby Pink Cropped Varsity Jacket', 'Red And White Cropped Varsity Jacket', 'Cropped Varsity Jacket', 'New Cropped Varsity Jacket For Women'];
async function fetchCroppedExample(signal) {
  for (const search of CROPPED_TERMS) {
    const r = await fetchProducts({ search, limit: 3 }, signal);
    const p = r.products.find((x) => x.image);
    if (p) return p;
  }
  const r = await fetchProducts({ category: 'cropped-varsity-jackets', limit: 1 }, signal);
  return r.products[0] || null;
}

const VIEWS = [
  { key: 'jacket', label: 'Jacket', columns: [['chest', 'Chest (pit to pit)'], ['backLength', 'Back length'], ['acrossShoulder', 'Across shoulder'], ['shoulder', 'Shoulder'], ['sleeves', 'Sleeve']] },
  { key: 'body', label: 'Body', columns: [['chest', 'Chest'], ['waist', 'Waist'], ['sleeves', 'Sleeve'], ['backLength', 'Back length']] },
];

export default function SizeChart() {
  usePageTitle('Size Chart', 'Custom varsity jacket sizes XXS to 6XL with finished jacket and body measurements in inches and cm, how to measure, and fit notes.');
  const { data: sizes, loading, error } = useAsync(fetchSizes, []);
  const [view, setView] = useState('jacket');
  const [unit, setUnit] = useState('in');
  const [chest, setChest] = useState('');
  const { data: croppedProduct } = useAsync((signal) => fetchCroppedExample(signal), []);

  const cm = unit === 'cm';
  const fmt = (v) => (v ? (cm ? toCm(v) : v) : '—');
  const chestIn = chest ? (cm ? Number(chest) / 2.54 : Number(chest)) : null;
  const current = VIEWS.find((v) => v.key === view) || VIEWS[0];
  const rows = (sizes || []).map((s) => {
    const range = inchRange(s.body.chest);
    // "38" fits up to the next size's range; "44-46" fits that span
    const hi = range && chestIn != null && chestIn >= range[0] && chestIn < (range[0] === range[1] ? range[1] + 2 : range[1] + 1);
    return {
      id: s.id,
      size: s.size,
      cells: current.columns.map(([k]) => fmt(s[view][k])),
      fits: fmt(s.body.chest),
      surcharge: s.surcharge ? `+${money(s.surcharge)}` : '—',
      hi: !!hi,
    };
  });
  const fits = VIEWS.map((v) => ({ label: v.label, active: view === v.key, select: () => setView(v.key) }));
  const units = [['in', 'Inches'], ['cm', 'Cm']].map(([v, l]) => ({ label: l, active: unit === v, select: () => setUnit(v) }));
  const unitLabel = cm ? 'cm' : 'in';

  return (
    <div className="pg-size-chart">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* Size chart header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Size chart</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Find your
              <br />
              fit
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every jacket is made to order, so measure once and order with confidence. Switch between the finished jacket laid flat and the body each size fits. Between sizes? Go up — varsity jackets are meant to layer.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="size-chart-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* controls */}
      {/* Chart controls */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0', display: 'flex', flexWrap: 'wrap', gap: '16px 28px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div className="ez-seg">
            {fits.map((f) => (
              <button key={f.label} type="button" aria-pressed={f.active} onClick={f.select}>{f.label}</button>
            ))}
          </div>
          <div className="ez-seg">
            {units.map((u) => (
              <button key={u.label} type="button" aria-pressed={u.active} onClick={u.select}>{u.label}</button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--muted)' }}>
          Highlight my chest
          <input type="number" placeholder={cm ? 'e.g. 102' : 'e.g. 40'} value={chest} onChange={(e) => setChest(e.target.value)} style={{ width: '90px', height: '44px', padding: '0 12px', border: '1.5px solid var(--cream-2)', borderRadius: '2px', background: '#fbf8f2', font: 'inherit', fontSize: '15px', color: 'var(--ink)' }} />
          <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{unitLabel}</span>
        </label>
      </section>
      {/* table */}
      {/* Size table */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px clamp(16px,4vw,48px) 0' }}>
        {error ? <p style={{ color: 'var(--muted)', margin: '0 0 14px' }}>The size chart could not be loaded ({error.message}).</p> : null}
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>Size</th>
                {current.columns.map(([k, label]) => <th key={k}>{label}</th>)}
                {view === 'jacket' ? <th>Fits chest</th> : null}
                <th>Surcharge</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }, (_, i) => (
                <tr key={i}><td colSpan={current.columns.length + 3}><div className="ez-skeleton" style={{ height: '20px' }} /></td></tr>
              )) : rows.map((r) => (
                <tr key={r.id} data-hi={r.hi}>
                  <td>{r.size}</td>
                  {r.cells.map((c, i) => <td key={i}>{c}</td>)}
                  {view === 'jacket' ? <td style={{ color: 'var(--muted)' }}>{r.fits}</td> : null}
                  <td style={{ color: r.surcharge === '—' ? 'var(--muted)' : 'inherit' }}>{r.surcharge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !error && !rows.length ? <p style={{ color: 'var(--muted)', margin: '14px 0 0' }}>No sizes have been published yet.</p> : null}
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '14px 0 0' }}>
          Jacket measurements are of the finished jacket laid flat; chest is pit to pit. Tolerance ±0.5 in (1.3 cm). "Tall" sizes add length to the body and sleeves. Larger sizes carry the surcharge shown; youth sizes and custom measurements are available at checkout.
        </p>
      </section>
      {/* how to measure */}
      {/* How to measure */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '36px clamp(24px,4vw,72px)', alignItems: 'start' }}>
        <div className="sc-frame" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: '#fbf8f2', display: 'grid', placeItems: 'center', padding: '8%', boxSizing: 'border-box' }}>
            <ImageSlot slot="size-diagram" shape="rect" src={`${IMG}/jacket-measurement.webp`} fit="contain" placeholder="Jacket measurement diagram (chest, length, across shoulder, shoulder, back length)" aria-label="Diagram of a varsity jacket front and back with the five measurements numbered" style={{ aspectRatio: 'auto', height: 'auto' }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            How to measure
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 28px' }}>
            Grab a jacket you love
          </h2>
          <p style={{ color: 'var(--ink-2)', lineHeight: '1.6', margin: '0 0 28px', maxWidth: '52ch' }}>
            The most reliable way to size a made-to-order jacket is to measure one that already fits you well. Lay it flat, zipped or snapped, and take these five measurements — they match the columns of the jacket chart above.
          </p>
          <div style={{ display: 'grid', gap: '22px' }}>
            {[
              ['1', 'Chest', 'Armpit to armpit across the front, one inch below the sleeve seam. The chart lists this pit-to-pit width.'],
              ['2', 'Length', 'From the top of the collar seam at the front straight down to the bottom of the waistband.'],
              ['3', 'Across shoulder', 'Seam to seam across the back, where the sleeves attach.'],
              ['4', 'Shoulder', 'From the collar seam to the sleeve seam along one shoulder.'],
              ['5', 'Back length', 'From the base of the collar at the back straight down to the bottom of the waistband.'],
            ].map(([n, title, text]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '18px' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1', color: 'var(--gold-2)', minWidth: '28px' }}>
                  {n}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>{title}</div>
                  <p style={{ margin: '6px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* fit notes */}
      {/* Fit notes */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          Fit notes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Classic fit</div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Room for a hoodie underneath. Sits at the hip. The traditional letterman cut the chart is built on.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Tall sizes</div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              The same chest with more body length and longer sleeves — compare the two rows in the chart. Pick tall if sleeves usually run short on you.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Women's</div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Shaped through the waist with a narrower shoulder. Also offered cropped.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Custom size</div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Send your five measurements at checkout and we cut to them. No extra charge, 3 extra days.
            </p>
          </div>
        </div>
      </section>
      <SizeGuides unit={unit} setUnit={setUnit} croppedProduct={croppedProduct} />
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Still unsure?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Send us your measurements
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Email the five numbers and your height and weight — we'll recommend a size within one business day. Wrong size on arrival? One free exchange.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact-us" className="ez-btn ez-btn-gold">Ask about sizing</A>
            <A href="/design-custom-jacket" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Start designing →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
