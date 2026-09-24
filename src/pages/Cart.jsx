// Converted from design/Easy Jackets Cart.dc.html
import { useDcState } from '../lib/useDcState';
import { useEffect } from 'react';
import { usePageProps } from '../lib/usePageProps';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const PAGE_PROPS = {
  scenario: { type: 'enum', options: ["filled","team","empty"], default: "filled" },
  showShippingBar: { type: 'boolean', default: true },
  showCrossSell: { type: 'boolean', default: false },
};

const ITEMS = [
    { id: 'c1', name: 'Classic Wool & Leather Varsity', spec: 'Navy melton body · Cream cowhide sleeves · Size L', extras: 'Chenille "L" · Name "Jordan" · Back logo', price: 189, qty: 1, src: 'https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
    { id: 'c2', name: 'Satin Baseball Jacket', spec: 'Black satin · Gold rib trim · Size M', extras: 'Sleeve number "24"', price: 112, qty: 2, src: 'https://clothoo.com/frontend/images/home/customize-your-jacket.jpg' },
  ];
const TEAM = [
    { id: 't1', name: 'Wool Varsity — Team Build', spec: 'Maroon melton body · Cream wool sleeves · Mixed sizes S–2XL', extras: 'Chenille "N" · Individual names & numbers · Crossed-sticks back patch', price: 135, qty: 24, src: 'https://www.thejacketmaker.pk/cdn/shop/files/Team_1024x1024.webp?v=1775220777' },
    { id: 't2', name: 'Wool Varsity — Coaches', spec: 'Maroon melton body · Cream wool sleeves · L, XL', extras: 'Chenille "N" · "COACH" embroidery', price: 135, qty: 6, src: 'https://www.thejacketmaker.pk/cdn/shop/files/School_1024x1024.webp?v=1775220778' },
  ];

const INITIAL_STATE = { items: null, promoInput: '', promo: '', promoMsg: '', scenario: null };

// The cart contents follow the `scenario` prop (filled / team / empty).
const scenarioState = (scenario) => ({
  items: scenario === 'empty' ? [] : scenario === 'team' ? TEAM : ITEMS,
  scenario,
  promo: scenario === 'team' ? 'TEAM10' : '',
  promoMsg: scenario === 'team' ? 'TEAM10 applied — 10% off' : '',
});

export default function Cart() {
  const props = usePageProps(PAGE_PROPS);
  const scenario = props.scenario ?? 'filled';
  const [state, setState] = useDcState({ ...INITIAL_STATE, ...scenarioState(scenario) });
  useEffect(() => {
    setState((prev) => (prev.scenario === scenario ? prev : scenarioState(scenario)));
  }, [scenario, setState]);

  function cartTotals(items, promo, ship) {
    const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
    const disc = promo === 'TEAM10' ? Math.round(sub * 0.10) : 0;
    const shipCost = ship === 'express' ? 39 : (sub - disc >= 150 ? 0 : 19);
    return { sub, disc, shipCost, total: sub - disc + shipCost, count: items.reduce((a, i) => a + i.qty, 0) };
  }

  function renderVals() {
    const s = state, t = cartTotals(s.items, s.promo, 'standard');
    const showShipBar = (props.showShippingBar ?? true) && s.items.length > 0;
    const remaining = Math.max(0, 150 - (t.sub - t.disc));
    const addons = [
      { slot: 'ad-1', name: 'Extra chenille patch', price: '$18', src: 'https://clothoo.com/frontend/images/home/custom-chenille-triple-felt-clothoo.jpg' },
      { slot: 'ad-2', name: 'Sleeve number embroidery', price: '$9', src: 'https://www.thejacketmaker.pk/cdn/shop/files/Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      { slot: 'ad-3', name: 'Garment bag', price: '$12', src: 'https://clothoo.com/frontend/images/home/polyester-satin-quilted-lining-options-clothoo.jpg' },
      { slot: 'ad-4', name: 'Leather conditioner kit', price: '$15', src: 'https://clothoo.com/frontend/images/home/full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg' },
    ].map(a => ({ ...a, add: () => setState({ items: [...s.items, { id: a.slot + '-' + Date.now(), name: a.name, spec: 'Add-on', extras: '', price: +a.price.slice(1), qty: 1, src: a.src }] }) }));
    const upd = (id, fn) => setState({ items: s.items.map(i => i.id === id ? fn(i) : i).filter(i => i.qty > 0) });
    return {
      footerNoop: e => e.preventDefault(), cartCount: t.count,
      hasItems: s.items.length > 0, empty: s.items.length === 0,
      items: s.items.map(i => ({ ...i, slot: 'cart-' + i.id, each: '$' + i.price, lineTotal: '$' + i.price * i.qty, inc: () => upd(i.id, x => ({ ...x, qty: x.qty + 1 })), dec: () => upd(i.id, x => ({ ...x, qty: x.qty - 1 })), remove: () => upd(i.id, x => ({ ...x, qty: 0 })) })),
      promoInput: s.promoInput, setPromoInput: e => setState({ promoInput: e.target.value }),
      applyPromo: e => { e.preventDefault(); const c = s.promoInput.trim().toUpperCase(); setState(c === 'TEAM10' ? { promo: c, promoMsg: 'TEAM10 applied — 10% off' } : { promo: '', promoMsg: c ? 'Code not recognised' : '' }); },
      showShipBar, shipBarPct: Math.min(100, Math.round((t.sub - t.disc) / 150 * 100)) + '%', shipBarText: remaining > 0 ? 'Add $' + remaining + ' more for free shipping' : '✓ You’ve unlocked free shipping',
      showCrossSell: (props.showCrossSell ?? false) && s.items.length > 0, addons,
      promoMsg: s.promoMsg, count: t.count, sub: '$' + t.sub, hasDisc: t.disc > 0, disc: '$' + t.disc, shipLabel: t.shipCost ? '$' + t.shipCost : 'Free', total: '$' + t.total,
    };
  }

  const { addons, applyPromo, cartCount, count, disc, empty, hasDisc, hasItems, items, promoInput, promoMsg, setPromoInput, shipBarPct, shipBarText, shipLabel, showCrossSell, showShipBar, sub, total } = renderVals();

  return (
    <div className="pg-cart">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Cart header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Cart</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Your
              <br />
              cart
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every jacket is made to order after checkout. Review your build, then head to checkout — a free digital proof follows before we cut.
            </p>
          </div>
        </div>
      </section>
      {/* Cart body */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(300px,4fr)', gap: '40px clamp(24px,5vw,72px)', alignItems: 'start' }}>
        <div>
          {hasItems ? (
            <>
              <div style={{ display: 'grid', gap: '0' }}>
                {items.map((i, iIdx) => (
                  <div key={iIdx} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: '20px', padding: '24px 0', borderTop: '1px solid var(--ink)', alignItems: 'start' }}>
                    <div style={{ aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                      <ImageSlot slot={i.slot} shape="rect" src={i.src} placeholder="Jacket" />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                        {i.name}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.5' }}>{i.spec}</div>
                      <div style={{ fontSize: '14px', color: 'var(--ink-2)', marginTop: '4px', lineHeight: '1.5' }}>{i.extras}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginTop: '16px' }}>
                        <div className="ez-qty">
                          <button type="button" onClick={i.dec} aria-label="Decrease">−</button>
                          <span>{i.qty}</span>
                          <button type="button" onClick={i.inc} aria-label="Increase">+</button>
                        </div>
                        <A href="/product" style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
                          Edit design
                        </A>
                        <button type="button" onClick={i.remove} style={{ font: 'inherit', fontSize: '13px', fontWeight: '600', background: 'none', border: '0', color: 'var(--muted)', cursor: 'pointer', padding: '0' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px' }}>{i.lineTotal}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{i.each} each</div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--ink)' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '28px' }}>
                <A href="/shop" className="ez-btn">← Keep shopping</A>
                <A href="/design" className="ez-btn" style={{ borderColor: 'var(--gold-2)', color: 'var(--gold-2)' }}>Design another jacket</A>
              </div>
              {showCrossSell ? (
                <div style={{ marginTop: '48px' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.9', textTransform: 'uppercase', marginBottom: '18px' }}>
                    Finish the look
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px' }}>
                    {addons.map((a, aIdx) => (
                      <div key={aIdx} style={{ display: 'grid', gap: '10px' }}>
                        <div style={{ aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                          <ImageSlot slot={a.slot} shape="rect" src={a.src} placeholder={a.name} />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{a.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '20px' }}>{a.price}</span>
                          <button type="button" onClick={a.add} style={{ font: 'inherit', fontSize: '12px', fontWeight: '600', background: 'none', border: '1.5px solid var(--ink)', borderRadius: '2px', padding: '6px 10px', cursor: 'pointer', color: 'var(--ink)' }}>
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
          {empty ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', border: '1.5px dashed var(--muted)', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '0.9', textTransform: 'uppercase' }}>
                Nothing here yet
              </div>
              <p style={{ color: 'var(--muted)', margin: '14px auto 28px', maxWidth: '36ch', lineHeight: '1.55' }}>
                Start a jacket in the design lab or pick a ready style and make it yours.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                <A href="/design" className="ez-btn ez-btn-ink">Design your own</A>
                <A href="/shop" className="ez-btn">Shop jackets</A>
              </div>
            </div>
          ) : null}
        </div>
        <div className="ez-side" style={{ position: 'sticky', top: '110px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Summary
          </h2>
          {showShipBar ? (
            <div style={{ display: 'grid', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{shipBarText}</div>
              <div style={{ height: '8px', background: 'var(--cream-2)', borderRadius: '1px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--gold)', width: shipBarPct, transition: 'width .3s' }} />
              </div>
            </div>
          ) : null}
          <form onSubmit={applyPromo} style={{ display: 'flex', gap: '8px' }}>
            <input className="ez-input" placeholder="Promo code (try TEAM10)" value={promoInput} onChange={setPromoInput} style={{ height: '46px' }} />
            <button type="submit" className="ez-btn" style={{ minHeight: '46px', padding: '0 16px', fontSize: '17px' }}>Apply</button>
          </form>
          {promoMsg ? (
            <div style={{ fontSize: '13px', color: 'var(--gold-2)', fontWeight: '600', marginTop: '-10px' }}>{promoMsg}</div>
          ) : null}
          <div style={{ display: 'grid', gap: '10px', fontSize: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal ({count} items)</span>
              <span>{sub}</span>
            </div>
            {hasDisc ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold-2)' }}>
                <span>Team discount</span>
                <span>−{disc}</span>
              </div>
            ) : null}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Shipping</span>
              <span>{shipLabel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px', marginTop: '4px' }}>
              <span style={{ fontWeight: '600' }}>Total</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{total}</span>
            </div>
          </div>
          <A href="/checkout" className="ez-btn ez-btn-ink" style={{ width: '100%' }}>Checkout →</A>
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            <div>✓ Free digital proof before production</div>
            <div>✓ One free size exchange</div>
            <div>✓ Free shipping over $150 · 2–3 weeks production</div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
