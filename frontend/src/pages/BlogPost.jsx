// A blog post, loaded by slug from the API.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchProducts } from '../lib/catalog';
import { fetchBlog, fetchBlogs } from '../lib/content';
import { prepareArticle } from '../lib/html';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './BlogPost.css';
import { productPath } from '../lib/urls';

const initials = (name) => String(name || 'EJ').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const shareBox = { width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: '1.5px solid var(--ink)', borderRadius: '2px', textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '14px', color: 'var(--ink)' };

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, loading, error } = useAsync((signal) => fetchBlog(slug, signal), [slug]);
  const { data: all } = useAsync(fetchBlogs, []);
  const { data: featured } = useAsync((signal) => fetchProducts({ limit: 1, sort: 'popular' }, signal).then((r) => r.products[0] || null), []);
  usePageTitle(post?.title, post?.excerpt?.slice(0, 160));

  const article = useMemo(() => (post ? prepareArticle(post.content) : { html: '', toc: [] }), [post]);
  const index = all && post ? all.findIndex((b) => b.slug === post.slug) : -1;
  const prev = index > 0 ? all[index - 1] : null; // newer
  const next = index >= 0 && index < (all?.length || 0) - 1 ? all[index + 1] : null; // older
  const related = useMemo(() => {
    if (!all || !post) return [];
    const others = all.filter((b) => b.slug !== post.slug);
    return [...others.filter((b) => b.category === post.category), ...others.filter((b) => b.category !== post.category)].slice(0, 3);
  }, [all, post]);

  // reading progress, one update per frame
  const [progress, setProgress] = useState(0);
  // the line sticks directly under the navbar, which is shorter on tablets and phones
  const [navHeight, setNavHeight] = useState(93);
  useEffect(() => {
    const nav = document.querySelector('.ez-nav');
    if (!nav || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => setNavHeight(Math.round(nav.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const a = document.getElementById('article'); if (!a) return;
      const r = a.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.5)));
      const v = Math.round(p * 100);
      setProgress((prevV) => (prevV === v ? prevV : v));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [slug]);

  const [copied, setCopied] = useState(false);
  const copyLink = () => { try { navigator.clipboard.writeText(window.location.href); } catch { /* unsupported */ } setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!loading && (error || !post)) {
    return (
      <div className="pg-blog-post">
        <Nav active="/new-blog" cta="shop" />
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', textTransform: 'uppercase', lineHeight: '0.9' }}>That post is not here</div>
          <p style={{ color: 'var(--muted)', margin: '16px 0 28px' }}>{error && error.status !== 404 ? error.message : 'It may have been renamed or unpublished.'}</p>
          <A href="/new-blog" className="ez-btn ez-btn-ink">All posts</A>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pg-blog-post">
      <Nav active="/new-blog" cta="shop" />
      {/* reading progress */}
      <div style={{ position: 'sticky', top: `${navHeight}px`, zIndex: '19', height: '3px', background: 'transparent' }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: `${progress}%`, transition: 'width .1s linear' }} />
      </div>
      {/* Post header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <A href="/new-blog" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>{post?.category || '…'}</span>
        </div>
        <div style={{ maxWidth: '900px', marginTop: '24px' }}>
          {loading ? (
            <div style={{ display: 'grid', gap: '14px' }} aria-busy="true">
              <div className="ez-skeleton" style={{ height: '14px', width: '30%' }} />
              <div className="ez-skeleton" style={{ height: '80px' }} />
              <div className="ez-skeleton" style={{ height: '48px', width: '80%' }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', flexWrap: 'wrap' }}>
                <A href={`/new-blog?category=${encodeURIComponent(post.category)}`} style={{ color: 'var(--gold-2)', textDecoration: 'none' }}>{post.category}</A>
                <span style={{ color: 'var(--muted)' }}>· {post.readTime ? `${post.readTime} read · ` : ''}{post.dateLabel}</span>
              </div>
              <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6.5vw,92px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>{post.title}</h1>
              {post.excerpt ? <p style={{ fontSize: '19px', lineHeight: '1.55', color: 'var(--ink-2)', margin: '22px 0 0', maxWidth: '60ch' }}>{post.excerpt}</p> : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
                <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '20px' }}>{initials(post.author)}</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{post.author || 'Easy Jackets'}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Published {post.dateLabel}</div>
                </div>
              </div>
            </>
          )}
        </div>
        <div style={{ position: 'relative', marginTop: '40px' }}>
          <div style={{ aspectRatio: '21/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
            {post?.image ? <ImageSlot slot="post-hero" shape="rect" src={post.image} width={1280} placeholder="Post image" aria-label={post.title} eager /> : <div className="ez-skeleton" style={{ height: '100%' }} />}
          </div>
        </div>
      </section>
      {/* Article */}
      <section className="ez-article" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) minmax(0,720px) minmax(220px,1fr)', gap: '40px clamp(24px,4vw,56px)', alignItems: 'start' }}>
        <aside className="ez-aside ez-toc" style={{ position: 'sticky', top: '120px' }}>
          {article.toc.length ? (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>In this guide</div>
              {article.toc.slice(0, 12).map((t) => <A key={t.id} href={`#${t.id}`}>{t.text}</A>)}
            </>
          ) : null}
        </aside>
        <article className="ez-prose" id="article">
          {loading ? (
            <div style={{ display: 'grid', gap: '12px' }} aria-busy="true">{Array.from({ length: 8 }, (_, i) => <div key={i} className="ez-skeleton" style={{ height: '14px', width: `${95 - (i % 3) * 15}%` }} />)}</div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: article.html }} />
          )}
          {/* inline CTA */}
          <div style={{ margin: '48px 0 0', background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: '28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>Ready?</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>Design yours in the lab</div>
            </div>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Start designing →</A>
          </div>
          {/* tags + share */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px 24px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--ink)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {post?.category ? (
                <A href={`/new-blog?category=${encodeURIComponent(post.category)}`} style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px', border: '1px solid var(--ink)', borderRadius: '2px', textDecoration: 'none' }}>{post.category}</A>
              ) : null}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)' }}>
              Share
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post?.title || '')}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" style={shareBox}>X</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" style={shareBox}>FB</a>
              <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(post?.image || '')}&description=${encodeURIComponent(post?.title || '')}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest" style={shareBox}>PT</a>
              <button type="button" onClick={copyLink} style={{ height: '36px', padding: '0 12px', border: '1.5px solid var(--ink)', borderRadius: '2px', background: 'transparent', font: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--ink)' }}>{copied ? 'Copied' : 'Copy link'}</button>
            </div>
          </div>
        </article>
        <aside className="ez-aside" style={{ position: 'sticky', top: '120px' }}>
          {featured ? (
            <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>Most popular jacket</div>
              <div className="ez-product-photo" style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden', marginTop: '12px' }}>
                <ImageSlot slot="post-product" shape="rect" src={featured.image} width={480} placeholder="Product" aria-label={featured.imageAlt} />
              </div>
              <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '12px' }}>{featured.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>{featured.priceLabel}</span>
                {featured.wasLabel ? <s style={{ fontSize: '13px', color: 'var(--muted)' }}>{featured.wasLabel}</s> : null}
              </div>
              <A href={productPath(featured.slug)} className="ez-btn ez-btn-ink" style={{ width: '100%', minHeight: '44px', fontSize: '17px', marginTop: '14px' }}>View jacket</A>
            </div>
          ) : null}
        </aside>
      </section>
      {/* Prev next */}
      {prev || next ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {[[prev, '← Newer', 'left'], [next, 'Older →', 'right']].map(([b, label, align]) => (b ? (
              <A key={b.slug} href={`/new-blog/${encodeURIComponent(b.slug)}`} className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit', textAlign: align }}>
                <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
                <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '10px', transition: 'color .2s' }}>{b.title}</div>
              </A>
            ) : <span key={label} />))}
          </div>
        </section>
      ) : null}
      {/* Related posts */}
      {related.length ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>Keep reading</h2>
            <A href="/new-blog" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All posts →</A>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
            {related.map((b) => (
              <A key={b.slug} href={`/new-blog/${encodeURIComponent(b.slug)}`} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ aspectRatio: '5/4', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                  <ImageSlot slot={`rel-${b.id}`} shape="rect" src={b.image} width={640} placeholder="Post image" aria-label={b.title} />
                </div>
                <div style={{ marginTop: '14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                  {b.category}{b.readTime ? <span style={{ color: 'var(--muted)', fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}> · {b.readTime}</span> : null}
                </div>
                <h3 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', margin: '10px 0 0', transition: 'color .2s' }}>{b.title}</h3>
              </A>
            ))}
          </div>
        </section>
      ) : <div style={{ height: '96px' }} />}
      <Footer />
    </div>
  );
}
