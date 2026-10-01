import React from 'react';
import fallbackLogo from '../../assets/images/site-logo.webp';
import '../../css/site.css';
import './styles.css';

// The navbar logo this browser last saw (components/SiteNav keeps it), else the bundled one: the
// loader shows before the navbar and its request.
const cachedLogo = () => {
  try {
    const v = JSON.parse(localStorage.getItem('ej-builder-nav-logo') || 'null');
    return (v && typeof v.src === 'string' && v.src) || fallbackLogo;
  } catch {
    return fallbackLogo;
  }
};

/** The full-screen loading state, in the storefront's look: logo, heading, message and a gold progress line. */
const Loader = ({ msg }) => (
  <div className="ez-site cjd-loader" role="status" aria-live="polite">
    <div className="cjd-loader-inner">
      <img
        className="cjd-loader-logo"
        src={cachedLogo()}
        alt="Easy Jackets"
        decoding="async"
        onError={(e) => { if (!e.currentTarget.src.endsWith(fallbackLogo)) e.currentTarget.src = fallbackLogo; }}
      />
      <div className="ez-eyebrow">Design Studio</div>
      <div className="cjd-loader-title">Getting your jacket ready</div>
      {msg ? <p className="cjd-loader-msg">{msg}</p> : null}
      <div className="cjd-loader-bar" aria-hidden="true"><span /></div>
    </div>
  </div>
);

export default Loader;
