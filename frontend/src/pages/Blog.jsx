// The journal: every published post from the API, filterable by category
// (?category=…), with a featured post on top: one of the posts marked Featured
// in the admin, picked at random on each visit.
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchBlogs } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './Blog.css';

export default function Blog() {
  const [params, setParams] = useSearchParams();
  const cat = params.get('category') || 'All';
  const { data: all, loading, error } = useAsync(fetchBlogs, []);
  usePageTitle('The Varsity Journal', 'Guides on custom varsity and letterman jackets — materials, styling, design ideas and customization tips.');

  const cats = useMemo(() => {
    const counts = new Map();
    for (const b of all || []) counts.set(b.category, (counts.get(b.category) || 0) + 1);
    return [{ label: 'All', count: (all || []).length }, ...[...counts].map(([label, count]) => ({ label, count }))];
  }, [all]);
  const filtered = (all || []).filter((b) => cat === 'All' || b.category === cat);
  // Featured: every post marked Featured in the admin, shuffled once per visit (a refresh can show another).
  // Images still on the retired S3 host go to the back; if the chosen image fails anyway, the next one takes over.
  const featuredPool = useMemo(() => {
    const pool = (all || []).filter((b) => b.featured && b.image);
    for (let i = pool.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const dead = (b) => /s3\.amazonaws\.com/i.test(String(b.image));
    return [...pool.filter((b) => !dead(b)), ...pool.filter(dead)];
  }, [all]);
  const [featuredMiss, setFeaturedMiss] = useState(0);
  const featured = cat === 'All' ? featuredPool[featuredMiss] || null : null;
  const hasFallback = featuredMiss < featuredPool.length - 1;
  const posts = filtered.filter((b) => !featured || b.slug !== featured.slug);
  const select = (label) => setParams(label === 'All' ? {} : { category: label }, { replace: true });

  return (
    <div className="pg-blog">
      <Nav active="/new-blog" cta="shop" />
      {/* Blog header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Blog</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
            The Varsity
            <br />
            Journal
          </h1>
          <p style={{ maxWidth: '44ch', margin: '0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            Guides on custom varsity and letterman jackets — materials, styling, design ideas and customization tips from the people who make them.
          </p>
        </div>
        <div className="bl-cats" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '32px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {cats.map((c) => (
            <button key={c.label} type="button" className="ez-chip" aria-pressed={cat === c.label} onClick={() => select(c.label)} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {c.label}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{c.count}</span>
            </button>
          ))}
          {/* phones: the categories as the device's own dropdown */}
          <select className="ez-input bl-cats-select" aria-label="Category" value={cat} onChange={(e) => select(e.target.value)}>
            {cats.map((c) => <option key={c.label} value={c.label}>{c.label} ({c.count})</option>)}
          </select>
        </div>
      </section>
      {/* Featured */}
      {featured ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
          <A href={`/new-blog/${encodeURIComponent(featured.slug)}`} className="ez-card ez-feat" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: '0', textDecoration: 'none', color: 'inherit', background: 'var(--ink)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot key={featured.slug} slot="blog-feat" shape="rect" src={featured.image} width={960} placeholder="Featured post image" aria-label={featured.title} eager {...(hasFallback ? { onError: () => setFeaturedMiss((n) => n + 1) } : {})} />
            </div>
            <div style={{ padding: 'clamp(24px,3vw,44px)', color: 'var(--cream)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--gold)' }}>Featured</span>
                <span style={{ color: 'rgba(244,239,230,0.6)' }}>{featured.category}{featured.readTime ? ` · ${featured.readTime}` : ''}</span>
              </div>
              <h2 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '0.92', textTransform: 'uppercase', margin: '0', color: 'var(--cream)', transition: 'color .2s' }}>{featured.title}</h2>
              <p style={{ margin: '0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px' }}>{featured.excerpt}</p>
              <div style={{ fontSize: '13px', color: 'rgba(244,239,230,0.6)' }}>{featured.dateLabel}</div>
              <span className="ez-btn ez-btn-gold" style={{ alignSelf: 'flex-start', minHeight: '46px', fontSize: '18px' }}>Read the guide →</span>
            </div>
          </A>
        </section>
      ) : null}
      {/* Posts */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        {error ? <p style={{ color: 'var(--muted)' }}>The journal could not be loaded ({error.message}).</p> : null}
        <div key={loading ? 'loading' : cat} className={loading ? undefined : 'ez-grid-enter'} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '36px 24px' }}>
          {loading ? Array.from({ length: 6 }, (_, i) => (
            <div key={i} aria-busy="true">
              <div className="ez-skeleton" style={{ aspectRatio: '5/4', borderRadius: '4px' }} />
              <div className="ez-skeleton" style={{ height: '16px', width: '70%', marginTop: '14px' }} />
              <div className="ez-skeleton" style={{ height: '12px', width: '45%', marginTop: '8px' }} />
            </div>
          )) : posts.map((b) => (
            <A key={b.slug} href={`/new-blog/${encodeURIComponent(b.slug)}`} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '5/4', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={`blog-${b.id}`} shape="rect" src={b.image} width={640} placeholder="Post image" aria-label={b.title} />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {b.category}
                {b.readTime ? <span style={{ color: 'var(--muted)', fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>· {b.readTime}</span> : null}
              </div>
              <h3 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase', margin: '10px 0 0', transition: 'color .2s' }}>{b.title}</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '15px' }}>{b.excerpt}</p>
              <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)' }}>{b.dateLabel}</div>
            </A>
          ))}
        </div>
        {!loading && !posts.length && !featured ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>No posts in this category yet.</p> : null}
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--gold)', color: 'var(--ink)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Read enough?</div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>Put it on a jacket</h2>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-ink">Design your own</A>
            <A href="/shop" className="ez-btn">Shop ready styles →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
