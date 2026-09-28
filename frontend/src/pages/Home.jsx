import { useEffect, useState } from 'react';
// The landing page: catalogue, categories, blog, FAQs, reviews and the top bar
// come from the API; the photography is the client's own.
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import CountUp from '../components/CountUp';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import Faq from '../components/Faq';
import { fetchCategories, fetchCategoryCounts, fetchColors, fetchLanding } from '../lib/catalog';
import { fetchFabricSections, fetchFeaturedReviews, fetchGallery, fetchPageFaqs, fetchPatchPhotos, fetchRecentBlogs, fetchTopBar, patchTags } from '../lib/content';
import { fetchTestimonials } from '../lib/site';
import PATCH_PHOTOS from '../data/embroidery-photos.json';
import { useAsync } from '../lib/useAsync';
import { usePageProps } from '../lib/usePageProps';
import { usePageTitle } from '../lib/usePageTitle';
import './Home.css';
import { productPath, shopPath } from '../lib/urls';

// The promo bar paints together with the navbar: the last text this browser
// saw (or the launch default) shows at once, then the admin's current text.
const TOP_BAR_KEY = 'ej-topbar';
const TOP_BAR_DEFAULT = 'Flash Sale · 50% Off · Across US & Canada';
const readCachedTopBar = () => {
  try {
    const v = localStorage.getItem(TOP_BAR_KEY);
    if (v === null) return { text: TOP_BAR_DEFAULT };
    return v ? { text: v } : null;
  } catch { return { text: TOP_BAR_DEFAULT }; }
};

const PAGE_PROPS = {
  showPromo: { type: 'boolean', default: true },
  primaryCta: { type: 'enum', options: ['shop', 'builder'], default: 'shop' },
};

const IMG = '/images/site';
// The client's campaign photo (two coach jackets) for the builder section, cropped 4:3.
const BUILDER_PHOTO = `${IMG}/campaign-coach-duo.webp`;

const PICKS = [
  // each pick tries its queries in order and takes a random product that matches (and is not already used),
  // so every visit shows a different jacket of that kind
  { key: 'wool-leather', name: 'Wool & Leather', desc: 'Classic wool body with leather sleeves.', material: 'Melton Wool', queries: [{ material: 'Cowhide Leather' }, { material: 'Melton Wool' }], match: (p) => /wool/i.test(p.material.body) && /leather/i.test(p.material.sleeves) && !/cropped|women/i.test(p.name) },
  { key: 'leather', name: 'All-Leather', desc: 'Full leather build with a heavy feel.', material: 'Cowhide Leather', queries: [{ search: 'all leather' }, { search: 'full leather' }, { material: 'Sheep Leather' }], match: (p) => /leather/i.test(p.material.body) },
  { key: 'wool', name: 'All-Wool', desc: 'Warm melton wool body for school jackets.', material: 'Melton Wool', queries: [{ search: 'wool varsity' }, { material: 'Melton Wool' }], match: (p) => /wool/i.test(p.material.body) && /wool/i.test(p.material.sleeves) && !/cropped|women/i.test(p.name) },
  { key: 'satin', name: 'Satin Varsity', desc: 'Lightweight satin with a glossy finish.', material: 'Satin', queries: [{ material: 'Satin' }], match: (p) => /satin/i.test(p.material.body) },
];

