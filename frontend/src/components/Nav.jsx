import { useEffect, useState } from 'react';
import A from './A';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import { fetchCategories, fetchMaterials } from '../lib/catalog';
import { useAsync } from '../lib/useAsync';
import { FALLBACK_NAV_LOGO, useSiteIdentity } from '../lib/siteIdentity';
import './nav.css';
import { shopPath } from '../lib/urls';

const DESIGN_LINKS = [
  ['Design Your Own Jacket', '/design-custom-jacket'],
  ['How To Design', '/how-to-design-jacket'],
];
const SUPPORT_LINKS = [
  ['Size Chart', '/sizechart'],
  ['Material Colors', '/material-colors'],
  ['Fabrics', '/fabrics'],
  ['FAQs', '/faq'],
  ['Photo Gallery', '/gallery'],
  ['Embroidery & Patches', '/embroidery-and-patches'],
  ['About', '/about-us'],
  ['Contact', '/contact-us'],
];

const Chevron = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const Caret = () => (
  <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-hidden="true">
    <path d="M1 1l5 5-5 5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/**
 * The site header. Desktop keeps the design's hover dropdowns; below the
 * breakpoint the links move into a slide-in drawer (the export simply hid
 * them). `active` is the route of the highlighted top-level link and `cta`
 * is "cart", "shop" or a {label, href} pair. The cart count is live.
 */
export default function Nav({ active, cta = 'cart' }) {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();
  const { data: categories } = useAsync(() => fetchCategories('jackets'), []);
  const { data: materials } = useAsync(fetchMaterials, []);
  const SHOP_BY_STYLE = (categories || []).map((c) => [c.name, shopPath({ category: c.slug })]);
  const SHOP_BY_MATERIAL = (materials || []).map((m) => [m.name, shopPath({ material: m.name })]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const { user } = useAuth();
  // navbar logo + size from the admin (Site Identity & Logos); the last one seen is inline, so it paints at once
  const identity = useSiteIdentity();
  const navLogo = identity.navSrc || FALLBACK_NAV_LOGO;
  const logoHeight = identity.navbarLogoHeight || 72;
  const button = cta === 'cart' ? { href: '/cart', label: `Cart · ${cartCount}` }
    : cta === 'shop' ? { href: '/shop', label: 'Shop jackets' }
    : cta;
  const top = (href) => (active === href ? 'is-active' : undefined);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="ez-nav">
        <div className="ez-nav-bar">
          <A href="/" className="ez-nav-logo" aria-label="Easy Jackets home" style={{ '--ez-logo-h': `${logoHeight}px` }}>
            <img src={navLogo} alt="Easy Jackets" height={logoHeight} decoding="sync" fetchPriority="high" onError={(e) => { if (!e.currentTarget.src.endsWith(FALLBACK_NAV_LOGO)) e.currentTarget.src = FALLBACK_NAV_LOGO; }} />
          </A>

          <div className="ez-dd">
            <A href="/shop" className={top('/shop')}>Shop <Chevron /></A>
            <div className="ez-dd-menu" style={{ minWidth: '270px' }}>
              <div className="ez-sub">
                <A href="/shop?style" className="ez-sub-trigger">Jackets By Style <Caret /></A>
                <div className="ez-sub-menu">{SHOP_BY_STYLE.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
              </div>
              <div className="ez-sub">
                <A href="/shop" className="ez-sub-trigger">By Material <Caret /></A>
                <div className="ez-sub-menu">{SHOP_BY_MATERIAL.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
              </div>
              <A href="/shop">All Jackets</A>
            </div>
          </div>

          <div className="ez-dd">
            <A href="/design-custom-jacket" className={top('/design-custom-jacket')}>Design Studio <Chevron /></A>
            <div className="ez-dd-menu">{DESIGN_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          </div>

          <A href="/bulk-order" className={top('/bulk-order')}>Bulk Orders</A>
          <A href="/new-blog" className={top('/new-blog')}>Journal</A>

          <div className="ez-dd">
            <A href="/faq" className={top('/faq')}>Support <Chevron /></A>
            <div className="ez-dd-menu">{SUPPORT_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          </div>

          <A href={user ? '/dashboard' : '/account'} className={['ez-nav-account', top(user ? '/dashboard' : '/account')].filter(Boolean).join(' ')}>{user ? 'My account' : 'Sign in'}</A>
          <A href={button.href} className="ez-btn ez-btn-ink ez-nav-cta">{button.label}</A>

          <button type="button" className="ez-burger" aria-label="Open menu" aria-expanded={open} aria-controls="ez-drawer" onClick={() => setOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`ez-drawer-backdrop${open ? ' is-open' : ''}`} onClick={close} aria-hidden="true" />
      <aside id="ez-drawer" className={`ez-drawer${open ? ' is-open' : ''}`} aria-hidden={!open} aria-label="Menu">
        <div className="ez-drawer-head">
          <img src={navLogo} alt="Easy Jackets" height="48" decoding="async" />
          <button type="button" className="ez-drawer-close" aria-label="Close menu" onClick={close}>×</button>
        </div>
        <div className="ez-drawer-links" onClick={(e) => { if (e.target.closest('a')) close(); }}>
          <A href={user ? '/dashboard' : '/account'} className="ez-drawer-top">{user ? 'My account' : 'Sign in'}</A>
          <A href="/shop" className="ez-drawer-top">Shop</A>
          <div className="ez-drawer-group">
            <div className="ez-drawer-label">Jackets by style</div>
            {SHOP_BY_STYLE.map(([label, href]) => <A key={href} href={href}>{label}</A>)}
          </div>
          <div className="ez-drawer-group">
            <div className="ez-drawer-label">By material</div>
            {SHOP_BY_MATERIAL.map(([label, href]) => <A key={href} href={href}>{label}</A>)}
          </div>
          <A href="/design-custom-jacket" className="ez-drawer-top">Design Studio</A>
          <div className="ez-drawer-group">{DESIGN_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          <A href="/bulk-order" className="ez-drawer-top">Bulk Orders</A>
          <A href="/new-blog" className="ez-drawer-top">Journal</A>
          <A href="/faq" className="ez-drawer-top">Support</A>
          <div className="ez-drawer-group">{SUPPORT_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
        </div>
      </aside>
    </>
  );
}
