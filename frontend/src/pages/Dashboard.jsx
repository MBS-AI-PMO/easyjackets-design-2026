// The signed-in account: orders (with tracking), address, saved cards and
// profile — from /auth/orders, /auth/profile, /auth/change-password and
// /payment-methods, the current site's endpoints.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { ORDER_STAGES, changePassword, deletePaymentMethod, fetchMyOrders, fetchPaymentMethods, hideOrder, money, updateProfile } from '../lib/orders';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './Dashboard.css';
import { productPath } from '../lib/urls';

const PILL = { placed: ['#efe0a8', '#5c4a08'], production: ['#efe0a8', '#5c4a08'], shipped: ['#cfe3ec', '#12455c'], delivered: ['#d7e6d3', '#1f4a2f'], cancelled: ['#e9e1d2', '#6b635a'] };
const pillFor = (o) => (o.step < 0 ? PILL.cancelled : o.step === 0 ? PILL.placed : o.step === 1 ? PILL.production : o.step === 2 ? PILL.shipped : PILL.delivered);
const isOpen = (o) => o.step >= 0 && o.step < 3;
const addressText = (a) => (typeof a === 'string' ? a : a && typeof a === 'object' ? [a.line1 || a.street || a.address, a.city, a.state, a.zip || a.postal_code, a.country].filter(Boolean).join(', ') : '');
const h2 = { fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' };
const h3 = { fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', textTransform: 'uppercase', margin: '0 0 14px' };

export default function Dashboard() {
  usePageTitle('My account', 'Your Easy Jackets orders, address and profile.');
  const { user, ready, logout, updateUser, replaceToken } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('overview');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => { if (ready && !user) navigate('/account?next=/dashboard', { replace: true }); }, [ready, user, navigate]);

  const { data: orders, loading: ordersLoading, reload: reloadOrders } = useAsync((signal) => (user ? fetchMyOrders(signal) : Promise.resolve([])), [user?._id]);
  const { data: cards, reload: reloadCards } = useAsync((signal) => (user ? fetchPaymentMethods(signal).catch(() => []) : Promise.resolve([])), [user?._id]);

  const list = orders || [];
  const open = list.filter(isOpen);
  const current = open[0] || list[0] || null;
  const shown = list.filter((o) => filter === 'All' || (filter === 'Open' ? isOpen(o) : o.step === 3));
  const order = selected ? list.find((o) => o.id === selected) : null;
  const jackets = useMemo(() => list.filter((o) => o.step === 3).reduce((n, o) => n + o.items.reduce((m, i) => m + i.quantity, 0), 0), [list]);

  const go = (v) => () => { setView(v); window.scrollTo({ top: 0 }); };
  const openOrder = (o) => { setSelected(o.id); setView('order'); window.scrollTo({ top: 0 }); };
  const nav = [['overview', 'Overview', ''], ['orders', 'Orders', list.length ? String(list.length) : ''], ['designs', 'Designs', ''], ['addresses', 'Address', ''], ['payments', 'Payment', cards?.length ? String(cards.length) : ''], ['profile', 'Profile', '']];

  // profile form
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', currentPassword: '' });
  useEffect(() => { if (user) setProfile({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: addressText(user.address), currentPassword: '' }); }, [user]);
  // a new email needs the current password (the API asks for it)
  const emailChanged = Boolean(user) && profile.email.trim().toLowerCase() !== String(user.email || '').trim().toLowerCase();
  const [profileState, setProfileState] = useState({ busy: false, msg: '', error: '' });
  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileState({ busy: true, msg: '', error: '' });
    try {
      const next = await updateProfile({ name: profile.name.trim(), email: profile.email.trim(), phone: profile.phone.trim(), address: profile.address.trim(), ...(emailChanged ? { currentPassword: profile.currentPassword } : {}) });
      updateUser(next || { name: profile.name.trim(), email: profile.email.trim(), phone: profile.phone.trim(), address: profile.address.trim() });
      setProfile((p) => ({ ...p, currentPassword: '' }));
      setProfileState({ busy: false, msg: 'Saved.', error: '' });
    } catch (err) { setProfileState({ busy: false, msg: '', error: err.message || 'Could not save.' }); }
  };
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwState, setPwState] = useState({ busy: false, msg: '', error: '' });
  const savePassword = async (e) => {
    e.preventDefault();
    setPwState({ busy: true, msg: '', error: '' });
    try {
      const res = await changePassword(pw.current, pw.next, pw.confirm);
      replaceToken(res?.token); // the change ended every other session; this one continues with a fresh token
      setPw({ current: '', next: '', confirm: '' });
      setPwState({ busy: false, msg: 'Password changed.', error: '' });
    } catch (err) { setPwState({ busy: false, msg: '', error: err.message || 'Could not change the password.' }); }
  };
  const removeOrder = async (o) => {
    if (!window.confirm(`Remove order ${o.orderId} from your list? It stays on file with us.`)) return;
    try { await hideOrder(o.id); setView('orders'); setSelected(null); reloadOrders(); } catch (err) { window.alert(err.message || 'Could not remove the order.'); }
  };
  const removeCard = async (c) => {
    if (!window.confirm(`Remove the card ending ${c.last4}?`)) return;
    try { await deletePaymentMethod(c.id); reloadCards(); } catch (err) { window.alert(err.message || 'Could not remove the card.'); }
  };
  const signOut = () => { logout(); navigate('/'); };

  if (!ready || !user) return <div className="pg-dashboard"><Nav active="/faq" cta="shop" /><div style={{ minHeight: '50vh' }} /><Footer faq={false} /></div>;

  const OrderCard = ({ o }) => (
    <div className="ez-panel" style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr) auto', gap: '20px', alignItems: 'center' }}>
      <div className={`ez-product-photo${o.items[0]?.custom ? ' ez-design-photo' : ''}`} style={{ aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden' }}>
        <ImageSlot slot={`ord-${o.id}`} shape="rect" src={o.items[0]?.image} width={320} knockout={!!o.items[0]?.custom} placeholder="Jacket" aria-label={o.items[0]?.name || 'Order'} />
      </div>
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', textTransform: 'uppercase' }}>#{o.orderId}</span>
          <span className="ez-pill" style={{ background: pillFor(o)[0], color: pillFor(o)[1] }}><i />{o.statusLabel}</span>
        </div>
        <div style={{ fontSize: '15px', marginTop: '6px' }}>{o.items.map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`).join(' · ') || 'Custom order'}</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Placed {o.dateLabel} · {o.isCod ? 'Cash on delivery' : o.paymentStatus === 'paid' ? 'Paid by card' : 'Card'}</div>
      </div>
      <div style={{ textAlign: 'right', display: 'grid', gap: '10px', justifyItems: 'end' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px' }}>{money(o.total, o.currency)}</div>
        <button type="button" className="ez-chip" onClick={() => openOrder(o)}>Details →</button>
      </div>
    </div>
  );

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
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>{user.email}</div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7vw,96px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '6px 0 0' }}>
              Welcome back, {String(user.name || '').split(' ')[0] || 'there'}
            </h1>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '46px', fontSize: '18px' }}>Design a jacket</A>
            <button type="button" className="ez-btn" style={{ minHeight: '46px', fontSize: '18px' }} onClick={signOut}>Sign out</button>
          </div>
        </div>
      </section>
      {/* Dashboard */}
      <section className="ez-dash" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: '28px clamp(24px,4vw,56px)', alignItems: 'start' }}>
        <div className="ez-side" style={{ position: 'sticky', top: '104px', display: 'grid', gap: '2px' }}>
          {nav.map(([v, label, count]) => (
            <button key={v} type="button" aria-current={view === v || (v === 'orders' && view === 'order')} onClick={go(v)}>
              {label}
              <span className="ez-side-n">{count}</span>
            </button>
          ))}
          <A href="/contact-us" style={{ marginTop: '14px', fontSize: '16px' }}>Need help? →</A>
        </div>
        <div style={{ display: 'grid', gap: 'clamp(32px,4vw,52px)' }}>
          {view === 'overview' ? (
            <div style={{ display: 'grid', gap: 'clamp(32px,4vw,52px)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '24px' }}>
                <div className="ez-stat"><b>{open.length}</b><span>Open orders</span></div>
                <div className="ez-stat"><b>{list.length}</b><span>Orders placed</span></div>
                <div className="ez-stat"><b>{jackets}</b><span>Jackets delivered</span></div>
                <div className="ez-stat" style={{ borderTopColor: 'var(--gold)' }}><b>{money(list.reduce((n, o) => n + (o.step < 0 ? 0 : o.total), 0))}</b><span>Lifetime total</span></div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <h2 style={{ ...h2, fontSize: 'clamp(34px,4vw,48px)' }}>{current ? 'Current order' : 'No orders yet'}</h2>
                  {current ? <button type="button" className="ez-chip" onClick={() => openOrder(current)}>View full details →</button> : null}
                </div>
                {ordersLoading ? <div className="ez-skeleton" style={{ height: '160px' }} /> : current ? (
                  <div className="ez-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '26px clamp(24px,4vw,48px)', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                      <div className={`ez-product-photo${current.items[0]?.custom ? ' ez-design-photo' : ''}`} style={{ width: '110px', aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden', flex: 'none' }}>
                        <ImageSlot slot="dash-current" shape="rect" src={current.items[0]?.image} width={320} knockout={!!current.items[0]?.custom} placeholder="Jacket" aria-label={current.items[0]?.name || 'Order'} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Order #{current.orderId} · {current.dateLabel}</div>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>{current.items[0]?.name || 'Custom jacket'}</div>
                        <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>{[current.items[0]?.spec, current.items.length > 1 ? `+${current.items.length - 1} more` : ''].filter(Boolean).join(' · ') || `${current.items.length} item(s)`}</div>
                        <div style={{ marginTop: '10px' }}><span className="ez-pill" style={{ background: pillFor(current)[0], color: pillFor(current)[1] }}><i />{current.statusLabel}</span></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                        <span>{current.statusLabel}</span>
                        <span>{money(current.total, current.currency)}</span>
                      </div>
                      <div style={{ height: '8px', borderRadius: '999px', background: 'var(--cream-2)', marginTop: '10px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${current.step < 0 ? 0 : Math.round(((current.step + 1) / ORDER_STAGES.length) * 100)}%`, background: 'var(--gold)' }} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginTop: '12px', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
                        {ORDER_STAGES.map(([t], i) => <span key={t} style={i <= current.step ? { color: 'var(--ink)', fontWeight: '600' } : undefined}>{t.split(' ')[0]}</span>)}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                        <button type="button" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }} onClick={() => openOrder(current)}>Track order</button>
                        <A href="/contact-us" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Message us</A>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ez-panel">
                    <p style={{ margin: '0 0 16px', color: 'var(--muted)', lineHeight: '1.6' }}>Orders you place while signed in show up here with their status.</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <A href="/shop" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>Shop jackets</A>
                      <A href="/track-order" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Track a guest order</A>
                    </div>
                  </div>
                )}
              </div>
              {list.length ? (
                <div>
                  <h2 style={{ ...h2, fontSize: 'clamp(34px,4vw,48px)', margin: '0 0 18px' }}>Recent activity</h2>
                  <div style={{ display: 'grid', gap: '0' }}>
                    {list.slice(0, 5).map((o) => (
                      <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: '18px', alignItems: 'baseline', padding: '14px 0', borderTop: '1px solid var(--cream-2)' }}>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{o.dateLabel}</div>
                        <div style={{ fontSize: '15px' }}>Order placed · {o.statusLabel.toLowerCase()} · {o.isCod ? 'cash on delivery' : 'paid by card'}</div>
                        <button type="button" className="ez-chip" onClick={() => openOrder(o)}>#{o.orderId}</button>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--cream-2)' }} />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {view === 'orders' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={h2}>Your orders</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['All', 'Open', 'Delivered'].map((f) => <button key={f} type="button" className="ez-chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}</button>)}
                </div>
              </div>
              <div style={{ display: 'grid', gap: '18px' }}>
                {ordersLoading ? [0, 1].map((i) => <div key={i} className="ez-skeleton" style={{ height: '140px' }} />) : shown.length ? shown.map((o) => <OrderCard key={o.id} o={o} />) : (
                  <p style={{ color: 'var(--muted)', margin: '0' }}>{list.length ? 'No orders in this group.' : 'No orders yet — they appear here once you check out while signed in.'}</p>
                )}
              </div>
            </div>
          ) : null}
          {view === 'order' && order ? (
            <div style={{ display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
              <div>
                <button type="button" className="ez-chip" onClick={go('orders')}>← All orders</button>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px', marginTop: '16px' }}>
                  <div>
                    <h2 style={{ ...h2, fontSize: 'clamp(44px,5.5vw,72px)' }}>Order #{order.orderId}</h2>
                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '8px' }}>
                      Placed {order.dateLabel} · {order.isCod ? 'Cash on delivery' : order.cardLast4 ? `Card ending ${order.cardLast4}` : 'Paid by card'}{order.trackingNumber ? ` · Tracking ${order.trackingNumber}${order.courier ? ` (${order.courier})` : ''}` : order.courier ? ` · Ships with ${order.courier}` : ''}
                    </div>
                  </div>
                  <span className="ez-pill" style={{ background: pillFor(order)[0], color: pillFor(order)[1], fontSize: '14px', padding: '8px 16px' }}><i />{order.statusLabel}</span>
                </div>
              </div>
              <div className="ez-panel">
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '22px' }}>Tracking</div>
                {order.step < 0 ? <p style={{ margin: '0', color: 'var(--ink-2)' }}>This order was cancelled.</p> : (
                  <div style={{ display: 'grid', gap: '0' }}>
                    {ORDER_STAGES.map(([title, note], i) => {
                      const done = i < order.step, now = i === order.step;
                      return (
                        <div key={title} style={{ display: 'grid', gridTemplateColumns: '34px minmax(0,1fr)', gap: '18px' }}>
                          <div style={{ display: 'grid', justifyItems: 'center', gap: '0' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `3px solid ${i > order.step ? 'var(--cream-2)' : 'var(--ink)'}`, background: done ? 'var(--ink)' : now ? 'var(--gold)' : 'transparent' }} />
                            {i < ORDER_STAGES.length - 1 ? <div style={{ width: '3px', flex: '1', minHeight: '38px', background: i < order.step ? 'var(--ink)' : 'var(--cream-2)' }} /> : null}
                          </div>
                          <div style={{ paddingBottom: '22px' }}>
                            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', lineHeight: '1', color: i > order.step ? 'var(--muted)' : 'var(--ink)' }}>{title}</div>
                            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>{note}</div>
                            {i === 0 ? <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{order.dateLabel}</div> : null}
                            {now && i > 0 ? <div style={{ fontSize: '13px', color: 'var(--gold-2)', fontWeight: '600', marginTop: '2px' }}>Current stage</div> : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                  {/* the courier's own tracking page (lib/orders.js builds it from a fixed list) */}
                  {order.trackingUrl ? <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>Track with {order.courier} ↗</a> : null}
                  <A href="/contact-us" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Ask about this order</A>
                  <button type="button" className="ez-chip" onClick={() => removeOrder(order)}>Remove from my list</button>
                </div>
              </div>
              <div className="ez-two" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '28px clamp(24px,4vw,48px)', alignItems: 'start' }}>
                <div>
                  <h3 style={h3}>Items</h3>
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {order.items.map((l) => (
                      <div key={l.key} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0,1fr) auto', gap: '16px', alignItems: 'center' }}>
                        <div className={`ez-product-photo${l.custom ? ' ez-design-photo' : ''}`} style={{ aspectRatio: '4/5', borderRadius: '3px', overflow: 'hidden' }}>
                          <ImageSlot slot={`line-${order.id}-${l.key}`} shape="rect" src={l.image} width={320} knockout={!!l.custom} placeholder="Jacket" aria-label={l.name} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1' }}>{l.name}</div>
                          <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>{[l.spec, `Qty ${l.quantity}`].filter(Boolean).join(' · ')}</div>
                          {l.slug ? <A href={productPath(l.slug)} style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>View jacket</A> : null}
                        </div>
                        <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{money(l.price * l.quantity, order.currency)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '24px' }}>
                  <div>
                    <h3 style={h3}>Summary</h3>
                    <div style={{ display: 'grid', gap: '10px', fontSize: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{money(order.subtotal, order.currency)}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{order.total - order.subtotal > 0 ? money(order.total - order.subtotal, order.currency) : 'Free'}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '2px solid var(--ink)', paddingTop: '12px', marginTop: '4px' }}>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', textTransform: 'uppercase' }}>Total</span>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px' }}>{money(order.total, order.currency)}</span>
                      </div>
                    </div>
                  </div>
                  {order.shipTo ? (
                    <div>
                      <h3 style={h3}>Shipping to</h3>
                      <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
                        {order.shipTo.name}<br />{order.shipTo.line1}<br />{[order.shipTo.city, order.shipTo.state, order.shipTo.zip].filter(Boolean).join(', ')}<br />{order.shipTo.country}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <A href="/shipping#exchanges" className="ez-chip" style={{ textDecoration: 'none' }}>Return policy</A>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
          {view === 'designs' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={h2}>Your designs</h2>
                <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }}>New design</A>
              </div>
              <div className="ez-panel">
                <p style={{ margin: '0 0 16px', color: 'var(--ink-2)', lineHeight: '1.6', maxWidth: '60ch' }}>
                  Designs are saved inside the design lab under the same email. Open the lab to pick up where you left off, share a design with your team, or order it.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <A href="/design-custom-jacket" className="ez-btn" style={{ minHeight: '44px', fontSize: '17px' }}>Open the design lab →</A>
                  <A href="/how-to-design-jacket" className="ez-chip" style={{ textDecoration: 'none' }}>How it works</A>
                </div>
              </div>
            </div>
          ) : null}
          {view === 'addresses' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <h2 style={h2}>Address</h2>
                <button type="button" className="ez-btn ez-btn-ink" style={{ minHeight: '44px', fontSize: '17px' }} onClick={go('profile')}>Edit address</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
                <div className="ez-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>Shipping</div>
                    <span className="ez-pill" style={{ background: '#efe0a8', color: '#5c4a08' }}><i />Default</span>
                  </div>
                  <p style={{ margin: '12px 0 0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
                    {user.name}<br />{addressText(user.address) || 'No address on file yet.'}<br />{user.phone}
                  </p>
                  <p style={{ margin: '12px 0 0', fontSize: '13px', color: 'var(--muted)' }}>Used to pre-fill checkout. You can still ship each order somewhere else.</p>
                </div>
              </div>
            </div>
          ) : null}
          {view === 'payments' ? (
            <div>
              <h2 style={{ ...h2, margin: '0 0 20px' }}>Payment</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '20px' }}>
                {cards?.length ? cards.map((c) => (
                  <div key={c.id} className="ez-panel">
                    <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase' }}>{c.brand} •••• {c.last4}</div>
                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)' }}>Expires {c.exp}</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}><button type="button" className="ez-chip" onClick={() => removeCard(c)}>Remove</button></div>
                  </div>
                )) : (
                  <div className="ez-panel">
                    <p style={{ margin: '0', color: 'var(--ink-2)', lineHeight: '1.6' }}>No saved cards. Payment happens on Stripe's secure page at checkout; cards you choose to save there appear here.</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          {view === 'profile' ? (
            <div style={{ display: 'grid', gap: 'clamp(28px,4vw,44px)' }}>
              <div>
                <h2 style={{ ...h2, margin: '0 0 20px' }}>Profile</h2>
                <form onSubmit={saveProfile} className="ez-panel" style={{ display: 'grid', gap: '18px', maxWidth: '640px' }}>
                  <label className="ez-label">Full name<input className="ez-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required autoComplete="name" /></label>
                  <label className="ez-label">Email<input className="ez-input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required autoComplete="email" /></label>
                  {emailChanged ? (
                    <label className="ez-label">Current password (to change your email)<input className="ez-input" type="password" value={profile.currentPassword} onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })} required autoComplete="current-password" /></label>
                  ) : null}
                  <label className="ez-label">Phone<input className="ez-input" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} autoComplete="tel" /></label>
                  <label className="ez-label">Address<input className="ez-input" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Street, city, state, ZIP, country" autoComplete="street-address" /></label>
                  {profileState.error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e' }}>{profileState.error}</p> : null}
                  {profileState.msg ? <p role="status" style={{ margin: '0', fontSize: '14px', color: 'var(--gold-2)', fontWeight: '600' }}>{profileState.msg}</p> : null}
                  <button type="submit" className="ez-btn ez-btn-ink" style={{ justifySelf: 'start', minHeight: '46px', fontSize: '18px' }} disabled={profileState.busy}>{profileState.busy ? 'Saving…' : 'Save changes'}</button>
                </form>
              </div>
              <div>
                <h2 style={{ ...h2, fontSize: 'clamp(34px,4vw,48px)', margin: '0 0 16px' }}>Password</h2>
                <form onSubmit={savePassword} className="ez-panel" style={{ display: 'grid', gap: '18px', maxWidth: '640px' }}>
                  <label className="ez-label">Current password<input className="ez-input" type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required autoComplete="current-password" /></label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                    <label className="ez-label">New password<input className="ez-input" type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required minLength={6} autoComplete="new-password" /></label>
                    <label className="ez-label">Confirm<input className="ez-input" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required minLength={6} autoComplete="new-password" /></label>
                  </div>
                  {pwState.error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e' }}>{pwState.error}</p> : null}
                  {pwState.msg ? <p role="status" style={{ margin: '0', fontSize: '14px', color: 'var(--gold-2)', fontWeight: '600' }}>{pwState.msg}</p> : null}
                  <button type="submit" className="ez-btn" style={{ justifySelf: 'start', minHeight: '46px', fontSize: '18px' }} disabled={pwState.busy}>{pwState.busy ? 'Saving…' : 'Change password'}</button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <Footer />
    </div>
  );
}
