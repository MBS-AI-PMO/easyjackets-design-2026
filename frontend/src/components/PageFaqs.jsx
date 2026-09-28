import { useAsync } from '../lib/useAsync';
import { fetchFaqsFor } from '../lib/content';
import Faq from './Faq';

/**
 * The FAQ block for a page, fed by the admin's Storefront FAQs screen (the
 * same source as the live site). `pageKeys` are tried in order and the first
 * with questions wins, so a category page can carry its own list and fall
 * back to the catalog template; `values` fill a template's {placeholders}.
 * Renders nothing while loading and nothing when the page has no FAQs, which
 * is the case for most routes.
 */
export default function PageFaqs({ pageKeys, values, title = 'Good to know', intro }) {
  const keys = (pageKeys || []).filter(Boolean);
  const valuesKey = JSON.stringify(values || null);
  const { data: items } = useAsync(() => (keys.length ? fetchFaqsFor(keys, values) : Promise.resolve([])), [keys.join('|'), valuesKey]);
  if (!items?.length) return null;
  return (
    <section className="ez-page-faqs" aria-labelledby="ez-page-faqs-title" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>FAQ</div>
        <h2 id="ez-page-faqs-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>{title}</h2>
        {intro ? <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '36ch' }}>{intro}</p> : null}
      </div>
      <Faq items={items} schema />
    </section>
  );
}
