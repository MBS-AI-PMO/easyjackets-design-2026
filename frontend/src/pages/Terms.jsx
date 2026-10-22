// Terms & Conditions: the text is the admin's (Content -> Terms & Conditions, stored in the database, backend
// helpers/pageContent.js + data/termsDefaults.js). Each section is a title and its text as HTML, cleaned on the
// server to headings, paragraphs, lists, emphasis and links, and cleaned again here before it is drawn. The
// "On this page" list is made from the section titles. Crawlers that run no scripts get the same text from the
// server (seo-render).
import { useMemo, useState } from 'react';
import A from '../components/A';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { usePageTitle } from '../lib/usePageTitle';
import { usePageContent } from '../lib/pageContent';
import { safeHtml } from '../lib/html';
import './Terms.css';

// shown only when the terms cannot be loaded at all (no saved copy in this browser and no answer from the API)
const UNAVAILABLE = { header: { title: 'Terms & Conditions' }, sections: [], unavailable: true };

// "7. Sizing & measurements" -> "sizing-and-measurements": an address for each section, unique on the page
const anchorsFor = (sections) => {
  const seen = new Map();
  return sections.map((s) => {
    const base = String(s.title || 'section').toLowerCase().replace(/^\s*\d+\s*[.)]\s*/, '').replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section';
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return n > 1 ? `${base}-${n}` : base;
  });
};

const Bar = ({ w, h = 16, mt = 12 }) => <div className="ez-skeleton" style={{ width: w, height: `${h}px`, marginTop: `${mt}px` }} />;

export default function Terms() {
  usePageTitle('Terms & Conditions', 'The agreement between you and Easy Jackets when you order: acceptance, pricing, proofs, artwork rights, sizing, delivery, team orders and liability.');
  const { content, ready } = usePageContent('terms', UNAVAILABLE);
  const [tocOpen, setTocOpen] = useState(false);
  const header = content?.header || {};
  const sections = useMemo(() => (content?.sections || []).map((s) => ({ ...s, html: safeHtml(s.body || '', { stripStyles: true }) })), [content]);
  const anchors = useMemo(() => anchorsFor(sections), [sections]);
  const titled = sections.map((s, i) => ({ title: s.title, id: anchors[i] })).filter((s) => s.title);

  return (
    <div className="pg-terms">
      <Nav cta="cart" />
      <main id="main" aria-busy={!ready}>
      {/* Terms header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Terms & Conditions</span>
        </div>
        <div style={{ marginTop: '16px', maxWidth: '52ch' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7.5vw,104px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            {ready ? header.title || 'Terms & Conditions' : 'Terms & Conditions'}
          </h1>
          {ready ? (
            <>
              {header.intro ? <p style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>{header.intro}</p> : null}
              {header.effectiveDate ? <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: '13px' }}>Effective date: {header.effectiveDate}</p> : null}
            </>
          ) : (
            <><Bar w="min(100%, 46ch)" mt={22} /><Bar w="18ch" h={12} /></>
          )}
        </div>
      </section>
      {/* Terms body */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 64px', display: 'grid', gridTemplateColumns: 'minmax(0,240px) minmax(0,1fr)', gap: '32px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <aside className={`ez-toc ez-side tc-toc${tocOpen ? ' is-open' : ''}`} style={{ position: 'sticky', top: '110px' }}>
          <button type="button" className="tc-toc-toggle" aria-expanded={tocOpen} aria-controls="tc-toc-list" onClick={() => setTocOpen((v) => !v)}>
            On this page{titled.length ? ` (${titled.length})` : ''}
            <span aria-hidden="true">{tocOpen ? '−' : '+'}</span>
          </button>
          <div className="tc-toc-label">On this page</div>
          <nav id="tc-toc-list" className="tc-toc-list" aria-label="Sections">
            {ready
              ? titled.map((s) => <A key={s.id} href={`#${s.id}`} onClick={() => setTocOpen(false)}>{s.title}</A>)
              : [70, 55, 80, 60, 75, 50].map((w, i) => <Bar key={i} w={`${w}%`} h={12} mt={14} />)}
          </nav>
        </aside>
        <div className="ez-prose tc-prose">
          {!ready ? (
            [0, 1, 2].map((i) => (
              <div key={i} style={{ marginBottom: '40px' }}>
                <Bar w="40%" h={30} mt={0} /><Bar w="100%" /><Bar w="96%" /><Bar w="88%" /><Bar w="70%" />
              </div>
            ))
          ) : content?.unavailable ? (
            <p>
              The terms could not be loaded just now. Please refresh the page, or{' '}
              <A href="/contact-us">contact us</A>
              {' '}and we will send them to you.
            </p>
          ) : (
            sections.map((s, i) => (
              <section key={anchors[i]} id={anchors[i]} className="tc-section" aria-labelledby={s.title ? `${anchors[i]}-title` : undefined}>
                {s.title ? <h2 id={`${anchors[i]}-title`}>{s.title}</h2> : null}
                {/* the admin's text, cleaned on the server and again here (lib/html.js) */}
                {s.html ? <div dangerouslySetInnerHTML={{ __html: s.html }} /> : null}
              </section>
            ))
          )}
        </div>
      </section>
      {/* Related */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 clamp(16px,4vw,48px) 96px' }}>
        <div style={{ borderTop: '2px solid var(--ink)', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: '6px' }}>
            Also read
          </span>
          <A href="/shipping" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Shipping & returns
          </A>
          <A href="/privacypolicy" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Privacy policy
          </A>
          <A href="/bulk-order" className="ez-chip" style={{ textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '17px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Team orders
          </A>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
