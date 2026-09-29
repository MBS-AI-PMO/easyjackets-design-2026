// Order confirmation. Reached two ways: /order-confirmation?order=<number>
// after cash-on-delivery, and /success/:sessionId when Stripe sends the
// visitor back (the order is created from that session, as on the current site).
import { useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useCart } from '../lib/cart';
import { fetchOrderById, money, normalizeOrder, verifyStripeSession } from '../lib/orders';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';

const STEPS = [
  ['Proof in 2 days', 'A digital illustration of your exact jacket lands in your inbox. Reply with changes or approve.'],
  ['Cutting & stitching', '2–3 weeks in the workshop. We send a photo when it comes off the bench.'],
  ['Shipped & tracked', 'Courier delivery with a tracking number by email and on the tracking page.'],
  ['Wear it', 'Wrong size? One free exchange. Tag @easyjackets to be featured in the gallery.'],
];

export default function OrderConfirmation() {
  usePageTitle('Order confirmed', 'Your Easy Jackets order is in.');
  const { sessionId } = useParams();
  const [params] = useSearchParams();
  const orderNo = params.get('order');
  const cart = useCart();
  const { data: order, loading, error } = useAsync(async (signal) => {
    if (sessionId) return normalizeOrder(await verifyStripeSession(sessionId));
    if (orderNo) return fetchOrderById(orderNo, signal);
    return null;
  }, [sessionId, orderNo]);

  // A confirmed order empties the cart (once).
  const cleared = useRef(false);
  useEffect(() => { if (order && !cleared.current) { cleared.current = true; cart.clear(); } }, [order, cart]);

  const firstName = order?.shipTo?.name ? order.shipTo.name.split(' ')[0] : '';

  return (
    <div className="pg-order-confirmation">
      <Nav cta="cart" />
      {/* Confirmation */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,48px) 0' }}>
        {loading ? (
          <div style={{ display: 'grid', gap: '16px', maxWidth: '520px' }}>
            <div className="ez-skeleton" style={{ height: '20px', width: '240px' }} />
            <div className="ez-skeleton" style={{ height: '96px' }} />
            <div className="ez-skeleton" style={{ height: '60px' }} />
            <p style={{ margin: '0', color: 'var(--muted)' }}>{sessionId ? 'Confirming your payment…' : 'Loading your order…'}</p>
          </div>
        ) : !order ? (
          <div style={{ maxWidth: '560px' }}>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
              {error ? 'We could not find that order' : 'No order to show'}
            </h1>
            <p style={{ color: 'var(--muted)', margin: '16px 0 28px', lineHeight: '1.6' }}>
              {error ? (error.message || 'Please check the link in your confirmation email, or track your order with its number.') : 'Open this page from your confirmation email, or track an order with its number.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <A href="/track-order" className="ez-btn ez-btn-ink">Track an order</A>
              <A href="/shop" className="ez-btn">Keep shopping</A>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
                Order {order.orderId} · Confirmed
              </div>
              <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
                Thank you{firstName ? ',' : ''}
                <br />
                {firstName ? <span style={{ color: 'var(--gold-2)' }}>{firstName}.</span> : <span style={{ color: 'var(--gold-2)' }}>your order is in.</span>}
              </h1>
              <p style={{ maxWidth: '48ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '17px' }}>
                Your order is in. A confirmation is on its way to{' '}
                <strong>{order.shipTo?.email || 'your email'}</strong>
                . Next, our artists draw up your digital proof — expect it within 2 business days. Nothing is cut until you approve it.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
                <A href={`/track-order?order=${encodeURIComponent(order.orderId)}&email=${encodeURIComponent(order.shipTo?.email || '')}`} className="ez-btn ez-btn-ink">Track this order</A>
                <A href="/shop" className="ez-btn">Keep shopping</A>
              </div>
            </div>
            <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '18px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Order summary
              </h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {order.items.map((i) => (
                  <div key={i.key} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) auto', gap: '14px', alignItems: 'center' }}>
                    <div className={`ez-product-photo${i.custom ? ' ez-design-photo' : ''}`} style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden' }}>
                      <ImageSlot slot={`cf-${i.key}`} shape="rect" src={i.image} width={320} knockout={i.custom} placeholder="Jacket" aria-label={i.name} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name} × {i.quantity}</div>
                      {i.spec ? <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{i.spec}</div> : null}
                    </div>
                    <div style={{ fontWeight: '600' }}>{money(i.price * i.quantity, order.currency)}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gap: '10px', fontSize: '15px', borderTop: '1px solid var(--ink)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Subtotal</span>
                  <span>{money(order.subtotal, order.currency)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted)' }}>Shipping</span>
                  <span>{order.total - order.subtotal > 0 ? money(order.total - order.subtotal, order.currency) : 'Free'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--ink)', paddingTop: '14px' }}>
                  <span style={{ fontWeight: '600' }}>{order.paymentStatus === 'paid' ? 'Paid' : 'Total'}</span>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px' }}>{money(order.total, order.currency)}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '16px', fontSize: '13px', lineHeight: '1.5', borderTop: '1px solid var(--cream-2)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>Ships to</div>
                  <div style={{ color: 'var(--muted)' }}>
                    {order.shipTo?.name}
                    <br />
                    {order.shipTo?.line1}
                    <br />
                    {[order.shipTo?.city, order.shipTo?.state, order.shipTo?.zip].filter(Boolean).join(', ')}
                    {order.shipTo?.country ? <><br />{order.shipTo.country}</> : null}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>Payment</div>
                  <div style={{ color: 'var(--muted)' }}>
                    {order.isCod ? 'Cash on delivery' : order.cardLast4 ? `Card ending ${order.cardLast4}` : 'Card · Stripe'}
                    <br />
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Payment on delivery'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
      {/* Next steps */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          What happens next
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          {STEPS.map(([title, text], i) => (
            <div key={title} style={{ borderTop: `3px solid ${i === 0 ? 'var(--gold)' : 'var(--ink)'}`, paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>0{i + 1}</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>{title}</div>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
