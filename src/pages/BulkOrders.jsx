// Converted from design/Easy Jackets Bulk.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './BulkOrders.css';

const INITIAL_STATE = { org: 'School', addons: ['Names', 'Chenille letter'], sent: false, sentName: '' };

export default function BulkOrders() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const footerNoop = e => e.preventDefault();
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/';
    const s = state;
    return {
      footerNoop,
      notSent: !s.sent, sent: s.sent, sentName: s.sentName || 'there',
      orgTypes: ['School', 'Sports team', 'Business', 'Club', 'Event', 'Other'].map(l => ({ label: l, active: s.org === l, select: () => setState({ org: l }) })),
      addons: ['Names', 'Numbers', 'Chenille letter', 'Back logo', 'Sleeve patches', 'Custom lining'].map(l => ({ label: l, active: s.addons.includes(l), toggle: () => setState({ addons: s.addons.includes(l) ? s.addons.filter(x => x !== l) : [...s.addons, l] }) })),
      submit: e => { e.preventDefault(); const name = (new FormData(e.target).get('name') || '').split(' ')[0]; setState({ sent: true, sentName: name }); },
      reset: () => setState({ sent: false }),
      segments: [
        { slot: 'seg-1', name: 'Schools', desc: 'Letterman jackets for athletics, band and class of ’27.', src: TJM + 'School_1024x1024.webp?v=1775220778' },
        { slot: 'seg-2', name: 'Teams', desc: 'Matching colors, individual names and numbers.', src: TJM + 'Team_1024x1024.webp?v=1775220777' },
        { slot: 'seg-3', name: 'Businesses', desc: 'Branded jackets for staff, launches and gifting.', src: TJM + 'Brand_63f92eec-0544-42c1-8c33-0fe8dd40f4eb_1024x1024.webp?v=1775220871' },
        { slot: 'seg-4', name: 'Clubs', desc: 'Car clubs, fraternities, esports and alumni groups.', src: 'https://clothoo.com/frontend/images/customer-photos/maroon-gold-varsity-jackets-with-hockey-crossed-sticks-logo-student-group-clothoo-600x395.jpg' },
      ],
      tiers: [
        { range: '10–24 jackets', note: 'Mixed sizes and colors', off: '10% off', from: '$135' },
        { range: '25–49 jackets', note: 'Free physical sample', off: '15% off', from: '$127' },
        { range: '50–99 jackets', note: 'Dedicated specialist', off: '20% off', from: '$120' },
        { range: '100+ jackets', note: 'Pantone matching included', off: 'Up to 30% off', from: '$105' },
      ],
      faqs: [
        { q: 'What is the minimum for bulk pricing?', a: 'Ten jackets. Below that you can still order any quantity at regular price — there is no minimum order.' },
        { q: 'Can everyone have a different size, name and number?', a: 'Yes. Send a roster sheet and each jacket is made and labelled individually. Mixed sizes and colors count toward the same volume tier.' },
        { q: 'Can you match our school colors exactly?', a: 'We stock 40+ wool and leather colors and can Pantone-match rib knit and lining on orders of 100+. Send a swatch or code and we will confirm the closest match on the mockup.' },
        { q: 'How long does a team order take?', a: 'Typically 3–4 weeks in production after mockup approval, plus 4–5 business days shipping. Tell us your deadline and we will confirm before you commit.' },
        { q: 'Do you offer samples?', a: 'A free digital mockup for every quote. A physical sample jacket is available on orders of 25 or more, credited back against the order.' },
        { q: 'How do payment and invoicing work?', a: '50% deposit to start production, balance before shipping. We issue invoices and W-9s for schools and businesses, and accept purchase orders from institutions.' },
      ],
    };
  }

  const { addons, faqs, notSent, orgTypes, reset, segments, sent, sentName, submit, tiers } = renderVals();

  return (
    <div className="pg-bulk-orders">
      <Nav active="/bulk-orders" cta="shop" />
      {/* hero + form */}
      {/* Bulk hero */}
      <section className="ez-bulk" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
            <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Bulk orders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '24px' }}>
            <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
            Schools · Teams · Businesses · Clubs
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,7.5vw,108px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
            Bulk varsity
            <br />
            & custom
            <br />
            <span style={{ color: 'var(--gold-2)' }}>jacket orders</span>
          </h1>
          <p style={{ maxWidth: '48ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '17px' }}>
            Order custom varsity jackets in bulk for your school, team, business, club or organization. Tell us the colors, the roster and the date — we handle the sizing run, individual names and numbers, and one shipment to your door.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '20px 28px', marginTop: '36px' }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                10
                <span style={{ color: 'var(--gold)' }}>+</span>
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Jackets for bulk pricing
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                Up to 30
                <span style={{ color: 'var(--gold)' }}>%</span>
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Volume discount
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>Free</div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Design proof & mockup
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                3
                <span style={{ color: 'var(--gold)' }}>–</span>
                4 wks
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Typical team turnaround
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', marginTop: '44px' }}>
            <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="bulk-hero" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Team_1024x1024.webp?v=1775220777" placeholder="Team in matching jackets" />
            </div>
          </div>
        </div>
        {/* form */}
        <div className="ez-form-side" style={{ position: 'sticky', top: '104px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          {notSent ? (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                Free quote · replies within 1 business day
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,44px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                Request a bulk quote
              </h2>
              <form onSubmit={submit} style={{ display: 'grid', gap: '18px', marginTop: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Full name
                    <input className="ez-input" name="name" required placeholder="Jordan Lee" />
                  </label>
                  <label className="ez-label">
                    Organization
                    <input className="ez-input" name="org" required placeholder="Lincoln High School" />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Email
                    <input className="ez-input" type="email" name="email" required placeholder="you@school.edu" />
                  </label>
                  <label className="ez-label">
                    Phone
                    <input className="ez-input" type="tel" name="phone" placeholder="+1 (555) 000-0000" />
                  </label>
                </div>
                <div className="ez-label">
                  Order type
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {orgTypes.map((o, oIdx) => (
                      <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.select}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Jacket type
                    <select className="ez-input" name="type">
                      <option>Wool & leather varsity</option>
                      <option>All-wool varsity</option>
                      <option>All-leather varsity</option>
                      <option>Satin baseball</option>
                      <option>Bomber</option>
                      <option>Coach jacket</option>
                      <option>Fleece hoodie</option>
                      <option>Not sure yet</option>
                    </select>
                  </label>
                  <label className="ez-label">
                    Quantity
                    <select className="ez-input" name="qty">
                      <option>10–24</option>
                      <option>25–49</option>
                      <option>50–99</option>
                      <option>100–249</option>
                      <option>250+</option>
                    </select>
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Needed by
                    <input className="ez-input" type="date" name="date" />
                  </label>
                  <label className="ez-label">
                    Budget per jacket
                    <select className="ez-input" name="budget">
                      <option>Under $100</option>
                      <option>$100–150</option>
                      <option>$150–200</option>
                      <option>$200+</option>
                      <option>Flexible</option>
                    </select>
                  </label>
                </div>
                <div className="ez-label">
                  Personalization
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {addons.map((o, oIdx) => (
                      <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.toggle}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <label className="ez-label">
                  Details
                  <textarea className="ez-input" name="details" placeholder="School colors, sizes, logo placement, anything else…" />
                </label>
                <label className="ez-label">
                  Logo or artwork
                  <span className="ez-drop">
                    <strong style={{ color: 'var(--ink)' }}>Upload files</strong>
                    {' '}or drag them here · PNG, JPG, PDF, AI, SVG up to 20 MB
                    <input type="file" multiple accept="image/*,.pdf,.ai,.svg" style={{ display: 'none' }} />
                  </span>
                </label>
                <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }}>Get my quote →</button>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  No commitment. We'll send pricing, a free mockup and a production timeline. By submitting you agree to be contacted about your order.
                </p>
              </form>
            </>
          ) : null}
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', margin: '0 auto', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px' }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '0.9', textTransform: 'uppercase', margin: '20px 0 0' }}>
                Request received
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '14px auto 0', maxWidth: '36ch' }}>
                Thanks, {sentName}. A team specialist will email pricing and a free mockup within one business day.
              </p>
              <button type="button" className="ez-btn" onClick={reset} style={{ marginTop: '24px' }}>Send another request</button>
            </div>
          ) : null}
        </div>
      </section>
      {/* who we serve */}
      {/* Who */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Who orders in bulk
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 36px' }}>
          One jacket, the whole crew
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
          {segments.map((s, sIdx) => (
            <div key={sIdx} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', color: 'var(--cream)' }}>
              <div style={{ position: 'absolute', inset: '0', opacity: '0.8' }}>
                <ImageSlot slot={s.slot} shape="rect" src={s.src} placeholder={s.name} />
              </div>
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '20px', background: 'linear-gradient(to top,rgba(20,17,15,0.92),transparent)' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                  {s.name}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: '1.5', color: 'rgba(244,239,230,0.85)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* pricing tiers */}
      {/* Pricing */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Volume pricing
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            More jackets, lower price
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '40ch' }}>
            Discounts apply to the whole order, mixed sizes and colors included. Names, numbers and patches are priced once per design, not per jacket.
          </p>
        </div>
        <div style={{ display: 'grid', gap: '0' }}>
          {tiers.map((t, tIdx) => (
            <div key={tIdx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', gap: '16px 24px', alignItems: 'baseline', padding: '18px 0', borderTop: '1px solid var(--ink)' }}>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '1', textTransform: 'uppercase' }}>
                  {t.range}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{t.note}</div>
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', color: 'var(--gold-2)' }}>{t.off}</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                from{' '}
                <strong style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', color: 'var(--ink)' }}>{t.from}</strong>
                /jacket
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* process */}
      {/* Process */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          How a team order works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>01</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Request a quote
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Send colors, logo, quantity and date. A specialist replies within one business day.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>02</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Approve the mockup
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Free digital proof of the exact jacket. A physical sample is available for orders of 25+.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>03</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Send the roster
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Names, numbers and sizes in a simple sheet. We double-check the sizing run with you.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>04</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              One delivery
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              3–4 weeks in production, labelled by name, shipped together to your office.
            </p>
          </div>
        </div>
      </section>
      {/* faq */}
      {/* FAQ */}
      <section id="faq" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            FAQ
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            Bulk order questions
          </h2>
        </div>
        <div>
          {faqs.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
