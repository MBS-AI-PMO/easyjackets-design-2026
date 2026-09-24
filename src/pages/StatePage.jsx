// Converted from design/Easy Jackets State.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function StatePage() {

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/';
    return { footerNoop: e => e.preventDefault(),
      cities: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa', 'Hoover', 'Auburn', 'Dothan', 'Decatur', 'Madison', 'Florence', 'Phenix City', 'Prattville', 'Vestavia Hills', 'Gadsden', 'Enterprise'],
      styles: [
        { slot: 'st-1', name: 'Wool & Leather Varsity', price: 'From $150', img: TJM + 'School_1024x1024.webp?v=1775220778' },
        { slot: 'st-2', name: 'Satin Baseball Jacket', price: 'From $97', img: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
        { slot: 'st-3', name: 'Chenille Letter Jacket', price: 'From $135', img: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
        { slot: 'st-4', name: 'All-Leather Varsity', price: 'From $180', img: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
      ],
      steps: [
        { n: '01', title: 'Design online', desc: 'Pick your style, colors, materials and patches in the design lab — or send a sketch and our artists draw it up free.' },
        { n: '02', title: 'Approve the proof', desc: 'We email a digital proof of the front, back and sleeves. Nothing is cut until you say yes.' },
        { n: '03', title: 'We make it', desc: 'Cut, chenille, embroidery, assembly and inspection — 2–3 weeks depending on decoration.' },
        { n: '04', title: 'Delivered in Alabama', desc: 'DHL or FedEx with tracking to your school, field house or home address in 4–5 business days.' },
      ],
      reviews: [
        { text: 'Ordered 22 jackets for our senior class in Huntsville. The proof came back in two days and every name was spelled right. Kids loved them.', who: 'Athletics coordinator · Huntsville, AL' },
        { text: 'Wool body, leather sleeves, chenille A on the chest. Heavier than the jacket I had in school and half the price of the local shop.', who: 'Marcus T. · Birmingham, AL' },
        { text: 'Our booster club ordered on a purchase order and it was painless. Shipped to Tuscaloosa in under three weeks.', who: 'Booster club president · Tuscaloosa, AL' },
      ],
      nearby: ['Georgia', 'Florida', 'Mississippi', 'Tennessee', 'Louisiana'] };
  }

  const { cities, nearby, reviews, steps, styles } = renderVals();

  return (
    <div className="pg-state-page">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* State header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <A href="/united-states" style={{ textDecoration: 'none', color: 'inherit' }}>United States</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Alabama</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,440px)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Alabama · Custom letterman jackets
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Custom varsity jackets in Alabama
            </h1>
            <p style={{ maxWidth: '56ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '17px' }}>
              Design custom letterman and varsity jackets for schools, teams and businesses in Birmingham, Montgomery, Huntsville, Mobile, Tuscaloosa and every town in between. Free digital proof, no minimum order, delivery to any Alabama address in 2–3 weeks.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '26px' }}>
              <A href="/design" className="ez-btn ez-btn-ink" style={{ minHeight: '50px', fontSize: '20px' }}>Design your Alabama jacket</A>
              <A href="/bulk-orders" className="ez-btn" style={{ minHeight: '50px', fontSize: '20px' }}>Get a team quote</A>
            </div>
          </div>
          <div style={{ aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
            <ImageSlot slot="st-hero" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Team_1024x1024.webp?v=1775220777" placeholder="Alabama team jackets" />
          </div>
        </div>
      </section>
      {/* State facts */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '26px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.2vw,56px)', lineHeight: '1' }}>4–5 days</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Shipping to Alabama
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.2vw,56px)', lineHeight: '1' }}>No min.</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Order one or one hundred
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.2vw,56px)', lineHeight: '1' }}>
              $97
              <span style={{ fontSize: '0.5em' }}>+</span>
            </div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Starting price
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.2vw,56px)', lineHeight: '1' }}>PO ok</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Schools & districts
            </div>
          </div>
        </div>
      </section>
      {/* Cities */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 8px' }}>
          Cities we deliver to
        </h2>
        <p style={{ margin: '0 0 26px', color: 'var(--muted)', fontSize: '15px', maxWidth: '60ch', lineHeight: '1.6' }}>
          Same production time and free shipping over $150, wherever you are in the state.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '2px 20px' }}>
          {cities.map((c, cIdx) => (
            <div key={cIdx} style={{ padding: '9px 0', borderBottom: '1px solid var(--cream-2)', fontWeight: '600', fontSize: '16px' }}>{c}</div>
          ))}
        </div>
      </section>
      {/* Popular in state */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Popular in Alabama
          </h2>
          <A href="/shop" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>See all styles →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '20px' }}>
          {styles.map((s, sIdx) => (
            <A key={sIdx} href="/product" className="ez-card" style={{ display: 'grid', gap: '12px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                <ImageSlot slot={s.slot} shape="rect" src={s.img} placeholder={s.name} />
              </div>
              <div>
                <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '5px' }}>{s.price}</div>
              </div>
            </A>
          ))}
        </div>
      </section>
      {/* How it works */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          Ordering in Alabama
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '26px' }}>
          {steps.map((s, sIdx) => (
            <div key={sIdx} style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1', color: 'var(--gold-2)' }}>
                {s.n}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '6px', lineHeight: '1' }}>
                {s.title}
              </div>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', fontSize: '14px' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* State reviews */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          From Alabama customers
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {reviews.map((r, rIdx) => (
            <div key={rIdx} style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '24px' }}>
              <div style={{ color: 'var(--gold-2)', letterSpacing: '0.1em' }}>★★★★★</div>
              <p style={{ margin: '12px 0 0', lineHeight: '1.65', fontSize: '15px' }}>{r.text}</p>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '14px', fontWeight: '600' }}>{r.who}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Nearby states */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,52px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 18px' }}>
          Nearby states
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {nearby.map((n, nIdx) => (
            <A key={nIdx} href="/united-states/alabama" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {n}
            </A>
          ))}
          <A href="/united-states" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            All 50 states →
          </A>
        </div>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Alabama orders
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Design it, we ship it
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Build your jacket online, approve the free proof, and have it delivered anywhere in Alabama in two to three weeks.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design" className="ez-btn ez-btn-gold">Start designing</A>
            <A href="/contact" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Talk to us →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