// Patches tiles: the design's four labels, each illustrated by a random photo
// of that technique — the workshop patch photos (data/embroidery-photos.json)
// plus Gallery photos tagged by caption — so every visit shows a different set.
const PATCHES = [
  { name: 'Embroidery', tag: 'Embroidery' },
  { name: 'Embroidered patches', tag: 'Patches' },
  { name: 'Chenille patches', tag: 'Chenille' },
  { name: 'Sublimation prints', tag: 'Printed' },
];
// Fisher–Yates: a sort() with a random comparator is biased and keeps items near their old position.
const shuffle = (list) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
// The Photo Gallery's hover caption (eyebrow + title over a gradient), reused on the landing tiles.
const GalCap = ({ eyebrow, title }) => (
  <div className="ez-gal-cap">
    <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>{eyebrow}</div>
    <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1', marginTop: '4px' }}>{title}</div>
  </div>
);
// "Made for real teams": five random photos per visit from the Gallery and the patch photos.
const MOSAIC_SIZE = 5;
const pickMosaic = (gallery, adminPhotos = []) => shuffle([
  ...gallery.map((g) => ({ ...g, href: '/gallery' })),
  ...adminPhotos.map((p) => ({ id: p.id, image: p.image, caption: p.caption, href: '/embroidery-and-patches' })),
  ...PATCH_PHOTOS.filter((p) => p.url).map((p) => ({ id: p.slug, image: p.url, caption: p.cap, href: '/embroidery-and-patches' })),
]).slice(0, MOSAIC_SIZE);
const pickPatchPhotos = (gallery, adminPhotos = []) => {
  const pool = shuffle([
    ...adminPhotos.map((p) => ({ id: p.id, src: p.image, alt: p.caption, tags: p.tags })),
    ...PATCH_PHOTOS.filter((p) => p.url).map((p) => ({ id: p.slug, src: p.url, alt: p.cap, tags: p.tags })),
    ...gallery.map((g) => ({ id: g.id, src: g.image, alt: g.caption, tags: patchTags(g.caption) })),
  ]);
  const used = new Set();
  return PATCHES.map((t) => {
    // a technique with fewer than three photos of its own borrows from the rest, so every tile still varies
    const own = pool.filter((p) => p.tags.includes(t.tag));
    const candidates = own.length >= 3 ? own : [...own, ...pool.filter((p) => !own.includes(p))];
    const photo = candidates.find((p) => !used.has(p.id)) || null;
    if (photo) used.add(photo.id);
    return { ...t, src: photo?.src || '', alt: photo?.alt || t.name };
  });
};

const STATES = [
  { name: 'California', note: 'West Coast high schools' },
  { name: 'Texas', note: 'Teams, bands & drill' },
  { name: 'New York', note: 'Senior class jackets' },
  { name: 'Florida', note: 'Athletic programs' },
  { name: 'Illinois', note: 'Midwest schools' },
  { name: 'Pennsylvania', note: 'Colleges & Greek life' },
];

