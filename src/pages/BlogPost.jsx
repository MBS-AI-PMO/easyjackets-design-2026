// Converted from design/Easy Jackets Blog Post.dc.html
import { useEffect } from 'react';
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import './BlogPost.css';

const INITIAL_STATE = { progress: 0, copied: false };

export default function BlogPost() {
  const [state, setState] = useDcState(INITIAL_STATE);

  // Reading progress: measured on scroll, throttled to one update per frame
  // and only committed when the rounded value actually changes.
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const a = document.getElementById('article'); if (!a) return;
      const r = a.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh * 0.5)));
      const progress = Math.round(p * 100);
      setState((prev) => (prev.progress === progress ? prev : { progress }));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => { window.removeEventListener('scroll', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, [setState]);

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/', CL = 'https://clothoo.com/frontend/images/home/';
    return {
      footerNoop: e => e.preventDefault(),
      progress: state.progress + '%',
      copyLabel: state.copied ? 'Copied' : 'Copy link',
      copyLink: () => { try { navigator.clipboard.writeText(location.href); } catch (e) {} setState({ copied: true }); setTimeout(() => setState({ copied: false }), 1500); },
      tags: ['Design ideas', 'Varsity jackets', 'Materials', 'Customization'],
      related: [
        { slot: 'rel-1', cat: 'Materials', read: '7 min', title: 'Melton wool vs. satin vs. fleece', src: CL + 'melton-wool-fabric-for-varsity-jackets-clothoo.jpg' },
        { slot: 'rel-2', cat: 'Patches', read: '6 min', title: 'Varsity jacket patch placement guide', src: CL + 'custom-chenille-triple-felt-clothoo.jpg' },
        { slot: 'rel-3', cat: 'History', read: '8 min', title: 'A concise history of the letterman jacket', src: TJM + 'School_1024x1024.webp?v=1775220778' },
      ],
    };
  }

  const { copyLabel, copyLink, progress, related, tags } = renderVals();

  return (
    <div className="pg-blog-post">
      <Nav active="/blog" cta="shop" />
      {/* reading progress */}
      <div style={{ position: 'sticky', top: '93px', zIndex: '19', height: '3px', background: 'transparent' }}>
        <div style={{ height: '100%', background: 'var(--gold)', width: progress, transition: 'width .1s linear' }} />
      </div>
      {/* post header */}
      {/* Post header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <A href="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>Blog</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Design ideas</span>
        </div>
        <div style={{ maxWidth: '900px', marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--gold-2)' }}>Design ideas</span>
            <span style={{ color: 'var(--muted)' }}>· 6 min read · May 21, 2025</span>
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,6.5vw,92px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
            Design a custom jacket that’s uniquely yours
          </h1>
          <p style={{ fontSize: '19px', lineHeight: '1.55', color: 'var(--ink-2)', margin: '22px 0 0', maxWidth: '60ch' }}>
            Colors, materials and sleeve styles in the design lab — where to start, what to decide first, and the three choices that make or break a varsity jacket.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '28px' }}>
            <span style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--ink)', color: 'var(--gold)', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '20px' }}>
              EJ
            </span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Easy Jackets Design Team</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Sialkot workshop · Updated May 2025</div>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: '40px' }}>
          <div style={{ aspectRatio: '21/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
            <ImageSlot slot="post-hero" shape="rect" src="https://clothoo.com/frontend/images/home/design-your-own-varsity-jacket-builder-online-clothoo-800.jpg" placeholder="Post hero image" />
          </div>
        </div>
      </section>
      {/* article */}
      {/* Article */}
      <section className="ez-article" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) minmax(0,720px) minmax(220px,1fr)', gap: '0 clamp(24px,4vw,64px)', alignItems: 'start' }}>
        <aside className="ez-aside ez-toc" style={{ position: 'sticky', top: '120px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            In this guide
          </div>
          <A href="#s1">Start with the body</A>
          <A href="#s2">Sleeves set the tone</A>
          <A href="#s3">Trim, lining, snaps</A>
          <A href="#s4">Letters, names and logos</A>
          <A href="#s5">Before you order</A>
        </aside>
        <article className="ez-prose" id="article">
          <p>
            <strong>A varsity jacket is a small number of big decisions.</strong>
            {' '}Get the body cloth, sleeve material and two colors right and everything else — trim, lining, patches — falls into place. Get them wrong and no amount of embroidery saves it. This guide walks through the design lab in the order we'd use ourselves.
          </p>
          <h2 id="s1">Start with the body</h2>
          <p>
            The body is roughly seventy percent of what people see, so choose the cloth before the color. Melton wool is the classic: dense, warm, matte, and it takes chenille without puckering. Satin is lighter and glossier, good for spring and stage. Fleece is the budget option and still looks sharp in a single dark tone.
          </p>
          <p>
            For color, pick the darker of your two school colors for the body. Dark bodies hide wear, make the trim stripes pop and photograph well under gym lights.
          </p>
          <figure>
            <div style={{ aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="post-fig-1" shape="rect" src="https://clothoo.com/frontend/images/home/melton-wool-fabric-for-varsity-jackets-clothoo.jpg" placeholder="Wool swatches" />
            </div>
            <figcaption>24 oz melton wool in navy, maroon and black — the three most-ordered body colors.</figcaption>
          </figure>
          <h2 id="s2">Sleeves set the tone</h2>
          <p>
            Leather sleeves read as heritage and heavy; wool sleeves read as school-issue; vegan leather sits in between at a lower price. If the body is dark, go light on the sleeves — white, cream or grey — for the traditional two-tone look. Matching sleeves to body gives a tonal, fashion-forward jacket.
          </p>
          <blockquote>Dark body, light sleeves, two-color trim. Ninety years of letter jackets say it works.</blockquote>
          <h2 id="s3">Trim, lining, snaps</h2>
          <p>
            The rib knit collar, cuffs and waistband carry your second color in stripes. Pick the two-stripe pattern for a classic look or a single wide stripe for something cleaner. Lining is where you can be loud: a quilted satin in gold or your mascot color is a private flash every time the jacket comes off.
          </p>
          <ul>
            <li>
              <strong>Snaps</strong>
              {' '}— antique brass on warm palettes, gunmetal on cool ones.
            </li>
            <li>
              <strong>Pockets</strong>
              {' '}— slash pockets with a leather welt when you have leather sleeves.
            </li>
            <li>
              <strong>Collar</strong>
              {' '}— knit stand collar is standard; a shirt collar on leather builds a retro look.
            </li>
          </ul>
          <h2 id="s4">Letters, names and logos</h2>
          <p>
            Tradition puts the chenille letter on the left chest, the name on the right, a mascot or graduation year on the sleeves and the big artwork on the back. Upload your logo in the design lab; our artists redraw it for thread and send a proof before anything is stitched.
          </p>
          <figure>
            <div style={{ aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="post-fig-2" shape="rect" src="https://clothoo.com/frontend/images/home/custom-chenille-triple-felt-clothoo.jpg" placeholder="Chenille letter detail" />
            </div>
            <figcaption>Triple-felt chenille letter with a felt border — the standard varsity build.</figcaption>
          </figure>
          <h2 id="s5">Before you order</h2>
          <ol>
            <li>Measure a jacket you already own and compare to the size chart.</li>
            <li>Check the proof on a phone screen and a laptop — colors shift.</li>
            <li>Give us the date you need it by; production is 2–3 weeks plus shipping.</li>
          </ol>
          <p>
            That's it. Open the design lab, make those decisions in that order, and you'll have a jacket that still looks right in thirty years.
          </p>
          {/* inline CTA */}
          <div style={{ margin: '48px 0 0', background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: '28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                Ready?
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '34px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>
                Design yours in the lab
              </div>
            </div>
            <A href="/design" className="ez-btn ez-btn-gold">Start designing →</A>
          </div>
          {/* tags + share */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px 24px', marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--ink)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tags.map((t, tIdx) => (
                <A key={tIdx} href="/blog" style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 10px', border: '1px solid var(--ink)', borderRadius: '2px', textDecoration: 'none' }}>
                  {t}
                </A>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)' }}>
              Share
              <A href="#" aria-label="Share on X" style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: '1.5px solid var(--ink)', borderRadius: '2px', textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '900' }}>
                X
              </A>
              <A href="#" aria-label="Share on Facebook" style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: '1.5px solid var(--ink)', borderRadius: '2px', textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '900' }}>
                FB
              </A>
              <A href="#" aria-label="Share on Pinterest" style={{ width: '36px', height: '36px', display: 'grid', placeItems: 'center', border: '1.5px solid var(--ink)', borderRadius: '2px', textDecoration: 'none', fontFamily: 'var(--display)', fontWeight: '900' }}>
                PT
              </A>
              <button type="button" onClick={copyLink} style={{ height: '36px', padding: '0 12px', border: '1.5px solid var(--ink)', borderRadius: '2px', background: 'transparent', font: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                {copyLabel}
              </button>
            </div>
          </div>
        </article>
        <aside className="ez-aside" style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              Featured in this post
            </div>
            <div style={{ aspectRatio: '4/5', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)', marginTop: '12px' }}>
              <ImageSlot slot="post-product" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981" placeholder="Product" />
            </div>
            <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '12px' }}>Classic All-Black Varsity</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px' }}>$150</span>
              <s style={{ fontSize: '13px', color: 'var(--muted)' }}>$200</s>
            </div>
            <A href="/product" className="ez-btn ez-btn-ink" style={{ width: '100%', minHeight: '44px', fontSize: '17px', marginTop: '14px' }}>
              View jacket
            </A>
          </div>
        </aside>
      </section>
      {/* prev / next */}
      {/* Prev next */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          <A href="/blog/design-a-jacket-thats-uniquely-yours" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              ← Previous
            </div>
            <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '10px', transition: 'color .2s' }}>
              A concise history of the letterman jacket
            </div>
          </A>
          <A href="/blog/design-a-jacket-thats-uniquely-yours" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit', textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Next →
            </div>
            <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '10px', transition: 'color .2s' }}>
              How to style a varsity jacket in 2026
            </div>
          </A>
        </div>
      </section>
      {/* related */}
      {/* Related posts */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Keep reading
          </h2>
          <A href="/blog" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>All posts →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {related.map((b, bIdx) => (
            <A key={bIdx} href="/blog/design-a-jacket-thats-uniquely-yours" className="ez-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ aspectRatio: '3/2', overflow: 'hidden', borderRadius: '4px', background: 'var(--cream-2)' }}>
                <ImageSlot slot={b.slot} shape="rect" src={b.src} placeholder="Post image" />
              </div>
              <div style={{ marginTop: '14px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                {b.cat}{' '}
                <span style={{ color: 'var(--muted)', fontWeight: '500', letterSpacing: '0', textTransform: 'none' }}>· {b.read}</span>
              </div>
              <h3 className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', margin: '10px 0 0', transition: 'color .2s' }}>
                {b.title}
              </h3>
            </A>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
