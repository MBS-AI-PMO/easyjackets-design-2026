// The catalogue, from the API. Filters live in the path, in the live site's
// URL scheme (/shop/category/hoodies, /shop/filter/category/x/material/y), and
// the view options in the query (?sort, ?max, ?q, ?page), so every collection
// has one canonical address and shared links land on the right view.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import SelectMenu from '../components/SelectMenu';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchCategoryCounts, fetchFilterOptions, fetchProducts } from '../lib/catalog';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import { FILTER_TYPES, parseShopPath, shopPath, slugify } from '../lib/urls';
import { catalogProfile } from '../lib/catalogSeo';
import CatalogGuide from '../components/CatalogGuide';
import './Shop.css';

const PAGE_SIZE = 12;
const PRICE_MIN = 40;
const PRICE_MAX = 250; // the slider's top means "any"
const SORTS = [
  ['popular', 'Most popular'],
  ['rating', 'Top rated'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['new', 'Newest'],
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  // filters from the path; the old ?category= style is still read, then moved into the path
  const filters = useMemo(() => parseShopPath(pathname, search), [pathname, search]);
  const category = filters.category || '';
  const material = filters.material || '';
  const color = filters.color || '';
  const size = filters.size || '';
  useEffect(() => {
    if (!FILTER_TYPES.some((t) => params.get(t))) return;
    const rest = Object.fromEntries([...params].filter(([k]) => !FILTER_TYPES.includes(k)));
    navigate(shopPath(filters, rest), { replace: true });
  }, [params, filters, navigate]);
  // links for the filters: view options (sort, price, search) carry over, the page number starts again
  const viewQuery = () => Object.fromEntries(['sort', 'max', 'q'].filter((k) => params.get(k)).map((k) => [k, params.get(k)]));
  const filterHref = (type, value) => shopPath({ ...filters, [type]: filters[type] === slugify(value) ? '' : value }, viewQuery());
  const tabHref = (slug) => shopPath({ ...filters, category: slug }, viewQuery());
  const sort = SORTS.some(([v]) => v === params.get('sort')) ? params.get('sort') : 'popular';
  const maxPrice = Number(params.get('max')) || PRICE_MAX;
  const query = params.get('q') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);

  const setParam = useCallback((key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value == null || (key === 'max' && Number(value) >= PRICE_MAX) || (key === 'sort' && value === 'popular')) next.delete(key);
      else next.set(key, value);
      next.delete('page'); // a new filter starts at the first page
      return next;
    }, { replace: true });
  }, [setParams]);
  const clearAll = () => navigate('/shop');

  // reference lists
  const { data: counts } = useAsync(fetchCategoryCounts, []);
  // material and colour choices come from the products themselves, narrowed to the open category;
  // the previous lists stay on screen while the next category's load
  const { data: options } = useAsync(() => fetchFilterOptions(category), [category]);
  const lastOptions = useRef(null);
  if (options) lastOptions.current = options;
  const materials = lastOptions.current?.materials;
  const colors = lastOptions.current?.colors;

  // products, one page at a time; the page number lives in the URL (?page=) so it survives reloads and the back button
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const listRef = useRef(null);
  const filterKey = `${category}|${material}|${color}|${size}|${sort}|${maxPrice}|${query}`;
  useEffect(() => {
    let alive = true;
    const ctl = new AbortController();
    setLoading(true); setError(null);
    fetchProducts({ page, limit: PAGE_SIZE, category, material, color, size, sort, search: query, maxPrice: maxPrice < PRICE_MAX ? maxPrice : undefined }, ctl.signal)
      .then((r) => { if (!alive) return; setItems(r.products); setTotal(r.total); setLoading(false); })
      .catch((e) => { if (!alive || e.name === 'AbortError') return; setError(e); setLoading(false); });
    return () => { alive = false; ctl.abort(); };
  }, [page, filterKey, category, material, color, size, sort, query, maxPrice, attempt]);
  const pages = total != null ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 0;
  const goToPage = useCallback((n) => {
    setParams((prev) => { const next = new URLSearchParams(prev); if (n > 1) next.set('page', String(n)); else next.delete('page'); return next; });
    const top = listRef.current ? listRef.current.getBoundingClientRect().top + window.scrollY - 96 : 0;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [setParams]);
  // a page beyond the last one (a filter narrowed the list) goes back to the first
  useEffect(() => { if (total != null && page > 1 && (page - 1) * PAGE_SIZE >= total) goToPage(1); }, [total, page, goToPage]);

  const typeTabs = useMemo(() => {
    const cats = counts || [];
    const all = cats.reduce((n, c) => n + c.count, 0);
    return [{ label: 'All', slug: '', count: all }, ...cats.map((c) => ({ label: c.name.trim(), slug: c.slug, count: c.count }))];
  }, [counts]);
  const activeCategory = typeTabs.find((t) => t.slug === category);
  // search copy for this collection (H1, intro, quick answer, title), named after what is being browsed
  const profile = catalogProfile(filters, {
    category: activeCategory?.slug ? activeCategory.label : '',
    material: (materials || []).find((m) => slugify(m.name) === material)?.name,
    color: (colors || []).find((c) => slugify(c.name) === color)?.name,
  });
  usePageTitle(profile.title, profile.description);
  // FAQ block: the collection's own list (its page path, or the older "/varsity-jackets" key) when the admin has one, else the catalog template
  const faqBlock = { pageKeys: [shopPath(filters) !== '/shop' ? shopPath(filters) : null, category ? `/${category}` : null, 'catalog-template'], values: { productPhrase: profile.productPhrase }, title: 'Good to know' };
  const showSkeleton = loading && items.length === 0;

  // phones: the filters live in a drawer that slides in from the left
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [material, color, maxPrice < PRICE_MAX ? 'max' : ''].filter(Boolean).length;
  useEffect(() => {
    if (!filtersOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setFiltersOpen(false); };
    const wide = window.matchMedia('(min-width: 901px)');
    const onWide = () => { if (wide.matches) setFiltersOpen(false); };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); };
  }, [filtersOpen]);

  return (
    <div className="pg-shop">
      <Nav active="/shop" cta="cart" />
      {/* Listing header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          {activeCategory?.slug ? (
            <>
              <A href="/shop" style={{ textDecoration: 'none', color: 'inherit' }}>Jackets</A>
              <span>/</span>
              <span style={{ color: 'var(--ink)', fontWeight: '600' }}>{activeCategory.label}</span>
            </>
          ) : (
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Jackets</span>
          )}
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)', marginBottom: '12px' }}>Easy Jackets collection</div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(52px,7vw,100px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              {profile.h1}
            </h1>
            <p style={{ maxWidth: '52ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              {profile.intro}
            </p>
          </div>
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="lst-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" />
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
        {/* type tabs */}
        <div id="picks" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '32px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {typeTabs.map((t) => (
            <A key={t.slug} href={tabHref(t.slug)} className="ez-chip" aria-current={t.slug === category ? 'page' : undefined} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {t.label}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{t.count}</span>
            </A>
          ))}
        </div>
      </section>
      {/* Listing */}
      <section className="ez-layout" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 96px', display: 'grid', gridTemplateColumns: '276px minmax(0,1fr)', gap: '40px clamp(24px,4vw,56px)', alignItems: 'start' }}>
        {/* filters */}
        <div className={`ez-side-backdrop${filtersOpen ? ' is-open' : ''}`} onClick={() => setFiltersOpen(false)} aria-hidden="true" />
        <aside id="shop-filters" className={`ez-side${filtersOpen ? ' is-open' : ''}`} aria-label="Filters" style={{ position: 'sticky', top: '132px', display: 'grid', gap: '28px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button type="button" onClick={() => { clearAll(); setFiltersOpen(false); }} style={{ background: 'none', border: '0', font: 'inherit', fontSize: '13px', fontWeight: '600', color: 'var(--gold-2)', cursor: 'pointer', padding: '0', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Clear all
              </button>
              <button type="button" className="ez-side-close" onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2" /></svg>
              </button>
            </span>
          </div>
          {/* phones: the jacket-type tabs live here (the tab row above the grid is hidden) */}
          <div className="ez-side-types">
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>Jacket type</div>
            {typeTabs.map((t) => (
              <A key={t.slug || 'all'} href={tabHref(t.slug)} className="ez-chip" aria-current={t.slug === category ? 'page' : undefined} onClick={() => setFiltersOpen(false)}>
                {t.label}<span>{t.count}</span>
              </A>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Material
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px' }}>
              {(materials || []).map((m) => (
                <A key={m.id} href={filterHref('material', m.name)} className="ez-chip" aria-current={material === slugify(m.name) ? 'page' : undefined} onClick={() => setFiltersOpen(false)}>{m.name}</A>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px' }}>
              Body color
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {(colors || []).map((c) => (
                <A key={c.id} href={filterHref('color', c.name)} className="ez-swatch" aria-current={color === slugify(c.name) ? 'page' : undefined} onClick={() => setFiltersOpen(false)} title={c.name} aria-label={c.name} style={{ background: c.code }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span id="shop-max-price-label" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Max price
              </span>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px' }}>{maxPrice >= PRICE_MAX ? 'Any' : `$${maxPrice}`}</span>
            </div>
            {/* named by the "Max price" heading above it, and read out as the price shown, not the raw number */}
            <input type="range" min={PRICE_MIN} max={PRICE_MAX} step="10" value={maxPrice} aria-labelledby="shop-max-price-label" aria-valuetext={maxPrice >= PRICE_MAX ? 'Any price' : `$${maxPrice}`} onChange={(e) => setParam('max', e.target.value)} onPointerUp={() => setFiltersOpen(false)} onKeyUp={(e) => { if (e.key === 'Enter') setFiltersOpen(false); }} style={{ width: '100%', accentColor: 'var(--ink)' }} />
          </div>
          <div className="ez-side-done">
            <button type="button" className="ez-btn ez-btn-ink" onClick={() => setFiltersOpen(false)} style={{ width: '100%' }}>
              {loading ? 'Loading…' : `Show ${total ?? ''} jacket${total === 1 ? '' : 's'}`}
            </button>
          </div>
        </aside>
        {/* results */}
        <div>
          <div className="ez-results-bar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px 20px', marginBottom: '24px' }}>
            <div className="ez-results-count" style={{ fontSize: '14px', color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--ink)', fontFamily: 'var(--display)', fontSize: '22px', fontWeight: '900' }}>{total ?? '…'}</strong>
              {' '}{total === 1 ? 'Jacket' : 'Jackets'}{query ? <> for “{query}”</> : null}
            </div>
            <div className="ez-results-tools" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)' }}>
              <button type="button" className="ez-filters-btn" onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="shop-filters">
                <svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true"><path d="M1 2h14M4 7h8M6.5 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                Filters{activeFilters ? <span className="ez-filters-count">{activeFilters}</span> : null}
              </button>
              <div className="ez-sort">
              <span id="shop-sort-label">Sort</span>
              {/* desktop: the navbar-style menu; phones and tablets: the device's own picker */}
              <span className="ez-sort-desktop"><SelectMenu value={sort} options={SORTS} onChange={(v) => setParam('sort', v)} labelledBy="shop-sort-label" /></span>
              <select className="ez-select ez-sort-native" aria-labelledby="shop-sort-label" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                {SORTS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
              </div>
            </div>
          </div>
          {error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', border: '1.5px dashed var(--cream-2)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--muted)', margin: '0 0 16px' }}>The catalogue could not be loaded ({error.message}).</p>
              <button type="button" className="ez-btn ez-btn-line" onClick={() => setAttempt((n) => n + 1)}>Try again</button>
            </div>
          ) : null}
          {showSkeleton ? (
            <div className="ez-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '32px 20px' }} aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i}>
                  <div className="ez-skeleton" style={{ aspectRatio: '4/5', borderRadius: '4px' }} />
                  <div className="ez-skeleton" style={{ height: '16px', width: '70%', marginTop: '14px' }} />
                  <div className="ez-skeleton" style={{ height: '12px', width: '40%', marginTop: '8px' }} />
                </div>
              ))}
            </div>
          ) : null}
          {!showSkeleton && items.length ? (
            <div key={`${filterKey}|${page}|${items[0]?.id || ''}`} ref={listRef} className="ez-product-grid ez-grid-enter" style={{ opacity: loading ? 0.55 : 1, transition: 'opacity .2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '32px 20px' }}>
              {items.map((p) => <ProductCard key={p.id} product={p} slotPrefix="lst" />)}
            </div>
          ) : null}
          {!loading && !error && total === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', border: '1.5px dashed var(--cream-2)', borderRadius: '4px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', textTransform: 'uppercase' }}>
                Nothing in that combination
              </div>
              <p style={{ color: 'var(--muted)', margin: '10px 0 24px' }}>Loosen a filter, or build exactly this jacket from scratch.</p>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-ink">Design your own</A>
            </div>
          ) : null}
          <Pagination page={page} pages={pages} onChange={goToPage} disabled={loading} label="Product pages" />
        </div>
      </section>
      <CatalogGuide title={profile.h1} quickAnswer={profile.quickAnswer} />
      <Footer faq={faqBlock} />
    </div>
  );
}
