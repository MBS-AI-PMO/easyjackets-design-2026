// Converted from design/Easy Jackets Account.dc.html
import { useNavigate } from 'react-router-dom';
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { mode: 'login' };

export default function Account() {
  const [state, setState] = useDcState(INITIAL_STATE);
  const navigate = useNavigate();

  function renderVals() {
    const s = state;
    return { footerNoop: e => e.preventDefault(), cartCount: 0,
      modes: [['login', 'Sign in'], ['signup', 'Create account']].map(([v, l]) => ({ label: l, active: s.mode === v, select: () => setState({ mode: v }) })),
      isLogin: s.mode === 'login', isSignup: s.mode === 'signup', submitLabel: s.mode === 'login' ? 'Sign in →' : 'Create account →',
      submit: e => { e.preventDefault(); navigate('/dashboard'); } };
  }

  const { cartCount, isLogin, isSignup, modes, submit, submitLabel } = renderVals();

  return (
    <div className="pg-account">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Account */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,88px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(320px,480px)', gap: '40px clamp(24px,5vw,80px)', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
            Your account
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
            Welcome
            <br />
            back
          </h1>
          <p style={{ maxWidth: '44ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            Sign in to see saved designs, approve proofs, track orders and reorder for a new season in one click.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '20px', marginTop: '36px' }}>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>Saved designs</div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Pick up where you left off in the lab.
              </p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>
                Proof approvals
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>Review and approve in one place.</p>
            </div>
            <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '12px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase' }}>Team rosters</div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                Reorder last season's build with new names.
              </p>
            </div>
          </div>
        </div>
        <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          <div className="ez-seg" style={{ display: 'flex' }}>
            {modes.map((m, mIdx) => (
              <button key={mIdx} type="button" aria-pressed={m.active} onClick={m.select} style={{ flex: '1' }}>{m.label}</button>
            ))}
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gap: '16px', marginTop: '24px' }}>
            {isSignup ? (
              <label className="ez-label">
                Full name
                <input className="ez-input" required />
              </label>
            ) : null}
            <label className="ez-label">
              Email
              <input className="ez-input" type="email" required placeholder="you@example.com" />
            </label>
            <label className="ez-label">
              Password
              <input className="ez-input" type="password" required placeholder="••••••••" />
            </label>
            {isLogin ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--muted)' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--ink)', width: '16px', height: '16px' }} />
                  {' '}Keep me signed in
                </label>
                <A href="#" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>Forgot password?</A>
              </div>
            ) : null}
            <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }}>{submitLabel}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              <span style={{ flex: '1', height: '1px', background: 'var(--cream-2)' }} />
              or
              <span style={{ flex: '1', height: '1px', background: 'var(--cream-2)' }} />
            </div>
            <button type="button" className="ez-btn" style={{ width: '100%' }}>Continue with Google</button>
            <button type="button" className="ez-btn" style={{ width: '100%' }}>Continue with Apple</button>
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
