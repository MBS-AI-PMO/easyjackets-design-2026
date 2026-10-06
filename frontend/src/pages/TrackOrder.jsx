// Guest order tracking: order number + the email the order was placed with,
// looked up through GET /order/track (added to the new backend for this page).
// It shows the stages, the courier and tracking number the admin entered
// (Orders → Status & Shipping) with a link to the courier's tracking page, the
// status updates and the items. The status emails link here with both filled in.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { ORDER_STAGES, trackOrder } from '../lib/orders';
import { usePageTitle } from '../lib/usePageTitle';
import { agentSubmission, orderStatusSummary } from '../lib/webmcp';

export default function TrackOrder() {
  usePageTitle('Track your order', 'See where your custom jacket is, from proof to your door.');
  const [params] = useSearchParams();
  const [orderNo, setOrderNo] = useState(params.get('order') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [state, setState] = useState({ order: null, loading: false, error: '' });

  const lookup = async (e, o = orderNo, m = email) => {
    if (e) e.preventDefault();
    // filled in and sent by an AI agent (WebMCP, the form's toolname below): the values come from the
    // form itself, shown in the fields too, and the agent is told the result
    const agent = agentSubmission(e);
    if (agent) {
      o = String(agent.values.order || '');
      m = String(agent.values.email || '');
      setOrderNo(o);
      setEmail(m);
    }
    if (!o.trim() || !m.trim()) {
      setState({ order: null, loading: false, error: 'Enter your order number and email.' });
      agent?.reply({ error: 'Enter the order number and the email the order was placed with.' });
      return;
    }
    setState({ order: null, loading: true, error: '' });
    try {
      const order = await trackOrder(o.trim(), m.trim());
      setState({ order, loading: false, error: '' });
      agent?.reply(order ? orderStatusSummary(order) : { error: 'That order could not be found.' });
    } catch (err) {
      setState({ order: null, loading: false, error: err.message || 'That order could not be found.' });
      agent?.reply({ error: err.message || 'That order could not be found.' });
    }
  };
  // Arriving from the confirmation page with both values filled in: look it up at once.
  useEffect(() => { if (params.get('order') && params.get('email')) lookup(null, params.get('order'), params.get('email')); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { order, loading, error } = state;
  const cur = order ? order.step : -1;
  const cancelled = order && order.step < 0;
  const stageDates = order ? [order.dateLabel, '', order.shippedLabel, order.deliveredLabel] : [];
  // the courier panel: once the admin has entered a courier, tracking number or note (a cancelled order's note sits with the notice)
  const shipped = order && (order.courier || order.trackingNumber || (order.shippingNote && !cancelled));

  return (
    <div className="pg-track-order">
      <Nav cta="cart" />
      {/* Track order header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Track order</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
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
        {/* toolname / tooldescription / toolparamdescription: offered to AI agents as a tool (WebMCP, lib/webmcp.js);
            a lookup changes nothing, so an agent may send it itself (toolautosubmit) */}
        <form onSubmit={lookup} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px', maxWidth: '820px', alignItems: 'end' }} noValidate
          toolname="track_order_form" tooldescription="Looks up an Easy Jackets order on this page: its stage (order placed, in production, shipped, delivered), courier, tracking number and the jackets in it. Needs the order number and the email address the order was placed with." toolautosubmit="">
          <label className="ez-label">
            Order number
            <input className="ez-input" name="order" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="From your confirmation email" required autoComplete="off" toolparamdescription="The order number from the order confirmation email." />
          </label>
          <label className="ez-label">
            Email
            <input className="ez-input" type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" toolparamdescription="The email address the order was placed with." />
          </label>
          <button type="submit" className="ez-btn ez-btn-ink" style={{ minHeight: '50px' }} disabled={loading}>{loading ? 'Looking…' : 'Track →'}</button>
        </form>
        {error ? <p role="alert" style={{ margin: '14px 0 0', fontSize: '14px', color: '#b3261e' }}>{error}</p> : null}
      </section>
      {/* Order status */}
      {order ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }} className="ez-two">
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Order {order.orderId}
              </h2>
              <span style={{ background: cancelled ? 'var(--cream-2)' : 'var(--gold)', padding: '6px 12px', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '16px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {order.statusLabel}
              </span>
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: '15px' }}>
              Placed {order.dateLabel}
              {order.trackingNumber ? <> · Tracking <strong style={{ color: 'var(--ink)' }}>{order.trackingNumber}</strong>{order.courier ? ` (${order.courier})` : ''}</> : null}
            </p>
            {cancelled ? (
              <p style={{ margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6' }}>This order was cancelled.{order.shippingNote ? ` ${order.shippingNote}` : ''} If that is unexpected, <A href="/contact-us" style={{ color: 'inherit', fontWeight: '600' }}>contact us</A> and we will sort it out.</p>
            ) : (
              <div style={{ display: 'grid', gap: '0', marginTop: '36px' }}>
                {ORDER_STAGES.map(([title, desc], i) => {
                  const done = i < cur, now = i === cur;
                  return (
                    <div key={title} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '18px' }}>
                      <div style={{ display: 'grid', justifyItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', background: done ? 'var(--ink)' : now ? 'var(--gold)' : 'transparent', color: done ? 'var(--cream)' : 'var(--ink)', border: '2px solid var(--ink)' }}>
                          {done ? '✓' : i + 1}
                        </div>
                        {i < ORDER_STAGES.length - 1 ? <div style={{ width: '2px', flex: '1', background: done ? 'var(--ink)' : 'var(--cream-2)', minHeight: '40px' }} /> : null}
                      </div>
                      <div style={{ paddingBottom: '28px' }}>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', lineHeight: '1', textTransform: 'uppercase', color: i <= cur ? 'var(--ink)' : 'var(--muted)' }}>{title}</div>
                        <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px', lineHeight: '1.5' }}>{desc}</div>
                        {i <= cur && stageDates[i] ? <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{stageDates[i]}</div> : null}
                        {now && i > 0 ? <div style={{ fontSize: '12px', color: 'var(--gold-2)', fontWeight: '600', marginTop: '4px' }}>Current stage</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {order.history.length ? (
              <div style={{ marginTop: cancelled ? '32px' : '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>Updates</div>
                {order.history.map((h) => (
                  <div key={h.key} style={{ display: 'grid', gridTemplateColumns: 'minmax(110px,160px) minmax(0,1fr)', gap: '14px', padding: '12px 0', borderTop: '1px solid var(--cream-2)', fontSize: '14px', lineHeight: '1.5' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{h.when}</span>
                    <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                      <strong>{h.label}</strong>{h.courier ? ` · ${h.courier}` : ''}{h.trackingNumber ? ` · ${h.trackingNumber}` : ''}
                      {h.note ? <span style={{ display: 'block', color: 'var(--muted)', fontSize: '13px', marginTop: '2px' }}>{h.note}</span> : null}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div style={{ display: 'grid', gap: '20px' }}>
            {shipped ? (
              <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderLeft: '4px solid var(--gold)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '16px' }}>
                <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                  Shipping
                </h3>
                <dl style={{ margin: '0', display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '8px 18px', fontSize: '14px', lineHeight: '1.5' }}>
                  {order.courier ? <><dt style={{ color: 'var(--muted)' }}>Courier</dt><dd style={{ margin: '0', fontWeight: '600' }}>{order.courier}</dd></> : null}
                  {order.trackingNumber ? <><dt style={{ color: 'var(--muted)' }}>Tracking number</dt><dd style={{ margin: '0', fontWeight: '700', letterSpacing: '0.04em', overflowWrap: 'anywhere' }}>{order.trackingNumber}</dd></> : null}
                  {order.shippedLabel ? <><dt style={{ color: 'var(--muted)' }}>Shipped on</dt><dd style={{ margin: '0' }}>{order.shippedLabel}</dd></> : null}
                  {order.deliveredLabel ? <><dt style={{ color: 'var(--muted)' }}>Delivered on</dt><dd style={{ margin: '0' }}>{order.deliveredLabel}</dd></> : null}
                  {order.shippingNote && !cancelled ? <><dt style={{ color: 'var(--muted)' }}>Note</dt><dd style={{ margin: '0', overflowWrap: 'anywhere' }}>{order.shippingNote}</dd></> : null}
                </dl>
                {order.trackingUrl ? (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="ez-btn ez-btn-ink" style={{ justifySelf: 'start', minHeight: '44px', fontSize: '17px' }}>
                    Track with {order.courier} ↗
                  </a>
                ) : null}
              </div>
            ) : null}
            <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '16px' }}>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Items
              </h3>
              {order.items.map((i) => (
                <div key={i.key} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', gap: '14px', alignItems: 'center' }}>
                  <div className={`ez-product-photo${i.custom ? ' ez-design-photo' : ''}`} style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden' }}>
                    <ImageSlot slot={`tr-${i.key}`} shape="rect" src={i.image} width={320} knockout={i.custom} placeholder="Jacket" aria-label={i.name} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', lineHeight: '1.3' }}>{i.name} × {i.quantity}</div>
                    {i.spec ? <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{i.spec}</div> : null}
                  </div>
                </div>
              ))}
              {!shipped && !cancelled ? (
                <div style={{ borderTop: '1px solid var(--ink)', paddingTop: '14px', fontSize: '13px', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600' }}>Carrier</div>
                  <div style={{ color: 'var(--muted)' }}>Tracked courier. The tracking number shows here once your order ships.</div>
                </div>
              ) : null}
            </div>
            <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: '24px', display: 'grid', gap: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Need a change?
              </div>
              <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.55', color: 'rgba(244,239,230,0.8)' }}>
                Size changes are possible up to 48 hours after proof approval. Address changes until the jacket ships.
              </p>
              <A href="/contact-us" className="ez-btn ez-btn-gold" style={{ justifySelf: 'start', minHeight: '44px', fontSize: '17px' }}>
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
