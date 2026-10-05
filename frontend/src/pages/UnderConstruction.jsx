import { useEffect, useState } from 'react';
import { FALLBACK_NAV_LOGO, useSiteIdentity } from '../lib/siteIdentity';
import { fetchWebsiteDetails, telHref } from '../lib/site';
import './UnderConstruction.css';

// The "under construction" screen while one of the apps is being deployed (components/SiteGate.jsx). The
// headline is the admin's text (Settings → Site Status) when one is set. Everything comes in one after the
// other, the headline word by word, and a gold thread keeps sewing itself across under the text. `leaving`
// fades the page away when the site is back. Kept out of search results while it shows.
export default function UnderConstruction({ message, leaving = false }) {
  const identity = useSiteIdentity();
  const [contact, setContact] = useState(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Under construction | Easy Jackets';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetchWebsiteDetails().then((details) => { if (alive) setContact(details); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const logo = identity.navSrc || FALLBACK_NAV_LOGO;
  const headline = String(message || '').trim() || 'Something new is being stitched';
  const words = headline.split(/\s+/);
  // each step comes in after the one before it (seconds)
  const after = (step) => ({ animationDelay: `${0.15 + step * 0.12}s` });
  const textStep = 2 + words.length * 0.6;

  return (
    <main className={`ez-uc${leaving ? ' ez-uc--leaving' : ''}`} aria-labelledby="ez-uc-title">
      <div className="ez-uc-glow" aria-hidden="true" />
      <div className="ez-uc-inner">
        <img
          className="ez-uc-logo ez-uc-in"
          style={after(0)}
          src={logo}
          alt="Easy Jackets"
          onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_NAV_LOGO)) e.currentTarget.src = FALLBACK_NAV_LOGO; }}
        />
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
          We're updating Easy Jackets right now. The site will be back in a few minutes, all by itself.
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
            {contact.phone && <a href={telHref(contact.phone)}>{contact.phone}</a>}
          </p>
        )}
      </div>
    </main>
  );
}
