// A catalogue product, loaded by slug from the API.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import ProductCard from '../components/ProductCard';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useCart } from '../lib/cart';
import { customizerUrl, fetchProduct, fetchRelated, fetchReviewSummary, fetchReviews, money, submitReview, trackView } from '../lib/catalog';
import { safeHtml, stripHtml } from '../lib/html';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './Product.css';
import { shopPath } from '../lib/urls';

const FAQS = [
  { q: 'Can I add patches after I receive it?', a: 'Yes. Chenille and embroidered patches can be sewn on by any local tailor; we also sell matching patches separately.' },
  { q: 'Is the leather real?', a: 'Cowhide sleeves are full-grain leather. Choose vegan leather in the Design Studio for an animal-free build.' },
  { q: 'How does sizing run?', a: 'True to the chart above, cut to layer over a hoodie. Between sizes, go up.' },
  { q: 'Can I return a custom jacket?', a: 'Custom jackets are made to your spec, so returns are for defects or a size that does not match your order — in which case we remake it.' },
];
const SIZE_CHART = [
  ['Chest', 38, 40, 42, 44, 46, 49, 52],
  ['Length', 24, 25, 26, 27, 28, 29, 30],
  ['Sleeve', 24, 24.5, 25, 25.5, 26, 26.5, 27],
  ['Shoulder', 17, 18, 19, 20, 21, 22, 23],
];
// the one-column (phone) layout of this page, as in Product.css
const PHONE_QUERY = '(max-width: 900px)';
function useIsPhone() {
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const q = window.matchMedia(PHONE_QUERY);
    const on = () => setPhone(q.matches);
    on();
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);
  return phone;
}
// Product title: at most TITLE_MAX_LINES lines. It starts at its CSS size and steps down
// until the whole name fits (never below TITLE_MIN_PX); only a name that still does not fit
// at that size is cut with an ellipsis. Refits when the name, the fonts or the width change.
const TITLE_SIZE = 'clamp(44px,5vw,72px)';
const TITLE_LINE_HEIGHT = 0.88;
const TITLE_MAX_LINES = 3;
const TITLE_MIN_PX = 26;
function useFitLines(ref, text) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !text) return undefined;
    const fit = () => {
      // back to the full size first (not '' — that would drop the size itself and leave the browser's small default)
      Object.assign(el.style, { fontSize: TITLE_SIZE, display: '', WebkitLineClamp: '', WebkitBoxOrient: '', overflow: '' });
      let size = parseFloat(getComputedStyle(el).fontSize);
      const lines = () => Math.round(el.getBoundingClientRect().height / (size * TITLE_LINE_HEIGHT));
      while (lines() > TITLE_MAX_LINES && size > TITLE_MIN_PX) {
        size = Math.max(TITLE_MIN_PX, size - 2);
        el.style.fontSize = `${size}px`;
      }
      if (lines() > TITLE_MAX_LINES) {
        Object.assign(el.style, { display: '-webkit-box', WebkitLineClamp: String(TITLE_MAX_LINES), WebkitBoxOrient: 'vertical', overflow: 'hidden' });
      }
    };
    fit();
    let alive = true;
    document.fonts?.ready?.then(() => { if (alive) fit(); });
    window.addEventListener('resize', fit);
    return () => { alive = false; window.removeEventListener('resize', fit); };
  }, [ref, text]);
}

const stars = (n) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

