// Converted from design/Easy Jackets Contact.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { topic: 'Sizing', sent: false, sentName: '' };

export default function Contact() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const s = state;
    return { footerNoop: e => e.preventDefault(), notSent: !s.sent, sent: s.sent, sentName: s.sentName || 'there',
      topics: ['Sizing', 'Artwork & proof', 'Existing order', 'Team order', 'Wholesale', 'Other'].map(l => ({ label: l, active: s.topic === l, select: () => setState({ topic: l }) })),
      submit: e => { e.preventDefault(); setState({ sent: true, sentName: (new FormData(e.target).get('name') || '').split(' ')[0] }); },
      reset: () => setState({ sent: false }) };
  }

  const { notSent, reset, sent, sentName, submit, topics } = renderVals();

  return (
    <div className="pg-contact">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* Contact header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Contact</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Talk to a
              <br />
              jacket maker
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Questions about sizing, artwork, a team order or an order already in production — a real person from the workshop replies within one business day.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="contact-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.9) 30%,rgba(20,17,15,0.15))', pointerEvents: 'none' }} />
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
      {/* Contact body */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px' }}>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Email
              </div>
              <A href="mailto:info@easyjackets.com" style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', textDecoration: 'none', marginTop: '8px' }}>
                info@easyjackets.com
              </A>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>Orders, artwork, sizing</p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                WhatsApp / phone
              </div>
              <A href="tel:+10000000000" style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', textDecoration: 'none', marginTop: '8px' }}>
                +1 (000) 000-0000
              </A>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>Mon–Sat, 9am–7pm EST</p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Team orders
              </div>
              <A href="/bulk-orders" style={{ display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', textDecoration: 'none', marginTop: '8px' }}>
                Bulk quote form →
              </A>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>10+ jackets, volume pricing</p>
            </div>
            <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                Workshop
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', marginTop: '8px' }}>
                Sialkot, Pakistan
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>Ships worldwide via DHL & FedEx</p>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="contact-photo" shape="rect" src="https://www.thejacketmaker.pk/cdn/shop/files/Chenille_Embroidery_1024x1024.webp?v=1775220008" placeholder="Workshop photo" />
            </div>
          </div>
        </div>
        <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          {notSent ? (
            <>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,44px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Send a message
              </h2>
              <form onSubmit={submit} style={{ display: 'grid', gap: '18px', marginTop: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Name
                    <input className="ez-input" name="name" required placeholder="Jordan Lee" />
                  </label>
                  <label className="ez-label">
                    Email
                    <input className="ez-input" type="email" name="email" required placeholder="you@example.com" />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <label className="ez-label">
                    Phone
                    <input className="ez-input" type="tel" name="phone" placeholder="Optional" />
                  </label>
                  <label className="ez-label">
                    Order number
                    <input className="ez-input" name="order" placeholder="EJ-12345 (if any)" />
                  </label>
                </div>
                <div className="ez-label">
                  Topic
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {topics.map((t, tIdx) => (
                      <button key={tIdx} type="button" className="ez-chip" aria-pressed={t.active} onClick={t.select}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <label className="ez-label">
                  Message
                  <textarea className="ez-input" name="msg" required placeholder="Tell us what you need…" />
                </label>
                <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }}>Send message →</button>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  We reply within one business day. Attach artwork by replying to our confirmation email.
                </p>
              </form>
            </>
          ) : null}
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', margin: '0 auto', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px' }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '0.9', textTransform: 'uppercase', margin: '20px 0 0' }}>
                Message sent
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '14px auto 0', maxWidth: '36ch' }}>
                Thanks, {sentName}. We'll reply within one business day.
              </p>
              <button type="button" className="ez-btn" onClick={reset} style={{ marginTop: '24px' }}>Send another</button>
            </div>
          ) : null}
        </div>
      </section>
      {/* Quick answers */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            Quick answers
          </h2>
          <A href="/faq" style={{ fontWeight: '600', textDecoration: 'none', borderBottom: '2px solid var(--gold)' }}>Full FAQ →</A>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          <A href="/size-chart" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
            <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase' }}>
              Which size am I?
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>Chart, how to measure, fit notes.</p>
          </A>
          <A href="/track-order" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
            <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase' }}>
              Where's my order?
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>Track from proof to your door.</p>
          </A>
          <A href="/shipping-returns#exchanges" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
            <div className="ez-card-title" style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '0.95', textTransform: 'uppercase' }}>
              Returns & exchanges
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>
              One free size exchange on every custom jacket.
            </p>
          </A>
        </div>
      </section>
      <Footer />
    </div>
  );
}
