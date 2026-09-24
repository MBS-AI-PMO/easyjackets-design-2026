// Converted from design/Easy Jackets Fabrics.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function Fabrics() {

  function renderVals() {
    return { footerNoop: e => e.preventDefault(),
         fabrics: [
           { id: 'melton-wool', slot: 'fab-1', name: 'Melton Wool', use: 'Body · the classic', weight: '24 oz', warmth: 'High', colors: '18', care: 'Dry clean', price: 'From $112', desc: 'A dense, boiled wool blend with a matte, felted face. It blocks wind, holds its shape for decades and takes chenille without puckering. The cloth every letterman jacket was originally made from.', src: 'https://clothoo.com/frontend/images/home/melton-wool-fabric-for-varsity-jackets-clothoo.jpg' },
           { id: 'cowhide-leather', slot: 'fab-2', name: 'Cowhide Leather', use: 'Sleeves · heritage', weight: '1.2 mm', warmth: 'High', colors: '10', care: 'Condition', price: 'From $150', desc: 'Full-grain cowhide, drum-dyed and lightly waxed. Stiff on day one, moulded to you by month three. The premium sleeve on our wool and leather varsity.', src: 'https://clothoo.com/frontend/images/home/full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg' },
           { id: 'sheep-leather', slot: 'fab-3', name: 'Sheep Leather', use: 'Sleeves & body · soft', weight: '0.9 mm', warmth: 'Medium', colors: '8', care: 'Condition', price: 'From $180', desc: 'Lighter and buttery-soft from the first wear. Chosen for all-leather and fashion builds where drape matters more than armour.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Suede_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238171' },
           { id: 'faux-leather', slot: 'fab-4', name: 'Faux Leather', use: 'Sleeves · vegan', weight: '0.8 mm', warmth: 'Medium', colors: '12', care: 'Wipe clean', price: 'From $120', desc: 'A supple PU on a knit backing with the look of cowhide at a lower price and no animal products. Water-resistant and easy to keep clean.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
           { id: 'polyester-satin', slot: 'fab-5', name: 'Polyester Satin', use: 'Body · lightweight', weight: '6 oz', warmth: 'Low', colors: '16', care: 'Machine wash', price: 'From $97', desc: 'Glossy, light and quick-drying. The baseball-jacket fabric, great for spring seasons, stage wear and hot climates. Embroidery pops on it.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
           { id: 'cotton-fleece', slot: 'fab-6', name: 'Cotton Fleece', use: 'Body · hoodies', weight: '14 oz', warmth: 'Medium', colors: '14', care: 'Machine wash', price: 'From $95', desc: 'Heavyweight brushed-back cotton fleece. Soft, washable and the base for our hoodies and casual varsity builds.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114' },
           { id: 'cotton-twill', slot: 'fab-7', name: 'Cotton Twill', use: 'Body · coach jackets', weight: '10 oz', warmth: 'Low', colors: '12', care: 'Machine wash', price: 'From $90', desc: 'A tight diagonal weave with a dry hand. Sharp for coach jackets and workwear-inspired builds.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Cotton_fabric_material_texture_close_up_for_custom_varisty_jackets_1024x1024.webp?v=1775238632' },
           { id: 'nylon', slot: 'fab-8', name: 'Nylon', use: 'Body · bombers', weight: '5 oz', warmth: 'Low', colors: '10', care: 'Machine wash', price: 'From $105', desc: 'Water-resistant flight nylon with a soft sheen. The bomber and coach-jacket shell.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
           { id: 'soft-shell', slot: 'fab-9', name: 'Soft Shell', use: 'Body · technical', weight: '9 oz', warmth: 'Medium', colors: '8', care: 'Machine wash', price: 'From $115', desc: 'Bonded stretch fabric with a fleece back. Wind- and water-resistant for sideline and outdoor teams.', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Denim_and_cotton_fabric_options_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238196' }] };
  }

  const { fabrics } = renderVals();

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
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Cloth, leather
              <br />
              & knit
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every material we cut, with weight, feel and what it is best for. All are available in the design lab; swatches ship free on request.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="fabrics-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* Fabric list */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gap: 'clamp(48px,6vw,80px)' }}>
        {fabrics.map((f, fIdx) => (
          <div key={fIdx} id={f.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '28px clamp(24px,4vw,72px)', alignItems: 'center' }}>
            <div style={{ aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot={f.slot} shape="rect" src={f.src} placeholder={`${f.name} swatch`} />
            </div>
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
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{f.colors}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '24px' }}>
                <A href={`/material-colors#${f.id}`} className="ez-btn" style={{ minHeight: '46px', fontSize: '18px' }}>See colors</A>
                <A href="/design" className="ez-btn ez-btn-ink" style={{ minHeight: '46px', fontSize: '18px' }}>Design with it →</A>
              </div>
            </div>
          </div>
        ))}
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
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {fabrics.map((f, fIdx) => (
                <tr key={fIdx}>
                  <td style={{ fontSize: '18px' }}>{f.name}</td>
                  <td>{f.use}</td>
                  <td>{f.weight}</td>
                  <td>{f.warmth}</td>
                  <td>{f.care}</td>
                  <td>{f.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact" className="ez-btn ez-btn-gold">Request swatches</A>
            <A href="/material-colors" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Browse colors →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
