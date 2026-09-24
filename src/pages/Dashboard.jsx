// Converted from design/Easy Jackets Dashboard.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Dashboard.css';

const INITIAL_STATE = { view: 'overview', filter: 'All', prefs: { proof: true, ship: true, promo: false } };

export default function Dashboard() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const s = state, go = v => () => setState({ view: v });
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/';
    const P = { prod: ['#efe0a8', '#5c4a08'], ship: ['#cfe3ec', '#12455c'], done: ['#d7e6d3', '#1f4a2f'], proof: ['#f0d9e2', '#6b1436'] };
    const orders = [
      { id: 'EJ-24812', status: 'In production', key: 'Open', tint: P.prod[0], ink: P.prod[1], items: 'Wool & Leather Varsity — Navy / Cream, L', date: '12 Sep 2026', eta: 'Est. 29 Sep', total: '$350.00', img: TJM + 'School_1024x1024.webp?v=1775220778' },
      { id: 'EJ-24655', status: 'Awaiting proof', key: 'Open', tint: P.proof[0], ink: P.proof[1], items: 'Satin Baseball Jacket — Black / Gold, M', date: '05 Sep 2026', eta: 'Proof due 16 Sep', total: '$132.00', img: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
      { id: 'EJ-23190', status: 'Delivered', key: 'Delivered', tint: P.done[0], ink: P.done[1], items: 'Cropped Varsity — Maroon / White, S', date: '14 Jun 2026', eta: 'Delivered 02 Jul', total: '$186.00', img: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
      { id: 'EJ-21044', status: 'Delivered', key: 'Delivered', tint: P.done[0], ink: P.done[1], items: 'Team order — 14 × Wool Varsity', date: '02 Feb 2026', eta: 'Delivered 25 Feb', total: '$2,184.00', img: TJM + 'Team_1024x1024.webp?v=1775220777' },
    ].map((o, i) => ({ ...o, slot: 'ord-' + i, open: go('order') }));
    const step = (title, note, when, state) => ({ title, note, when,
      ring: state === 'todo' ? 'var(--cream-2)' : 'var(--ink)',
      fill: state === 'done' ? 'var(--ink)' : state === 'now' ? 'var(--gold)' : 'transparent',
      bar: state === 'todo' ? 'var(--cream-2)' : 'var(--ink)',
      titleColor: state === 'todo' ? 'var(--muted)' : 'var(--ink)' });
    return { footerNoop: e => e.preventDefault(), cartCount: 2,
      nav: [['overview', 'Overview', ''], ['orders', 'Orders', '4'], ['order', 'Tracking', '2 open'], ['designs', 'Designs', '3'], ['addresses', 'Addresses', '2'], ['profile', 'Profile', '']]
        .map(([v, label, count]) => ({ label, count, active: s.view === v, go: go(v) })),
      isOverview: s.view === 'overview', isOrders: s.view === 'orders', isOrder: s.view === 'order',
      isDesigns: s.view === 'designs', isAddresses: s.view === 'addresses', isProfile: s.view === 'profile',
      goOrder: go('order'), goOrders: go('orders'), goAddresses: go('addresses'),
      filters: ['All', 'Open', 'Delivered'].map(f => ({ label: f, active: s.filter === f, select: () => setState({ filter: f }) })),
      orders: orders.filter(o => s.filter === 'All' || o.key === s.filter),
      activity: [
        { date: '13 Sep 2026', text: 'Proof approved for EJ-24812 — production started', ref: 'EJ-24812' },
        { date: '12 Sep 2026', text: 'Order placed · paid by Visa ending 4412', ref: 'EJ-24812' },
        { date: '08 Sep 2026', text: 'Artwork received — our design team is drawing your proof', ref: 'EJ-24655' },
        { date: '02 Jul 2026', text: 'Delivered to Austin, TX — signed for by J. Lee', ref: 'EJ-23190' },
      ],
      steps: [
        step('Order placed', 'Payment confirmed, order queued for design.', '12 Sep, 4:02 pm', 'done'),
        step('Digital proof approved', 'You approved the front, back and sleeve layout.', '13 Sep, 9:41 am', 'done'),
        step('Cutting', 'Melton wool and cowhide panels cut to your size.', '15 Sep, 11:20 am', 'done'),
        step('Chenille & embroidery', 'Letters, name and sleeve number applied.', 'In progress', 'now'),
        step('Final stitching & QC', 'Assembly, lining, snaps and inspection.', 'Expected 24 Sep', 'todo'),
        step('Shipped', 'DHL Express with tracking to Austin, TX.', 'Expected 26 Sep', 'todo'),
      ],
      lines: [
        { slot: 'line-1', name: 'Wool & Leather Varsity', spec: 'Navy body / Cream sleeves · Size L · Chest letter "A" · Sleeve #12', price: '$328.00', img: TJM + 'School_1024x1024.webp?v=1775220778' },
        { slot: 'line-2', name: 'Add-ons', spec: 'Chenille back patch · Embroidered name "Jordan"', price: '$46.00', img: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      ],
      designs: [
        { slot: 'des-1', name: 'Austin High ’26', meta: 'Wool · Navy / Cream · edited 2 days ago', img: TJM + 'School_1024x1024.webp?v=1775220778' },
        { slot: 'des-2', name: 'All-black leather', meta: 'Sheep leather · edited 3 weeks ago', img: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
        { slot: 'des-3', name: 'Studio staff bomber', meta: 'Nylon · Black / Gold · edited in June', img: TJM + 'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
      ],
      addresses: [
        { label: 'Home', tag: 'Default', tint: '#efe0a8', ink: '#5c4a08', line1: 'Jordan Lee', line2: '1428 Brookside Ave, Apt 4C', line3: 'Austin, TX 78704, United States' },
        { label: 'School', tag: 'Team orders', tint: '#e9e1d2', ink: '#6b635a', line1: 'Austin High Athletics', line2: '1715 W Cesar Chavez St', line3: 'Austin, TX 78703, United States' },
      ],
      prefs: [
        { label: 'Proof & production updates', note: 'Email me at each stage of the build.', on: s.prefs.proof, toggle: () => setState({ prefs: { ...s.prefs, proof: !s.prefs.proof } }) },
        { label: 'Shipping notifications', note: 'Tracking number and delivery alerts by SMS.', on: s.prefs.ship, toggle: () => setState({ prefs: { ...s.prefs, ship: !s.prefs.ship } }) },
        { label: 'Offers & new materials', note: 'Occasional emails — no more than once a month.', on: s.prefs.promo, toggle: () => setState({ prefs: { ...s.prefs, promo: !s.prefs.promo } }) },
      ] };
  }

  const { activity, addresses, designs, filters, goAddresses, goOrder, goOrders, isAddresses, isDesigns, isOrder, isOrders, isOverview, isProfile, lines, nav, orders, prefs, steps } = renderVals();

  return (
    <div className="pg-dashboard">
      <Nav active="/faq" cta="shop" />
      {/* Dashboard header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>My account</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginTop: '14px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Member since 2023 · Gold tier
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7vw,96px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '6px 0 0' }}>
              Welcome back, Jordan
            </h1>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <A href="/design" className="ez-btn ez-btn-ink" style={{ minHeight: '46px', fontSize: '18px' }}>Design a jacket</A>
            <A href="/account" className="ez-btn" style={{ minHeight: '46px', fontSize: '18px' }}>Sign out</A>
          </div>
        </div>
      </section>
      {/* Dashboard */}
      <section className="ez-dash" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: '28px clamp(24px,4vw,56px)', alignItems: 'start' }}>
        <div className="ez-side" style={{ position: 'sticky', top: '104px', display: 'grid', gap: '2px' }}>
          {nav.map((n, nIdx) => (
            <button key={nIdx} type="button" aria-current={n.active} onClick={n.go}>
              {n.label}
              <span className="ez-side-n">{n.count}</span>
            </button>
          ))}
          <A href="/contact" style={{ marginTop: '14px', fontSize: '16px' }}>Need help? →</A>
        </div>
        <div style={{ display: 'grid', gap: 'clamp(32px,4vw,52px)' }}>
          {isOverview ? (
            <div style={{ display: 'grid', gap: 'clamp(32px,4vw,52px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '24px' }}>
                <div className="ez-stat">
                  <b>2</b>
                  <span>Open orders</span>
                </div>
                <div className="ez-stat">
                  <b>7</b>
                  <span>Jackets owned</span>
                </div>
                <div className="ez-stat">
                  <b>3</b>
                  <span>Saved designs</span>
                </div>
                <div className="ez-stat" style={{ borderTopColor: 'var(--gold)' }}>
                  <b>$148</b>
                  <span>Store credit</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                    Current order
                  </h2>
                  <button type="button" className="ez-chip" onClick={goOrder}>View full details →</button>
                </div>
                <div className="ez-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '26px clamp(24px,4vw,48px)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                    <div style={{ width: '110px', aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden', background: 'var(--cream-2)', flex: 'none' }}>
                      <ImageSlot slot="dash-current" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/School_1024x1024.webp?v=1775220778" placeholder="Jacket" />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        Order EJ-24812 · 12 Sep 2026
                      </div>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>
                        Wool & Leather Varsity
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>Navy / Cream · Size L · Qty 1</div>
                      <div style={{ marginTop: '10px' }}>
                        <span className="ez-pill" style={{ background: '#efe0a8', color: '#5c4a08' }}>
                          <i />
                          In production
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      <span>Proof approved</span>
                      <span>Est. 29 Sep</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', background: 'var(--cream-2)', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '55%', background: 'var(--gold)' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '12px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Proof</span>
                      <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Cutting</span>
                      <span>Stitching</span>
                      <span>Shipped</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                      <button type="button" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }} onClick={goOrder}>
                        Track order
                      </button>
                      <A href="/contact" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Message us</A>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 18px' }}>
                  Recent activity
                </h2>
                <div style={{ display: 'grid', gap: '0' }}>
                  {activity.map((a, aIdx) => (
                    <div key={aIdx} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: '18px', alignItems: 'baseline', padding: '14px 0', borderTop: '1px solid var(--cream-2)' }}>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{a.date}</div>
                      <div style={{ fontSize: '15px' }}>{a.text}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{a.ref}</div>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--cream-2)' }} />
                </div>
              </div>
            </div>
          ) : null}
          {isOrders ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                  Your orders
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {filters.map((f, fIdx) => (
                    <button key={fIdx} type="button" className="ez-chip" aria-pressed={f.active} onClick={f.select}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '18px' }}>
                {orders.map((o, oIdx) => (
                  <div key={oIdx} className="ez-panel" style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr) auto', gap: '20px', alignItems: 'center' }}>
                    <div style={{ aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                      <ImageSlot slot={o.slot} shape="rect" src={o.img} placeholder="Jacket" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', textTransform: 'uppercase' }}>
                          {o.id}
                        </span>
                        <span className="ez-pill" style={{ background: o.tint, color: o.ink }}>
                          <i />
                          {o.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', marginTop: '6px' }}>{o.items}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Placed {o.date} · {o.eta}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'grid', gap: '10px', justifyItems: 'end' }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px' }}>{o.total}</div>
                      <button type="button" className="ez-chip" onClick={o.open}>Details →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {isOrder ? (
            <div style={{ display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
              <div>
                <button type="button" className="ez-chip" onClick={goOrders}>← All orders</button>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,5.5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                      Order EJ-24812
                    </h2>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>
                      Placed 12 Sep 2026 · Est. delivery 29 Sep 2026 · DHL Express
                    </div>
                  </div>
                  <span className="ez-pill" style={{ background: '#efe0a8', color: '#5c4a08', fontSize: '14px', padding: '8px 16px' }}>
                    <i />
                    In production
                  </span>
                </div>
              </div>
              <div className="ez-panel">
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '22px' }}>
                  Tracking
                </div>
                <div style={{ display: 'grid', gap: '0' }}>
                  {steps.map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: '18px' }}>
                      <div style={{ display: 'grid', justifyItems: 'center', gap: '0' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `3px solid ${s.ring}`, background: s.fill }} />
                        <div style={{ width: '3px', flex: '1', minHeight: '38px', background: s.bar }} />
                      </div>
                      <div style={{ paddingBottom: '22px' }}>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', lineHeight: '1', color: s.titleColor }}>
                          {s.title}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>{s.note}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{s.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                  <A href="/track-order" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>Open carrier tracking</A>
                  <A href="/contact" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Ask about this order</A>
                </div>
              </div>
              <div className="ez-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '28px clamp(24px,4vw,48px)', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', textTransform: 'uppercase', margin: '0 0 14px' }}>
                    Items
                  </h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {lines.map((l, lIdx) => (
                      <div key={lIdx} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0,1fr) auto', gap: '16px', alignItems: 'center' }}>
                        <div style={{ aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                          <ImageSlot slot={l.slot} shape="rect" src={l.img} placeholder="Jacket" />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1' }}>
                            {l.name}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>{l.spec}</div>
                          <A href="/design" style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
                            View proof
                          </A>
                        </div>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{l.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', textTransform: 'uppercase', margin: '0 0 14px' }}>
                      Summary
                    </h3>
                    <div style={{ display: 'grid', gap: '10px', fontSize: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal</span>
                        <span>$328.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Chenille & embroidery</span>
                        <span>$46.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shipping (DHL Express)</span>
                        <span>Free</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-2)' }}>
                        <span>Gold tier discount</span>
                        <span>−$24.00</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '2px solid var(--ink)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', textTransform: 'uppercase' }}>
                          Total
                        </span>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px' }}>$350.00</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', textTransform: 'uppercase', margin: '0 0 14px' }}>
                      Shipping to
                    </h3>
                    <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
                      Jordan Lee
                      <br />
                      1428 Brookside Ave, Apt 4C
                      <br />
                      Austin, TX 78704
                      <br />
                      United States
                    </p>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <button type="button" className="ez-chip" onClick={goAddresses}>Change address</button>
                      <A href="/shipping-returns#exchanges" className="ez-chip" style={{ textDecoration: 'none' }}>Return policy</A>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {isDesigns ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                  Saved designs
                </h2>
                <A href="/design" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>New design</A>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '24px' }}>
                {designs.map((d, dIdx) => (
                  <div key={dIdx} className="ez-card" style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                      <ImageSlot slot={d.slot} shape="rect" src={d.img} placeholder="Design" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', lineHeight: '1' }}>
                        {d.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '5px' }}>{d.meta}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <A href="/design" className="ez-chip" style={{ textDecoration: 'none' }}>Edit</A>
                      <A href="/cart" className="ez-chip" style={{ textDecoration: 'none' }}>Order</A>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {isAddresses ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                  Addresses
                </h2>
                <button type="button" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>Add address</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
                {addresses.map((a, aIdx) => (
                  <div key={aIdx} className="ez-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>
                        {a.label}
                      </div>
                      <span className="ez-pill" style={{ background: a.tint, color: a.ink }}>
                        <i />
                        {a.tag}
                      </span>
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
                      {a.line1}
                      <br />
                      {a.line2}
                      <br />
                      {a.line3}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                      <button type="button" className="ez-chip">Edit</button>
                      <button type="button" className="ez-chip">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {isProfile ? (
            <div style={{ display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 20px' }}>
                  Profile
                </h2>
                <div className="ez-panel" style={{ display: 'grid', gap: '18px', maxWidth: '640px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label className="ez-label">
                      First name
                      <input className="ez-input" defaultValue="Jordan" />
                    </label>
                    <label className="ez-label">
                      Last name
                      <input className="ez-input" defaultValue="Lee" />
                    </label>
                  </div>
                  <label className="ez-label">
                    Email
                    <input className="ez-input" type="email" defaultValue="jordan.lee@example.com" />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label className="ez-label">
                      Phone
                      <input className="ez-input" type="tel" defaultValue="+1 512 555 0144" />
                    </label>
                    <label className="ez-label">
                      Preferred size
                      <select className="ez-input" defaultValue="L">
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                      </select>
                    </label>
                  </div>
                  <button type="button" className="ez-btn ez-btn-ink" style={{ justifySelf: 'start', minHeight: '46px', fontSize: '18px' }}>
                    Save changes
                  </button>
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Measurements on file
                </h2>
                <div className="ez-wrap">
                  <table className="ez-table">
                    <thead>
                      <tr>
                        <th>Measure</th>
                        <th>Value</th>
                        <th>Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Chest</td>
                        <td>42 in</td>
                        <td>Mar 2026</td>
                      </tr>
                      <tr>
                        <td>Sleeve</td>
                        <td>25 in</td>
                        <td>Mar 2026</td>
                      </tr>
                      <tr>
                        <td>Body length</td>
                        <td>27 in</td>
                        <td>Mar 2026</td>
                      </tr>
                      <tr>
                        <td>Shoulder</td>
                        <td>19 in</td>
                        <td>Mar 2026</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <A href="/size-chart" className="ez-chip" style={{ textDecoration: 'none' }}>How to measure</A>
                  <button type="button" className="ez-chip">Update measurements</button>
                </div>
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(34px,4vw,48px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 16px' }}>
                  Notifications
                </h2>
                <div style={{ display: 'grid', gap: '12px', maxWidth: '640px' }}>
                  {prefs.map((p, pIdx) => (
                    <label key={pIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '14px 0', borderTop: '1px solid var(--cream-2)', cursor: 'pointer' }}>
                      <span>
                        <span style={{ fontWeight: '600', fontSize: '16px' }}>{p.label}</span>
                        <br />
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.note}</span>
                      </span>
                      <input type="checkbox" checked={p.on} onChange={p.toggle} style={{ width: '22px', height: '22px', accentColor: 'var(--gold)', flex: 'none' }} />
                    </label>
                  ))}
                  <div style={{ borderTop: '1px solid var(--cream-2)' }} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
}
