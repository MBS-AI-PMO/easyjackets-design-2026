import { useEffect, useRef, useState } from 'react';

/**
 * A figure that counts up to `value` the first time it scrolls into view, and
 * glides to any later value (a count that arrives from the API after the first
 * paint). Honours the reduced-motion preference by showing the value at once.
 */
export default function CountUp({ value, decimals = 0, duration = 1200, children, style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  const seenRef = useRef(false);
  const target = Number(value) || 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const run = () => {
      if (reduce) { shownRef.current = target; setShown(target); return; }
      const from = shownRef.current;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - p) ** 3;
        const v = from + (target - from) * eased;
        shownRef.current = v;
        setShown(v);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (seenRef.current || typeof IntersectionObserver === 'undefined') { seenRef.current = true; run(); return () => cancelAnimationFrame(raf); }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { seenRef.current = true; io.disconnect(); run(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration]);

  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{shown.toFixed(decimals)}{children}</span>;
}
