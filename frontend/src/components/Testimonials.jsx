// "What people are saying": the admin's testimonials (Features screen, lib/site.js fetchTestimonials), as on
// the landing and state pages. The live site's design and about pages had this block with hard-coded quotes;
// here it shows only real ones, and nothing when there are none (SEO audit N-O8).
import { fetchTestimonials } from '../lib/site';
import { useAsync } from '../lib/useAsync';

export default function Testimonials({ title = 'What people are saying', limit = 3 }) {
  const { data: testimonials } = useAsync((signal) => fetchTestimonials(signal), []);
  if (!testimonials?.length) return null;
  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' }}>
      <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 28px' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
        {testimonials.slice(0, limit).map((r) => (
          <figure key={r.id} style={{ margin: 0, background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '24px' }}>
            <blockquote style={{ margin: 0, lineHeight: '1.65', fontSize: '15px' }}>{r.quote}</blockquote>
            <figcaption style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '14px', fontWeight: '600' }}>{r.name}{r.role ? ` · ${r.role}` : ''}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
