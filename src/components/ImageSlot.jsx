import { useState } from 'react';

const RADIUS = { rect: 0, rounded: '12px', circle: '50%', pill: '9999px' };

/**
 * Replaces the design tool's <image-slot>: a picture that fills whatever box
 * it is placed in, lazy-loaded and decoded off the main thread, with the slot
 * caption as its fallback if the source cannot be fetched.
 */
export default function ImageSlot({ slot, src, placeholder = '', shape = 'rounded', fit = 'cover', radius, eager = false, className, style, ...rest }) {
  const [failed, setFailed] = useState(false);
  const borderRadius = shape === 'rounded' && radius != null ? `${radius}px` : RADIUS[shape] ?? RADIUS.rounded;
  const cls = ['ez-slot', className].filter(Boolean).join(' ');

  if (!src || failed) {
    return (
      <div data-slot={slot} className={`${cls} ez-slot-empty`} role="img" aria-label={placeholder} style={{ borderRadius, ...style }} {...rest}>
        {placeholder ? <span>{placeholder}</span> : null}
      </div>
    );
  }
  return (
    <img
      data-slot={slot}
      className={cls}
      src={src}
      alt={rest['aria-label'] ?? placeholder}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : undefined}
      onError={() => setFailed(true)}
      style={{ objectFit: fit, borderRadius, ...style }}
      {...rest}
    />
  );
}
