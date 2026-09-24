// Converted from design/Easy Jackets Blog.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Blog.css';

const INITIAL_STATE = { cat: 'All' };

export default function Blog() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    const all = [
      { id: 1, cat: 'Design ideas', title: 'Design a custom jacket that’s uniquely yours', blurb: 'Colors, materials and sleeve styles in the design lab — where to start and what to decide first.', date: 'May 21, 2025', read: '6 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: CL + 'design-your-own-varsity-jacket-builder-online-clothoo-800.jpg', featured: true },
      { id: 2, cat: 'History', title: 'A concise history of the letterman jacket', blurb: 'From the 1865 Harvard baseball nine to the modern varsity closet.', date: 'Apr 30, 2025', read: '8 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: TJM + 'School_1024x1024.webp?v=1775220778' },
      { id: 3, cat: 'Styling', title: 'How to style a varsity jacket in 2026', blurb: 'Five outfits that work with wool-and-leather, from game day to date night.', date: 'Apr 12, 2025', read: '5 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: 'https://clothoo.com/frontend/images/home/USA-custom-varsity-letterman-jacket-clothoo-548.jpg' },
      { id: 4, cat: 'Materials', title: 'Melton wool vs. satin vs. fleece', blurb: 'Weight, warmth, cost and how each body cloth takes chenille and embroidery.', date: 'Mar 28, 2025', read: '7 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: CL + 'melton-wool-fabric-for-varsity-jackets-clothoo.jpg' },
      { id: 5, cat: 'Patches', title: 'Varsity jacket patch placement guide', blurb: 'Where the letter, name, numbers and mascot traditionally go — and when to break the rules.', date: 'Mar 10, 2025', read: '6 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: CL + 'custom-chenille-triple-felt-clothoo.jpg' },
      { id: 6, cat: 'Materials', title: 'Real leather or vegan leather sleeves?', blurb: 'Feel, break-in, care and price of cowhide against PU — an honest comparison.', date: 'Feb 22, 2025', read: '5 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: CL + 'full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg' },
      { id: 7, cat: 'Styling', title: 'Styling women’s hoodies, effortlessly', blurb: 'Layering ideas for the fleece hoodie you designed yourself.', date: 'Feb 5, 2025', read: '4 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: TJM + 'Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114' },
      { id: 8, cat: 'Team orders', title: 'How to run a team jacket order without the headache', blurb: 'Collecting sizes, names and numbers, and getting one shipment to the athletic office.', date: 'Jan 20, 2025', read: '6 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: TJM + 'Team_1024x1024.webp?v=1775220777' },
      { id: 9, cat: 'Design ideas', title: 'Custom letterman jacket trends this season', blurb: 'Tonal builds, cropped cuts, chain-stitch script and what schools are ordering now.', date: 'Jan 8, 2025', read: '5 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
      { id: 10, cat: 'Care', title: 'How to clean and store a wool-and-leather jacket', blurb: 'Spot cleaning, leather conditioning and why you should never put it in a plastic bag.', date: 'Dec 15, 2024', read: '4 min', href: '/blog/design-a-jacket-thats-uniquely-yours', src: CL + 'polyester-satin-quilted-lining-options-clothoo.jpg' },
    ];
    const s = state;
    const catNames = ['All', ...[...new Set(all.map(p => p.cat))]];
    const filtered = all.filter(p => s.cat === 'All' || p.cat === s.cat);
    const featured = s.cat === 'All' ? all.find(p => p.featured) : null;
    return {
      footerNoop: e => e.preventDefault(),
      cats: catNames.map(c => ({ label: c, active: s.cat === c, count: c === 'All' ? all.length : all.filter(p => p.cat === c).length, select: () => setState({ cat: c }) })),
      hasFeatured: !!featured,
      featured: featured ? { ...featured, slot: 'blog-feat' } : {},
      posts: filtered.filter(p => !(featured && p.id === featured.id)).map(p => ({ ...p, slot: 'blog-' + p.id })),
    };
  }

  const { cats, featured, hasFeatured, posts } = renderVals();

  return (
    <div className="pg-blog">
      <Nav active="/blog" cta="shop" />
      {/* header */}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '32px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {cats.map((c, cIdx) => (
            <button key={cIdx} type="button" className="ez-chip" aria-pressed={c.active} onClick={c.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {c.label}{' '}
              <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '12px', opacity: '0.7' }}>{c.count}</span>
            </button>
          ))}
        </div>
      </section>
      {/* featured */}
      {/* Featured */}
      {hasFeatured ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
          <A href={featured.href} className="ez-card ez-feat" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,5fr)', gap: '0', textDecoration: 'none', color: 'inherit', background: 'var(--ink)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '16/10', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot={featured.slot} shape="rect" src={featured.src} placeholder="Featured post image" />
            </div>
            <div style={{ padding: 'clamp(24px,3vw,44px)', color: 'var(--cream)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                <span style={{ color: 'var(--gold)' }}>Featured</span>
                <span style={{ color: 'rgba(244,239,230,0.6)' }}>{featured.cat} · {featured.read}</span>
              </div>
              <h2 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '0.92', textTransform: 'uppercase', margin: '0', color: 'var(--cream)', transition: 'color .2s' }}>
                {featured.title}
              </h2>
              <p style={{ margin: '0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px' }}>{featured.blurb}</p>
              <div style={{ fontSize: '13px', color: 'rgba(244,239,230,0.6)' }}>{featured.date}</div>
              <span className="ez-btn ez-btn-gold" style={{ alignSelf: 'flex-start', minHeight: '46px', fontSize: '18px' }}>
                Read the guide →
              </span>
            </div>
          </A>
        </section>
      ) : null}
      {/* grid */}
      {/* Posts */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '36px 24px' }}>
          {posts.map((b, bIdx) => (
            <A key={bIdx} href={b.href} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/2', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={b.slot} shape="rect" src={b.src} placeholder="Post image" />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {b.cat}
                <span style={{ color: 'var(--muted)', fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>· {b.read}</span>
              </div>
              <h3 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase', margin: '10px 0 0', transition: 'color .2s' }}>
                {b.title}
              </h3>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '15px' }}>{b.blurb}</p>
              <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--muted)' }}>{b.date}</div>
            </A>
          ))}
        </div>
      </section>
      {/* CTA strip */}
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--gold)', color: 'var(--ink)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Read enough?</div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Put it on a jacket
            </h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design" className="ez-btn ez-btn-ink">Design your own</A>
            <A href="/shop" className="ez-btn">Shop ready styles →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
