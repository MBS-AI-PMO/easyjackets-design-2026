import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import fallbackLogo from "../../assets/images/site-logo.webp";
import { frontendUrl, imageUrl } from "../../config/url";
import { getSiteSettings } from "../../utils/siteSettings";
import "../../css/site.css";
import "./styles.css";

// The storefront's footer (frontend/src/components/Footer.jsx): newsletter, logo and socials, the
// three link columns and the admin's contact details. Every link opens the storefront.

const COLUMNS = [
  { title: "Shop", links: [["Varsity Jackets", "/shop"], ["Bomber Jackets", "/shop"], ["Fleece Hoodies", "/shop"], ["Coach Jackets", "/shop"], ["Bestsellers", "/#bestsellers"]] },
  { title: "Custom", links: [["Design Your Own", "/design-custom-jacket"], ["Materials & Colors", "/material-colors"], ["Patches & Embroidery", "/embroidery-and-patches"], ["Bulk & Team Orders", "/bulk-order"], ["Size Guide", "/sizechart"]] },
  { title: "Help", links: [["FAQ", "/faq"], ["Track Order", "/track-order"], ["Shipping & Returns", "/shipping"], ["Contact Us", "/contact-us"], ["Blog", "/new-blog"]] },
];

const SOCIAL_NAMES = { facebook: "Facebook", instagram: "Instagram", twitter: "X (Twitter)", linkedin: "LinkedIn", youtube: "YouTube", tiktok: "TikTok", pinterest: "Pinterest" };
// the short label on the footer's square social buttons
const SOCIAL_ABBR = { facebook: "FB", instagram: "IG", twitter: "X", linkedin: "IN", youtube: "YT", tiktok: "TT", pinterest: "PT" };

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
const telHref = (phone) => {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
};

/** "Factory Address\nEasy Jackets\nCiti Villas, Sialkot": a first line that reads like a heading becomes the label. */
const parseAddress = (text) => {
  const lines = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const heading = lines.length > 1 && lines[0].length <= 40 && /address|office|workshop|factory|warehouse|store|hq/i.test(lines[0]);
  return { label: heading ? lines[0] : "", lines: heading ? lines.slice(1) : lines };
};

/** Contact details and social links from the admin (Website Details). */
const toSite = (w) => {
  if (!w) return null;
  const socials = Object.entries(w.socialLinks || {})
    .filter(([key, url]) => String(url || "").trim() && (w.isActive?.[key] ?? true))
    .map(([key, url]) => ({ key, name: SOCIAL_NAMES[key] || key, abbr: SOCIAL_ABBR[key] || key.slice(0, 2).toUpperCase(), url: String(url).trim() }));
  return {
    email: String(w.email || "").trim(),
    phone: String(w.phoneNumber || "").trim(),
    addresses: [w.address, w.address1].map(parseAddress).filter(Boolean),
    socials,
  };
};

/** The newsletter sign-up: POST /features/subscribe, with the API's reply shown under the field. */
const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState({ sending: false, ok: false, message: "" });
  const submit = async (e) => {
    e.preventDefault();
    if (!isEmail(email)) {
      setState({ sending: false, ok: false, message: "Enter a valid email address." });
      return;
    }
    setState({ sending: true, ok: false, message: "" });
    try {
      const res = await axiosInstance.post("/features/subscribe", { email: email.trim() });
      if (res.data?.success === false) throw new Error(res.data.message);
      setState({ sending: false, ok: true, message: res.data?.message || "Successfully subscribed to newsletter!" });
      setEmail("");
    } catch (err) {
      setState({ sending: false, ok: false, message: err?.response?.data?.message || err?.message || "Failed to subscribe. Please try again." });
    }
  };
  return (
    <div>
      <form onSubmit={submit} noValidate className="ez-footer-form">
        <input type="email" placeholder="you@school.edu" aria-label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={state.sending} aria-invalid={!state.ok && !!state.message} />
        <button type="submit" className="ez-btn ez-btn-gold" disabled={state.sending} style={{ borderRadius: "0 2px 2px 0", opacity: state.sending ? 0.7 : 1 }}>
          {state.sending ? "Joining…" : "Join"}
        </button>
      </form>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={`ez-footer-news-msg${state.ok ? " is-ok" : ""}`}>{state.message}</p>
      ) : null}
    </div>
  );
};

