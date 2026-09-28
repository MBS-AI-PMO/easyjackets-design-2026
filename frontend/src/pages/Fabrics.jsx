// The materials guide: every material the customiser offers (names and
// body/sleeve prices from the API) with the design's notes on weight, warmth
// and care, photographed on the client's own jackets, plus a summary of the
// swatch colours each material comes in (linking into /material-colors).
import { useState } from 'react';
import A from '../components/A';
import Lightbox from '../components/Lightbox';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchMaterials } from '../lib/catalog';
import { fetchFabricSections } from '../lib/content';
import { fetchMaterialPricing, materialForSection, money, slugify } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './Fabrics.css';

const IMG = '/images/site';

// The guide copy the API does not carry, keyed by material name (lower-case).
const GUIDE = {
  'melton wool': { use: 'Body · the classic', weight: '24 oz', warmth: 'High', care: 'Dry clean', img: 'man-black-orange.webp', alt: 'Black melton wool varsity jacket with orange leather shoulder inserts', desc: 'A dense, boiled wool blend with a matte, felted face. It blocks wind, holds its shape for decades and takes chenille without puckering. The cloth every letterman jacket was originally made from.' },
  'cowhide leather': { use: 'Sleeves · heritage', weight: '1.2 mm', warmth: 'High', care: 'Condition', img: 'leather-black.webp', alt: 'Black cowhide leather close-up', desc: 'Full-grain cowhide, drum-dyed and lightly waxed. Stiff on day one, moulded to you by month three. The premium sleeve on our wool and leather varsity.' },
  'sheep leather': { use: 'Sleeves & body · soft', weight: '0.9 mm', warmth: 'Medium', care: 'Condition', img: 'leather-brown.webp', alt: 'Brown sheep nappa leather close-up', desc: 'Lighter and buttery-soft from the first wear. Chosen for all-leather and fashion builds where drape matters more than armour.' },
  'faux leather': { use: 'Sleeves · vegan', weight: '0.8 mm', warmth: 'Medium', care: 'Wipe clean', img: 'leather-navy.webp', alt: 'Navy leather-look sleeve material close-up', desc: 'A supple PU on a knit backing with the look of cowhide at a lower price and no animal products. Water-resistant and easy to keep clean.' },
  'satin': { use: 'Body · lightweight', weight: '6 oz', warmth: 'Low', care: 'Machine wash', img: 'woman-green-satin.webp', alt: 'Green satin cropped varsity jacket', desc: 'Glossy, light and quick-drying. The baseball-jacket fabric, great for spring seasons, stage wear and hot climates. Embroidery pops on it.' },
  'cotton fleece': { use: 'Body · hoodies', weight: '14 oz', warmth: 'Medium', care: 'Machine wash', img: 'couple-hoodies.webp', alt: 'Blue and orange cotton fleece hoodies with felt lettering', desc: 'Heavyweight brushed-back cotton fleece. Soft, washable and the base for our hoodies and casual varsity builds.' },
  'cotton twill': { use: 'Body · coach jackets', weight: '10 oz', warmth: 'Low', care: 'Machine wash', img: 'jackets-on-rail.webp', alt: 'Cotton and twill jackets on a rail', desc: 'A tight diagonal weave with a dry hand. Sharp for coach jackets and workwear-inspired builds.' },
  'nylon': { use: 'Body · bombers & coach jackets', weight: '5 oz', warmth: 'Low', care: 'Machine wash', img: 'woman-black-coach.webp', alt: 'Black nylon coach jacket with felt lettering', desc: 'Water-resistant flight nylon with a soft sheen. The bomber and coach-jacket shell.' },
  'soft shell': { use: 'Body · technical', weight: '9 oz', warmth: 'Medium', care: 'Machine wash', img: 'trio-outdoors.webp', alt: 'Three friends outdoors in varsity jackets', desc: 'Bonded stretch fabric with a fleece back. Wind- and water-resistant for sideline and outdoor teams.' },
};
const FALLBACK = { use: 'Body & sleeves', weight: '—', warmth: '—', care: 'See care label', img: 'leather-rolls.webp', alt: 'Rolls of jacket leather in several colours', desc: 'Available on the body and sleeves in the design lab. Request a free swatch to see and feel it before you order.' };
const guideFor = (name) => GUIDE[String(name || '').trim().toLowerCase()] || FALLBACK;

