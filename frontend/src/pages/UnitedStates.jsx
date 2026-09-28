// Converted from design/Easy Jackets United States.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchShippingRates, money } from '../lib/materials';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import { statePath } from '../lib/states';
import './UnitedStates.css';

const INITIAL_STATE = { q: '' };

export default function UnitedStates() {
  usePageTitle('Custom Varsity Jackets in the United States', 'Custom letterman and varsity jackets for high schools, colleges, teams and companies in all 50 states. Design online, free proof, no minimum order.');
  const [state, setState] = useDcState(INITIAL_STATE);
  // the free-shipping threshold is the checkout's (admin's Shipping Rates screen)
  const { data: rates } = useAsync(fetchShippingRates, []);
  const freeOver = rates?.enabled && rates.freeShippingOver > 0 ? money(rates.freeShippingOver) : '';
  const single = rates?.enabled ? rates.usaTiers.find((t) => t.minQty === 1) : null;

  function renderVals() {
    const R = [
      ['West', [['Alaska','AK'],['Arizona','AZ'],['California','CA'],['Colorado','CO'],['Hawaii','HI'],['Idaho','ID'],['Montana','MT'],['Nevada','NV'],['New Mexico','NM'],['Oregon','OR'],['Utah','UT'],['Washington','WA'],['Wyoming','WY']]],
      ['Midwest', [['Illinois','IL'],['Indiana','IN'],['Iowa','IA'],['Kansas','KS'],['Michigan','MI'],['Minnesota','MN'],['Missouri','MO'],['Nebraska','NE'],['North Dakota','ND'],['Ohio','OH'],['South Dakota','SD'],['Wisconsin','WI']]],
      ['South', [['Alabama','AL'],['Arkansas','AR'],['Delaware','DE'],['Florida','FL'],['Georgia','GA'],['Kentucky','KY'],['Louisiana','LA'],['Maryland','MD'],['Mississippi','MS'],['North Carolina','NC'],['Oklahoma','OK'],['South Carolina','SC'],['Tennessee','TN'],['Texas','TX'],['Virginia','VA'],['West Virginia','WV']]],
      ['Northeast', [['Connecticut','CT'],['Maine','ME'],['Massachusetts','MA'],['New Hampshire','NH'],['New Jersey','NJ'],['New York','NY'],['Pennsylvania','PA'],['Rhode Island','RI'],['Vermont','VT']]],
    ];
    const q = state.q.trim().toLowerCase();
    const regions = R.map(([name, list]) => ({ name, states: list.filter(([n, a]) => !q || n.toLowerCase().includes(q) || a.toLowerCase() === q).map(([n, a]) => ({ name: n, abbr: a })) })).filter(r => r.states.length);
    return { footerNoop: e => e.preventDefault(), query: state.q, search: e => setState({ q: e.target.value }),
      regions, empty: regions.length === 0,
      popular: [
        { code: 'CA', name: 'California', note: 'High schools, colleges & studios' },
        { code: 'TX', name: 'Texas', note: 'Football, bands & drill teams' },
        { code: 'NY', name: 'New York', note: 'Senior class & alumni jackets' },
        { code: 'FL', name: 'Florida', note: 'Athletic programs & clubs' },
        { code: 'IL', name: 'Illinois', note: 'Midwest schools & leagues' },
        { code: 'PA', name: 'Pennsylvania', note: 'Universities & Greek life' },
      ],
      audiences: [
        { title: 'High schools', desc: 'Senior class jackets, letter awards and chenille patches for every sport and activity.' },
        { title: 'Colleges & Greek life', desc: 'Fraternity, sorority and alumni jackets with embroidered crests and Greek letters.' },
        { title: 'Sports teams & clubs', desc: 'Matching team jackets with player names and numbers, priced by volume from ten pieces.' },
        { title: 'Companies & brands', desc: 'Staff, merch and event jackets carrying your logo in chenille, embroidery or print.' },
      ],
      faqs: [
        { q: 'How long does shipping take within the U.S.?', a: 'Production is 2–3 weeks depending on decoration, then 4–5 business days by DHL or FedEx with tracking. Rush production in 7–10 days is available.' },
        { q: 'Is shipping really free?', a: `${freeOver ? `Yes, on orders over ${freeOver}. ` : ''}${single ? `Shipping a single jacket within the U.S. is ${money(single.rate)}, and larger orders are priced per order at checkout. ` : rates && !rates.enabled ? 'Shipping is free on every order at the moment. ' : 'Shipping is priced per order at checkout. '}Orders under $800 are duty-free into the United States.` },
        { q: 'Can my school pay by purchase order?', a: 'Yes. Schools, districts and universities can order on a PO; we invoice with net 30 terms after the proof is approved.' },
        { q: 'Do you have a minimum order?', a: 'No. Order one jacket or two hundred. Team pricing begins at ten jackets and improves at 25, 50 and 100.' },
      ] };
  }

  const { audiences, empty, faqs, popular, query, regions, search } = renderVals();

  return (
    <div className="pg-united-states">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* US header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>United States</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,440px)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Custom letterman jackets · All 50 states
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Custom varsity jackets across America
            </h1>
            <p style={{ maxWidth: '56ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '17px' }}>
              We make custom letterman and varsity jackets for high schools, colleges, sports teams, bands and companies in every U.S. state. Design yours online, get a free proof, and have it shipped to your door in two to three weeks. No minimum order.
            </p>
            <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '26px' }}>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '50px', fontSize: '20px' }}>Design a jacket now</A>
              <A href="/bulk-order" className="ez-btn" style={{ minHeight: '50px', fontSize: '20px' }}>Get a team quote</A>
            </div>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="us-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* US stats */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '26px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,60px)', lineHeight: '1' }}>50</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              States served
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,60px)', lineHeight: '1' }}>1</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Minimum order
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,60px)', lineHeight: '1' }}>
              2–3
              <span style={{ fontSize: '0.5em' }}>{' '}wks</span>
            </div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              Production time
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '14px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,60px)', lineHeight: '1' }}>Free</div>
            <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
              {freeOver ? `Proof & shipping over ${freeOver}` : 'Design proof'}
            </div>
          </div>
        </div>
      </section>
      {/* Popular states */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          Where we ship most
        </h2>
        <div className="us-top">
          {popular.map((p) => (
            <A key={p.code} href={statePath(p.name)} className="ez-card us-top-card">
              <span className="us-top-code">{p.code}</span>
              <span className="us-top-name">{p.name}</span>
              <span className="us-top-note">{p.note}</span>
              <span className="us-top-arrow" aria-hidden="true">→</span>
            </A>
          ))}
        </div>
      </section>
      {/* All states */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '22px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            All 50 states
          </h2>
          <input className="ez-input" value={query} onChange={search} placeholder="Search your state…" style={{ maxWidth: '280px' }} />
        </div>
        <div style={{ display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
          {regions.map((r, rIdx) => (
            <div key={rIdx}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)', borderBottom: '2px solid var(--ink)', paddingBottom: '10px' }}>
                {r.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '2px 20px', marginTop: '14px' }}>
                {r.states.map((s, sIdx) => (
                  <A key={sIdx} href={statePath(s.name)} className="ez-state" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', padding: '9px 0', borderBottom: '1px solid var(--cream-2)', textDecoration: 'none', color: 'inherit', fontWeight: '600', fontSize: '16px' }}>
                    {s.name}
                    <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>{s.abbr}</span>
                  </A>
                ))}
              </div>
            </div>
          ))}
        </div>
        {empty ? (
          <p style={{ margin: '24px 0 0', color: 'var(--muted)' }}>
            No state matches that search.{' '}
            <A href="/contact-us" style={{ color: 'inherit' }}>Contact us</A>
            {' '}and we'll sort it out.
          </p>
        ) : null}
      </section>
      {/* Who we make for */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>
          Who we make jackets for
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '26px' }}>
          {audiences.map((a, aIdx) => (
            <div key={aIdx} style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                {a.title}
              </div>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', fontSize: '14px' }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* US FAQ */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '24px clamp(24px,4vw,72px)' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
          Ordering from the U.S.
        </h2>
        <div>
          {faqs.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Anywhere in the 50 states
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Start your jacket today
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Build it online in minutes, approve a free digital proof, and we ship straight to your school, team or door.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Design your jacket</A>
            <A href="/bulk-order" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Team pricing →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
