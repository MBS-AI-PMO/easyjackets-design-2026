// Sign in, create an account, or reset a password — against /auth/login,
// /auth/register and /auth/forgot-password (the current site's accounts).
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';

const MODES = [['login', 'Sign in'], ['signup', 'Create account']];
const EMPTY = { name: '', email: '', password: '', phone: '', address: '', answer: '', newPassword: '' };

export default function Account() {
  usePageTitle('Your account', 'Sign in to Easy Jackets to track orders, save designs and reorder for a new season.');
  const { user, ready, login, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') && params.get('next').startsWith('/') ? params.get('next') : '/dashboard';
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Already signed in: straight on to where they were going.
  useEffect(() => { if (ready && user) navigate(next, { replace: true }); }, [ready, user, next, navigate]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const switchMode = (m) => { setMode(m); setError(''); setNotice(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email.trim(), form.password);
        navigate(next, { replace: true });
      } else if (mode === 'signup') {
        if (form.password.length < 6) throw new Error('Use a password of at least 6 characters.');
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim(), address: form.address.trim(), answer: form.answer.trim() });
        navigate(next, { replace: true });
      } else {
        if (form.newPassword.length < 6) throw new Error('Use a new password of at least 6 characters.');
        await api.post('/auth/forgot-password', { email: form.email.trim(), answer: form.answer.trim(), newPassword: form.newPassword }, { auth: false });
        setNotice('Password reset. Sign in with your new password.');
        setMode('login');
        setForm((f) => ({ ...EMPTY, email: f.email }));
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'signup' ? ['Start', 'here'] : mode === 'forgot' ? ['Reset your', 'password'] : ['Welcome', 'back'];
  const submitLabel = mode === 'login' ? 'Sign in →' : mode === 'signup' ? 'Create account →' : 'Reset password →';

  return (
    <div className="pg-account">
      <Nav cta="cart" />
      {/* Account */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(320px,480px)', gap: '40px clamp(24px,5vw,80px)', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
            Your account
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
            {title[0]}
            <br />
            {title[1]}
          </h1>
          <p style={{ maxWidth: '44ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            Sign in to see your orders, track shipments, keep your details for the next checkout and reorder for a new season in one click.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '20px', marginTop: '36px' }}>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>Order history</div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>Every jacket you have ordered, with its status.</p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>Faster checkout</div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>Your address and phone are filled in for you.</p>
            </div>
            <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>Team rosters</div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>Reorder last season's build with new names.</p>
            </div>
          </div>
        </div>
        <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          {mode !== 'forgot' ? (
            <div className="ez-seg" style={{ display: 'flex' }}>
              {MODES.map(([v, l]) => (
                <button key={v} type="button" aria-pressed={mode === v} onClick={() => switchMode(v)} style={{ flex: '1' }}>{l}</button>
              ))}
            </div>
          ) : null}
          <form onSubmit={submit} style={{ display: 'grid', gap: '16px', marginTop: '24px' }} noValidate>
            {mode === 'signup' ? (
              <label className="ez-label">
                Full name
                <input className="ez-input" required value={form.name} onChange={set('name')} autoComplete="name" />
              </label>
            ) : null}
            <label className="ez-label">
              Email
              <input className="ez-input" type="email" required placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
            </label>
            {mode !== 'forgot' ? (
              <label className="ez-label">
                Password
                <input className="ez-input" type="password" required placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} />
              </label>
            ) : null}
            {mode === 'signup' ? (
              <>
                <label className="ez-label">
                  Phone
                  <input className="ez-input" type="tel" required placeholder="+1 555 000 0000" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </label>
                <label className="ez-label">
                  Address
                  <input className="ez-input" required placeholder="Street, city, state, ZIP" value={form.address} onChange={set('address')} autoComplete="street-address" />
                </label>
              </>
            ) : null}
            {mode !== 'login' ? (
              <label className="ez-label">
                Security word
                <input className="ez-input" required placeholder={mode === 'signup' ? 'A word only you know — it resets your password' : 'The word you chose when you signed up'} value={form.answer} onChange={set('answer')} />
              </label>
            ) : null}
            {mode === 'forgot' ? (
              <label className="ez-label">
                New password
                <input className="ez-input" type="password" required placeholder="••••••••" value={form.newPassword} onChange={set('newPassword')} autoComplete="new-password" minLength={6} />
              </label>
            ) : null}
            {mode === 'login' ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '13px' }}>
                <button type="button" onClick={() => switchMode('forgot')} style={{ background: 'none', border: 0, padding: 0, font: 'inherit', fontWeight: '600', cursor: 'pointer', borderBottom: '2px solid var(--gold)', color: 'inherit' }}>Forgot password?</button>
              </div>
            ) : null}
            {error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e', lineHeight: '1.5' }}>{error}</p> : null}
            {notice ? <p role="status" style={{ margin: '0', fontSize: '14px', color: 'var(--gold-2)', fontWeight: '600', lineHeight: '1.5' }}>{notice}</p> : null}
            <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }} disabled={busy}>{busy ? 'One moment…' : submitLabel}</button>
            {mode === 'forgot' ? (
              <button type="button" className="ez-btn" style={{ width: '100%' }} onClick={() => switchMode('login')}>Back to sign in</button>
            ) : null}
            <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', textAlign: 'center' }}>
              No account needed to order.{' '}
              <A href="/track-order" style={{ color: 'inherit', fontWeight: '600' }}>Track an order as a guest →</A>
            </p>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
