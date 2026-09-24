// Converted from design/Easy Jackets Order Confirmation.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const ITEMS = [
    { id: 'c1', name: 'Classic Wool & Leather Varsity', spec: 'Navy melton body · Cream cowhide sleeves · Size L', extras: 'Chenille "L" · Name "Jordan" · Back logo', price: 189, qty: 1, src: 'https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
    { id: 'c2', name: 'Satin Baseball Jacket', spec: 'Black satin · Gold rib trim · Size M', extras: 'Sleeve number "24"', price: 112, qty: 2, src: 'https://clothoo.com/frontend/images/home/customize-your-jacket.jpg' },
  ];

export default function OrderConfirmation() {

  function cartTotals(items, promo, ship) {
    const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
    const disc = promo === 'TEAM10' ? Math.round(sub * 0.10) : 0;
    const shipCost = ship === 'express' ? 39 : (sub - disc >= 150 ? 0 : 19);
    return { sub, disc, shipCost, total: sub - disc + shipCost, count: items.reduce((a, i) => a + i.qty, 0) };
  }

  function renderVals() {
    const items = ITEMS, t = cartTotals(items, '', 'standard');
    return { footerNoop: e => e.preventDefault(), cartCount: 0, items: items.map(i => ({ ...i, slot: 'cf-' + i.id, lineTotal: '$' + i.price * i.qty })), sub: '$' + t.sub, shipLabel: t.shipCost ? '$' + t.shipCost : 'Free', total: '$' + t.total };
  }

  const { cartCount, items, shipLabel, sub, total } = renderVals();

  return (
    <div className="pg-order-confirmation">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Confirmation */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
              Order EJ-48213 · Confirmed
            </div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
              Thank you,
              <br />
              <span style={{ color: 'var(--gold-2)' }}>Jordan.</span>
            </h1>
            <p style={{ maxWidth: '48ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '17px' }}>
              Your order is in. A confirmation is on its way to{' '}
              <strong>jordan@example.com</strong>
              . Next, our artists draw up your digital proof — expect it within 2 business days. Nothing is cut until you approve it.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
              <A href="/track-order" className="ez-btn ez-btn-ink">Track this order</A>
              <A href="/shop" className="ez-btn">Keep shopping</A>
            </div>
          </div>
          <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '18px' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
              Order summary
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {items.map((i, iIdx) => (
                <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) auto', gap: '14px', alignItems: 'center' }}>
                  <div style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                    <ImageSlot slot={i.slot} shape="rect" src={i.src} placeholder="Jacket" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name} × {i.qty}</div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px' }}>
                <span style={{ fontWeight: '600' }}>Paid</span>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{total}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px', lineHeight: '1.5', borderTop: '1px solid var(--cream-2)', paddingTop: '16px' }}>
              <div>
                <div style={{ fontWeight: '600' }}>Ships to</div>
                <div style={{ color: 'var(--muted)' }}>
                  Jordan Lee
                  <br />
                  412 Maple Ave
                  <br />
                  Austin, TX 78701
                </div>
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>Payment</div>
                <div style={{ color: 'var(--muted)' }}>
                  Visa ending 4242
                  <br />
                  Standard delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Next steps */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          What happens next
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>01</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Proof in 2 days
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              A digital illustration of your exact jacket lands in your inbox. Reply with changes or approve.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>02</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Cutting & stitching
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              2–3 weeks in the workshop. We send a photo when it comes off the bench.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>03</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Shipped & tracked
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              DHL or FedEx, 4–5 business days, tracking number by email and on the order page.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>04</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Wear it
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Wrong size? One free exchange. Tag @easyjackets to be featured in the gallery.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
