import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import logo from "../../assets/images/footer-logo.webp";
import Instagram from "../../assets/images/Instagram.webp";
import Twitter from "../../assets/images/t.webp";
import Facebook from "../../assets/images/Facebook.webp";
import "./styles.scss";
import { frontendUrl, uploadUrl } from "../../config/url";


const withAssetVersion = (url, version) => {
  if (!url || !version) return url;
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

const slugifyFilterValue = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\//g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCatalogBasePath = () => "/shop";

const buildCatalogFilterPath = (section = "jackets", filters = {}) => {
  const category = slugifyFilterValue(filters.category);
  if (!category) return getCatalogBasePath(section);
  return `${getCatalogBasePath(section)}/category/${encodeURIComponent(category)}`;
};

const buildFrontendUrl = frontendUrl;

const formatAddress = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(formatAddress).filter(Boolean).join("\n");
  if (typeof value === "object") {
    const cityLine = [value.city, value.state, value.postal_code]
      .filter(Boolean)
      .join(", ");
    return [value.line1, value.line2, cityLine, value.country]
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
};

const normalizeSocialUrl = (platform, value) => {
  const cleaned = String(value || "").trim();
  if (!cleaned) return "";
  if (/^https?:\/\//i.test(cleaned)) return cleaned;

  const handle = cleaned.replace(/^@/, "").replace(/^\/+/, "");
  const bases = {
    instagram: "https://www.instagram.com",
    twitter: "https://twitter.com",
    facebook: "https://www.facebook.com",
  };

  return `${bases[platform]}/${handle}`;
};

const MultilineText = ({ label, children }) => {
  const text = formatAddress(children);
  if (!text) return null;

  return (
    <div className="ej-footer-contact-block">
      {label && <div className="ej-footer-contact-label">{label}</div>}
      {text}
    </div>
  );
};

const fallbackJacketCategories = [
  { name: "Varsity Jackets", slug: "varsity-jackets" },
  { name: "Bomber Jackets", slug: "bomber-jackets" },
  { name: "Hoodies", slug: "hoodies" },
  { name: "Coach Jackets", slug: "coach-jackets" },
];

const fallbackSportsCategories = [
  { name: "Baseball Jackets", slug: "baseball-jackets" },
  { name: "Basketball Jackets", slug: "basketball-jackets" },
  { name: "Football Jackets", slug: "football-jackets" },
  { name: "Team Jackets", slug: "team-jackets" },
];

const CustomFooter = () => {
  const [footerData, setFooterData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [footerLogoUrl, setFooterLogoUrl] = useState(logo);
  const [footerLogoHeight, setFooterLogoHeight] = useState(66);
  const [hasCustomFooterLogo, setHasCustomFooterLogo] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchFooterContent = async () => {
      const [footerResult, metadataResult, categoryResult] = await Promise.allSettled([
        axiosInstance.get("/features/website/details"),
        axiosInstance.get("/metadata/global-settings"),
        axiosInstance.get("/category/get-category?section=&sort=serial"),
      ]);

      if (!mounted) return;

      if (footerResult.status === "fulfilled") {
        setFooterData(footerResult.value.data?.website || null);
      } else {
        console.error("Error fetching footer details:", footerResult.reason);
      }

      if (metadataResult.status === "fulfilled") {
        const metadata = metadataResult.value.data?.metadata;
        if (metadata?.footerLogo) {
          setFooterLogoUrl(
            withAssetVersion(uploadUrl(metadata.footerLogo), metadata.updatedAt || metadata._id)
          );
          setHasCustomFooterLogo(true);
        }
        if (metadata?.footerLogoHeight) {
          setFooterLogoHeight(metadata.footerLogoHeight);
        }
      } else {
        console.error("Error fetching footer metadata:", metadataResult.reason);
      }

      if (categoryResult.status === "fulfilled" && categoryResult.value.data?.success) {
        setCategories(categoryResult.value.data?.category || []);
      } else if (categoryResult.status === "rejected") {
        console.error("Error fetching footer categories:", categoryResult.reason);
      }
    };

    fetchFooterContent();

    return () => {
      mounted = false;
    };
  }, []);

  const jacketCats = useMemo(() => {
    const list = (categories || [])
      .filter((category) => !category.section || category.section === "jackets")
      .slice(0, 8);
    return list.length ? list : fallbackJacketCategories;
  }, [categories]);

  const sportsCats = useMemo(() => {
    const list = (categories || [])
      .filter((category) => category.section === "sports")
      .slice(0, 8);
    return list.length ? list : fallbackSportsCategories;
  }, [categories]);

  const handleSubscribe = async () => {
    const nextEmail = email.trim();
    setSubscribeMessage(null);

    if (!nextEmail) {
      setSubscribeMessage({ type: "error", text: "Please enter your email address" });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
      setSubscribeMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsSubscribing(true);
    try {
      const res = await axiosInstance.post("/features/subscribe", { email: nextEmail });
      if (res.data?.success) {
        setSubscribeMessage({
          type: "success",
          text: res.data.message || "Successfully subscribed!",
        });
        setEmail("");
      } else {
        setSubscribeMessage({
          type: "error",
          text: res.data?.message || "Failed to subscribe",
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      setSubscribeMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to subscribe. Please try again.",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="ej-footer">
      <div className="ej-container">
        <div className="ej-footer-grid-top">
          <div>
            <a href={buildFrontendUrl("/")} aria-label="EasyJackets home">
              <img
                src={footerLogoUrl}
                alt="EasyJackets"
                className="ej-footer-logo"
                style={{
                  height: footerLogoHeight,
                  filter: hasCustomFooterLogo ? "none" : "brightness(0) invert(1)",
                }}
              />
            </a>
            <p className="ej-footer-intro">
              Custom-made varsity jackets for individuals and teams. Free shipping, no minimums.
              Stitched with care in our workshop.
            </p>
            <a
              href={buildFrontendUrl("/design-custom-jacket")}
              className="ej-btn ej-btn--cream"
            >
              Customize your jacket
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <path d="M8 7h9v9" />
              </svg>
            </a>
          </div>

          <div className="ej-footer-col">
            <div className="ej-footer-heading">Shop</div>
            <ul>
              <li><a href={buildFrontendUrl("/shop")}>All Jackets</a></li>
              {jacketCats.map((category, index) => (
                <li key={category._id || category.slug || category.name || index}>
                  <a
                    href={buildFrontendUrl(
                      buildCatalogFilterPath("jackets", {
                        category: category.slug || slugifyFilterValue(category.name),
                      })
                    )}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ej-footer-col">
            <div className="ej-footer-heading">Sports &amp; Spirit</div>
            <ul>
              <li><a href={buildFrontendUrl("/shop")}>All Sports Wear</a></li>
              {sportsCats.map((category, index) => (
                <li key={category._id || category.slug || category.name || index}>
                  <a
                    href={buildFrontendUrl(
                      buildCatalogFilterPath("sports", {
                        category: category.slug || slugifyFilterValue(category.name),
                      })
                    )}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="ej-footer-col">
            <div className="ej-footer-heading">Design</div>
            <ul>
              <li><a href={buildFrontendUrl("/design-custom-jacket")}>Design Studio</a></li>
              <li><a href={buildFrontendUrl("/how-to-design-jacket")}>How To Design</a></li>
              <li><a href={buildFrontendUrl("/bulk-order")}>Bulk Orders</a></li>
              <li><a href={buildFrontendUrl("/sizechart")}>Size Guide</a></li>
              <li><a href={buildFrontendUrl("/photo-gallery")}>Gallery</a></li>
            </ul>
          </div>

          <div className="ej-footer-col">
            <div className="ej-footer-heading">Company</div>
            <ul>
              <li><a href={buildFrontendUrl("/about-us")}>About Us</a></li>
              <li><a href={buildFrontendUrl("/new-blog")}>Journal</a></li>
              <li><a href={buildFrontendUrl("/contact-us")}>Contact Us</a></li>
              <li><a href={buildFrontendUrl("/shipping")}>Shipping Policy</a></li>
              <li><a href={buildFrontendUrl("/return-policy")}>Return Policy</a></li>
              <li><a href={buildFrontendUrl("/terms-and-conditions")}>Terms &amp; Conditions</a></li>
              <li><a href={buildFrontendUrl("/privacypolicy")}>Privacy Policy</a></li>
              <li><a href={buildFrontendUrl("/faq")}>FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="ej-footer-grid-news">
          <div>
            <div className="ej-label ej-label--on-ink">Get our updates</div>
            <h3>
              Early access to drops,<br />bulk discounts, and varsity stories.
            </h3>
            <p>Unsubscribe anytime. We don't spam.</p>

            <div className="ej-footer-news-form">
              <input
                type="email"
                className="ej-footer-news-input"
                placeholder="you@varsity.club"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSubscribe();
                }}
                disabled={isSubscribing}
              />
              <button
                className="ej-btn ej-btn--primary"
                type="button"
                onClick={handleSubscribe}
                disabled={isSubscribing}
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {subscribeMessage && (
              <div className={`ej-footer-news-message ${subscribeMessage.type}`}>
                {subscribeMessage.text}
              </div>
            )}
          </div>

          <div className="ej-footer-social-wrap">
            <div className="ej-label ej-label--on-ink">Follow along</div>
            <div className="ej-footer-social-list">
              {footerData?.isActive?.instagram && footerData?.socialLinks?.instagram && (
                <a
                  className="ej-footer-social"
                  href={normalizeSocialUrl("instagram", footerData.socialLinks.instagram)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <img src={Instagram} alt="" />
                </a>
              )}
              {footerData?.isActive?.twitter && footerData?.socialLinks?.twitter && (
                <a
                  className="ej-footer-social"
                  href={normalizeSocialUrl("twitter", footerData.socialLinks.twitter)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <img src={Twitter} alt="" />
                </a>
              )}
              {footerData?.isActive?.facebook && footerData?.socialLinks?.facebook && (
                <a
                  className="ej-footer-social"
                  href={normalizeSocialUrl("facebook", footerData.socialLinks.facebook)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <img src={Facebook} alt="" />
                </a>
              )}
            </div>

            {footerData && (
              <div className="ej-footer-contact">
                <div className="ej-footer-address-grid">
                  <MultilineText label="Primary Address">{footerData.address}</MultilineText>
                  <MultilineText label="Secondary Address">{footerData.address1}</MultilineText>
                </div>
                {footerData.phoneNumber && (
                  <div className="ej-footer-contact-block">
                    <a href={`tel:${String(footerData.phoneNumber).replace(/[^+\d]/g, "")}`}>
                      {footerData.phoneNumber}
                    </a>
                  </div>
                )}
                {footerData.email && (
                  <div className="ej-footer-contact-block">
                    <a href={`mailto:${footerData.email}`}>{footerData.email}</a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="ej-footer-word-wrap" aria-hidden="true">
          <div className="ej-footer-word">EasyJackets</div>
        </div>

        <div className="ej-footer-legal">
          <div>&copy; {new Date().getFullYear()} EasyJackets. All rights reserved.</div>
          <div>
            <a href={buildFrontendUrl("/terms-and-conditions")}>Terms &amp; Conditions</a>
            <a href={buildFrontendUrl("/shipping")}>Shipping Policy</a>
            <a href={buildFrontendUrl("/return-policy")}>Return Policy</a>
            <a href={buildFrontendUrl("/contact-us")}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default CustomFooter;
