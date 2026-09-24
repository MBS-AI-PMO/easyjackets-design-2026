// Converted from design/Easy Jackets Track Order.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const ITEMS = [
    { id: 'c1', name: 'Classic Wool & Leather Varsity', spec: 'Navy melton body · Cream cowhide sleeves · Size L', extras: 'Chenille "L" · Name "Jordan" · Back logo', price: 189, qty: 1, src: 'https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
    { id: 'c2', name: 'Satin Baseball Jacket', spec: 'Black satin · Gold rib trim · Size M', extras: 'Sleeve number "24"', price: 112, qty: 2, src: 'https://clothoo.com/frontend/images/home/customize-your-jacket.jpg' },
  ];

const INITIAL_STATE = { orderNo: 'EJ-48213', found: true };

export default function TrackOrder() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function cartTotals(items, promo, ship) {
    const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
    const disc = promo === 'TEAM10' ? Math.round(sub * 0.10) : 0;
    const shipCost = ship === 'express' ? 39 : (sub - disc >= 150 ? 0 : 19);
    return { sub, disc, shipCost, total: sub - disc + shipCost, count: items.reduce((a, i) => a + i.qty, 0) };
  }

  function renderVals() {
    const s = state, cur = 2;
    const st = [['Order placed', 'Payment received; sent to the art team.', 'Sep 2'], ['Proof approved', 'You approved revision 2 of your digital proof.', 'Sep 4'], ['In production', 'Cutting, chenille and embroidery in the Sialkot workshop.', 'Sep 5 – ~Sep 19'], ['Shipped', 'Handed to DHL Express with tracking.', 'Est. Sep 19'], ['Delivered', 'Signed for at your door.', 'Est. Sep 24–26']];
    return { footerNoop: e => e.preventDefault(), cartCount: 0, orderNo: s.orderNo, setOrderNo: e => setState({ orderNo: e.target.value }), found: s.found,
      lookup: e => { e.preventDefault(); setState({ found: true }); },
      stages: st.map(([title, desc, when], i) => ({ title, desc, when, mark: i < cur ? '✓' : String(i + 1), bg: i < cur ? 'var(--ink)' : i === cur ? 'var(--gold)' : 'transparent', fg: i < cur ? 'var(--cream)' : 'var(--ink)', line: i < cur ? 'var(--ink)' : 'var(--cream-2)', color: i <= cur ? 'var(--ink)' : 'var(--muted)' })),
      items: ITEMS.map(i => ({ ...i, slot: 'tr-' + i.id })) };
  }

  const { cartCount, found, items, lookup, orderNo, setOrderNo, stages } = renderVals();

  return (
    <div className="pg-track-order">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Track order header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Track order</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Where’s my
              <br />
              jacket?
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Enter your order number and email to see where your jacket is — from proof to your door.
            </p>
          </div>
        </div>
      </section>
      {/* Track form */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,48px) clamp(16px,4vw,48px) 0' }}>
        <form onSubmit={lookup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', maxWidth: '820px', alignItems: 'end' }}>
          <label className="ez-label">
            Order number
            <input className="ez-input" value={orderNo} onChange={setOrderNo} placeholder="EJ-48213" required />
          </label>
          <label className="ez-label">
            Email
            <input className="ez-input" type="email" placeholder="you@example.com" required />
          </label>
          <button type="submit" className="ez-btn ez-btn-ink" style={{ minHeight: '50px' }}>Track →</button>
        </form>
      </section>
      {/* Order status */}
      {found ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }} className="ez-two">
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Order {orderNo}
              </h2>
              <span style={{ background: 'var(--gold)', padding: '6px 12px', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                In production
              </span>
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: '15px' }}>
              Placed Sep 2, 2026 · Estimated delivery{' '}
              <strong style={{ color: 'var(--ink)' }}>Sep 24–26</strong>
            </p>
            <div style={{ display: 'grid', gap: '0', marginTop: '36px' }}>
              {stages.map((s, sIdx) => (
                <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '18px' }}>
                  <div style={{ display: 'grid', justifyItems: 'center' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', background: s.bg, color: s.fg, border: '2px solid var(--ink)' }}>
                      {s.mark}
                    </div>
                    <div style={{ width: '2px', flex: '1', background: s.line, minHeight: '40px' }} />
                  </div>
                  <div style={{ paddingBottom: '28px' }}>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', lineHeight: '1', textTransform: 'uppercase', color: s.color }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px', lineHeight: '1.5' }}>{s.desc}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{s.when}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Items
              </h3>
              {items.map((i, iIdx) => (
                <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: '14px', alignItems: 'center' }}>
                  <div style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                    <ImageSlot slot={i.slot} shape="rect" src={i.src} placeholder="Jacket" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name} × {i.qty}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{i.spec}</div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--ink)', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', lineHeight: '1.5' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Ships to</div>
                  <div style={{ color: 'var(--muted)' }}>
                    Jordan Lee
                    <br />
                    Austin, TX 78701
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Carrier</div>
                  <div style={{ color: 'var(--muted)' }}>
                    DHL Express
                    <br />
                    Tracking number when shipped
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: '24px', display: 'grid', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Need a change?
              </div>
              <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.55', color: 'rgba(244,239,230,0.8)' }}>
                Size changes are possible up to 48 hours after proof approval. Address changes until the jacket ships.
              </p>
              <A href="/contact" className="ez-btn ez-btn-gold" style={{ justifySelf: 'start', minHeight: '44px', fontSize: '17px' }}>
                Contact support
              </A>
            </div>
          </div>
        </section>
      ) : null}
      <div style={{ height: '96px' }} />
      <Footer />
    </div>
  );
}