export default function Fabrics() {
  // enlarged view of a swatch photo: the material's photos, stepping from the one clicked
  const [viewer, setViewer] = useState(null);
  usePageTitle('Fabrics & Materials', 'Melton wool, cowhide and sheep leather, satin, fleece, twill, nylon and soft shell — every material we cut for custom varsity jackets, with weight, feel and colours.');
  const { data: materials } = useAsync(fetchMaterials, []);
  const { data: pricing } = useAsync(fetchMaterialPricing, []);
  const { data: sections, loading, error } = useAsync(fetchFabricSections, []);
  const sectionsLoading = loading;

  // Only the fabrics the admin has added in Fabric Colors, in the admin's order;
  // the design-lab material of the same name supplies the prices and pairings.
  const fabrics = (sections || []).map((section) => {
    const m = materialForSection(section, materials || []);
    const name = m?.name || section.name || section.title;
    const g = guideFor(name);
    const p = m ? pricing?.get(m.id) || null : null;
    return {
      id: slugify(name),
      slot: `fab-${section.id}`,
      name,
      ...g,
      src: `${IMG}/${g.img}`,
      colors: String(section.colorCount),
      colorsHref: `/material-colors#${slugify(name)}`,
      // the photographed swatches of this fabric (Fabric Colors in the admin)
      photos: section.tileSwatches,
      // "+$30" for an upcharge, "$0" when the part costs nothing extra
      bodyPrice: p && p.forBody ? (p.bodyPrice > 0 ? `+${money(p.bodyPrice)}` : money(0)) : '',
      sleevesPrice: p && p.forSleeves ? (p.sleevesPrice > 0 ? `+${money(p.sleevesPrice)}` : money(0)) : '',
      pairsWith: p?.pairsWith || [],
    };
  });

  return (
    <div className="pg-fabrics">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* Fabrics header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Fabrics</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Cloth, leather
              <br />
              & knit
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              {fabrics.length ? `The ${fabrics.length} fabrics we cut` : 'Every fabric we cut'}, with weight, feel and what each is best for. All are available in the design lab; swatches ship free on request.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="fabrics-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* Fabric list */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gap: 'clamp(48px,6vw,80px)' }}>
        {error ? <p style={{ color: 'var(--muted)', margin: '0' }}>The materials could not be loaded ({error.message}).</p> : null}
        {loading ? Array.from({ length: 3 }, (_, i) => (
          <div key={i} aria-busy="true" style={{ display: 'grid', gap: '28px' }}>
            <div>
              <div className="ez-skeleton" style={{ height: '14px', width: '30%' }} />
              <div className="ez-skeleton" style={{ height: '52px', width: '60%', marginTop: '12px' }} />
              <div className="ez-skeleton" style={{ height: '14px', width: '90%', marginTop: '18px' }} />
              <div className="ez-skeleton" style={{ height: '14px', width: '75%', marginTop: '8px' }} />
            </div>
          </div>
        )) : fabrics.map((f) => (
          <div key={f.id} id={f.id} className="ez-reveal" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '28px', borderTop: '1px solid var(--ink)', paddingTop: 'clamp(28px,4vw,40px)' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {f.use}
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                {f.name}
              </h2>
              <p style={{ margin: '16px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '16px', maxWidth: '52ch' }}>{f.desc}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,auto)', gap: '12px 28px', marginTop: '22px', justifyContent: 'start' }}>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Weight</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{f.weight}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Warmth</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{f.warmth}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Colors</div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{sectionsLoading && f.colors === '—' ? '…' : f.colors}</div>
                </div>
              </div>
              {f.bodyPrice || f.sleevesPrice ? (
                <p style={{ margin: '16px 0 0', color: 'var(--muted)', fontSize: '14px', lineHeight: '1.55' }}>
                  In the design lab: {[f.bodyPrice ? `body ${f.bodyPrice}` : '', f.sleevesPrice ? `sleeves ${f.sleevesPrice}` : ''].filter(Boolean).join(' · ')}
                  {f.pairsWith.length ? <>. Combines with {f.pairsWith.join(', ')}.</> : '.'}
                </p>
              ) : null}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                <A href={f.colorsHref} className="ez-btn" style={{ minHeight: '46px', fontSize: '18px' }}>See colors</A>
                <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '46px', fontSize: '18px' }}>Design with it →</A>
              </div>
            </div>
            {f.photos.length ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '14px' }}>
                  {f.name} swatches · {f.photos.length} photographed
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: '14px' }}>
                  {f.photos.map((c, ci) => (
                    <button key={c.id} type="button" className="ez-reveal fab-swatch" onClick={() => setViewer({ items: f.photos.map((x) => ({ src: x.image, title: x.name, caption: `${f.name} swatch`, alt: x.alt || `${x.name} ${f.name} swatch` })), index: ci })} aria-label={`View ${c.name} ${f.name} swatch larger`}>
                      <div className="fab-swatch-img" style={{ aspectRatio: '1', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)', border: '1px solid rgba(20,17,15,0.12)' }}>
                        <ImageSlot slot={`fab-sw-${c.id}`} shape="rect" src={c.image} width={320} placeholder={c.name} aria-label={c.alt || `${c.name} ${f.name} swatch`} style={{ aspectRatio: '1' }} />
                        <span className="fab-swatch-zoom" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.8" fill="none" /><path d="M11 11l3.5 3.5M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.8" /></svg>
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: '1.2', marginTop: '8px' }}>{c.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {!loading && !error && !fabrics.length ? <p style={{ color: 'var(--muted)', margin: '0' }}>No fabrics have been added in the admin yet.</p> : null}
      </section>
      {/* Compare */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          At a glance
        </h2>
        <div className="ez-wrap">
          <table className="ez-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Best for</th>
                <th>Weight</th>
                <th>Warmth</th>
                <th>Care</th>
                <th>Colors</th>
                <th>Body</th>
                <th>Sleeves</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }, (_, i) => (
                <tr key={i}><td colSpan={8}><div className="ez-skeleton" style={{ height: '18px' }} /></td></tr>
              )) : fabrics.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontSize: '18px' }}>{f.name}</td>
                  <td>{f.use}</td>
                  <td>{f.weight}</td>
                  <td>{f.warmth}</td>
                  <td>{f.care}</td>
                  <td>{f.colors}</td>
                  <td>{f.bodyPrice || '—'}</td>
                  <td>{f.sleevesPrice || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '14px 0 0' }}>
          Body and sleeve prices are what the design lab adds for the material on that part of the jacket. Weight, warmth and care are typical for the cloth.
        </p>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Want to feel it first?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Free swatch pack
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Up to five swatches of any body, sleeve or lining material, shipped free anywhere.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact-us" className="ez-btn ez-btn-gold">Request swatches</A>
            <A href="/material-colors" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Browse colors →</A>
          </div>
        </div>
      </section>
      <Lightbox items={viewer?.items} index={viewer ? viewer.index : null} onClose={() => setViewer(null)} onIndex={(n) => setViewer((v) => ({ ...v, index: n }))} label="Fabric swatch" />
      <Footer />
    </div>
  );
}
