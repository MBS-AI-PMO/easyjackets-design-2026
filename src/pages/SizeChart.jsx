// Converted from design/Easy Jackets Size Chart.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { fit: 'Classic', unit: 'in', chest: '' };

export default function SizeChart() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const base = [
      ['XS', 40, 25, 17, 24, '34–36'], ['S', 42, 26, 18, 24.5, '36–38'], ['M', 44, 27, 18.5, 25, '38–40'], ['L', 46, 28, 19.5, 25.5, '40–42'],
      ['XL', 48, 29, 20.5, 26, '42–44'], ['2XL', 50, 30, 21.5, 26.5, '44–46'], ['3XL', 52, 31, 22.5, 27, '46–48'], ['4XL', 54, 32, 23.5, 27.5, '48–50'],
    ];
    const s = state, adj = { Classic: 0, Slim: -2, "Women's": -3 }[s.fit] || 0;
    const cm = s.unit === 'cm';
    const fmt = v => cm ? Math.round(v * 2.54) : (Number.isInteger(v) ? v : v.toFixed(1));
    const chestIn = s.chest ? (cm ? s.chest / 2.54 : +s.chest) : null;
    const rows = base.map(([size, c, l, sh, sl, fits]) => {
      const chest = c + adj;
      const [lo, hi] = fits.split('–').map(Number);
      const hiRow = chestIn != null && chestIn >= lo + adj && chestIn < hi + adj + (size === '4XL' ? 1 : 0);
      const fitsTxt = cm ? Math.round((lo + adj) * 2.54) + '–' + Math.round((hi + adj) * 2.54) : (lo + adj) + '–' + (hi + adj);
      return { size, chest: fmt(chest), length: fmt(l), shoulder: fmt(sh + adj / 4), sleeve: fmt(sl), fits: fitsTxt, hi: hiRow };
    });
    return {
      footerNoop: e => e.preventDefault(),
      fits: ['Classic', 'Slim', "Women's"].map(l => ({ label: l, active: s.fit === l, select: () => setState({ fit: l }) })),
      units: [['in', 'Inches'], ['cm', 'Cm']].map(([v, l]) => ({ label: l, active: s.unit === v, select: () => setState({ unit: v }) })),
      unitLabel: cm ? 'cm' : 'in', chestVal: s.chest, setChest: e => setState({ chest: e.target.value }), rows,
    };
  }

  const { chestVal, fits, rows, setChest, unitLabel, units } = renderVals();

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
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Find your
              <br />
              fit
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every jacket is made to order, so measure once and order with confidence. Measurements below are of the finished jacket laid flat, in inches. Between sizes? Go up — varsity jackets are meant to layer.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="size-chart-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* controls */}
      {/* Chart controls */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0', display: 'flex', flexWrap: 'wrap', gap: '16px 28px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div className="ez-seg">
            {fits.map((f, fIdx) => (
              <button key={fIdx} type="button" aria-pressed={f.active} onClick={f.select}>{f.label}</button>
            ))}
          </div>
          <div className="ez-seg">
            {units.map((u, uIdx) => (
              <button key={uIdx} type="button" aria-pressed={u.active} onClick={u.select}>{u.label}</button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--muted)' }}>
          Highlight my chest
          <input type="number" placeholder="e.g. 40" value={chestVal} onChange={setChest} style={{ width: '90px', height: '44px', padding: '0 12px', border: '1.5px solid var(--cream-2)', borderRadius: '2px', background: '#fbf8f2', font: 'inherit', fontSize: '15px', color: 'var(--ink)' }} />
          <span style={{ fontWeight: '600', color: 'var(--ink)' }}>{unitLabel}</span>
        </label>
      </section>
      {/* table */}
      {/* Size table */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px clamp(16px,4vw,48px) 0' }}>
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Body length</th>
                <th>Shoulder</th>
                <th>Sleeve</th>
                <th>Fits chest</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rIdx) => (
                <tr key={rIdx} data-hi={r.hi}>
                  <td>{r.size}</td>
                  <td>{r.chest}</td>
                  <td>{r.length}</td>
                  <td>{r.shoulder}</td>
                  <td>{r.sleeve}</td>
                  <td style={{ color: 'var(--muted)' }}>{r.fits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '14px 0 0' }}>
          Tolerance ±0.5 in (1.3 cm). Youth sizes and custom measurements are available at checkout at no extra cost.
        </p>
      </section>
      {/* how to measure */}
      {/* How to measure */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '36px clamp(24px,4vw,72px)', alignItems: 'start' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
            <ImageSlot slot="size-diagram" shape="rect" placeholder="Jacket measurement diagram (chest, length, shoulder, sleeve)" />
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
            The most reliable way to size a made-to-order jacket is to measure one that already fits you well. Lay it flat, zipped or snapped, and take these four measurements.
          </p>
          <div style={{ display: 'grid', gap: '22px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '18px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1', color: 'var(--gold-2)' }}>
                A
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Chest</div>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                  Armpit to armpit, one inch below the sleeve seam. Our chart lists this measurement doubled.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '18px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1', color: 'var(--gold-2)' }}>
                B
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Body length</div>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                  From the top of the collar seam at the back straight down to the bottom of the waistband.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '18px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1', color: 'var(--gold-2)' }}>
                C
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Shoulder</div>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                  Seam to seam across the back, where the sleeves attach.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '18px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1', color: 'var(--gold-2)' }}>
                D
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Sleeve</div>
                <p style={{ margin: '6px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
                  Shoulder seam down the outside of the arm to the end of the cuff.
                </p>
              </div>
            </div>
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
              Room for a hoodie underneath. Sits at the hip. The traditional letterman cut.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Slim fit</div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Two inches trimmer through the chest and body. Layers over a tee.
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
              Send your four measurements at checkout and we cut to them. No extra charge, 3 extra days.
            </p>
          </div>
        </div>
      </section>
      {/* CTA */}
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
              Email the four numbers and your height and weight — we'll recommend a size within one business day. Wrong size on arrival? One free exchange.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact" className="ez-btn ez-btn-gold">Ask about sizing</A>
            <A href="/design" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Start designing →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
