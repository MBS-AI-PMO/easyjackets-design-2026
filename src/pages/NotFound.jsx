// Converted from design/Easy Jackets 404.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export default function NotFound() {

  function renderVals() {
    return { footerNoop: e => e.preventDefault(), cartCount: 0 };
  }

  const { cartCount } = renderVals();

  return (
    <div className="pg-not-found">
      <Nav cta="cart" cartCount={cartCount} />
      {/* 404 */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(64px,10vw,140px) clamp(16px,4vw,48px) 120px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(120px,20vw,280px)', lineHeight: '0.8', letterSpacing: '-0.02em', color: 'var(--gold)', WebkitTextStroke: '3px var(--ink)' }}>
            404
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '16px 0 0' }}>
            This page got
            <br />
            cut from the pattern
          </h1>
          <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
            The link is broken or the page has moved. The jackets are all still here.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '32px' }}>
            <A href="/" className="ez-btn ez-btn-ink">Back to home</A>
            <A href="/shop" className="ez-btn">Shop jackets</A>
            <A href="/design" className="ez-btn" style={{ borderColor: 'var(--gold-2)', color: 'var(--gold-2)' }}>Design your own</A>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
          <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
            <ImageSlot slot="nf-photo" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Wool_fabric_used_in_warm_custom_letterman_jackets_1024x1024.webp?v=1775238036" placeholder="Jacket photo" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
