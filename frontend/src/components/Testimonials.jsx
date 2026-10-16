// "What people are saying": the admin's testimonials (Features screen, lib/site.js fetchTestimonials) in one
// horizontal row with previous / next buttons. The same section on every page that shows testimonials (home,
// about, design, state pages). The live site's design and about pages had this block with hard-coded quotes;
// here it shows only real ones, and nothing when there are none or the request fails (SEO audit N-O8).
import { useCallback, useEffect, useRef, useState } from 'react';
import ImageSlot from './ImageSlot';
import { fetchTestimonials } from '../lib/site';
import { useAsync } from '../lib/useAsync';
import './Testimonials.css';

const stars = (n) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
const Skeleton = () => (
  <div aria-busy="true">
    <div className="ez-skeleton" style={{ aspectRatio: '1', borderRadius: '4px' }} />
    <div className="ez-skeleton" style={{ height: '16px', width: '70%', marginTop: '14px' }} />
    <div className="ez-skeleton" style={{ height: '12px', width: '45%', marginTop: '8px' }} />
  </div>
);

export default function Testimonials({ id = 'testimonials' }) {
  const { data: testimonials, loading } = useAsync((signal) => fetchTestimonials(signal), []);
  // previous / next buttons move the row one card at a time; each greys out at its end
  const rowRef = useRef(null);
  const [ends, setEnds] = useState({ start: true, end: true });
  const measure = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setEnds({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => { el.removeEventListener('scroll', measure); window.removeEventListener('resize', measure); };
  }, [testimonials, measure]);
  const move = (dir) => {
    const el = rowRef.current;
    const card = el?.firstElementChild;
    if (!el || !card) return;
    const step = card.getBoundingClientRect().width + (parseFloat(getComputedStyle(el).columnGap) || 20);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (!loading && !testimonials?.length) return null;
  return (
    <section id={id} className="ez-quotes" aria-labelledby={`${id}-title`} style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
      <div className="ez-quote-head">
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>Testimonials</div>
          <h2 id={`${id}-title`} style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>What people are saying</h2>
        </div>
        {ends.start && ends.end ? null : (
          <div className="ez-quote-nav">
            <button type="button" className="ez-quote-btn" onClick={() => move(-1)} disabled={ends.start} aria-label="Previous testimonials" aria-controls={`${id}-row`}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" className="ez-quote-btn" onClick={() => move(1)} disabled={ends.end} aria-label="Next testimonials" aria-controls={`${id}-row`}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </div>
      <div className="ez-quote-row" id={`${id}-row`} ref={rowRef}>
        {testimonials?.length ? testimonials.map((t) => (
          <figure key={t.id} className="ez-reveal" style={{ margin: '0', padding: '28px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderTop: '3px solid var(--gold)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div aria-hidden="true" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '64px', lineHeight: '1', height: '32px', color: 'var(--gold)' }}>“</div>
            {t.rating ? <div role="img" aria-label={`Rated ${t.rating} out of 5`} style={{ color: 'var(--gold-2)', letterSpacing: '0.1em' }}>{stars(t.rating)}</div> : null}
            <blockquote style={{ margin: '0', fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-2)', flex: '1' }}>{t.quote}</blockquote>
            <figcaption style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--cream-2)' }}>
              {t.photo ? (
                <span style={{ width: '44px', height: '44px', flex: 'none', borderRadius: '50%', overflow: 'hidden', background: 'var(--cream-2)' }}>
                  <ImageSlot slot={`v2-q-${t.id}`} shape="circle" src={t.photo} width={96} placeholder={t.initial} aria-label={`Photo of ${t.name}`} />
                </span>
              ) : (
                <span aria-hidden="true" style={{ width: '44px', height: '44px', flex: 'none', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '20px' }}>{t.initial}</span>
              )}
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', lineHeight: '1', textTransform: 'uppercase' }}>{t.name}</strong>
                {t.role ? <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{t.role}</span> : null}
              </span>
            </figcaption>
          </figure>
        )) : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} />)}
      </div>
    </section>
  );
}
