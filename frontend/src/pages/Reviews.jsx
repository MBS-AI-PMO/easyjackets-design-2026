// Reviews: the approved customer reviews the API features (4★ and up with a
// comment, GET /reviews/featured) plus the store-wide average and count, with
// a client-side rating filter. Reviews are written on a jacket's own page.
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchFeaturedReviews } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import { productPath } from '../lib/urls';

const STARS = [5, 4, 3, 2, 1];
const starsOf = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
const card = { background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '22px', display: 'grid', gap: '12px', alignContent: 'start' };

export default function Reviews() {
  usePageTitle('Customer Reviews', 'What customers say about their custom varsity and letterman jackets from Easy Jackets — approved reviews, ratings and the jackets they bought.');
  const [stars, setStars] = useState(0);
  const [showNote, setShowNote] = useState(false);
  const { data, loading, error } = useAsync((signal) => fetchFeaturedReviews(60, signal), []);

  const reviews = data?.reviews || [];
  const total = data?.total || 0;
  const avg = Number(data?.averageRating || 0);
  const counts = STARS.map((n) => reviews.filter((r) => r.rating === n).length);
  const bars = STARS.map((n, i) => ({
    label: `${n} ★`,
    count: counts[i],
    pct: reviews.length ? `${Math.round((counts[i] / reviews.length) * 100)}%` : '0%',
    active: stars === n,
    select: () => setStars(stars === n ? 0 : n),
  }));
  const chips = [{ label: 'All', n: 0 }, ...STARS.filter((n, i) => counts[i]).map((n) => ({ label: `${n} ★`, n }))]
    .map((c) => ({ ...c, active: stars === c.n, select: () => setStars(c.n) }));
  const list = reviews.filter((r) => !stars || r.rating === stars);

  return (
    <div className="pg-reviews">
      <Nav cta="cart" />
      {/* Reviews header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Reviews</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              What customers
              <br />
              say
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Reviews from customers around the world, each one checked by the workshop before it goes live.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="reviews-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* Rating summary */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
          {loading ? (
            <div className="ez-skeleton" aria-busy="true" style={{ width: 'clamp(150px,20vw,260px)', height: 'clamp(84px,10vw,136px)' }} />
          ) : total ? (
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(96px,12vw,160px)', lineHeight: '0.85' }}>{avg.toFixed(1)}</div>
          ) : null}
          <div>
            <div className="ez-star" style={{ fontSize: total || loading ? '24px' : '40px' }} aria-label={total ? `${avg.toFixed(1)} out of 5 stars` : 'Not yet rated'}>{starsOf(total ? Math.round(avg) : 0)}</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>
              {loading ? 'Loading reviews…' : total ? `Based on ${total.toLocaleString()} approved ${total === 1 ? 'review' : 'reviews'}` : 'No approved reviews yet'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {bars.map((b) => (
            <button key={b.label} type="button" onClick={b.select} aria-pressed={b.active} disabled={!b.count} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 48px', gap: '12px', alignItems: 'center', background: 'none', border: '0', padding: '4px 0', font: 'inherit', cursor: b.count ? 'pointer' : 'default', color: 'var(--ink)', textAlign: 'left', opacity: b.count ? 1 : 0.55 }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{b.label}</span>
              <span style={{ height: '10px', background: 'var(--cream-2)', borderRadius: '1px', overflow: 'hidden', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', background: 'var(--gold)', width: b.pct, transition: 'width .3s' }} />
              </span>
              <span style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>{b.count}</span>
            </button>
          ))}
        </div>
      </section>
      {/* Review filters */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          <div className="ez-chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {chips.map((c) => (
              <button key={c.label} type="button" className="ez-chip" aria-pressed={c.active} onClick={c.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
                {c.label}
              </button>
            ))}
            {/* phones: the device's own dropdown instead of the chips */}
            <select className="ez-input ez-chip-select" aria-label="Filter reviews by rating" value={(chips.find((c) => c.active) || chips[0] || {}).label || ''} onChange={(e) => chips.find((c) => c.label === e.target.value)?.select()}>
              {chips.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
            </select>
          </div>
          <button type="button" className="ez-btn" onClick={() => setShowNote((v) => !v)} aria-expanded={showNote} style={{ minHeight: '44px', fontSize: '17px' }}>Write a review</button>
        </div>
      </section>
      {/* Where to write one: reviews belong to a jacket, so they are posted from its page */}
      {showNote ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
          <div className="ez-reveal" style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '16px', maxWidth: '720px' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
              Your review
            </h2>
            <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>
              Reviews are written on the jacket's own page, so each one stays tied to what you bought. Open your jacket from the shop and use the review form below its photos — the workshop approves every review before it appears here.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <A href="/shop" className="ez-btn ez-btn-ink">Find your jacket</A>
              <button type="button" className="ez-btn" onClick={() => setShowNote(false)}>Close</button>
            </div>
          </div>
        </section>
      ) : null}
      {/* Review list */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
        {error ? <p role="alert" style={{ color: 'var(--muted)', margin: '0 0 16px' }}>Reviews could not be loaded ({error.message}).</p> : null}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
          {loading ? Array.from({ length: 3 }, (_, i) => (
            <div key={i} aria-busy="true" style={card}>
              <div className="ez-skeleton" style={{ height: '16px', width: '40%' }} />
              <div className="ez-skeleton" style={{ height: '24px', width: '75%' }} />
              <div className="ez-skeleton" style={{ height: '72px' }} />
              <div className="ez-skeleton" style={{ height: '14px', width: '55%' }} />
            </div>
          )) : list.map((r) => (
            <article key={r.id} className="ez-reveal" style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span className="ez-star" style={{ fontSize: '16px' }} aria-label={`${r.rating} out of 5 stars`}>{starsOf(r.rating)}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                  ✓ Approved
                </span>
              </div>
              {r.title ? (
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                  {r.title}
                </div>
              ) : null}
              <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>{r.quote}</p>
              <div style={{ fontSize: '13px', color: 'var(--muted)', borderTop: '1px solid var(--cream-2)', paddingTop: '12px', display: 'grid', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span aria-hidden="true" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '16px', flex: '0 0 auto' }}>{r.initial}</span>
                  <span>
                    <strong style={{ color: 'var(--ink)' }}>{r.name}</strong>
                    {r.date ? ` · ${fmtDate(r.date)}` : ''}
                  </span>
                </div>
                {r.product?.slug ? (
                  <A href={productPath(r.product.slug)} style={{ justifySelf: 'start', color: 'var(--ink)', textDecoration: 'none', borderBottom: '2px solid var(--gold)', fontWeight: '600' }}>{r.product.name} →</A>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {!loading && !error && !list.length ? (
          <div style={{ textAlign: 'center', padding: 'clamp(40px,5vw,64px) 16px', border: '1px dashed var(--cream-2)', borderRadius: '4px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(28px,3.5vw,44px)', lineHeight: '0.95', textTransform: 'uppercase' }}>
              {reviews.length ? 'No reviews with this rating' : 'Reviews appear here once approved'}
            </div>
            <p style={{ color: 'var(--muted)', maxWidth: '48ch', margin: '12px auto 0', lineHeight: '1.6', fontSize: '15px' }}>
              {reviews.length
                ? 'Pick another rating, or show them all.'
                : 'Every review is checked by the workshop before it goes live. Until then, each jacket’s page carries its own reviews.'}
            </p>
            {reviews.length ? (
              <button type="button" className="ez-btn" onClick={() => setStars(0)} style={{ marginTop: '20px' }}>Show all</button>
            ) : (
              <A href="/shop" className="ez-btn" style={{ marginTop: '20px' }}>Browse jackets</A>
            )}
          </div>
        ) : null}
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Join them
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Your jacket, your review
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Every review here started with a design lab session.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Design your own</A>
            <A href="/shop" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Shop ready styles →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
