// The keyword landing pages (/letterman-jackets, /school-jackets …): the live site's pages and copy
// (data/landingPages.js), in this site's design, with real jackets from the catalogue for each topic.
// The storefront server writes the same text into the HTML before JavaScript runs (server.mjs).
import { useLocation } from 'react-router-dom';
import A from '../components/A';
import Footer from '../components/Footer';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import ProductCard from '../components/ProductCard';
import { LANDING_CUSTOMIZE, LANDING_STEPS, landingPage } from '../data/landingPages';
import { fetchProducts } from '../lib/catalog';
import { shopPath } from '../lib/urls';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import NotFound from './NotFound';

const H2 = { fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,68px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 22px' };
const WRAP = { maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(16px,4vw,48px) 0' };

export default function KeywordLanding() {
  const { pathname } = useLocation();
  const page = landingPage(pathname);
  usePageTitle(page?.title, page?.description);
  const filters = page?.products || {};
  const { data: list, error: listError } = useAsync(
    (signal) => (page ? fetchProducts({ ...filters, limit: 8, sort: 'popular' }, signal) : Promise.resolve(null)),
    [pathname],
  );
  if (!page) return <NotFound />;
  const products = list?.products || [];
  const moreHref = filters.search ? shopPath({}, { q: filters.search }) : shopPath({ category: filters.category, material: filters.material });

  return (
    <div className="pg-keyword-landing">
      <Nav cta="shop" />
      <main id="main">
      {/* header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span aria-hidden="true">/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }} aria-current="page">{page.h1}</span>
        </nav>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,440px)', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>Easy Jackets guide</div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '8px 0 0' }}>{page.h1}</h1>
            <p style={{ maxWidth: '58ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '17px' }}>{page.intro}</p>
            <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '26px' }}>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-ink" style={{ minHeight: '50px', fontSize: '20px' }}>Design your jacket</A>
              <A href="/shop" className="ez-btn" style={{ minHeight: '50px', fontSize: '20px' }}>Shop jackets</A>
            </div>
          </div>
          {/* the quick answer, on the shop page's campaign photo */}
          <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.9' }}>
              <ImageSlot slot="kl-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.92) 30%,rgba(20,17,15,0.45) 60%,rgba(20,17,15,0.1) 85%)' }} />
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '22px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>Quick answer</div>
              <p style={{ margin: '8px 0 0', lineHeight: '1.55', fontSize: '16px' }}>{page.quickAnswer}</p>
            </div>
          </div>
        </div>
      </section>

      {/* what you can customize + popular options */}
      <section style={WRAP}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'start' }}>
          <div>
            <h2 style={H2}>{LANDING_CUSTOMIZE.heading}</h2>
            {LANDING_CUSTOMIZE.paragraphs.map((p) => <p key={p} style={{ margin: '0 0 16px', color: 'var(--ink-2)', lineHeight: '1.7', fontSize: '16px', maxWidth: '62ch' }}>{p}</p>)}
            {page.extra ? (
              <>
                <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', textTransform: 'uppercase', margin: '28px 0 10px' }}>{page.extra.heading}</h3>
                {page.extra.paragraphs.map((p) => <p key={p} style={{ margin: '0 0 16px', color: 'var(--ink-2)', lineHeight: '1.7', fontSize: '16px', maxWidth: '62ch' }}>{p}</p>)}
              </>
            ) : null}
          </div>
          <div style={{ borderLeft: '3px solid var(--gold)', paddingLeft: '24px' }}>
            <h2 style={{ ...H2, fontSize: 'clamp(30px,3.5vw,44px)' }}>Popular options</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '12px' }}>
              {page.highlights.map((h) => <li key={h} style={{ fontWeight: '600', fontSize: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--cream-2)' }}>{h}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* real jackets for the topic */}
      <section style={WRAP}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '28px' }}>
          <h2 style={{ ...H2, margin: 0 }}>{page.productsTitle}</h2>
          <A href={moreHref} style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>See all →</A>
        </div>
        <div className="ez-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '32px 20px' }}>
          {list ? products.map((p) => <ProductCard key={p.id} product={p} slotPrefix="kl" />)
            : listError ? null
            : Array.from({ length: 4 }, (_, i) => (
              <div key={i} aria-busy="true">
                <div className="ez-skeleton" style={{ aspectRatio: '4/5', borderRadius: '4px' }} />
                <div className="ez-skeleton" style={{ height: '16px', width: '70%', marginTop: '14px' }} />
              </div>
            ))}
        </div>
      </section>

      {/* how an order runs */}
      <section style={WRAP}>
        <h2 style={H2}>How ordering works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '26px' }}>
          {LANDING_STEPS.map((s) => (
            <div key={s.n} style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1', color: 'var(--gold-2)' }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', margin: '6px 0 0', lineHeight: '1' }}>{s.title}</h3>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', fontSize: '14px' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* related pages */}
      <section style={{ ...WRAP, paddingBottom: '24px' }}>
        <h2 style={{ ...H2, fontSize: 'clamp(34px,4vw,52px)' }}>Related pages</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '14px' }}>
          {page.links.map((l) => (
            <A key={l.to} href={l.to} className="ez-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '20px 22px', border: '1px solid var(--cream-2)', borderRadius: '4px', background: '#fbf8f2', textDecoration: 'none', color: 'var(--ink)' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1' }}>{l.label}</span>
              <span aria-hidden="true" style={{ color: 'var(--gold-2)', fontWeight: '700' }}>→</span>
            </A>
          ))}
        </div>
      </section>

      </main>
      {/* the admin's FAQs for this address, or the page's own (as on the live site) */}
      <Footer faq={{ pageKeys: [pathname.replace(/\/+$/, '')], title: 'Good to know', fallback: page.faqs.map((f) => ({ q: f.question, a: f.answer })) }} />
    </div>
  );
}
