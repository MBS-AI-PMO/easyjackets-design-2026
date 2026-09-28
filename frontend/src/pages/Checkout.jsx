// Checkout: contact and shipping details, shipping from the admin's rate
// tiers, then either Stripe's secure payment page (card) or cash on delivery —
// the same two endpoints the current site uses.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { COUNTRIES, checkoutProducts, countryName, createCodOrder, createStripeSession, money, previewShipping } from '../lib/orders';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';

const splitName = (name = '') => { const parts = String(name).trim().split(/\s+/); return { firstName: parts.shift() || '', lastName: parts.join(' ') }; };
const addressText = (a) => (typeof a === 'string' ? a : a && typeof a === 'object' ? [a.line1 || a.street || a.address, a.city, a.state, a.zip || a.postal_code].filter(Boolean).join(', ') : '');

export default function Checkout() {
  usePageTitle('Checkout', 'Secure checkout for your custom jacket.');
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...splitName(user?.name), email: user?.email || '', phone: user?.phone || '', address: addressText(user?.address), address2: '', city: '', state: '', zip: '', country: 'US' }));
  const [pay, setPay] = useState('card');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // The signed-in visitor's details arrive after the first render.
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, ...(f.firstName ? {} : splitName(user.name)), email: f.email || user.email || '', phone: f.phone || user.phone || '', address: f.address || addressText(user.address) }));
  }, [user]);
  // Nothing to pay for: back to the cart (but not while an order is being placed).
  useEffect(() => { if (!cart.items.length && !busy) navigate('/cart', { replace: true }); }, [cart.items.length, busy, navigate]);

  const { data: shipping } = useAsync((signal) => (cart.count ? previewShipping(cart.count, form.country, cart.subtotal, signal) : Promise.resolve({ cost: 0 })), [cart.count, cart.subtotal, form.country]);
  const shipCost = shipping ? shipping.cost : null;
  const total = cart.subtotal + (shipCost || 0);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const products = useMemo(() => checkoutProducts(cart.items, shipCost || 0), [cart.items, shipCost]);

  const place = async (e) => {
    e.preventDefault();
    setError('');
    if (shipCost === null) { setError('Shipping is still being calculated — one moment.'); return; }
    const formDetails = {
      firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), phone: form.phone.trim(),
      address: [form.address.trim(), form.address2.trim()].filter(Boolean).join(', '), city: form.city.trim(), state: form.state.trim(), zip: form.zip.trim(), country: countryName(form.country),
    };
    if (!formDetails.firstName || !formDetails.email || !formDetails.address || !formDetails.city || !formDetails.zip) { setError('Please fill in your name, email and shipping address.'); return; }
    setBusy(true);
    try {
      if (pay === 'cod') {
        const orderId = await createCodOrder({ products, user, formDetails });
        cart.clear();
        navigate(`/order-confirmation?order=${encodeURIComponent(orderId)}`, { replace: true });
      } else {
        // Stripe brings the visitor back to /success/:sessionId, where the order is created and the cart cleared.
        try { sessionStorage.setItem('ej-checkout', JSON.stringify(formDetails)); } catch { /* private mode */ }
        const url = await createStripeSession({ products, user });
        window.location.assign(url);
      }
    } catch (err) {
      setError(err.message || 'The order could not be placed. Please try again.');
      setBusy(false);
    }
  };

  const h2 = { fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '0', display: 'flex', alignItems: 'center', gap: '12px' };

  return (
    <div className="pg-checkout">
      <Nav cta="cart" />
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
          {!user ? (
            <p style={{ margin: '14px 0 0', fontSize: '14px', color: 'var(--muted)' }}>
              Have an account? <A href="/account?next=/checkout" style={{ color: 'inherit', fontWeight: '600' }}>Sign in</A> to fill this in faster. Guests can order too.
            </p>
          ) : null}
          <form onSubmit={place} style={{ display: 'grid', gap: '40px', marginTop: '36px' }} noValidate>
            <div style={{ display: 'grid', gap: '18px' }}>
              <h2 style={h2}><span style={{ color: 'var(--gold-2)' }}>01</span> Contact</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                <label className="ez-label">
                  Email
                  <input className="ez-input" type="email" name="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
                </label>
                <label className="ez-label">
                  Phone
                  <input className="ez-input" type="tel" name="phone" placeholder="For delivery updates" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
              </div>
              <p style={{ margin: '0', fontSize: '14px', color: 'var(--muted)' }}>Your digital proof and order updates go to this email.</p>
            </div>
            <div style={{ display: 'grid', gap: '18px' }}>
              <h2 style={h2}><span style={{ color: 'var(--gold-2)' }}>02</span> Shipping address</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                <label className="ez-label">
                  First name
                  <input className="ez-input" name="first" required value={form.firstName} onChange={set('firstName')} autoComplete="given-name" />
                </label>
                <label className="ez-label">
                  Last name
                  <input className="ez-input" name="last" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" />
                </label>
              </div>
              <label className="ez-label">
                Address
                <input className="ez-input" name="addr" required placeholder="Street and number" value={form.address} onChange={set('address')} autoComplete="address-line1" />
              </label>
              <label className="ez-label">
                Apartment, suite (optional)
                <input className="ez-input" name="addr2" value={form.address2} onChange={set('address2')} autoComplete="address-line2" />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)', gap: '14px' }}>
                <label className="ez-label">
                  City
                  <input className="ez-input" name="city" required value={form.city} onChange={set('city')} autoComplete="address-level2" />
                </label>
                <label className="ez-label">
                  State
                  <input className="ez-input" name="state" value={form.state} onChange={set('state')} autoComplete="address-level1" />
                </label>
                <label className="ez-label">
                  ZIP
                  <input className="ez-input" name="zip" required value={form.zip} onChange={set('zip')} autoComplete="postal-code" />
                </label>
              </div>
              <label className="ez-label">
                Country
                <select className="ez-input" name="country" value={form.country} onChange={set('country')} autoComplete="country">
                  {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <h2 style={h2}><span style={{ color: 'var(--gold-2)' }}>03</span> Delivery</h2>
              <div className="ez-radio" role="radio" aria-checked="true">
                <span className="dot" />
                <div style={{ flex: '1' }}>
                  <div style={{ fontWeight: '600' }}>Tracked courier{shipping?.label ? ` · ${shipping.label}` : ''}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{form.country === 'US' ? '4–5 business days after production' : 'International, 5–8 business days after production'}</div>
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>{shipCost === null ? '…' : shipCost ? money(shipCost) : 'Free'}</div>
              </div>
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--muted)' }}>
                Production time (2–3 weeks) is in addition to delivery.
              </p>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <h2 style={h2}><span style={{ color: 'var(--gold-2)' }}>04</span> Payment</h2>
              {[['card', 'Credit or debit card', 'Secure Stripe page'], ['cod', 'Cash on delivery', 'Pay when it arrives']].map(([v, label, hint]) => (
                <div key={v} className="ez-radio" role="radio" aria-checked={pay === v} onClick={() => setPay(v)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setPay(v); }}>
                  <span className="dot" />
                  <div style={{ flex: '1', fontWeight: '600' }}>{label}</div>
                  <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{hint}</div>
                </div>
              ))}
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.55' }}>
                {pay === 'card' ? 'Card details are entered on Stripe’s secure page — Visa, Mastercard, Amex, Apple Pay and Google Pay. You come straight back here afterwards.' : 'Your order is confirmed by email right away and paid to the courier on delivery.'}
              </p>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e', lineHeight: '1.5' }}>{error}</p> : null}
              <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%', minHeight: '60px', fontSize: '22px' }} disabled={busy || !cart.items.length}>
                {busy ? 'One moment…' : `${pay === 'card' ? 'Continue to payment' : 'Place order'} · ${money(total)}`}
              </button>
              <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.55' }}>
                You'll receive a digital proof by email within 2 business days. Nothing is cut until you approve it. By placing this order you agree to our{' '}
                <A href="/terms-and-conditions" style={{ color: 'inherit' }}>Terms</A>
                {' '}and{' '}
                <A href="/shipping#exchanges" style={{ color: 'inherit' }}>Returns policy</A>
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
            {cart.items.map((i) => (
              <div key={i.key} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) auto', gap: '14px', alignItems: 'center' }}>
                <div className="ez-product-photo" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '2px', overflow: 'visible' }}>
                  <ImageSlot slot={`co-${i.key}`} shape="rect" src={i.image} width={320} placeholder="Jacket" aria-label={i.name} />
                  <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--ink)', color: 'var(--cream)', fontSize: '11px', fontWeight: '700', width: '20px', height: '20px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}>
                    {i.quantity}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{[i.color, i.size ? `Size ${i.size}` : ''].filter(Boolean).join(' · ')}</div>
                </div>
                <div style={{ fontWeight: '600' }}>{money(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gap: '10px', fontSize: '15px', borderTop: '1px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span>{money(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Shipping</span>
              <span>{shipCost === null ? '…' : shipCost ? money(shipCost) : 'Free'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--muted)' }}>Taxes</span>
              <span>Calculated at delivery</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px', marginTop: '4px' }}>
              <span style={{ fontWeight: '600' }}>Total</span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{money(total)}</span>
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
