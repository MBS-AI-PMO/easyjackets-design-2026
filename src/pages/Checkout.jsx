// Converted from design/Easy Jackets Checkout.dc.html
import { useNavigate } from 'react-router-dom';
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const ITEMS = [
    { id: 'c1', name: 'Classic Wool & Leather Varsity', spec: 'Navy melton body · Cream cowhide sleeves · Size L', extras: 'Chenille "L" · Name "Jordan" · Back logo', price: 189, qty: 1, src: 'https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
    { id: 'c2', name: 'Satin Baseball Jacket', spec: 'Black satin · Gold rib trim · Size M', extras: 'Sleeve number "24"', price: 112, qty: 2, src: 'https://clothoo.com/frontend/images/home/customize-your-jacket.jpg' },
  ];

const INITIAL_STATE = { ship: 'standard', pay: 'card' };

export default function Checkout() {
  const [state, setState] = useDcState(INITIAL_STATE);
  const navigate = useNavigate();

  function cartTotals(items, promo, ship) {
    const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
    const disc = promo === 'TEAM10' ? Math.round(sub * 0.10) : 0;
    const shipCost = ship === 'express' ? 39 : (sub - disc >= 150 ? 0 : 19);
    return { sub, disc, shipCost, total: sub - disc + shipCost, count: items.reduce((a, i) => a + i.qty, 0) };
  }

  function renderVals() {
    const s = state, items = ITEMS, t = cartTotals(items, '', s.ship);
    return {
      footerNoop: e => e.preventDefault(), cartCount: t.count,
      items: items.map(i => ({ ...i, slot: 'co-' + i.id, lineTotal: '$' + i.price * i.qty })),
      shipOpts: [['standard', 'Standard · DHL / FedEx', '4–5 business days, tracked', t.sub >= 150 ? 'Free' : '$19'], ['express', 'Express', '2–3 business days, tracked', '$39']].map(([v, label, desc, price]) => ({ label, desc, price, active: s.ship === v, select: () => setState({ ship: v }) })),
      payOpts: [['card', 'Credit or debit card', 'Visa · MC · Amex'], ['paypal', 'PayPal', 'Redirect'], ['wallet', 'Apple Pay / Google Pay', 'One tap']].map(([v, label, hint]) => ({ label, hint, active: s.pay === v, select: () => setState({ pay: v }) })),
      isCard: s.pay === 'card',
      sub: '$' + t.sub, shipLabel: t.shipCost ? '$' + t.shipCost : 'Free', total: '$' + t.total,
      place: e => { e.preventDefault(); navigate('/order-confirmation'); },
    };
  }

  const { cartCount, isCard, items, payOpts, place, shipLabel, shipOpts, sub, total } = renderVals();

  return (
    <div className="pg-checkout">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Checkout */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(300px,4fr)', gap: '40px clamp(24px,5vw,72px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
            <A href="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>Cart</A>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Checkout</span>
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6vw,84px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '16px 0 0' }}>
            Checkout
          </h1>
          <form onSubmit={place} style={{ display: 'grid', gap: '40px', marginTop: '36px' }}>
            <div style={{ display: 'grid', gap: '18px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--gold-2)' }}>01</span>
                {' '}Contact
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <label className="ez-label">
                  Email
                  <input className="ez-input" type="email" name="email" required placeholder="you@example.com" />
                </label>
                <label className="ez-label">
                  Phone
                  <input className="ez-input" type="tel" name="phone" placeholder="For delivery updates" />
                </label>
              </div>
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--muted)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ink)', width: '18px', height: '18px' }} />
                {' '}Email me the design proof and order updates
              </label>
            </div>
            <div style={{ display: 'grid', gap: '18px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--gold-2)' }}>02</span>
                {' '}Shipping address
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <label className="ez-label">
                  First name
                  <input className="ez-input" name="first" required />
                </label>
                <label className="ez-label">
                  Last name
                  <input className="ez-input" name="last" required />
                </label>
              </div>
              <label className="ez-label">
                Address
                <input className="ez-input" name="addr" required placeholder="Street and number" />
              </label>
              <label className="ez-label">
                Apartment, suite (optional)
                <input className="ez-input" name="addr2" />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px' }}>
                <label className="ez-label">
                  City
                  <input className="ez-input" name="city" required />
                </label>
                <label className="ez-label">
                  State
                  <input className="ez-input" name="state" />
                </label>
                <label className="ez-label">
                  ZIP
                  <input className="ez-input" name="zip" required />
                </label>
              </div>
              <label className="ez-label">
                Country
                <select className="ez-input" name="country">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--gold-2)' }}>03</span>
                {' '}Delivery
              </h2>
              {shipOpts.map((o, oIdx) => (
                <div key={oIdx} className="ez-radio" role="radio" aria-checked={o.active} onClick={o.select}>
                  <span className="dot" />
                  <div style={{ flex: '1' }}>
                    <div style={{ fontWeight: '600' }}>{o.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{o.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>{o.price}</div>
                </div>
              ))}
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--muted)' }}>
                Production time (2–3 weeks, or 7–10 days with rush) is in addition to delivery.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--gold-2)' }}>04</span>
                {' '}Payment
              </h2>
              {payOpts.map((o, oIdx) => (
                <div key={oIdx} className="ez-radio" role="radio" aria-checked={o.active} onClick={o.select}>
                  <span className="dot" />
                  <div style={{ flex: '1', fontWeight: '600' }}>{o.label}</div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{o.hint}</div>
                </div>
              ))}
              {isCard ? (
                <div style={{ display: 'grid', gap: '14px', padding: '18px', border: '1.5px solid var(--cream-2)', borderRadius: '2px', background: '#fbf8f2' }}>
                  <label className="ez-label">
                    Card number
                    <input className="ez-input" inputMode="numeric" placeholder="1234 1234 1234 1234" required />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                    <label className="ez-label">
                      Expiry
                      <input className="ez-input" placeholder="MM / YY" required />
                    </label>
                    <label className="ez-label">
                      CVC
                      <input className="ez-input" placeholder="123" required />
                    </label>
                    <label className="ez-label">
                      ZIP
                      <input className="ez-input" placeholder="Billing" />
                    </label>
                  </div>
                  <label className="ez-label">
                    Name on card
                    <input className="ez-input" required />
                  </label>
                </div>
              ) : null}
              <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--muted)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ink)', width: '18px', height: '18px' }} />
                {' '}Billing address same as shipping
              </label>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%', minHeight: '60px', fontSize: '22px' }}>
                Place order · {total}
              </button>
              <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.55' }}>
                You'll receive a digital proof by email within 2 business days. Nothing is cut until you approve it. By placing this order you agree to our{' '}
                <A href="/terms" style={{ color: 'inherit' }}>Terms</A>
                {' '}and{' '}
                <A href="/shipping-returns#exchanges" style={{ color: 'inherit' }}>Returns policy</A>
                .
              </p>
            </div>
          </form>
        </div>
        <div className="ez-side" style={{ position: 'sticky', top: '110px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
              Order
            </h2>
            <A href="/cart" style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
              Edit
            </A>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {items.map((i, iIdx) => (
              <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) auto', gap: '14px', alignItems: 'center' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                  <ImageSlot slot={i.slot} shape="rect" src={i.src} placeholder="Jacket" />
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--ink)', color: 'var(--cream)', fontSize: '11px', fontWeight: '700', width: '20px', height: '20px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                    {i.qty}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{i.spec}</div>
                </div>
                <div style={{ fontWeight: '600' }}>{i.lineTotal}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: '10px', fontSize: '15px', borderTop: '1px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>{sub}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Shipping</span>
              <span>{shipLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Taxes</span>
              <span>Calculated at delivery</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px', marginTop: '4px' }}>
              <span style={{ fontWeight: '600' }}>Total</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{total}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            <div>🔒 Secure checkout · SSL encrypted</div>
            <div>✓ Free digital proof · one free size exchange</div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