const eyebrow = { fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' };
const h2 = { fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' };
const section = { maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' };
const stars = (n) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
const Skeleton = ({ ratio = '4/5', lines = 2 }) => (
  <div aria-busy="true">
    <div className="ez-skeleton" style={{ aspectRatio: ratio, borderRadius: '4px' }} />
    {Array.from({ length: lines }, (_, i) => <div key={i} className="ez-skeleton" style={{ height: i ? '12px' : '16px', width: i ? '45%' : '70%', marginTop: i ? '8px' : '14px' }} />)}
  </div>
);

export default function Home() {
  const props = usePageProps(PAGE_PROPS);
  usePageTitle('', 'Design your own varsity, letterman and bomber jackets online. Wool, leather and satin builds, chenille patches, no minimums, free design proof.');
  const builderFirst = props.primaryCta === 'builder';
  const shop = { label: 'Shop varsity jackets', href: '#bestsellers' };
  const build = { label: 'Design your jacket', href: '/design-custom-jacket' };
  const primary = builderFirst ? build : shop;
  const secondary = builderFirst ? shop : build;

  const [topBar, setTopBar] = useState(readCachedTopBar);
  const { data: liveTopBar, loading: topBarLoading, error: topBarError } = useAsync(fetchTopBar, []);
  useEffect(() => {
    if (topBarLoading || topBarError) return;
    setTopBar(liveTopBar);
    try { localStorage.setItem(TOP_BAR_KEY, liveTopBar?.text || ''); } catch { /* private mode */ }
  }, [liveTopBar, topBarLoading, topBarError]);
  // Picks + bestsellers (two rounds of one jacket per category) come from one
  // request; the API draws them at random on every visit.
  const { data: landing } = useAsync((signal) => fetchLanding(signal), []);
  const bestsellers = landing ? { products: landing.bestsellers } : null;
  const picks = landing ? PICKS.map((pick) => ({ ...pick, product: landing.picks[pick.key] || null })) : null;
  const { data: categories } = useAsync(() => fetchCategories('jackets'), []);
  const { data: counts } = useAsync(fetchCategoryCounts, []);
  const { data: colors } = useAsync(fetchColors, []);
  const { data: reviewData } = useAsync((signal) => fetchFeaturedReviews(3, signal), []);
  const { data: posts } = useAsync((signal) => fetchRecentBlogs(3, signal), []);
  // Testimonials the admin keeps with the site features; the section is dropped when there are none or the request fails.
  const { data: testimonials, loading: testimonialsLoading } = useAsync((signal) => fetchTestimonials(signal), []);
  const { data: faqs } = useAsync((signal) => fetchPageFaqs('/', signal), []);
  // Gallery photos, drawn once per visit: the patches tiles and the mosaic order change on every refresh.
  const { data: galleryData } = useAsync((signal) => Promise.all([fetchGallery(signal), fetchPatchPhotos(signal).catch(() => [])])
    .then(([list, adminPhotos]) => ({ patches: pickPatchPhotos(list, adminPhotos), mosaic: pickMosaic(list, adminPhotos) })), []);
  const { data: fabricSections } = useAsync((signal) => fetchFabricSections(signal).then((list) => list.map((x) => ({ ...x, swatches: shuffle(x.tileSwatches) }))), []);
  const fabricCount = fabricSections?.length || 0;
  const colorCount = fabricSections ? fabricSections.reduce((n, x) => n + x.colorCount, 0) : 0;
  const materialTiles = fabricSections ? fabricSections.filter((x) => x.swatches.length).slice(0, 4).map((x) => ({ name: x.name, src: x.swatches[0].image, alt: x.swatches[0].alt, key: x.key })) : null;
  const patches = galleryData?.patches || null;
  const customerPhotos = galleryData?.mosaic || [];

  const showPromo = props.showPromo && !!topBar;
  const totalStyles = (counts || []).reduce((n, c) => n + c.count, 0);
  const promoPct = Math.max(0, ...(bestsellers?.products || []).map((p) => p.discountPct));
  const avg = reviewData?.averageRating || 0;
  const ticker = [
    reviewData?.total ? `${reviewData.total} verified reviews` : null,
    totalStyles ? `${totalStyles} ready styles` : null,
    colorCount ? `${colorCount} colors` : null,
    fabricCount ? `${fabricCount} fabrics` : null,
    'No minimum order', 'Free design proof', 'Ships to all 50 states',
  ].filter(Boolean);

  return (
    <div className="pg-home">
      {showPromo ? (
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', fontFamily: 'var(--display)', fontWeight: '700', fontSize: '16px', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', padding: '10px 20px' }}>
          {topBar.text}
        </div>
      ) : null}
      <Nav cta={{ label: primary.label, href: primary.href }} />
      <div id="top" />
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', background: 'radial-gradient(60% 50% at 80% 20%, color-mix(in srgb,var(--gold) 22%,transparent), transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(24px,3vw,40px) clamp(16px,4vw,48px) clamp(24px,3vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '32px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div style={{ animation: 'rise .7s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
              Since 2020 · Made to order · Ships worldwide
            </div>
            <h1 className="ez-hero-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6.4vw,92px)', lineHeight: '0.88', letterSpacing: '-0.005em', textTransform: 'uppercase', margin: '16px 0 0' }}>
              <span style={{ display: 'block' }}>Custom</span>
              <span style={{ display: 'block' }}>Varsity &</span>
              <span style={{ display: 'block', WebkitTextStroke: '2px var(--ink)', color: 'transparent' }}>Letterman</span>
              <span style={{ display: 'block' }}>Jackets</span>
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.55', maxWidth: '50ch', margin: '20px 0 0', color: 'var(--ink-2)' }}>
              Melton wool bodies, genuine cowhide sleeves, chenille letters stitched by hand. Choose from 40+ colors, add names, numbers and patches, and see a design proof before we cut a thread. One jacket or the whole roster — no minimums. Most orders ship in <strong>2–3 weeks</strong>.
            </p>
            <div className="ez-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>
              <A href={primary.href} className="ez-btn ez-btn-ink">{primary.label}</A>
              <A href={secondary.href} className="ez-btn ez-btn-line">{secondary.label}</A>
            </div>
            <div className="ez-hero-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 36px', marginTop: '32px' }}>
              {[
                [<CountUp value={colorCount || (fabricSections && colors?.length) || 40}><span style={{ color: 'var(--gold)' }}>+</span></CountUp>, 'Colors'],
                [<CountUp value={1} />, 'Minimum order'],
                [<><CountUp value={2} /><span style={{ color: 'var(--gold)' }}>–</span><CountUp value={3} /></>, 'Weeks to ship'],
                [<CountUp value={avg || 4.9} decimals={1}><span style={{ color: 'var(--gold)' }}>★</span></CountUp>, 'Customer rating'],
              ].map(([value, label]) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1' }}>{value}</div>
                  <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="ez-hero-media" style={{ position: 'relative', animation: 'rise .7s .15s ease both', justifySelf: 'end', width: 'min(100%,calc((100vh - 230px) * 0.8))' }}>
            <div style={{ position: 'absolute', inset: '18px -18px -18px 18px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 14px', transform: 'rotate(4deg)', boxShadow: '0 12px 24px -12px rgba(20,17,15,0.5)' }}>
              Free design proof
            </div>
            <div style={{ position: 'relative', aspectRatio: '4/5', maxHeight: 'calc(100vh - 230px)', width: '100%', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="v2-hero" shape="rect" src={`${IMG}/hero-red-navy-varsity.webp`} placeholder="Custom varsity jacket" aria-label="Customer wearing a custom red and navy varsity jacket" eager />
            </div>
          </div>
        </div>
        {/* ticker */}
        <div style={{ borderTop: '1px solid var(--cream-2)', borderBottom: '1px solid var(--cream-2)', padding: '18px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', width: 'max-content', gap: '56px', padding: '0 28px', animation: 'marquee 40s linear infinite' }}>
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%' }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>
      {/* Popular picks */}
      <section id="picks" style={section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <div>
            <div style={eyebrow}>Popular picks</div>
            <h2 style={h2}>Start with a classic</h2>
          </div>
          <A href="/shop" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>View all →</A>
        </div>
        <div className="ez-grid-2-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          {(picks || PICKS.map((p) => ({ ...p, product: null }))).map((p) => (
            <A key={p.key} href={p.product ? productPath(p.product.slug) : shopPath({ material: p.material })} className={`ez-card${p.product ? ' ez-reveal' : ''}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="ez-card-img ez-product-photo" style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: '4px' }}>
                {p.product ? <ImageSlot slot={`v2-pick-${p.key}`} shape="rect" src={p.product.image} width={480} placeholder={p.name} aria-label={p.product.imageAlt} /> : (picks ? null : <div className="ez-skeleton" style={{ height: '100%' }} />)}
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', lineHeight: '1', textTransform: 'uppercase', margin: '16px 0 0' }}>{p.name}</h3>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '15px' }}>{p.product ? <>{p.product.name} · <strong style={{ color: 'var(--ink)' }}>From {p.product.priceLabel}</strong></> : p.desc}</p>
            </A>
          ))}
        </div>
      </section>
      {/* Builder */}
      <section id="builder" style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--ink)', color: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: '12px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 40px,var(--cream) 40px 48px,var(--gold) 48px 88px,var(--ink) 88px 120px)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,4vw,72px)', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(244,239,230,0.15)', background: '#E8DFCB' }}>
              <ImageSlot slot="v2-builder" shape="rect" src={BUILDER_PHOTO} fit="cover" placeholder="Campaign photo" aria-label="Two Easy Jacket coach jackets from the campaign shoot" />
            </div>
            <div style={{ position: 'absolute', left: '-10px', bottom: '-16px', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '18px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px' }}>
              Live preview
            </div>
          </div>
          <div>
            <div style={{ ...eyebrow, color: 'var(--gold)' }}>Online builder</div>
            <h2 style={{ ...h2, fontSize: 'clamp(44px,6vw,84px)' }}>Design your own jacket</h2>
            <p style={{ fontSize: '17px', lineHeight: '1.65', maxWidth: '48ch', margin: '24px 0 0', color: 'rgba(244,239,230,0.8)' }}>
              Set body and sleeve colors, materials, rib trim, lining, patches, names and numbers — and watch the price update as you go. Make one jacket or a full set for your school, team or staff.
            </p>
            <ul style={{ listStyle: 'none', padding: '0', margin: '24px 0 0', display: 'grid', gap: '12px', fontSize: '16px' }}>
              {['Choose your jacket style and fabrics', 'Pick from a full spectrum of colors', 'Add names, logos and chenille letters', 'Approve the proof, then we stitch'].map((t, i) => (
                <li key={t} style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold)', fontSize: '20px' }}>0{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Start designing</A>
              <span style={{ alignSelf: 'center', fontSize: '14px', color: 'rgba(244,239,230,0.6)' }}>{(categories || []).map((c) => c.name.replace(/ Jackets?$/i, '')).join(' · ') || 'Varsity · Bomber · Hoodie · Coach'}</span>
            </div>
          </div>
        </div>
      </section>
      {/* Why us */}
      <section style={section}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '32px 28px' }}>
          {[
            ['Full custom options', 'Colors, sleeve materials, rib trim, lining, patches, embroidery, names and numbers.'],
            ['Built to last', '24 oz melton wool, full-grain cowhide, triple-felt chenille and rayon embroidery.'],
            ['No minimum order', 'Order one jacket for yourself or a full team set. Bulk pricing from ten.'],
            ['Free design proof', 'A digital illustration of your exact jacket within two business days. Nothing is cut until you approve.', true],
          ].map(([t, d, gold]) => (
            <div key={t} style={{ borderTop: `3px solid ${gold ? 'var(--gold)' : 'var(--ink)'}`, paddingTop: '20px' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '1', textTransform: 'uppercase' }}>{t}</div>
              <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.6' }}>{d}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Bestsellers */}
      <section id="bestsellers" style={section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <div>
            <div style={eyebrow}>Bestsellers</div>
            <h2 style={h2}>Ready to letter</h2>
          </div>
          {promoPct ? (
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--gold)', padding: '8px 16px' }}>
              {promoPct}% off — limited time
            </div>
          ) : null}
        </div>
        <div className="ez-grid-2-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 20px' }}>
          {bestsellers ? bestsellers.products.map((p) => (
            <A key={p.id} href={productPath(p.slug)} className="ez-card ez-reveal" data-category={p.category?.slug} style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              {p.badge ? (
                <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', padding: '4px 8px' }}>{p.badge}</span>
              ) : null}
              <div className="ez-card-img ez-product-photo" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px' }}>
                <ImageSlot slot={`v2-p-${p.id}`} shape="rect" src={p.image} width={480} placeholder={p.name} aria-label={p.imageAlt} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'start', marginTop: '14px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--body)', fontWeight: '600', fontSize: '16px', lineHeight: '1.35', margin: '0' }}>{p.name}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    {p.reviewCount ? <><span style={{ color: 'var(--gold-2)' }}>{stars(p.rating)}</span> {p.rating} · {p.reviewCount} review{p.reviewCount === 1 ? '' : 's'}</> : p.materialLabel || p.category?.name}
                  </div>
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {p.wasLabel ? <s style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>{p.wasLabel}</s> : null}
                  <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1' }}>{p.priceLabel}</span>
                </div>
              </div>
            </A>
          )) : Array.from({ length: 10 }, (_, i) => <Skeleton key={i} />)}
        </div>
      </section>
      {/* Shop by type */}
      <section id="types" style={section}>
        <div style={eyebrow}>Shop by jacket type</div>
        <h2 style={{ ...h2, margin: '10px 0 36px' }}>Every style, your colors</h2>
        <div className="ez-type-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '16px' }}>
          {categories ? categories.map((c) => {
            const count = (counts || []).find((x) => x.slug === c.slug)?.count;
            return (
              <A key={c.id} href={shopPath({ category: c.slug })} className="ez-card ez-type-tile" style={{ display: 'grid', gridTemplateRows: 'minmax(0,1fr) auto', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '4px', textDecoration: 'none', color: 'var(--ink)', background: 'transparent' }}>
                {/* the category thumbnails are cut-outs: shown on the page itself, no tile behind them */}
                <div className="ez-card-img" style={{ minHeight: 0, padding: '1% 0 0' }}>
                  <ImageSlot slot={`v2-t-${c.slug}`} shape="rect" src={c.image} width={480} fit="contain" placeholder={c.name} aria-label={c.name} style={{ aspectRatio: 'auto', height: '100%' }} />
                </div>
                <div style={{ padding: '8px 2px 0' }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', lineHeight: '1', textTransform: 'uppercase' }}>{c.name}</div>
                  {count ? <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '4px' }}>{count} style{count === 1 ? '' : 's'}</div> : null}
                </div>
              </A>
            );
          }) : Array.from({ length: 5 }, (_, i) => <div key={i} className="ez-skeleton" style={{ aspectRatio: '3/4', borderRadius: '4px' }} />)}
        </div>
      </section>
      {/* Materials */}
      <section id="materials" style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '56px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={eyebrow}>Materials & colors</div>
          <h2 style={{ ...h2, fontSize: 'clamp(40px,4.5vw,64px)' }}>10+ materials.<br />40+ colors.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px 16px', marginTop: '28px' }}>
            {(materialTiles || [{ name: 'Melton Wool' }, { name: 'Cowhide Leather' }, { name: 'Sheep Leather' }, { name: 'Polyester Satin' }]).map((m) => (
              <A key={m.name} href={m.key ? `/material-colors#${m.key}` : '/material-colors'} className={`ez-tile${m.src ? ' ez-reveal' : ''}`}>
                <div className="ez-gal">
                  {m.src ? <ImageSlot slot={`v2-m-${m.key}`} shape="rect" src={m.src} width={640} placeholder={m.name} aria-label={m.alt} /> : (materialTiles ? null : <div className="ez-skeleton" style={{ height: '100%' }} />)}
                  {m.src ? <GalCap eyebrow={m.name} title={m.alt && m.alt !== m.name ? m.alt : 'See all colors'} /> : null}
                </div>
                <div className="ez-tile-name">{m.name}</div>
              </A>
            ))}
          </div>
          <A href="/material-colors" style={{ display: 'inline-block', marginTop: '24px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>View materials & colors →</A>
        </div>
        <div>
          <div style={eyebrow}>Patches & embroidery</div>
          <h2 style={{ ...h2, fontSize: 'clamp(40px,4.5vw,64px)' }}>Sewn,<br />never pressed.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '20px 16px', marginTop: '28px' }}>
            {(patches || PATCHES.map((t) => ({ ...t, src: '', alt: t.name }))).map((m) => (
              <A key={m.name} href="/embroidery-and-patches" className={`ez-tile${m.src ? ' ez-reveal' : ''}`}>
                <div className="ez-gal">
                  {m.src ? <ImageSlot slot={`v2-e-${m.name}`} shape="rect" src={m.src} width={640} placeholder={m.name} aria-label={m.alt} /> : (patches ? null : <div className="ez-skeleton" style={{ height: '100%' }} />)}
                  {m.src ? <GalCap eyebrow={m.name} title={m.alt} /> : null}
                </div>
                <div className="ez-tile-name">{m.name}</div>
              </A>
            ))}
          </div>
          <A href="/embroidery-and-patches" style={{ display: 'inline-block', marginTop: '24px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>Patches & embroidery guide →</A>
        </div>
      </section>
      {/* Bulk */}
      <section id="bulk" style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--gold)', color: 'var(--ink)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Schools · Teams · Corporate</div>
            <h2 style={{ ...h2, fontSize: 'clamp(48px,7vw,96px)', lineHeight: '0.88' }}>Outfit the whole roster</h2>
          </div>
          <div>
            <p style={{ fontSize: '17px', lineHeight: '1.65', margin: '0', maxWidth: '48ch' }}>
              Bulk discounts from ten jackets, Pantone color matching, individual names and numbers, and one shipment to the athletic office. Tight deadline? Tell us the date.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '28px' }}>
              <A href="/bulk-order" className="ez-btn ez-btn-ink">Get a bulk quote</A>
              <span style={{ alignSelf: 'center', fontSize: '14px' }}>Unisex XS–6XL, tall options. <A href="/sizechart" style={{ color: 'inherit' }}>Size chart</A></span>
            </div>
          </div>
        </div>
      </section>
      {/* Free proof */}
      <section style={section}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '28px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ ...eyebrow, fontSize: '12px', color: 'var(--gold)' }}>Not sure where to start?</div>
            <h2 style={{ ...h2, fontSize: 'clamp(36px,4.5vw,64px)', margin: '8px 0 0' }}>Send us your idea, we'll draw it</h2>
          </div>
          <div>
            <p style={{ margin: '0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px' }}>
              Email a sketch, a photo of an old jacket, or your school colors and logo. Our artists send back a free digital proof within two business days — no commitment until you love it.
            </p>
            <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '20px' }}>
              <A href="/contact-us" className="ez-btn ez-btn-gold">Get a free proof</A>
              <A href="/bulk-order" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Team order? →</A>
            </div>
          </div>
        </div>
      </section>
      {/* Customer photos */}
      <section style={section}>
        <div style={eyebrow}>#EasyJackets</div>
        <h2 style={{ ...h2, margin: '10px 0 36px' }}>Made for real teams</h2>
        <div className="ez-photo-grid">
          {customerPhotos.length ? customerPhotos.map((ph, i) => (
            <A key={ph.id} href={ph.href} className="ez-gal ez-reveal" style={{ gridColumn: i === 0 ? 'span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined }}>
              <ImageSlot slot={`v2-cp-${ph.id}`} shape="rect" src={ph.image} width={i === 0 ? 960 : 480} placeholder="Customer photo" aria-label={ph.caption || 'Customer photo'} />
              {ph.caption ? <GalCap eyebrow={patchTags(ph.caption).join(' · ')} title={ph.caption} /> : null}
            </A>
          )) : Array.from({ length: 5 }, (_, i) => <div key={i} className="ez-skeleton" style={{ gridColumn: i === 0 ? 'span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined, borderRadius: '4px' }} />)}
        </div>
      </section>
      {/* States */}
      <section id="states" style={section}>
        <div style={eyebrow}>Shipping to all 50 states</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px clamp(24px,4vw,72px)', alignItems: 'end', marginTop: '10px' }}>
          <h2 style={{ ...h2, margin: 0 }}>Custom varsity jackets near you</h2>
          <p style={{ margin: '0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '16px', maxWidth: '52ch' }}>
            From <strong>California</strong> to <strong>New York</strong>, Easy Jackets makes custom letterman and varsity jackets for high schools, colleges, sports teams and companies in every state. No minimum order, free design proof, fast production and worldwide shipping.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px', marginTop: '36px' }}>
          {STATES.map((s) => (
            <A key={s.name} href={`/united-states/${s.name.toLowerCase().replace(/\s+/g, '-')}`} className="ez-card" style={{ display: 'block', padding: '20px 18px', border: '1px solid var(--cream-2)', borderRadius: '4px', background: '#fbf8f2', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>{s.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{s.note}</div>
            </A>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '32px' }}>
          <A href="/united-states" className="ez-btn ez-btn-ink" style={{ minHeight: '48px', fontSize: '19px' }}>Browse all 50 states</A>
          <A href="/design-custom-jacket" className="ez-btn" style={{ minHeight: '48px', fontSize: '19px' }}>Start designing →</A>
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Trusted by students, athletes and alumni nationwide.</span>
        </div>
      </section>
      {/* Reviews */}
      {reviewData?.reviews?.length ? (
        <section style={section}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
            <div>
              <div style={eyebrow}>Reviews</div>
              <h2 style={h2}>What customers say</h2>
            </div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
              {avg.toFixed(1)}<span style={{ color: 'var(--gold)' }}>★</span>{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '14px', color: 'var(--muted)' }}>average across {reviewData.total} verified reviews</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {reviewData.reviews.map((r) => (
              <figure key={r.id} style={{ margin: '0', padding: '28px', background: 'var(--cream-2)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ color: 'var(--gold-2)', letterSpacing: '0.1em' }}>{stars(r.rating)}</div>
                <blockquote style={{ margin: '0', fontSize: '17px', lineHeight: '1.6', flex: '1' }}>“{r.quote}”</blockquote>
                <figcaption style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '18px', flex: 'none' }}>{r.initial}</span>
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: '14px' }}>{r.name}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Verified buyer{r.product ? <> · <A href={productPath(r.product.slug)} style={{ color: 'inherit' }}>{r.product.name}</A></> : null}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
      {/* Blog */}
      <section style={section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <h2 style={{ ...h2, fontSize: 'clamp(40px,5vw,64px)', margin: 0 }}>From the blog</h2>
          <A href="/new-blog" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All posts →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {posts ? posts.map((b) => (
            <A key={b.id} href={`/new-blog/${encodeURIComponent(b.slug)}`} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="ez-card-img" style={{ aspectRatio: '5 / 4', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={`v2-b-${b.id}`} shape="rect" src={b.image} width={640} placeholder="Post image" aria-label={b.title} />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {b.category}{b.readTime ? <span style={{ color: 'var(--muted)', fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>· {b.readTime}</span> : null}
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', lineHeight: '1', textTransform: 'uppercase', margin: '8px 0 0' }}>{b.title}</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '15px' }}>{b.excerpt}</p>
            </A>
          )) : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} ratio="1" />)}
        </div>
      </section>
      {/* Testimonials */}
      {testimonialsLoading || testimonials?.length ? (
        <section id="testimonials" aria-labelledby="testimonials-title" style={section}>
          <div style={eyebrow}>Testimonials</div>
          <h2 id="testimonials-title" style={{ ...h2, margin: '10px 0 36px' }}>What people are saying</h2>
          <div className="ez-quote-row">
            {testimonials?.length ? testimonials.map((t) => (
              <figure key={t.id} className="ez-reveal" style={{ margin: '0', padding: '28px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderTop: '3px solid var(--gold)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div aria-hidden="true" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '64px', lineHeight: '1', height: '32px', color: 'var(--gold)' }}>“</div>
                {t.rating ? <div role="img" aria-label={`Rated ${t.rating} out of 5`} style={{ color: 'var(--gold-2)', letterSpacing: '0.1em' }}>{stars(t.rating)}</div> : null}
                <blockquote style={{ margin: '0', fontSize: '16px', lineHeight: '1.65', color: 'var(--ink-2)', flex: '1' }}>{t.quote}</blockquote>
                <figcaption style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--cream-2)' }}>
                  {t.photo ? (
                    <span style={{ width: '44px', height: '44px', flex: 'none', borderRadius: '50%', overflow: 'hidden', background: 'var(--cream-2)' }}>
                      <ImageSlot slot={`v2-q-${t.id}`} shape="circle" src={t.photo} width={96} placeholder={t.initial} aria-label={`Photo of ${t.name}`} />
                    </span>
                  ) : (
                    <span aria-hidden="true" style={{ width: '44px', height: '44px', flex: 'none', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '20px' }}>{t.initial}</span>
                  )}
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '20px', lineHeight: '1', textTransform: 'uppercase' }}>{t.name}</strong>
                    {t.role ? <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{t.role}</span> : null}
                  </span>
                </figcaption>
              </figure>
            )) : Array.from({ length: 3 }, (_, i) => <Skeleton key={i} ratio="1" />)}
          </div>
        </section>
      ) : null}
      {/* FAQ */}
      <section id="faq" style={{ ...section, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={eyebrow}>FAQ</div>
          <h2 style={h2}>Before you order</h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '36ch' }}>Still stuck? <A href="/contact-us" style={{ color: 'inherit' }}>Chat with us</A> any time — we answer within the hour during business days.</p>
        </div>
        <div>
          {faqs ? <Faq items={faqs.slice(0, 6)} schema /> : <div style={{ borderTop: '1px solid var(--ink)' }} />}
          {faqs?.length > 6 ? <A href="/faq" style={{ display: 'inline-block', marginTop: '16px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All questions →</A> : null}
        </div>
      </section>
      {/* CTA */}
      <section style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--ink)', color: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', background: 'radial-gradient(50% 60% at 20% 100%, color-mix(in srgb,var(--gold) 30%,transparent), transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(72px,9vw,128px) clamp(16px,4vw,48px)', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,9vw,136px)', lineHeight: '0.86', textTransform: 'uppercase', margin: '0', maxWidth: '14ch' }}>
            Ready to create your <span style={{ color: 'var(--gold)' }}>legacy?</span>
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.65', maxWidth: '52ch', margin: '28px 0 0', color: 'rgba(244,239,230,0.8)' }}>
            Design a varsity or bomber jacket in melton wool and leather. Add your name, number or logo. Free design proof, no minimums, ships worldwide.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '36px' }}>
            <A href={primary.href} className="ez-btn ez-btn-gold">{primary.label}</A>
            <A href={secondary.href} className="ez-btn ez-btn-line" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>{secondary.label}</A>
          </div>
        </div>
        <div style={{ height: '12px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 40px,var(--cream) 40px 48px,var(--gold) 48px 88px,var(--ink) 88px 120px)' }} />
      </section>
      <Footer faq={false} />
    </div>
  );
}
