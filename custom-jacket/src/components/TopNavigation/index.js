import React, { useState, useEffect } from 'react';
import './styles.scss';
import { frontendUrl } from '../../config/url';

const TopNavigation = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
      if (window.innerWidth > 1200) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { url: frontendUrl('/shop'), label: 'Shop' },
    { url: frontendUrl('/how-to-design-jacket'), label: 'How to Design' },
    { url: frontendUrl('/sizechart'), label: 'Size Guide' },
    { url: frontendUrl('/bulk-order'), label: 'Bulk Orders' },
    { url: frontendUrl('/contact-us'), label: 'Contact' },
  ];

  return (
    <nav className="cjd-top-nav">
      <div className="cjd-top-nav-container">
        {isMobile ? (
          <div className="cjd-top-nav-mobile-bar">
            <button
              className="cjd-top-nav-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span className={`cjd-hamburger ${menuOpen ? 'active' : ''}`}>
                <span /><span /><span />
              </span>
            </button>
          </div>
        ) : (
          <div className="cjd-top-nav-links">
            {navLinks.map((link, index) => (
              <a key={index} href={link.url}>{link.label}</a>
            ))}
          </div>
        )}
      </div>

      <div className={`cjd-top-nav-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map((link, index) => (
          <a key={index} href={link.url} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default TopNavigation;
