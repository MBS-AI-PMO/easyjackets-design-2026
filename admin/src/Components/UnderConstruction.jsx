import React from 'react';
import axios from 'axios';
import { BASE_URL, uploadUrl } from '../constant/url';
import './UnderConstruction.css';

// The holding page the admin shows before sign-in while the site is under construction (Settings → Site
// Status; the gate is AdminGate below). The same page as the storefront's (UnderConstruction.css is a copy
// of frontend/src/pages/UnderConstruction.css); here it also has "Team sign in", so the team can always
// get in, among other things to switch it off. Signed-in admins never see it.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800&family=Instrument+Sans:wght@400;600;700&display=swap';
const PREVIEW_KEY = 'ej-preview';
const TEAM_KEY = 'ej-team-signin';

const params = new URLSearchParams(window.location.search);
const onLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const showOnLocalhost = params.has('uc');

const getPreviewKey = () => {
  const fromAddress = params.get('preview');
  try {
    if (fromAddress && fromAddress !== 'off') localStorage.setItem(PREVIEW_KEY, fromAddress);
    if (fromAddress === 'off') localStorage.removeItem(PREVIEW_KEY);
    return localStorage.getItem(PREVIEW_KEY) || '';
  } catch {
    return fromAddress && fromAddress !== 'off' ? fromAddress : '';
  }
};

const teamChoseSignIn = () => {
  try { return sessionStorage.getItem(TEAM_KEY) === '1'; } catch { return false; }
};

function HoldingPage({ message, onTeamSignIn }) {
  const [contact, setContact] = React.useState(null);
  const [logo, setLogo] = React.useState('');

  // the storefront's navbar logo (Site Identity & Logos)
  React.useEffect(() => {
    let alive = true;
    axios.get(`${BASE_URL}/metadata/global-settings`, { timeout: 5000 })
      .then(({ data }) => { if (alive && data?.metadata?.navbarLogo) setLogo(uploadUrl(data.metadata.navbarLogo)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Under construction | Easy Jackets';
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = FONTS_HREF;
    document.head.appendChild(fonts);
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      fonts.remove();
      robots.remove();
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    axios.get(`${BASE_URL}/features/website/details`, { timeout: 5000 })
      .then(({ data }) => {
        const website = data?.website;
        if (alive && website) setContact({ email: String(website.email || '').trim(), phone: String(website.phoneNumber || '').trim() });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const headline = String(message || '').trim() || 'Something new is being stitched';
  const words = headline.split(/\s+/);
  // each step comes in after the one before it (seconds)
  const after = (step) => ({ animationDelay: `${0.15 + step * 0.12}s` });
  const textStep = 2 + words.length * 0.6;
  const tel = contact?.phone ? `tel:${contact.phone.replace(/[^\d+]/g, '')}` : '';

  return (
    <main className="ez-uc" aria-labelledby="ez-uc-title">
      <div className="ez-uc-glow" aria-hidden="true" />
      <div className="ez-uc-inner">
        {logo && <img className="ez-uc-logo ez-uc-in" style={after(0)} src={logo} alt="Easy Jackets" />}
        <span className="ez-uc-label ez-uc-in" style={after(1)}>
          <span className="ez-uc-dot" aria-hidden="true" />
          Under construction
        </span>
        <h1 id="ez-uc-title" className="ez-uc-title" aria-label={headline}>
          {words.map((word, i) => (
            <span className="ez-uc-word" key={`${word}-${i}`} aria-hidden="true">
              <span style={after(2 + i * 0.6)}>{word}</span>
            </span>
          ))}
        </h1>
        <p className="ez-uc-text ez-uc-in" style={after(textStep)}>
          We're building the new Easy Jackets: custom letterman jackets, designed by you and made by hand.
          The site will be back very soon.
        </p>

        {/* the thread being sewn: a faint seam line, the gold stitches revealed behind a moving needle */}
        <svg className="ez-uc-seam ez-uc-in" style={after(textStep + 1)} viewBox="0 0 320 28" aria-hidden="true">
          <defs>
            <clipPath id="ez-uc-sewn">
              <rect className="ez-uc-sewn" x="0" y="0" width="320" height="28" />
            </clipPath>
          </defs>
          <line className="ez-uc-seam-line" x1="6" y1="16" x2="314" y2="16" />
          <g className="ez-uc-thread" clipPath="url(#ez-uc-sewn)">
            <line x1="6" y1="16" x2="314" y2="16" />
          </g>
          <g className="ez-uc-needle">
            <g className="ez-uc-needle-bob">
              <path d="M1 17 L-7 -5" />
              <circle cx="-6.1" cy="-2.4" r="1.6" />
            </g>
          </g>
        </svg>

        {(contact?.email || contact?.phone) && (
          <p className="ez-uc-contact ez-uc-in" style={after(textStep + 2)}>
            Questions or an order in progress?{' '}
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            {contact.email && contact.phone && <span className="ez-uc-sep"> · </span>}
            {contact.phone && <a href={tel}>{contact.phone}</a>}
          </p>
        )}

        <button type="button" className="ez-uc-team ez-uc-in" style={after(textStep + 3)} onClick={onTeamSignIn}>
          Team sign in
        </button>
      </div>
    </main>
  );
}

/**
 * The sign-in screen, or the holding page while the site is under construction. "Team sign in" (kept for
 * this browser tab) and the private preview link (?preview=<key>) both lead to the sign-in screen.
 */
export default function AdminGate({ children }) {
  const [state, setState] = React.useState({ loaded: false, blocked: false, message: '' });
  const [team, setTeam] = React.useState(teamChoseSignIn);

  React.useEffect(() => {
    if (onLocalhost) return undefined;
    let alive = true;
    axios.get(`${BASE_URL}/site-status`, { timeout: 5000, params: { preview: getPreviewKey() } })
      .then(({ data }) => {
        if (alive) setState({ loaded: true, blocked: Boolean(data?.underConstruction) && !data?.preview, message: data?.message || '' });
      })
      .catch(() => { if (alive) setState({ loaded: true, blocked: false, message: '' }); }); // never lock the team out
    return () => { alive = false; };
  }, []);

  const signIn = () => {
    try { sessionStorage.setItem(TEAM_KEY, '1'); } catch { /* storage blocked: for this page only */ }
    setTeam(true);
  };

  if (onLocalhost) return showOnLocalhost && !team ? <HoldingPage onTeamSignIn={signIn} /> : children;
  if (team) return children;
  if (!state.loaded) return <div style={{ minHeight: '100vh', background: '#f4efe6' }} />;
  return state.blocked ? <HoldingPage message={state.message} onTeamSignIn={signIn} /> : children;
}
