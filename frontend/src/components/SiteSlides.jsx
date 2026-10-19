// A photo slot the admin can turn into a slideshow (Content -> Site Images; the slots in SITE_IMAGE_SLIDES, e.g.
// the home hero). One photo shows still, exactly as SiteImage. Two or more cross-fade one after another, with a
// bar per photo along the bottom (no arrows): the bar of the photo showing fills up until the next one, and a
// bar takes you to its photo. It waits while the pointer is over it or a bar has keyboard focus, swipes on touch
// screens, and does not move on its own for visitors who ask for reduced motion (the bars still work).
// The timing is the bar's own CSS animation (SiteSlides.css): when it ends, the next photo shows.
import { useEffect, useRef, useState } from 'react';
import ImageSlot from './ImageSlot';
import SiteImage from './SiteImage';
import { useSiteIdentity } from '../lib/siteIdentity';
import { SITE_IMAGES } from '../lib/siteImages';
import './SiteSlides.css';

const SWIPE = 40; // px of sideways movement that counts as a swipe

export default function SiteSlides({ which, placeholder = '', 'aria-label': label, eager = false, seconds = 6, className, style, ...rest }) {
  const { siteImages, siteImagesKnown } = useSiteIdentity();
  const own = siteImages?.[which] || {};
  const fallback = SITE_IMAGES[which] || {};
  const more = siteImagesKnown && Array.isArray(own.more) ? own.more : [];
  const photos = [
    { src: own.src || fallback.src, alt: own.alt || label || fallback.alt || placeholder },
    ...more.map((p) => ({ src: p.src, alt: p.alt || placeholder })),
  ];
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const at = index % count; // the admin may have removed photos since
  const next = (at + 1) % count;
  // a photo is fetched once it is next in line, and kept after that
  const [shown, setShown] = useState(() => new Set([0]));
  const touch = useRef(null);

  useEffect(() => {
    setShown((s) => (s.has(at) && s.has(next) ? s : new Set(s).add(at).add(next)));
  }, [at, next]);

  if (count < 2) return <SiteImage which={which} placeholder={placeholder} aria-label={label} eager={eager} className={className} style={style} {...rest} />;

  const go = (i) => setIndex(((i % count) + count) % count);
  const onPointerDown = (e) => { touch.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - start.y)) go(dx < 0 ? at + 1 : at - 1);
  };

  return (
    <div
      className={['ez-slides', className].filter(Boolean).join(' ')}
      style={{ '--ez-slide-seconds': `${seconds}s`, ...style }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label || placeholder || 'Photos'}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { touch.current = null; }}
    >
      {photos.map((photo, i) => (
        <div
          key={`${i}-${photo.src}`}
          className={`ez-slide${i === at ? ' is-active' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
          aria-hidden={i === at ? undefined : 'true'}
        >
          {shown.has(i) || i === at ? (
            <ImageSlot {...rest} src={photo.src} placeholder={placeholder} aria-label={photo.alt} eager={eager && i === 0} draggable={false} />
          ) : null}
        </div>
      ))}
      <div className="ez-slides-bars" role="group" aria-label="Choose a photo">
        {photos.map((photo, i) => (
          <button
            key={i}
            type="button"
            className={`ez-slides-bar${i < at ? ' is-past' : ''}${i === at ? ' is-active' : ''}`}
            aria-label={`Photo ${i + 1} of ${count}`}
            aria-current={i === at ? 'true' : undefined}
            onClick={() => go(i)}
          >
            <span className="ez-slides-track">
              {/* keyed by the photo showing, so the bar starts again from empty every time */}
              <span key={i === at ? `run-${index}` : 'still'} className="ez-slides-fill" onAnimationEnd={i === at ? () => go(at + 1) : undefined} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
