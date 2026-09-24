// Converted from design/Easy Jackets Landing v2.dc.html
import { usePageProps } from '../lib/usePageProps';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './Home.css';

const PAGE_PROPS = {
  showPromo: { type: 'boolean', default: true },
  primaryCta: { type: 'enum', options: ["shop","builder"], default: "shop" },
};

export default function Home() {
  const props = usePageProps(PAGE_PROPS);

  function renderVals() {
    const builderFirst = (props.primaryCta ?? 'shop') === 'builder';
    const shop = { label: 'Shop varsity jackets', href: '#bestsellers' };
    const build = { label: 'Design your jacket', href: '/design' };
    const pri = builderFirst ? build : shop, sec = builderFirst ? shop : build;
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    return {
      showPromo: props.showPromo ?? true,
      states: [
        { name: 'California', note: 'West Coast high schools' },
        { name: 'Texas', note: 'Teams, bands & drill' },
        { name: 'New York', note: 'Senior class jackets' },
        { name: 'Florida', note: 'Athletic programs' },
        { name: 'Illinois', note: 'Midwest schools' },
        { name: 'Pennsylvania', note: 'Colleges & Greek life' },
      ],
      noop: e => e.preventDefault(),
      primaryLabel: pri.label, primaryHref: pri.href, secondaryLabel: sec.label, secondaryHref: sec.href,
      picks: [
        { slot: 'v2-pick-1', name: 'Wool & Leather', desc: 'Classic wool body with leather sleeves.', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
        { slot: 'v2-pick-2', name: 'All-Leather', desc: 'Full leather build with a heavy feel.', src: TJM + 'Logo-Varsity_1_1024x1024.webp?v=1775219897' },
        { slot: 'v2-pick-3', name: 'All-Wool', desc: 'Warm melton wool body for school jackets.', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
        { slot: 'v2-pick-4', name: 'Satin Baseball', desc: 'Lightweight satin with a glossy finish.', src: CL + 'customize-your-jacket.jpg' },
      ],
      products: [
        { slot: 'v2-p1', name: 'Classic All-Black Varsity, Leather Sleeves', reviews: 173, was: '$200', price: '$150', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
        { slot: 'v2-p2', name: 'Black & White Letterman, Leather Sleeves', reviews: 141, was: '$200', price: '$150', src: TJM + 'Patches_41cb68d9-f7c0-4b04-8ac9-08cca6394fa0_1024x1024.webp?v=1775219898' },
        { slot: 'v2-p3', name: 'Red Wool, Gold Leather Sleeves', reviews: 96, was: '$200', price: '$150', src: TJM + 'Embroidery_2_1024x1024.webp?v=1775219897' },
        { slot: 'v2-p4', name: 'Royal Blue Wool, White Leather Sleeves', reviews: 88, was: '$200', price: '$150', src: TJM + 'Logo-Varsity_1_1024x1024.webp?v=1775219897' },
        { slot: 'v2-p5', name: 'All-Black Wool Letterman', reviews: 64, was: '$150', price: '$112', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
        { slot: 'v2-p6', name: 'Baby Pink & Beige Wool Varsity (Women)', reviews: 52, was: '$150', price: '$112', src: TJM + 'V-Printed_1024x1024.webp?v=1775219901' },
        { slot: 'v2-p7', name: 'Black & Gold Satin Jacket', reviews: 77, was: '$130', price: '$97', src: CL + 'customize-your-jacket.jpg' },
        { slot: 'v2-p8', name: 'Retro Leather Letterman, Shirt Collar', reviews: 39, was: '$410', price: '$307', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      ],
      types: [
        { slot: 'v2-t1', name: 'Varsity', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
        { slot: 'v2-t2', name: 'Bomber', src: TJM + 'Suede_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238171' },
        { slot: 'v2-t3', name: 'Coach', src: TJM + 'Nylon_fabric_used_in_lightweight_custom_varsity_jackets_1024x1024.webp?v=1775238145' },
        { slot: 'v2-t4', name: 'Denim', src: TJM + 'Denim_and_cotton_fabric_options_used_in_custom_letterman_jackets_1024x1024.webp?v=1775238196' },
        { slot: 'v2-t5', name: 'Hoodies', src: TJM + 'Technical_fabric_materials_used_for_modern_custom_varsity_jackets_1024x1024.webp?v=1775238114' },
        { slot: 'v2-t6', name: 'Puffer', src: TJM + 'Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036' },
      ],
      materials: [
        { slot: 'v2-m1', name: 'Melton wool', src: CL + 'melton-wool-fabric-for-varsity-jackets-clothoo.jpg' },
        { slot: 'v2-m2', name: 'Full-grain leather', src: CL + 'full-grain-cowhide-leather-for-letterman-jackets-clothoo.jpg' },
        { slot: 'v2-m3', name: 'Vegan leather', src: CL + 'faux-leather-or-vegan-leather-clothoo.jpg' },
        { slot: 'v2-m4', name: 'Lining options', src: CL + 'polyester-satin-quilted-lining-options-clothoo.jpg' },
      ],
      patches: [
        { slot: 'v2-e1', name: 'Embroidery', src: CL + 'cusotm-embroidery-details-viscose-thread-jacket-clothoo.jpg' },
        { slot: 'v2-e2', name: 'Embroidered patches', src: CL + 'double-felt-embroidered-patch-clothoo.jpg' },
        { slot: 'v2-e3', name: 'Chenille patches', src: CL + 'custom-chenille-triple-felt-clothoo.jpg' },
        { slot: 'v2-e4', name: 'Sublimation prints', src: CL + 'sublimation-printing-clothoo.jpg' },
      ],
      reviews: [
        { initial: 'J', name: 'Jen B.', where: 'Verified buyer · United States', quote: 'The blue leather matches the wool exactly and the stitching is spot on. Every detail I requested is exactly what I asked for.' },
        { initial: 'D', name: 'Don P.', where: 'Car club order · Arizona', quote: 'Ordered custom jackets for our car club. Custom stitching and patches came out awesome — 10 days from design to finished jacket.' },
        { initial: 'C', name: 'Cimika S.', where: 'Parent · Texas', quote: 'Just received my son’s letterman jacket and it has exceeded all my expectations. Recommending you to all my friends.' },
      ],
      posts: [
        { slot: 'v2-b1', href: '/blog/design-a-jacket-thats-uniquely-yours', title: 'Design a jacket that’s uniquely yours', blurb: 'Colors, materials and sleeve styles in the Design Lab — where to start.', src: CL + 'design-your-own-varsity-jacket-builder-online-clothoo-800.jpg' },
        { slot: 'v2-b2', href: '/blog/design-a-jacket-thats-uniquely-yours', title: 'A concise history of the letterman jacket', blurb: 'From the 1865 Harvard baseball nine to the modern varsity closet.', src: TJM + 'School_1024x1024.webp?v=1775220778' },
        { slot: 'v2-b3', href: '/blog/design-a-jacket-thats-uniquely-yours', title: 'Styling women’s hoodies, effortlessly', blurb: 'Layering ideas for the fleece hoodie you designed yourself.', src: CL + 'cusotm-embroidery-details-viscose-thread-jacket-clothoo.jpg' },
      ],
      faqs: [
        { q: 'Can I order just one jacket for myself?', a: 'Yes. There is no minimum order. Design a single jacket in the builder or pick a ready style and add your letter and name.' },
        { q: 'How do I design a letterman jacket online?', a: 'Pick a style, choose materials and colors for body, sleeves and trim, upload your logo, and watch the live preview update. Add to cart when you are happy.' },
        { q: 'How do I add my school logo or team patch?', a: 'Upload artwork in the builder. Our artists redraw it for chenille or embroidery and send a digital proof for approval before production.' },
        { q: 'How much does a custom jacket cost?', a: 'Fleece and satin start around $100; wool and leather builds from $150. Patches, names and numbers add to the total, shown live in the builder.' },
        { q: 'How long does it take?', a: 'Blank jackets 10–12 days; with embroidery or patches 2–3 weeks. Shipping adds 4–5 business days. Rush production is available at checkout.' },
        { q: 'How can I order for my school or team?', a: 'Request a bulk quote and we will confirm pricing, a sizing run and a production timeline for your date.' },
      ],
    };
  }

  const { faqs, materials, patches, picks, posts, primaryHref, primaryLabel, products, reviews, secondaryHref, secondaryLabel, showPromo, states, types } = renderVals();

  return (
    <div className="pg-home">
      {/* promo bar */}
      {/* Promo */}
      {showPromo ? (
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', fontFamily: 'var(--display)', fontWeight: '700', fontSize: '16px', letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', padding: '10px 20px' }}>
          Back-to-school —{' '}
          <span style={{ color: 'var(--gold)' }}>25% off</span>
          {' '}every jacket · Free design proof · No minimums
        </div>
      ) : null}
      {/* nav */}
      <Nav cta={{ label: primaryLabel, href: primaryHref }} />
      <div id="top" />
      {/* hero */}
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', background: 'radial-gradient(60% 50% at 80% 20%, color-mix(in srgb,var(--gold) 22%,transparent), transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(24px,3vw,40px) clamp(16px,4vw,48px) clamp(24px,3vw,40px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '32px clamp(24px,4vw,64px)', alignItems: 'center', position: 'relative', minHeight: 'calc(100vh - 150px)', boxSizing: 'border-box' }}>
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
              Melton wool bodies, genuine cowhide sleeves, chenille letters stitched by hand. Choose from 40+ colors, add names, numbers and patches, and see a design proof before we cut a thread. One jacket or the whole roster — no minimums. Most orders ship in{' '}
              <strong>2–3 weeks</strong>
              .
            </p>
            <div className="ez-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '24px' }}>
              <A href={primaryHref} className="ez-btn ez-btn-ink">{primaryLabel}</A>
              <A href={secondaryHref} className="ez-btn ez-btn-line">{secondaryLabel}</A>
            </div>
            <div className="ez-hero-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px 36px', marginTop: '32px' }}>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1' }}>
                  40
                  <span style={{ color: 'var(--gold)' }}>+</span>
                </div>
                <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                  Colors
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1' }}>1</div>
                <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                  Minimum order
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1' }}>
                  2
                  <span style={{ color: 'var(--gold)' }}>–</span>
                  3
                </div>
                <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                  Weeks to ship
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '36px', lineHeight: '1' }}>
                  4.9
                  <span style={{ color: 'var(--gold)' }}>★</span>
                </div>
                <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                  Customer rating
                </div>
              </div>
            </div>
          </div>
          <div className="ez-hero-media" style={{ position: 'relative', animation: 'rise .7s .15s ease both', justifySelf: 'end', width: 'min(100%,calc((100vh - 230px) * 0.8))' }}>
            <div style={{ position: 'absolute', inset: '18px -18px -18px 18px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '22px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 16px', transform: 'rotate(4deg)', boxShadow: '0 10px 30px rgba(20,17,15,0.25)' }}>
              Free design proof
            </div>
            <div style={{ position: 'relative', aspectRatio: '4/5', maxHeight: 'calc(100vh - 230px)', width: '100%', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="v2-hero" shape="rect" src="https://clothoo.com/frontend/images/home/USA-custom-varsity-letterman-jacket-clothoo-548.jpg" placeholder="Hero — jacket worn" />
            </div>
          </div>
        </div>
        {/* trusted marquee */}
        <div style={{ borderTop: '1px solid var(--cream-2)', borderBottom: '1px solid var(--cream-2)', padding: '20px 0', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto 12px', padding: '0 clamp(16px,4vw,48px)', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Trusted by schools, teams and brands
          </div>
          <div style={{ display: 'flex', width: 'max-content', gap: '72px', padding: '0 36px', animation: 'marquee 30s linear infinite', filter: 'grayscale(1)', opacity: '0.75' }}>
            <img src="https://clothoo.com/frontend/images/home/logos/michigan-state-university.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/penn-state-lions.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/ups-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/ihop-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/wendys.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/pizza-hut-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/mcdonald.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/michigan-state-university.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/penn-state-lions.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/ups-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/ihop-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/wendys.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/pizza-hut-logo.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
            <img src="https://clothoo.com/frontend/images/home/logos/mcdonald.svg" alt="" style={{ height: '40px' }} loading="lazy" decoding="async" />
          </div>
        </div>
      </section>
      {/* popular picks */}
      {/* Popular picks */}
      <section id="picks" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Popular picks
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
              Start with a classic
            </h2>
          </div>
          <A href="/shop" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>View all →</A>
        </div>
        <div className="ez-grid-2-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '20px' }}>
          {picks.map((p, pIdx) => (
            <A key={pIdx} href="/shop" className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="ez-card-img" style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={p.slot} shape="rect" src={p.src} placeholder={p.name} />
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '28px', lineHeight: '1', textTransform: 'uppercase', margin: '16px 0 0' }}>
                {p.name}
              </h3>
              <p style={{ margin: '6px 0 0', color: 'var(--muted)', fontSize: '15px' }}>{p.desc}</p>
            </A>
          ))}
        </div>
      </section>
      {/* builder band */}
      {/* Builder */}
      <section id="builder" style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--ink)', color: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ height: '12px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 40px,var(--cream) 40px 48px,var(--gold) 48px 88px,var(--ink) 88px 120px)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,4vw,72px)', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(244,239,230,0.15)' }}>
              <ImageSlot slot="v2-builder" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Online builder screenshot" />
            </div>
            <div style={{ position: 'absolute', left: '-10px', bottom: '-16px', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '18px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '8px 14px' }}>
              Live preview
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Online builder
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,84px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
              Design your own jacket
            </h2>
            <p style={{ fontSize: '17px', lineHeight: '1.65', maxWidth: '48ch', margin: '24px 0 0', color: 'rgba(244,239,230,0.8)' }}>
              Set body and sleeve colors, materials, rib trim, lining, patches, names and numbers — and watch the price update as you go. Make one jacket or a full set for your school, team or staff.
            </p>
            <ul style={{ listStyle: 'none', padding: '0', margin: '24px 0 0', display: 'grid', gap: '12px', fontSize: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold)', fontSize: '20px' }}>01</span>
                Choose your jacket style and fabrics
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold)', fontSize: '20px' }}>02</span>
                Pick from a full spectrum of colors
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold)', fontSize: '20px' }}>03</span>
                Add names, logos and chenille letters
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: '900', color: 'var(--gold)', fontSize: '20px' }}>04</span>
                Approve the proof, then we stitch
              </li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
              <A href="/design" className="ez-btn ez-btn-gold">Start designing</A>
              <span style={{ alignSelf: 'center', fontSize: '14px', color: 'rgba(244,239,230,0.6)' }}>Varsity · Bomber · Hoodie · Coach</span>
            </div>
          </div>
        </div>
      </section>
      {/* value props */}
      {/* Why us */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: '32px 28px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '20px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '1', textTransform: 'uppercase' }}>
              Full custom options
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.6' }}>
              Colors, sleeve materials, rib trim, lining, patches, embroidery, names and numbers.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '20px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '1', textTransform: 'uppercase' }}>
              Built to last
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.6' }}>
              24 oz melton wool, full-grain cowhide, triple-felt chenille and rayon embroidery.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '20px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '1', textTransform: 'uppercase' }}>
              No minimum order
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.6' }}>
              Order one jacket for yourself or a full team set. Bulk pricing from ten.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '20px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '1', textTransform: 'uppercase' }}>
              Free design proof
            </div>
            <p style={{ margin: '12px 0 0', color: 'var(--muted)', lineHeight: '1.6' }}>
              A digital illustration of your exact jacket within two business days. Nothing is cut until you approve.
            </p>
          </div>
        </div>
      </section>
      {/* bestsellers */}
      {/* Bestsellers */}
      <section id="bestsellers" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Bestsellers
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
              Ready to letter
            </h2>
          </div>
          {showPromo ? (
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--ink)', color: 'var(--gold)', padding: '8px 16px' }}>
              25% off — limited time
            </div>
          ) : null}
        </div>
        <div className="ez-grid-2-sm" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 20px' }}>
          {products.map((p, pIdx) => (
            <A key={pIdx} href="/product" className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
              {showPromo ? (
                <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '2', background: 'var(--gold)', color: 'var(--ink)', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '15px', letterSpacing: '0.1em', padding: '4px 8px' }}>
                  -25%
                </span>
              ) : null}
              <div className="ez-card-img" style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={p.slot} shape="rect" src={p.src} placeholder={p.name} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '12px', alignItems: 'start', marginTop: '14px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--body)', fontWeight: '600', fontSize: '16px', lineHeight: '1.35', margin: '0' }}>{p.name}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    <span style={{ color: 'var(--gold-2)' }}>★★★★★</span>
                    {' '}4.9 · {p.reviews} reviews
                  </div>
                </div>
                <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {showPromo ? (
                    <s style={{ display: 'block', fontSize: '13px', color: 'var(--muted)' }}>{p.was}</s>
                  ) : null}
                  <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1' }}>{p.price}</span>
                </div>
              </div>
            </A>
          ))}
        </div>
      </section>
      {/* shop by type */}
      {/* Shop by type */}
      <section id="types" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Shop by jacket type
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 36px' }}>
          Every style, your colors
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '16px' }}>
          {types.map((t, tIdx) => (
            <A key={tIdx} href="/shop" className="ez-card" style={{ display: 'block', position: 'relative', aspectRatio: '3/4', overflow: 'hidden', borderRadius: '4px', textDecoration: 'none', color: 'var(--cream)', background: 'var(--ink)' }}>
              <div className="ez-card-img" style={{ position: 'absolute', inset: '0', opacity: '0.85' }}>
                <ImageSlot slot={t.slot} shape="rect" src={t.src} placeholder={t.name} />
              </div>
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '16px', background: 'linear-gradient(to top,rgba(20,17,15,0.85),transparent)', pointerEvents: 'none' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', textTransform: 'uppercase' }}>
                  {t.name}
                </div>
              </div>
            </A>
          ))}
        </div>
      </section>
      {/* materials + patches */}
      {/* Materials */}
      <section id="materials" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '56px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Materials & colors
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            10+ materials.
            <br />
            40+ colors.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 16px', marginTop: '28px' }}>
            {materials.map((m, mIdx) => (
              <div key={mIdx}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                  <ImageSlot slot={m.slot} shape="rect" src={m.src} placeholder={m.name} />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px' }}>
                  {m.name}
                </div>
              </div>
            ))}
          </div>
          <A href="https://www.easyjackets.com/" style={{ display: 'inline-block', marginTop: '24px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
            View materials & colors →
          </A>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Patches & embroidery
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            Sewn,
            <br />
            never pressed.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 16px', marginTop: '28px' }}>
            {patches.map((m, mIdx) => (
              <div key={mIdx}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                  <ImageSlot slot={m.slot} shape="rect" src={m.src} placeholder={m.name} />
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', marginTop: '10px' }}>
                  {m.name}
                </div>
              </div>
            ))}
          </div>
          <A href="https://www.easyjackets.com/" style={{ display: 'inline-block', marginTop: '24px', fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>
            Patches & embroidery guide →
          </A>
        </div>
      </section>
      {/* bulk band */}
      {/* Bulk */}
      <section id="bulk" style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--gold)', color: 'var(--ink)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Schools · Teams · Corporate
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,7vw,96px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '10px 0 0' }}>
              Outfit the whole roster
            </h2>
          </div>
          <div>
            <p style={{ fontSize: '17px', lineHeight: '1.65', margin: '0', maxWidth: '48ch' }}>
              Bulk discounts from ten jackets, Pantone color matching, individual names and numbers, and one shipment to the athletic office. Tight deadline? Tell us the date.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '28px' }}>
              <A href="/bulk-orders" className="ez-btn ez-btn-ink">Get a bulk quote</A>
              <span style={{ alignSelf: 'center', fontSize: '14px' }}>
                Unisex XS–6XL, tall options.{' '}
                <A href="https://www.easyjackets.com/" style={{ color: 'inherit' }}>Size chart</A>
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* send us your idea */}
      {/* Free proof */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '28px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Not sure where to start?
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Send us your idea, we'll draw it
            </h2>
          </div>
          <div>
            <p style={{ margin: '0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px' }}>
              Email a sketch, a photo of an old jacket, or your school colors and logo. Our artists send back a free digital proof within two business days — no commitment until you love it.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '20px' }}>
              <A href="/contact" className="ez-btn ez-btn-gold">Get a free proof</A>
              <A href="/bulk-orders" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Team order? →</A>
            </div>
          </div>
        </div>
      </section>
      {/* customer photos */}
      {/* Customer photos */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          #EasyJackets
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 36px' }}>
          Made for real teams
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gridAutoRows: '200px', gap: '12px' }}>
          <div style={{ gridColumn: 'span 2', gridRow: 'span 2', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
            <ImageSlot slot="v2-cp1" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Team_1024x1024.webp?v=1775220777" placeholder="Team photo" />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
            <ImageSlot slot="v2-cp2" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/School_1024x1024.webp?v=1775220778" placeholder="Customer photo" />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
            <ImageSlot slot="v2-cp3" shape="rect" src="https://clothoo.com/frontend/images/customer-photos/maroon-gold-varsity-jackets-with-hockey-crossed-sticks-logo-student-group-clothoo-600x395.jpg" placeholder="Customer photo" />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
            <ImageSlot slot="v2-cp4" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Brand_63f92eec-0544-42c1-8c33-0fe8dd40f4eb_1024x1024.webp?v=1775220871" placeholder="Customer photo" />
          </div>
          <div style={{ overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
            <ImageSlot slot="v2-cp5" shape="rect" src="https://clothoo.com/frontend/images/customer-photos/wetzels-pretzels-blue-gold-varsity-jacket-with-wetzside-script-back-design-clothoo-600x395.jpg" placeholder="Customer photo" />
          </div>
        </div>
      </section>
      {/* states */}
      {/* States */}
      <section id="states" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Shipping to all 50 states
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px clamp(24px,4vw,72px)', alignItems: 'end', marginTop: '10px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Custom varsity jackets near you
          </h2>
          <p style={{ margin: '0', color: 'var(--ink-2)', lineHeight: '1.65', fontSize: '16px', maxWidth: '52ch' }}>
            From{' '}
            <strong>California</strong>
            {' '}to{' '}
            <strong>New York</strong>
            , Easy Jackets makes custom letterman and varsity jackets for high schools, colleges, sports teams and companies in every state. No minimum order, free design proof, fast production and worldwide shipping.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px', marginTop: '36px' }}>
          {states.map((s, sIdx) => (
            <A key={sIdx} href="/united-states/alabama" className="ez-card" style={{ display: 'block', padding: '20px 18px', border: '1px solid var(--cream-2)', borderRadius: '4px', background: '#fbf8f2', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                {s.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{s.note}</div>
            </A>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '32px' }}>
          <A href="/united-states" className="ez-btn ez-btn-ink" style={{ minHeight: '48px', fontSize: '19px' }}>Browse all 50 states</A>
          <A href="/design" className="ez-btn" style={{ minHeight: '48px', fontSize: '19px' }}>Start designing →</A>
          <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Trusted by students, athletes and alumni nationwide.</span>
        </div>
      </section>
      {/* reviews */}
      {/* Reviews */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Reviews
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
              What customers say
            </h2>
          </div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
            4.9
            <span style={{ color: 'var(--gold)' }}>★</span>
            {' '}
            <span style={{ fontFamily: 'var(--body)', fontWeight: '500', fontSize: '14px', color: 'var(--muted)' }}>
              average across verified orders
            </span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {reviews.map((r, rIdx) => (
            <figure key={rIdx} style={{ margin: '0', padding: '28px', background: 'var(--cream-2)', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ color: 'var(--gold-2)', letterSpacing: '0.1em' }}>★★★★★</div>
              <blockquote style={{ margin: '0', fontSize: '17px', lineHeight: '1.6', flex: '1' }}>“{r.quote}”</blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '18px' }}>
                  {r.initial}
                </span>
                <span>
                  <strong style={{ display: 'block', fontSize: '14px' }}>{r.name}</strong>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>{r.where}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      {/* blog */}
      {/* Blog */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '36px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            From the blog
          </h2>
          <A href="/blog" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All posts →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {posts.map((b, bIdx) => (
            <A key={bIdx} href={b.href} className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div className="ez-card-img" style={{ aspectRatio: '3/2', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={b.slot} shape="rect" src={b.src} placeholder="Post image" />
              </div>
              <h3 style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', lineHeight: '1', textTransform: 'uppercase', margin: '16px 0 0' }}>
                {b.title}
              </h3>
              <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '15px' }}>{b.blurb}</p>
            </A>
          ))}
        </div>
      </section>
      {/* faq */}
      {/* FAQ */}
      <section id="faq" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            FAQ
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            Before you order
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '36ch' }}>
            Still stuck? Chat with us any time — we answer within the hour during business days.
          </p>
        </div>
        <div>
          {faqs.map((f, fIdx) => (
            <details key={fIdx} style={{ borderTop: '1px solid var(--ink)', padding: '16px 0' }}>
              <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '24px', cursor: 'pointer', listStyle: 'none', fontWeight: '600', fontSize: '17px' }}>
                <span>{f.q}</span>
                <span className="faq-plus" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '1', color: 'var(--gold-2)', transition: 'transform .2s' }}>
                  +
                </span>
              </summary>
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', lineHeight: '1.6', maxWidth: '60ch' }}>{f.a}</p>
            </details>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* final cta */}
      {/* CTA */}
      <section style={{ marginTop: 'clamp(56px,7vw,96px)', background: 'var(--ink)', color: 'var(--cream)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '0', pointerEvents: 'none', background: 'radial-gradient(50% 60% at 20% 100%, color-mix(in srgb,var(--gold) 30%,transparent), transparent 70%)' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(72px,9vw,128px) clamp(16px,4vw,48px)', position: 'relative' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,9vw,136px)', lineHeight: '0.86', textTransform: 'uppercase', margin: '0', maxWidth: '14ch' }}>
            Ready to create your{' '}
            <span style={{ color: 'var(--gold)' }}>legacy?</span>
          </h2>
          <p style={{ fontSize: '17px', lineHeight: '1.65', maxWidth: '52ch', margin: '28px 0 0', color: 'rgba(244,239,230,0.8)' }}>
            Design a varsity or bomber jacket in melton wool and leather. Add your name, number or logo. Free design proof, no minimums, ships worldwide.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '36px' }}>
            <A href={primaryHref} className="ez-btn ez-btn-gold">{primaryLabel}</A>
            <A href={secondaryHref} className="ez-btn ez-btn-line" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>
              {secondaryLabel}
            </A>
          </div>
        </div>
        <div style={{ height: '12px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 40px,var(--cream) 40px 48px,var(--gold) 48px 88px,var(--ink) 88px 120px)' }} />
      </section>
      <Footer />
    </div>
  );
}
