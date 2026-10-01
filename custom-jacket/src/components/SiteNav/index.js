import React, { useEffect, useState } from "react";
import fallbackLogo from "../../assets/images/site-logo.webp";
import { frontendUrl, imageUrl } from "../../config/url";
import { getSiteSettings } from "../../utils/siteSettings";
import { useScrollLock } from "../../utils/scrollLock";
import "../../css/site.css";
import "./styles.css";

// The navbar parts the builder's one bar (components/Header) is made of, in the storefront navbar's
// look (frontend/src/components/Nav.jsx): the admin's navbar logo, the storefront links, and the
// menu button with its slide-in drawer on narrow screens. Every link opens the storefront.

export const NAV_LINKS = [
  ["Shop", "/shop"],
  ["How to Design", "/how-to-design-jacket"],
  ["Size Guide", "/sizechart"],
  ["Bulk Orders", "/bulk-order"],
  ["Contact", "/contact-us"],
];

// the last navbar logo this browser saw, so it paints at once on the next visit (the loader uses it too)
export const NAV_LOGO_KEY = "ej-builder-nav-logo";
const readLogo = () => {
  try {
    const v = JSON.parse(localStorage.getItem(NAV_LOGO_KEY) || "null");
    return v && typeof v.src === "string" ? v : null;
  } catch {
    return null;
  }
};

/** The admin's navbar logo and its height (Settings → Site Identity & Logos). */
export const useNavLogo = () => {
  const [logo, setLogo] = useState(() => readLogo() || { src: "", height: 72 });
  useEffect(() => {
    let mounted = true;
    getSiteSettings()
      .then((m) => {
        const next = { src: m.navbarLogo ? imageUrl(m.navbarLogo, 320) : "", height: Number(m.navbarLogoHeight) || 72 };
        if (!mounted) return;
        setLogo(next);
        try { localStorage.setItem(NAV_LOGO_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      })
      .catch((error) => console.error("Error fetching the navbar logo:", error));
    return () => {
      mounted = false;
    };
  }, []);
  return logo;
};

const onLogoError = (e) => {
  // the bundled logo when the admin's file is missing
  if (!e.currentTarget.src.endsWith(fallbackLogo)) e.currentTarget.src = fallbackLogo;
};

export const NavLogo = ({ logo }) => (
  <a href={frontendUrl("/")} className="ez-nav-logo" aria-label="Easy Jackets home" style={{ "--ez-logo-h": `${logo.height}px` }}>
    <img src={logo.src || fallbackLogo} alt="Easy Jackets" height={logo.height} decoding="sync" fetchpriority="high" onError={onLogoError} />
  </a>
);

export const NavLinks = () => (
  <nav className="ez-nav-links" aria-label="Easy Jackets">
    {NAV_LINKS.map(([label, href]) => <a key={href} href={frontendUrl(href)}>{label}</a>)}
  </nav>
);

export const NavBurger = ({ open, onOpen }) => (
  <button type="button" className="ez-burger" aria-label="Open menu" aria-expanded={open} aria-controls="ez-drawer" onClick={onOpen}>
    <span /><span /><span />
  </button>
);

/** The slide-in menu for narrow screens; Escape, the backdrop, × and any link close it. */
export const NavDrawer = ({ open, onClose, logo }) => {
  useScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="ez-site">
      <div className={`ez-drawer-backdrop${open ? " is-open" : ""}`} onClick={onClose} aria-hidden="true" />
      <aside id="ez-drawer" className={`ez-drawer${open ? " is-open" : ""}`} aria-hidden={!open} aria-label="Menu">
        <div className="ez-drawer-head">
          <img src={logo.src || fallbackLogo} alt="Easy Jackets" height="48" decoding="async" onError={onLogoError} />
          <button type="button" className="ez-drawer-close" aria-label="Close menu" onClick={onClose}>×</button>
        </div>
        <div className="ez-drawer-links" onClick={(e) => { if (e.target.closest("a")) onClose(); }}>
          {NAV_LINKS.map(([label, href]) => <a key={href} href={frontendUrl(href)} className="ez-drawer-top">{label}</a>)}
        </div>
      </aside>
    </div>
  );
};