const labelStyle = { fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' };
const h2Style = { fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4vw,56px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 20px' };

export default function Product() {
  const { slug } = useParams();
  const cart = useCart();
  const { data: product, loading, error } = useAsync((signal) => fetchProduct(slug, signal), [slug]);
  const productId = product?.id;
  const categoryId = product?.category?.id;
  const { data: summary, reload: reloadSummary } = useAsync((signal) => (productId ? fetchReviewSummary(productId, signal) : null), [productId]);
  const { data: reviews, reload: reloadReviews } = useAsync((signal) => (productId ? fetchReviews(productId, signal) : []), [productId]);
  const { data: related } = useAsync((signal) => (productId && categoryId ? fetchRelated(productId, categoryId, signal) : []), [productId, categoryId], { live: false }); // random per visit
  useEffect(() => { if (productId) trackView(productId); }, [productId]);
  usePageTitle(product?.name, product ? stripHtml(product.shortDescription || product.description).slice(0, 160) : undefined);

  // the jacket's name never takes more than three lines: long names get a smaller size
  const titleRef = useRef(null);
  useFitLines(titleRef, product?.name);

  const [img, setImg] = useState(0);
  const [tab, setTab] = useState('fixed');
  // "As shown" is a phone-only tab: on desktop the Customize tab stands alone
  const isPhone = useIsPhone();
  const shownTab = isPhone ? tab : 'custom';
  // the tab underline slides to the selected tab instead of jumping
  const tabsRef = useRef(null);
  const [tabInk, setTabInk] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = tabsRef.current?.querySelector('[aria-selected="true"]');
      if (el) setTabInk({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [shownTab, isPhone, product]);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [needSize, setNeedSize] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(() => { setImg(0); setSize(''); setQty(1); setNeedSize(false); setAdded(false); setTab('fixed'); }, [slug]);

  const sizes = product?.sizes || [];
  const chosen = sizes.find((s) => s.size === size) || null;
  const unit = chosen ? chosen.price : product?.price || 0;
  const unitOriginal = chosen ? chosen.original : product?.original || 0;
  const total = unit * qty;
  const breakdown = useMemo(() => {
    if (!product) return '';
    const parts = [chosen ? `Size ${chosen.size} · ${money(unit)} each` : sizes.length ? 'Pick a size for its exact price' : 'Made to order'];
    if (qty > 1) parts.push(`× ${qty}`);
    return parts.join(' · ');
  }, [product, chosen, unit, qty, sizes.length]);

  const addToCart = () => {
    if (sizes.length && !chosen) { setNeedSize(true); return; }
    cart.add({ id: product.id, slug: product.slug, name: product.name, price: unit, size: chosen?.size || '', color: product.color?.name || '', image: product.image }, qty);
    setAdded(true);
  };

  // review form
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', comment: '' });
  const [formState, setFormState] = useState({ sending: false, done: false, error: null });
  const sendReview = async (e) => {
    e.preventDefault();
    setFormState({ sending: true, done: false, error: null });
    try {
      await submitReview(product.id, form);
      setFormState({ sending: false, done: true, error: null });
      setForm({ name: '', email: '', rating: 5, title: '', comment: '' });
      reloadSummary(); reloadReviews();
    } catch (err) {
      setFormState({ sending: false, done: false, error: err.message });
    }
  };

  const catHref = product?.category ? shopPath({ category: product.category.slug }) : '/shop';
  const avg = summary?.averageRating || 0;
  const count = summary?.reviewCount || 0;

  if (!loading && (error || !product)) {
    return (
      <div className="pg-product">
        <Nav cta="cart" />
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', textTransform: 'uppercase', lineHeight: '0.9' }}>
            {error?.status === 404 || !error ? 'That jacket is not here' : 'The jacket could not be loaded'}
          </div>
          <p style={{ color: 'var(--muted)', margin: '16px 0 28px' }}>{error && error.status !== 404 ? error.message : 'It may have been renamed or retired.'}</p>
          <A href="/shop" className="ez-btn ez-btn-ink">Browse all jackets</A>
        </section>
        <Footer faq={false} />
      </div>
    );
  }

  return (
    <div className="pg-product">
      <Nav cta="cart" />
      {/* Product */}
      <section className="ez-pdp" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(24px,3vw,40px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: '40px clamp(24px,4vw,64px)', alignItems: 'start' }}>
        {/* gallery */}
        <div className="pdp-gallery">
          <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
            <span>/</span>
            <A href={catHref} style={{ textDecoration: 'none', color: 'inherit' }}>{product?.category?.name || 'Jackets'}</A>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>{product?.name || '…'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '72px minmax(0,1fr)', gap: '14px' }}>
            <div style={{ display: 'grid', gap: '10px', alignContent: 'start' }}>
              {(product?.images || []).map((src, i) => (
                <button key={src} type="button" className="ez-thumb" aria-pressed={img === i} onClick={() => setImg(i)} aria-label={`View ${i + 1}`}>
                  <ImageSlot slot={`pdp-thumb-${i}`} shape="rect" src={src} width={320} placeholder="" style={{ pointerEvents: 'none' }} />
                </button>
              ))}
            </div>
            <div className="ez-product-photo" style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden' }}>
              {loading ? <div className="ez-skeleton" style={{ position: 'absolute', inset: 0 }} /> : (
                // every photo sits in the frame, stacked; picking a thumbnail crossfades to it
                <div className="pdp-stage">
                  {(product.images?.length ? product.images : [product.image]).map((src, i) => (
                    <div key={src} className={`pdp-layer${i === img ? ' is-on' : ''}`} aria-hidden={i === img ? undefined : 'true'}>
                      <ImageSlot slot={`pdp-main-${i}`} shape="rect" src={src} width={1280} placeholder="Product photo" role="img" aria-label={product.imageAlt} eager={i === 0} />
                    </div>
                  ))}
                </div>
              )}
              {product?.badge ? (
                <span style={{ position: 'absolute', top: '14px', left: '14px', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 10px' }}>
                  {product.badge}
                </span>
              ) : null}
              {product?.color?.name ? (
                <span style={{ position: 'absolute', bottom: '14px', left: '14px', background: 'rgba(20,17,15,0.85)', color: 'var(--cream)', fontSize: '12px', padding: '6px 10px', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: product.color.code, boxShadow: '0 0 0 1px rgba(244,239,230,0.5)' }} />
                  <strong>{product.color.name}</strong>
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {/* details: below the gallery on desktop; on phones they follow the buy box (Product.css) */}
        <div className="pdp-details" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '40px' }}>
            <div>
              <h2 style={h2Style}>Built from the inside out</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px' }}>
                {[
                  ['Body', product?.material.body || '—', 'The main cloth of the jacket.'],
                  ['Sleeves', product?.material.sleeves || '—', 'Cut to match the body left to right.'],
                  ['Colour', product?.color?.name || '—', 'As photographed; customise it in the Design Studio.'],
                  ['Made to order', 'Ships in 2–3 weeks', 'Nothing is cut until you approve the free design proof.', true],
                ].map(([k, v, note, gold]) => (
                  <div key={k} style={{ borderTop: `3px solid ${gold ? 'var(--gold)' : 'var(--ink)'}`, paddingTop: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>{k}</div>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', marginTop: '4px' }}>{v}</div>
                    <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>
            {product?.description ? (
              <div>
                <h2 style={h2Style}>About this jacket</h2>
                <div className="ez-prose" dangerouslySetInnerHTML={{ __html: safeHtml(product.description) }} />
                {product.care ? (
                  <details style={{ borderTop: '1px solid var(--ink)', padding: '14px 0', marginTop: '20px' }}>
                    <summary style={{ cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '16px' }}>Care instructions</summary>
                    <div className="ez-prose" style={{ marginTop: '10px' }} dangerouslySetInnerHTML={{ __html: safeHtml(product.care) }} />
                  </details>
                ) : null}
              </div>
            ) : null}
            <div id="size">
              <h2 style={{ ...h2Style, margin: '0 0 8px' }}>Size chart</h2>
              <p style={{ margin: '0 0 16px', color: 'var(--muted)', fontSize: '14px' }}>
                Unisex fit, measured flat in inches. Between sizes? Go up — a varsity jacket should layer over a hoodie.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="ez-table">
                  <thead>
                    <tr>{['Size', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((row) => <tr key={row[0]}>{row.map((c, i) => <td key={i}>{c}</td>)}</tr>)}
                  </tbody>
                </table>
              </div>
            </div>
            {/* reviews */}
            <div id="reviews">
              <h2 style={{ ...h2Style, margin: '0 0 8px' }}>Reviews</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '20px', alignItems: 'start', marginTop: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '56px', lineHeight: '1' }}>{count ? avg.toFixed(1) : '—'}</span>
                    <span style={{ color: 'var(--gold-2)', letterSpacing: '0.08em', fontSize: '18px' }}>{stars(avg)}</span>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>{count ? `${count} approved review${count === 1 ? '' : 's'}` : 'No reviews yet — be the first.'}</div>
                  {count ? (
                    <div style={{ display: 'grid', gap: '6px', marginTop: '14px', maxWidth: '280px' }}>
                      {[5, 4, 3, 2, 1].map((n) => (
                        <div key={n} style={{ display: 'grid', gridTemplateColumns: '28px 1fr 32px', gap: '10px', alignItems: 'center', fontSize: '12px', color: 'var(--muted)' }}>
                          <span>{n}★</span>
                          <span style={{ height: '8px', background: 'var(--cream-2)', borderRadius: '2px', overflow: 'hidden' }}>
                            <span style={{ display: 'block', height: '100%', width: `${count ? ((summary.ratingBreakdown?.[n] || 0) / count) * 100 : 0}%`, background: 'var(--gold)' }} />
                          </span>
                          <span>{summary.ratingBreakdown?.[n] || 0}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <form onSubmit={sendReview} style={{ display: 'grid', gap: '10px' }}>
                  <div className="ez-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' }}>
                    <input className="ez-input" placeholder="Your name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    <input className="ez-input" type="email" placeholder="Email (not shown)" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--muted)' }}>Rating</span>
                    <div role="radiogroup" aria-label="Rating" style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} type="button" role="radio" aria-checked={form.rating === n} onClick={() => setForm({ ...form, rating: n })} style={{ background: 'none', border: '0', fontSize: '24px', cursor: 'pointer', color: n <= form.rating ? 'var(--gold)' : 'var(--cream-2)', padding: '0 2px' }} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
                      ))}
                    </div>
                  </div>
                  <input className="ez-input" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <textarea className="ez-input" placeholder="How did it fit, feel and hold up?" required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} style={{ minHeight: '110px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <button type="submit" className="ez-btn ez-btn-ink" disabled={formState.sending} style={{ minHeight: '46px', fontSize: '18px' }}>{formState.sending ? 'Sending…' : 'Submit review'}</button>
                    {formState.done ? <span style={{ fontSize: '13px', color: 'var(--gold-2)', fontWeight: '600' }}>Thanks — it will appear once approved.</span> : null}
                    {formState.error ? <span style={{ fontSize: '13px', color: '#a8222a', fontWeight: '600' }}>{formState.error}</span> : null}
                  </div>
                </form>
              </div>
              {(reviews || []).length ? (
                <div style={{ marginTop: '28px', borderTop: '1px solid var(--ink)' }}>
                  {reviews.map((r) => (
                    <div key={r._id || r.createdAt + r.name} style={{ padding: '16px 0', borderBottom: '1px solid var(--cream-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                        <div style={{ fontWeight: '600' }}>{r.title} <span style={{ color: 'var(--gold-2)', letterSpacing: '0.06em', marginLeft: '8px', fontSize: '13px' }}>{stars(r.rating)}</span></div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{r.name} · {formatDate(r.createdAt)}</div>
                      </div>
                      <p style={{ margin: '6px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '15px', maxWidth: '70ch' }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div>
              <h2 style={{ ...h2Style, margin: '0 0 8px' }}>Questions</h2>
              {FAQS.map((f) => (
                <details key={f.q} style={{ borderTop: '1px solid var(--ink)', padding: '14px 0' }}>
                  <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '16px' }}>
                    <span>{f.q}</span>
                    <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>+</span>
                  </summary>
                  <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch', fontSize: '15px' }}>{f.a}</p>
                </details>
              ))}
              <div style={{ borderTop: '1px solid var(--ink)' }} />
            </div>
        </div>
        {/* buy box */}
        <div className="ez-buy" style={{ position: 'sticky', top: '118px' }}>
          {loading ? (
            <div style={{ display: 'grid', gap: '14px' }} aria-busy="true">
              <div className="ez-skeleton" style={{ height: '14px', width: '40%' }} />
              <div className="ez-skeleton" style={{ height: '64px' }} />
              <div className="ez-skeleton" style={{ height: '56px', width: '50%' }} />
              <div className="ez-skeleton" style={{ height: '120px' }} />
            </div>
          ) : (
            <>
              <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {product.materialLabel || product.category?.name}
              </div>
              <h1 ref={titleRef} style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: TITLE_SIZE, lineHeight: TITLE_LINE_HEIGHT, textTransform: 'uppercase', margin: '8px 0 0' }}>{product.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', fontSize: '14px', flexWrap: 'wrap' }}>
                {count ? (
                  <>
                    <span style={{ color: 'var(--gold-2)', letterSpacing: '0.08em' }}>{stars(avg)}</span>
                    <strong>{avg.toFixed(1)}</strong>
                    <A href="#reviews" style={{ color: 'var(--muted)' }}>{count} review{count === 1 ? '' : 's'}</A>
                  </>
                ) : (
                  <A href="#reviews" style={{ color: 'var(--muted)' }}>Be the first to review</A>
                )}
                <span style={{ color: 'var(--muted)' }}>·</span>
                <span style={{ color: 'var(--muted)' }}>Ships in 2–3 weeks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '56px', lineHeight: '1' }}>{money(total)}</span>
                {product.hasDiscount ? <s style={{ fontSize: '18px', color: 'var(--muted)' }}>{money(unitOriginal * qty)}</s> : null}
                {product.hasDiscount ? (
                  <span style={{ background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', padding: '4px 8px' }}>{product.badge}</span>
                ) : null}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--muted)' }}>{breakdown}</p>
              {/* phones: "As shown" and "Customize" tabs; desktop: Customize alone, as a plain heading (no tab line) */}
              {isPhone ? (
                <div ref={tabsRef} role="tablist" style={{ position: 'relative', display: 'flex', gap: '28px', borderBottom: '1px solid var(--cream-2)', marginTop: '2px' }}>
                  <button type="button" className="ez-tab" role="tab" aria-selected={shownTab === 'fixed'} onClick={() => setTab('fixed')}>As shown</button>
                  <button type="button" className="ez-tab" role="tab" aria-selected={shownTab === 'custom'} onClick={() => setTab('custom')}>Customize</button>
                  <span className="ez-tab-ink" aria-hidden="true" style={{ left: tabInk.left, width: tabInk.width }} />
                </div>
              ) : (
                <h2 className="ez-tab" style={{ margin: '2px 0 0', paddingBottom: 0, borderBottom: 0, color: 'var(--ink)', cursor: 'default' }}>Customize</h2>
              )}
              <div key={shownTab} className="ez-tab-panel" role={isPhone ? 'tabpanel' : undefined}>
              {shownTab === 'fixed' ? (
                <div style={{ margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '15px' }}>
                  {product.shortDescription ? <div dangerouslySetInnerHTML={{ __html: safeHtml(product.shortDescription) }} /> : <p style={{ margin: 0 }}>Exactly as photographed{product.color?.name ? ` in ${product.color.name}` : ''}. Blank — ready for your patches, or add your letter later.</p>}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px', marginTop: isPhone ? '22px' : '8px' }}>
                  <p style={{ margin: 0, color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '15px' }}>
                    Change colours and add chenille letters, names, numbers and your logo in the Design Studio, with the price updating live. You approve a free digital proof before we stitch.
                  </p>
                  <a href={customizerUrl(product)} className="ez-btn ez-btn-gold" style={{ justifySelf: 'start' }}>Customize this jacket →</a>
                </div>
              )}
              </div>
              {/* size + qty */}
              {sizes.length ? (
                <div style={{ marginTop: '26px' }}>
                  <div style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Size</span>
                    <A href="#size" style={{ color: 'var(--gold-2)', textTransform: 'none', letterSpacing: '0', fontWeight: '600' }}>Size chart</A>
                  </div>
                  <div className="ez-sizes">
                    {(sizes.length > 8 ? [sizes.slice(0, Math.ceil(sizes.length / 2)), sizes.slice(Math.ceil(sizes.length / 2))] : [sizes]).map((row, i) => (
                      <div key={i} className="ez-sizes-row">
                        {row.map((s) => (
                          <button key={s.size} type="button" className="ez-chip" aria-pressed={size === s.size} onClick={() => { setSize(s.size); setNeedSize(false); setAdded(false); }} title={money(s.price)}>{s.size}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '12px', marginTop: '22px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '2px solid var(--ink)', borderRadius: '2px' }}>
                  <button type="button" onClick={() => { setQty((q) => Math.max(1, q - 1)); setAdded(false); }} aria-label="Decrease" style={{ width: '48px', height: '48px', border: '0', background: 'none', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', cursor: 'pointer', color: 'var(--ink)' }}>−</button>
                  <span style={{ minWidth: '36px', textAlign: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>{qty}</span>
                  <button type="button" onClick={() => { setQty((q) => Math.min(50, q + 1)); setAdded(false); }} aria-label="Increase" style={{ width: '48px', height: '48px', border: '0', background: 'none', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', cursor: 'pointer', color: 'var(--ink)' }}>+</button>
                </div>
                <button type="button" className="ez-btn ez-btn-ink" onClick={addToCart} style={{ width: '100%' }}>Add to cart · {money(total)}</button>
              </div>
              {needSize ? <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#a8222a', fontWeight: '600' }}>Pick a size to add to cart.</p> : null}
              {added ? (
                <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--gold-2)', fontWeight: '600' }}>
                  Added to your cart. <A href="/cart" style={{ color: 'inherit' }}>View cart ({cart.count})</A> — you’ll approve a free design proof before we stitch.
                </p>
              ) : null}
              {/* promises: four cards */}
              <div className="ez-promises" style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '10px' }}>
                {[
                  { lead: '2–3 wks', title: 'Made to order', text: 'Production, then 4–5 business days tracked shipping. Rush at checkout.' },
                  { lead: 'Free', title: 'Design proof', text: 'A digital proof within two business days. Nothing is cut until you approve.' },
                  { lead: 'Fit', title: 'Guaranteed', text: 'Wrong size as specified? We remake it at no charge.' },
                  { lead: '10+', title: 'Team pricing', text: 'Ordering for a team, school or company? Get bulk pricing →', href: '/bulk-order' },
                ].map(({ lead, title, text, href }) => {
                  const inner = (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', lineHeight: '1', color: 'var(--gold-2)' }}>{lead}</span>
                        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{title}</span>
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: '1.5', color: 'var(--ink-2)' }}>{text}</div>
                    </>
                  );
                  const style = { display: 'block', padding: '14px', border: '1.5px solid var(--cream-2)', borderRadius: '4px', background: '#fbf8f2', color: 'inherit', textDecoration: 'none' };
                  return href
                    ? <A key={title} href={href} className="ez-promise ez-promise-link" style={style}>{inner}</A>
                    : <div key={title} className="ez-promise" style={style}>{inner}</div>;
                })}
              </div>
            </>
          )}
        </div>
      </section>
      {/* Related */}
      {(related || []).length ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>You might also letter</h2>
            <A href={catHref} style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All {product?.category?.name?.toLowerCase() || 'jackets'} →</A>
          </div>
          {/* at most four per row, and a card keeps that size even when the category has only one or two others
              (auto-fit stretched a lone card across the whole row) */}
          <div className="ez-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(max(220px, calc((100% - 60px) / 4)),1fr))', gap: '28px 20px' }}>
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} slotPrefix="rel" />)}
          </div>
        </section>
      ) : <div style={{ height: '64px' }} />}
      <Footer faq={product ? { pageKeys: ['product-template'], values: { productName: product.name }, title: 'About this jacket' } : false} />
    </div>
  );
}
