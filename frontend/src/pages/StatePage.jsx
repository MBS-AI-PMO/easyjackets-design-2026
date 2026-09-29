// One page per US state (/united-states/:state): the state's name, main cities and
// neighbouring states come from lib/states.js; an unknown state goes to the list.
import { Navigate, useLocation, useParams } from 'react-router-dom';
import A from '../components/A';
import ProductCard from '../components/ProductCard';
import { fetchRandomJackets } from '../lib/catalog';
import { fetchTestimonials } from '../lib/site';
import { stateBySlug, statePath } from '../lib/states';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchShippingRates, money } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';


export default function StatePage() {
  const { state: slug } = useParams();
  const st = stateBySlug(slug) || null;
  const name = st ? st.name : '';
  usePageTitle(name ? `Custom Varsity Jackets in ${name}` : 'Custom Varsity Jackets', name ? `Custom letterman and varsity jackets for schools, teams and businesses across ${name}. Free digital proof, no minimum order, delivery in 2–3 weeks.` : undefined);
  // the free-shipping threshold is the checkout's (admin's Shipping Rates screen)
  const { data: rates } = useAsync(fetchShippingRates, []);
  const freeOver = rates?.enabled && rates.freeShippingOver > 0 ? money(rates.freeShippingOver) : '';
  // popular picks: real jackets from the catalogue (no hoodies), a fresh random set on every visit and state
  const { pathname } = useLocation();
  const { data: picks, error: picksError } = useAsync((signal) => fetchRandomJackets(4, signal), [pathname], { live: false }); // random per visit
  // customer quotes: the admin's testimonials (Features screen), as on the landing page
  const { data: testimonials } = useAsync((signal) => fetchTestimonials(signal), []);

  function renderVals() {
    return { footerNoop: e => e.preventDefault(),
      cities: st ? st.cities : [],
      steps: [
        { n: '01', title: 'Design online', desc: 'Pick your style, colors, materials and patches in the design lab — or send a sketch and our artists draw it up free.' },
        { n: '02', title: 'Approve the proof', desc: 'We email a digital proof of the front, back and sleeves. Nothing is cut until you say yes.' },
        { n: '03', title: 'We make it', desc: 'Cut, chenille, embroidery, assembly and inspection — 2–3 weeks depending on decoration.' },
        { n: '04', title: `Delivered in ${name}`, desc: 'DHL or FedEx with tracking to your school, field house or home address in 4–5 business days.' },
      ],
      nearby: st ? st.near : [] };
  }

  const { cities, nearby, steps } = renderVals();
  if (!st) return <Navigate to="/united-states" replace />;
  const lead = cities.slice(0, 5);

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
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>{name}</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,440px)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              {name} · Custom letterman jackets
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Custom varsity jackets in {name}
            </h1>
            <p style={{ maxWidth: '56ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '17px' }}>
              Design custom letterman and varsity jackets for schools, teams and businesses in {lead.slice(0, -1).join(', ')} and {lead[lead.length - 1]}, and every town in between. Free digital proof, no minimum order, delivery to any {name} address in 2–3 weeks.
            </p>
            <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '26px' }}>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '50px', fontSize: '20px' }}>Design your {name} jacket</A>
              <A href="/bulk-order" className="ez-btn" style={{ minHeight: '50px', fontSize: '20px' }}>Get a team quote</A>
            </div>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="st-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* State facts */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '26px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(38px,4.2vw,56px)', lineHeight: '1' }}>4–5 days</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Shipping to {name}
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
          Same production time{freeOver ? ` and free shipping over ${freeOver}` : ''}, wherever you are in the state.
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
            Popular in {name}
          </h2>
          <A href="/shop" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>See all styles →</A>
        </div>
        <div className="ez-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '32px 20px' }}>
          {picks ? picks.map((p) => <ProductCard key={p.id} product={p} slotPrefix="st" />)
            : picksError ? null
            : Array.from({ length: 4 }, (_, i) => (
              <div key={i} aria-busy="true">
                <div className="ez-skeleton" style={{ aspectRatio: '4/5', borderRadius: '4px' }} />
                <div className="ez-skeleton" style={{ height: '16px', width: '70%', marginTop: '14px' }} />
              </div>
            ))}
        </div>
      </section>
      {/* How it works */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          Ordering in {name}
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
      {/* Customer quotes (the admin's testimonials) */}
      {testimonials && testimonials.length ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
            From our customers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
            {testimonials.slice(0, 3).map((r) => (
              <figure key={r.id} style={{ margin: 0, background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '24px' }}>
                <blockquote style={{ margin: 0, lineHeight: '1.65', fontSize: '15px' }}>{r.quote}</blockquote>
                <figcaption style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '14px', fontWeight: '600' }}>{r.name}{r.role ? ` · ${r.role}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      {/* Nearby states */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,52px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 18px' }}>
          Nearby states
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {nearby.map((n, nIdx) => (
            <A key={nIdx} href={statePath(n)} className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
              {name} orders
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Design it, we ship it
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Build your jacket online, approve the free proof, and have it delivered anywhere in {name} in two to three weeks.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Start designing</A>
            <A href="/contact-us" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Talk to us →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
