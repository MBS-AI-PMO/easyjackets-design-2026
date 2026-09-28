import { useEffect, useRef, useState } from 'react';
import { imageUrl } from '../lib/api';
import { cutoutVersion, useCutouts, withVersion } from '../lib/cutouts';

const RADIUS = { rect: 0, rounded: '12px', circle: '50%', pill: '9999px' };

/**
 * A picture that fills whatever box it is placed in: lazy-loaded, decoded off
 * the main thread, faded in once it has arrived, and — when `width` is given
 * and the file lives on our API — requested at that size (2x for sharp
 * screens) instead of at the original's full resolution. The slot caption is
 * the fallback if the source cannot be fetched.
 */
export default function ImageSlot({ slot, src, width, placeholder = '', shape = 'rounded', fit, radius, eager = false, className, style, ...rest }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);
  const cutout = useCutouts()(src); // background removed: the box around it needs no white fill
  const borderRadius = shape === 'rounded' && radius != null ? `${radius}px` : RADIUS[shape] ?? RADIUS.rounded;
  const cls = ['ez-slot', className].filter(Boolean).join(' ');

  const version = cutout ? cutoutVersion(src) : 0;
  const resolved = withVersion(width ? imageUrl(src, width) : src, version);
  const retina = width && imageUrl(src, width) !== src ? withVersion(imageUrl(src, width * 2), version) : null;

  useEffect(() => {
    setFailed(false);
    const img = ref.current;
    setLoaded(!!img && img.complete && img.naturalWidth > 0);
  }, [resolved]);

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
