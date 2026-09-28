// The cart: what the visitor added on product pages (localStorage, see
// lib/cart.jsx), with shipping from the admin's rate tiers.
import { useSearchParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useCart } from '../lib/cart';
import { money, previewShipping } from '../lib/orders';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import { productPath } from '../lib/urls';

export default function Cart() {
  usePageTitle('Your cart', 'Review your custom jackets before checkout.');
  const cart = useCart();
  const [params] = useSearchParams();
  const cancelled = params.get('cancelled') === '1';
  const { data: shipping } = useAsync((signal) => (cart.count ? previewShipping(cart.count, 'US', cart.subtotal, signal) : Promise.resolve({ cost: 0 })), [cart.count, cart.subtotal]);
  const shipCost = shipping ? shipping.cost : null;
  const total = cart.subtotal + (shipCost || 0);

  return (
    <div className="pg-cart">
      <Nav cta="cart" />
      {/* Cart header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Cart</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Your
              <br />
              cart
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Every jacket is made to order after checkout. Review your build, then head to checkout — a free digital proof follows before we cut.
            </p>
            {cancelled ? (
              <p role="status" style={{ margin: '16px 0 0', padding: '12px 16px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', fontSize: '14px', color: 'var(--ink-2)' }}>
                Payment was cancelled. Your cart is still here whenever you are ready.
              </p>
            ) : null}
          </div>
        </div>
      </section>
      {/* Cart body */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(300px,4fr)', gap: '40px clamp(24px,5vw,72px)', alignItems: 'start' }}>
        <div>
          {cart.items.length ? (
            <>
              <div style={{ display: 'grid', gap: '0' }}>
                {cart.items.map((i) => (
                  <div key={i.key} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: '20px', padding: '24px 0', borderTop: '1px solid var(--ink)', alignItems: 'start' }}>
                    <div className="ez-product-photo" style={{ aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden' }}>
                      <ImageSlot slot={`cart-${i.key}`} shape="rect" src={i.image} width={320} placeholder="Jacket" aria-label={i.name} />
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                        {i.name}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.5' }}>
                        {[i.color, i.size ? `Size ${i.size}` : ''].filter(Boolean).join(' · ') || 'Standard build'}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginTop: '16px' }}>
                        <div className="ez-qty">
                          <button type="button" onClick={() => cart.setQuantity(i.key, i.quantity - 1)} aria-label="Decrease">−</button>
                          <span>{i.quantity}</span>
                          <button type="button" onClick={() => cart.setQuantity(i.key, i.quantity + 1)} aria-label="Increase">+</button>
                        </div>
                        {i.slug ? (
                          <A href={productPath(i.slug)} style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
                            View jacket
                          </A>
                        ) : null}
                        <button type="button" onClick={() => cart.remove(i.key)} style={{ font: 'inherit', fontSize: '13px', fontWeight: '600', background: 'none', border: '0', color: 'var(--muted)', cursor: 'pointer', padding: '0' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px' }}>{money(i.price * i.quantity)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{money(i.price)} each</div>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--ink)' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '28px' }}>
                <A href="/shop" className="ez-btn">← Keep shopping</A>
                <A href="/design-custom-jacket" className="ez-btn" style={{ borderColor: 'var(--gold-2)', color: 'var(--gold-2)' }}>Design another jacket</A>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '64px 20px', border: '1.5px dashed var(--muted)', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '0.9', textTransform: 'uppercase' }}>
                Nothing here yet
              </div>
              <p style={{ color: 'var(--muted)', margin: '14px auto 28px', maxWidth: '36ch', lineHeight: '1.55' }}>
                Start a jacket in the design lab or pick a ready style and make it yours.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                <A href="/design-custom-jacket" className="ez-btn ez-btn-ink">Design your own</A>
                <A href="/shop" className="ez-btn">Shop jackets</A>
              </div>
            </div>
          )}
        </div>
        <div className="ez-side" style={{ position: 'sticky', top: '110px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '18px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Summary
          </h2>
          <div style={{ display: 'grid', gap: '10px', fontSize: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal ({cart.count} {cart.count === 1 ? 'item' : 'items'})</span>
              <span>{money(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Shipping (US){shipping?.label ? ` · ${shipping.label}` : ''}</span>
              <span>{!cart.count ? '—' : shipCost === null ? '…' : shipCost ? money(shipCost) : 'Free'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px', marginTop: '4px' }}>
              <span style={{ fontWeight: '600' }}>Total</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{money(total)}</span>
            </div>
          </div>
          <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>Shipping outside the US is worked out at checkout from your country.</p>
          {cart.items.length ? (
            <A href="/checkout" className="ez-btn ez-btn-ink" style={{ width: '100%' }}>Checkout →</A>
          ) : (
            <span className="ez-btn" aria-disabled="true" style={{ width: '100%', opacity: 0.5, pointerEvents: 'none' }}>Checkout →</span>
          )}
          <div style={{ display: 'grid', gap: '8px', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
            <div>✓ Free digital proof before production</div>
            <div>✓ One free size exchange</div>
            <div>✓ Ten jackets or more? <A href="/bulk-order" style={{ color: 'inherit', fontWeight: '600' }}>Get team pricing →</A></div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
