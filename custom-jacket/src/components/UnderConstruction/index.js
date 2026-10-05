import React from "react";
import logo from "../../assets/images/Header-logo.webp";
import axiosInstance from "../../utils/axiosConfig";
import "./holding.css";

// The holding page (components/MaintenanceGate): the same page as the storefront's
// (frontend/src/pages/UnderConstruction.jsx, holding.css is a copy of its stylesheet).
//   mode "site":   the site is under construction (admin: Settings → Site Status); the headline is the
//                  admin's message when one is set
//   mode "deploy": a deployment is running (backend /features/deployment-status); back by itself after it
// `leaving` fades it away when the designer opens.
const COPY = {
  site: {
    label: "Under construction",
    headline: "Something new is being stitched",
    text: "We're building the new Easy Jackets: custom letterman jackets, designed by you and made by hand. The site will be back very soon.",
  },
  deploy: {
    label: "Updating Easy Jackets",
    headline: "The site is under construction",
    text: "We are applying a site update right now. The designer will return automatically when deployment is complete.",
  },
};

const UnderConstruction = ({ mode = "site", message, leaving = false }) => {
  const [contact, setContact] = React.useState(null);
  const copy = COPY[mode] || COPY.site;

  React.useEffect(() => {
    const previousTitle = document.title;
    document.title = "Under construction | Easy Jackets";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => {
      document.title = previousTitle;
      robots.remove();
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    axiosInstance
      .get("/features/website/details", { timeout: 5000 })
      .then(({ data }) => {
        const website = data?.website;
        if (alive && website) {
          setContact({ email: String(website.email || "").trim(), phone: String(website.phoneNumber || "").trim() });
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const headline = String(message || "").trim() || copy.headline;
  const words = headline.split(/\s+/);
  // each step comes in after the one before it (seconds)
  const after = (step) => ({ animationDelay: `${0.15 + step * 0.12}s` });
  const textStep = 2 + words.length * 0.6;
  const tel = contact?.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : "";

  return (
    <main className={`ez-uc${leaving ? " ez-uc--leaving" : ""}`} aria-labelledby="ez-uc-title">
      <div className="ez-uc-glow" aria-hidden="true" />
      <div className="ez-uc-inner">
        <img className="ez-uc-logo ez-uc-logo--ink ez-uc-in" style={after(0)} src={logo} alt="Easy Jackets" />
        <span className="ez-uc-label ez-uc-in" style={after(1)}>
          <span className="ez-uc-dot" aria-hidden="true" />
          {copy.label}
        </span>
        <h1 id="ez-uc-title" className="ez-uc-title" aria-label={headline}>
          {words.map((word, i) => (
            <span className="ez-uc-word" key={`${word}-${i}`} aria-hidden="true">
              <span style={after(2 + i * 0.6)}>{word}</span>
            </span>
          ))}
        </h1>
        <p className="ez-uc-text ez-uc-in" style={after(textStep)}>{copy.text}</p>

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
            Questions or an order in progress?{" "}
            {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
            {contact.email && contact.phone && <span className="ez-uc-sep"> · </span>}
            {contact.phone && <a href={tel}>{contact.phone}</a>}
          </p>
        )}
      </div>
    </main>
  );
};

export default UnderConstruction;