const CustomFooter = () => {
  const [site, setSite] = useState(null);
  const [logo, setLogo] = useState({ src: "", height: 64 });

  useEffect(() => {
    let mounted = true;
    // footer logo + size from the admin (Site Identity & Logos), contact details from Website Details
    getSiteSettings()
      .then((m) => {
        if (mounted) setLogo({ src: m.footerLogo || "", height: Number(m.footerLogoHeight) || 64 });
      })
      .catch((error) => console.error("Error fetching footer logo:", error));
    axiosInstance
      .get("/features/website/details")
      .then((res) => {
        if (mounted) setSite(toSite(res.data?.website));
      })
      .catch((error) => console.error("Error fetching footer details:", error));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer className="ez-site ez-footer">
      <div className="ez-footer-grid">
        <div className="ez-footer-news">
          <div>
            <div className="ez-footer-kicker">Newsletter</div>
            <div className="ez-footer-headline">Get 10% off your first jacket</div>
          </div>
          <NewsletterForm />
        </div>

        <div>
          <a href={frontendUrl("/")} aria-label="Easy Jackets home">
            <img
              className="ez-footer-logo"
              src={logo.src ? imageUrl(logo.src, 480) : fallbackLogo}
              alt="Easy Jackets"
              height={logo.height}
              loading="lazy"
              decoding="async"
              style={{ "--ez-footer-logo-h": `${logo.height}px` }}
              onError={(e) => {
                // the bundled logo when the admin's file is missing
                if (!e.currentTarget.src.endsWith(fallbackLogo)) e.currentTarget.src = fallbackLogo;
              }}
            />
          </a>
          <p className="ez-footer-intro">
            Custom varsity and letterman jackets in melton wool and genuine leather. Made to order, no minimums, shipped worldwide.
          </p>
          {/* the admin's social profiles that are switched on (Website Details -> Social Media Profiles) */}
          {site?.socials?.length ? (
            <div className="ez-footer-socials">
              {site.socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`Easy Jackets on ${s.name}`} title={s.name} className="ez-footer-social">{s.abbr}</a>
              ))}
            </div>
          ) : null}
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <div className="ez-footer-title">{col.title}</div>
            <div className="ez-footer-links">
              {col.links.map(([label, href]) => <a key={label} href={frontendUrl(href)} className="ez-footer-link">{label}</a>)}
            </div>
          </div>
        ))}

        {/* Contact: the admin's phone, email and addresses (Website Details -> Contact Information) */}
        <div>
          <div className="ez-footer-title">Contact</div>
          <div className="ez-footer-contact">
            {site?.phone ? <a href={telHref(site.phone)} className="ez-footer-link">{site.phone}</a> : null}
            {site?.email ? <a href={`mailto:${site.email}`} className="ez-footer-link">{site.email}</a> : null}
            <div className="ez-footer-hours">Mon–Fri, 9am–6pm ET</div>
            {(site?.addresses || []).map((a, i) => (
              <div key={i} className="ez-footer-addr">
                {a.label ? <div className="ez-footer-addr-label">{a.label}</div> : null}
                {a.lines.map((l, j) => <div key={j}>{l}</div>)}
              </div>
            ))}
          </div>
        </div>

        <div className="ez-footer-legal">
          <span>© 2020–2026 Easy Jackets. All rights reserved.</span>
          <span className="ez-footer-legal-links">
            <a href={frontendUrl("/privacypolicy")}>Privacy</a>
            <a href={frontendUrl("/terms-and-conditions")}>Terms</a>
            <span>Visa · Mastercard · Amex · PayPal</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
