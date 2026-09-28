import { useCallback, useEffect, useRef, useState } from 'react';
import { imageUrl } from '../lib/api';

/**
 * A full-screen view of one picture from a set. `items` is a list of
 * { src, title, caption, alt }; `index` is the open one (null = closed).
 * Arrows / swipe step through the set, Esc or a click outside closes, and
 * focus returns to whatever opened it.
 */
export default function Lightbox({ items, index, onClose, onIndex, label = 'Image viewer' }) {
  const open = index != null && items && items[index];
  const closeRef = useRef(null);
  const openerRef = useRef(null);
  const touch = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const count = items ? items.length : 0;
  const go = useCallback((step) => { if (count > 1) onIndex((index + step + count) % count); }, [count, index, onIndex]);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus?.();
    };
  }, [open, onClose, go]);

  useEffect(() => { setLoaded(false); }, [index]);

  if (!open) return null;
  const item = items[index];
  const src = imageUrl(item.src, 1280);

  return (
    <div
      className="ez-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeRef} type="button" className="ez-lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2.2" /></svg>
      </button>
      {count > 1 ? (
        <>
          <button type="button" className="ez-lightbox-nav is-prev" onClick={() => go(-1)} aria-label="Previous">
            <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2L2 10l8 8" stroke="currentColor" strokeWidth="2.4" fill="none" /></svg>
          </button>
          <button type="button" className="ez-lightbox-nav is-next" onClick={() => go(1)} aria-label="Next">
            <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M2 2l8 8-8 8" stroke="currentColor" strokeWidth="2.4" fill="none" /></svg>
          </button>
        </>
      ) : null}
      <figure className="ez-lightbox-figure">
        <div className="ez-lightbox-frame">
          <img key={src} src={src} alt={item.alt || item.title || ''} className={loaded ? 'is-loaded' : undefined} onLoad={() => setLoaded(true)} />
        </div>
        <figcaption>
          <strong>{item.title}</strong>
          {item.caption ? <span>{item.caption}</span> : null}
          {count > 1 ? <span className="ez-lightbox-count">{index + 1} / {count}</span> : null}
        </figcaption>
      </figure>
    </div>
  );
}
