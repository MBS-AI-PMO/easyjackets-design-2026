import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import instance from '../constant/instance'
import { toast } from 'react-toastify'
import { useAuth } from '../Context/authContext'
import './Auth.css'

// line icons for the fields (inline: no icon font, nothing extra to load)
const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const MailIcon = () => <Icon><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></Icon>
const LockIcon = () => <Icon><rect x="4.5" y="10.5" width="15" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></Icon>
const EyeIcon = () => <Icon><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></Icon>
const EyeOffIcon = () => <Icon><path d="M3 3l18 18" /><path d="M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.1 3.8M6.6 6.9C4 8.6 2.5 12 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Icon>

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // look only: the password can be shown, Caps Lock is pointed out, the button waits while the request runs
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // the white logo and its height from Settings -> Site Identity (the storefront footer's, made for dark
  // backgrounds), else the name in type
  const [logo, setLogo] = useState({ src: '', height: 0 });
  const [logoFailed, setLogoFailed] = useState(false);

  const navigate = useNavigate()

  const { login } = useAuth()

  useEffect(() => {
    let mounted = true;
    instance.get('/metadata/global-settings')
      .then(({ data }) => { if (mounted) setLogo({ src: data?.metadata?.footerLogo || '', height: Number(data?.metadata?.footerLogoHeight) || 0 }); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {

      const { data } = await instance.post('/auth/login', { email, password })

      if (!data.success) {
        toast.error("please check you credentials")
        return
      }
      // the admin is for admins: a customer account signs in on the storefront, never here (its token used
      // to be kept and every admin screen shown)
      if (data.user?.role !== 1) {
        sessionStorage.removeItem('auth')
        toast.error("you are not authorised as admin")
        navigate('/')
        return
      }

      sessionStorage.setItem('auth', JSON.stringify(data))
      toast.success("login successfully")
      login()
    }
    catch (error) {
      toast.error("you are not authorised as admin")
    }
    finally {
      setSubmitting(false);
    }
  };

  const noteCapsLock = (e) => setCapsLock(Boolean(e.getModifierState && e.getModifierState('CapsLock')));

  return (
    <main className="ej-auth">
      <div className="ej-auth-glow" aria-hidden="true" />
      <div className="ej-auth-glow ej-auth-glow--2" aria-hidden="true" />
      <div className="ej-auth-card">
        <div className="ej-auth-brand">
          {logo.src && !logoFailed ? (
            <img className="ej-auth-logo" src={logo.src} alt="Easy Jackets" style={logo.height ? { height: `${logo.height}px` } : undefined} onError={() => setLogoFailed(true)} />
          ) : (
            <span className="ej-auth-wordmark">Easy Jackets</span>
          )}
          <span className="ej-auth-badge">Admin</span>
        </div>

        <h1 className="ej-auth-title">Welcome back</h1>
        <p className="ej-auth-sub">Sign in to manage orders, products and the store.</p>

        <form className="ej-auth-form" onSubmit={handleSubmit}>
          <label className="ej-auth-label" htmlFor="email">Email address</label>
          <div className="ej-auth-field">
            <span className="ej-auth-icon"><MailIcon /></span>
            <input
              className="ej-auth-input"
              required
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@easyjackets.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="ej-auth-label" htmlFor="password">Password</label>
          <div className="ej-auth-field">
            <span className="ej-auth-icon"><LockIcon /></span>
            <input
              className="ej-auth-input ej-auth-input--pw"
              required
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={noteCapsLock}
              onKeyDown={noteCapsLock}
              onBlur={() => setCapsLock(false)}
            />
            <button
              type="button"
              className="ej-auth-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls="password"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <div className={`ej-auth-caps${capsLock ? ' is-on' : ''}`} role="status" aria-live="polite">
            {capsLock ? 'Caps Lock is on' : ''}
          </div>

          <button type="submit" className="ej-auth-submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? <span className="ej-auth-spinner" aria-hidden="true" /> : null}
            <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
          </button>
        </form>
      </div>
      <p className="ej-auth-foot">Authorised staff only · Easy Jackets</p>
    </main>
  );
}

export default Auth;
