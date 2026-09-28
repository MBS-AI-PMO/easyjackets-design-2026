// The FAQ page: every question the admin keeps under "/faq" in the Storefront
// FAQs screen (the live site's source), in the design's groups — Ordering,
// Design & artwork, Sizing, Shipping, Returns, Care — searchable, with
// FAQPage structured data. A question's group is the category set in the
// admin; until one is set, it is grouped by what it asks about.
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { faqSchema } from '../components/Faq';
import FaqGroups from '../components/FaqGroups';
import { fetchPageFaqs } from '../lib/content';
import { stripHtml } from '../lib/html';
import { FAQ_PAGE_GROUPS, groupFaqs } from '../lib/faqGroups';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';

// Groups and the automatic filing rule are shared with the bulk-order page and the admin (lib/faqGroups.js).
export const FAQ_GROUPS = FAQ_PAGE_GROUPS;

export default function FaqPage() {
  usePageTitle('FAQ', 'Answers about ordering, designing, sizing, shipping and caring for a custom varsity or letterman jacket.');
  const { data: faqs, error } = useAsync(() => fetchPageFaqs('/faq'), []);
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const matching = faqs && needle ? faqs.filter((f) => `${f.q} ${stripHtml(f.a)}`.toLowerCase().includes(needle)) : null;
  const groups = faqs ? groupFaqs(faqs) : null;
  const schema = faqs ? faqSchema(faqs) : null;


  return (
    <div className="pg-faq">
      <Nav active="/faq" cta="shop" />
      {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null}
      {/* FAQ header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>FAQ</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Questions,
              <br />
              answered
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Everything about ordering, designing, sizing, shipping and caring for a custom jacket. Can’t find it? Contact us and a jacket maker will reply within a day.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="faq-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.85) 18%,rgba(20,17,15,0.35) 42%,rgba(20,17,15,0) 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '14px', pointerEvents: 'none' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Online builder · Free proof
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>
                  Design your Custom Letterman & Varsity Jacket
                </div>
              </div>
              <span className="ez-btn ez-btn-gold" style={{ minHeight: '44px', padding: '0 16px', fontSize: '17px', background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                Start →
              </span>
            </div>
          </A>
        </div>
      </section>
      {/* questions: category list beside the grouped questions (as on the bulk order page) */}
      <FaqGroups
        id="questions"
        className="ez-faq-layout-page"
        groups={groups}
        headingLevel={2}
        onPick={() => setQuery('')}
        results={matching ? { title: 'Matching questions', items: matching, empty: `Nothing matches “${query}”. Try another word, or ask us directly below.` } : null}
        side={(
          <>
            <input
              type="search"
              className="ez-input"
              placeholder="Search the questions…"
              aria-label="Search questions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', height: '46px' }}
            />
            {error ? <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: '13px' }}>The questions could not be loaded right now.</p> : null}
          </>
        )}
      />
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Still stuck?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Ask a jacket maker
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Email, WhatsApp or the contact form — a real person replies within one business day.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/contact-us" className="ez-btn ez-btn-gold">Contact us</A>
            <A href="/sizechart" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Size chart →</A>
          </div>
        </div>
      </section>
      <Footer faq={false} />
    </div>
  );
}
