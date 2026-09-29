import { useEffect, useRef, useState } from 'react';
import { imageUrl } from '../lib/api';
import { cutoutVersion, useCutouts, withVersion } from '../lib/cutouts';
import { useKnockout } from '../lib/knockout';

const RADIUS = { rect: 0, rounded: '12px', circle: '50%', pill: '9999px' };

/**
 * A picture that fills whatever box it is placed in: lazy-loaded, decoded off
 * the main thread, faded in once it has arrived, and — when `width` is given
 * and the file lives on our API — requested at that size (2x for sharp
 * screens) instead of at the original's full resolution. The slot caption is
 * the fallback if the source cannot be fetched.
 */
export default function ImageSlot({ slot, src, width, placeholder = '', shape = 'rounded', fit, radius, eager = false, knockout = false, className, style, ...rest }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  // `knockout`: a design-lab render, whose white ground is cleared in the browser (lib/knockout.js)
  const knocked = useKnockout(knockout && src ? (width ? imageUrl(src, width * 2) : src) : '');
  const isCutout = useCutouts();
  const cutout = knockout || isCutout(src); // background removed: the box around it needs no white fill
  const borderRadius = shape === 'rounded' && radius != null ? `${radius}px` : RADIUS[shape] ?? RADIUS.rounded;
  const cls = ['ez-slot', className].filter(Boolean).join(' ');

  const version = cutout && !knockout ? cutoutVersion(src) : 0;
  const resolved = knockout ? knocked || '' : withVersion(width ? imageUrl(src, width) : src, version);
  const retina = !knockout && width && imageUrl(src, width) !== src ? withVersion(imageUrl(src, width * 2), version) : null;

  useEffect(() => {
    setFailed(false);
    const img = ref.current;
    setLoaded(!!img && img.complete && img.naturalWidth > 0);
  }, [resolved]);

  // the render is being cleared: an empty box (no placeholder text flashing in)
  if (knockout && src && !failed && knocked === null) {
    return <div data-slot={slot} className={cls} aria-hidden="true" style={{ borderRadius, ...style }} />;
  }
  if (!src || failed) {
    return (
      <div data-slot={slot} className={`${cls} ez-slot-empty`} role="img" aria-label={placeholder} style={{ borderRadius, ...style }} {...rest}>
        {placeholder ? <span>{placeholder}</span> : null}
      </div>
    );
  }
  return (
    <img
      ref={ref}
      data-slot={slot}
      className={`${cls} ez-slot-img${loaded ? ' is-loaded' : ''}`}
      data-cutout={cutout ? 'true' : undefined}
      src={resolved}
      srcSet={retina ? `${resolved} 1x, ${retina} 2x` : undefined}
      alt={rest['aria-label'] ?? placeholder}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      style={{ ...(fit ? { objectFit: fit } : {}), borderRadius, ...style }}
      {...rest}
    />
  );
}
