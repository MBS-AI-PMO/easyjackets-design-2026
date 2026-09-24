// Converted from design/Easy Jackets Gallery.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { cat: 'All' };

export default function Gallery() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/';
    const all = [
      { cat: 'Schools', cap: 'Class of ’26', ratio: '4/5', src: TJM + 'School_1024x1024.webp?v=1775220778' },
      { cat: 'Teams', cap: 'Hockey club', ratio: '3/2', src: 'https://clothoo.com/frontend/images/customer-photos/maroon-gold-varsity-jackets-with-hockey-crossed-sticks-logo-student-group-clothoo-600x395.jpg' },
      { cat: 'Brands', cap: 'Launch crew', ratio: '1/1', src: TJM + 'Brand_63f92eec-0544-42c1-8c33-0fe8dd40f4eb_1024x1024.webp?v=1775220871' },
      { cat: 'Individuals', cap: 'All-black wool & leather', ratio: '4/5', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
      { cat: 'Teams', cap: 'Football seniors', ratio: '3/2', src: TJM + 'Team_1024x1024.webp?v=1775220777' },
      { cat: 'Details', cap: 'Triple-felt chenille', ratio: '1/1', src: CL + 'home/custom-chenille-triple-felt-clothoo.jpg' },
      { cat: 'Individuals', cap: 'Suede varsity', ratio: '4/5', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
      { cat: 'Details', cap: 'Back embroidery', ratio: '3/2', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      { cat: 'Schools', cap: 'Band jackets', ratio: '1/1', src: CL + 'home/USA-custom-varsity-letterman-jacket-clothoo-548.jpg' },
      { cat: 'Brands', cap: 'Staff bombers', ratio: '4/5', src: TJM + 'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
      { cat: 'Details', cap: 'Quilted lining', ratio: '1/1', src: CL + 'home/polyester-satin-quilted-lining-options-clothoo.jpg' },
      { cat: 'Individuals', cap: 'Cropped varsity', ratio: '4/5', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
    ];
    const s = state;
    return { footerNoop: e => e.preventDefault(),
      cats: ['All', 'Schools', 'Teams', 'Brands', 'Individuals', 'Details'].map(c => ({ label: c, active: s.cat === c, select: () => setState({ cat: c }) })),
      photos: all.filter(p => s.cat === 'All' || p.cat === s.cat).map(p => ({ ...p, slot: 'gal-' + all.indexOf(p) })) };
  }

  const { cats, photos } = renderVals();

  return (
    <div className="pg-gallery">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* Photo gallery header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Photo gallery</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Jackets in
              <br />
              the wild
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Real jackets on real customers — schools, teams, brands and one-offs. Tag @easyjackets to be featured.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="gallery-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* Gallery filter */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {cats.map((c, cIdx) => (
            <button key={cIdx} type="button" className="ez-chip" aria-pressed={c.active} onClick={c.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {c.label}
            </button>
          ))}
        </div>
      </section>
      {/* Gallery grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
        <div style={{ columns: '3 280px', columnGap: '20px' }}>
          {photos.map((p, pIdx) => (
            <div key={pIdx} className="ez-gal" style={{ aspectRatio: p.ratio }}>
              <ImageSlot slot={p.slot} shape="rect" src={p.src} placeholder={p.cap} />
              <div className="ez-gal-cap">
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  {p.cat}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1', marginTop: '4px' }}>
                  {p.cap}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Your turn
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Make one worth photographing
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Every jacket here started in the design lab or as a sketch sent to our artists.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design" className="ez-btn ez-btn-gold">Design your own</A>
            <A href="/shop" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Shop ready styles →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
