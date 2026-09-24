import { useEffect, useState } from 'react';
import A from './A';
import './nav.css';

const SHOP_BY_STYLE = [
  ['Varsity Jackets', '/shop?style=Varsity%20Jackets'],
  ['Cropped Varsity Jackets', '/shop?style=Cropped%20Varsity%20Jackets'],
  ['Bomber Jackets', '/shop?style=Bomber%20Jackets'],
  ['Coach Jackets', '/shop?style=Coach%20Jackets'],
  ['Hoodies', '/shop?style=Hoodies'],
];
const SHOP_BY_MATERIAL = [
  ['Melton Wool', '/shop?material=Melton%20Wool'],
  ['Faux Leather', '/shop?material=Faux%20Leather'],
  ['Polyester Satin', '/shop?material=Polyester%20Satin'],
  ['Cotton Fleece', '/shop?material=Cotton%20Fleece'],
  ['Cotton Twill', '/shop?material=Cotton%20Twill'],
  ['Sheep Leather', '/shop?material=Sheep%20Leather'],
  ['Nylon', '/shop?material=Nylon'],
  ['Cowhide Leather', '/shop?material=Cowhide%20Leather'],
  ['Soft Shell', '/shop?material=Soft%20Shell'],
];
const DESIGN_LINKS = [
  ['Design Your Own Jacket', '/design'],
  ['How To Design', '/how-to-design'],
];
const SUPPORT_LINKS = [
  ['Size Chart', '/size-chart'],
  ['Material Colors', '/material-colors'],
  ['Fabrics', '/fabrics'],
  ['FAQs', '/faq'],
  ['Photo Gallery', '/gallery'],
  ['About', '/about'],
  ['Contact', '/contact'],
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
 * is "cart", "shop" or a {label, href} pair — the three variants the pages use.
 */
export default function Nav({ active, cta = 'cart', cartCount = 0 }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const button = cta === 'cart' ? { href: '/cart', label: `Cart · ${cartCount}` }
    : cta === 'shop' ? { href: '/shop', label: 'Shop jackets' }
    : cta;
  const top = (href) => (active === href ? 'is-active' : undefined);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="ez-nav">
        <div className="ez-nav-bar">
          <A href="/" className="ez-nav-logo" aria-label="Easy Jacket home">
            <img src="/easy-jacket-logo.png" alt="Easy Jacket" width="87" height="72" decoding="async" />
          </A>

          <div className="ez-dd">
            <A href="/shop" className={top('/shop')}>Shop <Chevron /></A>
            <div className="ez-dd-menu" style={{ minWidth: '270px' }}>
              <div className="ez-sub">
                <A href="/shop?style" className="ez-sub-trigger">Jackets By Style <Caret /></A>
                <div className="ez-sub-menu">{SHOP_BY_STYLE.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
              </div>
              <div className="ez-sub">
                <A href="/shop?material" className="ez-sub-trigger">By Material <Caret /></A>
                <div className="ez-sub-menu">{SHOP_BY_MATERIAL.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
              </div>
              <A href="/shop">All Jackets</A>
            </div>
          </div>

          <div className="ez-dd">
            <A href="/design" className={top('/design')}>Design Studio <Chevron /></A>
            <div className="ez-dd-menu">{DESIGN_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          </div>

          <A href="/bulk-orders" className={top('/bulk-orders')}>Bulk Orders</A>
          <A href="/blog" className={top('/blog')}>Journal</A>

          <div className="ez-dd">
            <A href="/faq" className={top('/faq')}>Support <Chevron /></A>
            <div className="ez-dd-menu">{SUPPORT_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          </div>

          <A href={button.href} className="ez-btn ez-btn-ink ez-nav-cta">{button.label}</A>

          <button type="button" className="ez-burger" aria-label="Open menu" aria-expanded={open} aria-controls="ez-drawer" onClick={() => setOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`ez-drawer-backdrop${open ? ' is-open' : ''}`} onClick={close} aria-hidden="true" />
      <aside id="ez-drawer" className={`ez-drawer${open ? ' is-open' : ''}`} aria-hidden={!open} aria-label="Menu">
        <div className="ez-drawer-head">
          <img src="/easy-jacket-logo.png" alt="Easy Jacket" width="58" height="48" decoding="async" />
          <button type="button" className="ez-drawer-close" aria-label="Close menu" onClick={close}>×</button>
        </div>
        <div className="ez-drawer-links" onClick={(e) => { if (e.target.closest('a')) close(); }}>
          <A href="/shop" className="ez-drawer-top">Shop</A>
          <div className="ez-drawer-group">
            <div className="ez-drawer-label">Jackets by style</div>
            {SHOP_BY_STYLE.map(([label, href]) => <A key={href} href={href}>{label}</A>)}
          </div>
          <div className="ez-drawer-group">
            <div className="ez-drawer-label">By material</div>
            {SHOP_BY_MATERIAL.map(([label, href]) => <A key={href} href={href}>{label}</A>)}
          </div>
          <A href="/design" className="ez-drawer-top">Design Studio</A>
          <div className="ez-drawer-group">{DESIGN_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
          <A href="/bulk-orders" className="ez-drawer-top">Bulk Orders</A>
          <A href="/blog" className="ez-drawer-top">Journal</A>
          <A href="/faq" className="ez-drawer-top">Support</A>
          <div className="ez-drawer-group">{SUPPORT_LINKS.map(([label, href]) => <A key={href} href={href}>{label}</A>)}</div>
        </div>
      </aside>
    </>
  );
}
