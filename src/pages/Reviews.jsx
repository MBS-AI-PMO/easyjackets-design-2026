// Converted from design/Easy Jackets Reviews.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const INITIAL_STATE = { tag: 'All', stars: 0, showForm: false, pick: 5 };

export default function Reviews() {
  const [state, setState] = useDcState(INITIAL_STATE);

  function renderVals() {
    const TJM = 'https://www.thejacketmaker.pk/cdn/shop/files/';
    const all = [
      { n: 5, tag: 'Schools', title: 'Better than the school’s supplier', body: 'Ordered 32 for our senior class. Proof came in a day, jackets in three weeks, every name spelled right. Wool is heavy and the chenille is thick.', name: 'Coach Martinez', where: 'Austin, TX', date: 'Aug 2026', product: 'Wool & Leather Varsity ×32', src: TJM + 'School_1024x1024.webp?v=1775220778' },
      { n: 5, tag: 'Individuals', title: 'Leather sleeves are the real deal', body: 'Stiff at first, broke in after a few weeks. Looks like a $500 jacket. The lining is a nice surprise.', name: 'Devon K.', where: 'Toronto', date: 'Jul 2026', product: 'All-Black Varsity', src: TJM + 'Premium_leather_material_used_in_custom_letterman_jackets_1024x1024.webp?v=1775237981' },
      { n: 4, tag: 'Individuals', title: 'Great jacket, size up', body: 'Quality is excellent. Ordered M based on my tee size and it was snug; the exchange was free and fast, so four stars only for the wait.', name: 'Priya S.', where: 'London', date: 'Jun 2026', product: 'Satin Baseball Jacket' },
      { n: 5, tag: 'Teams', title: 'Hockey club approved', body: 'Maroon and gold with crossed sticks on the back. Colors matched our kit exactly. Bulk pricing beat two local shops.', name: 'Northside HC', where: 'Minneapolis, MN', date: 'May 2026', product: 'Wool Varsity ×18', src: 'https://clothoo.com/frontend/images/customer-photos/maroon-gold-varsity-jackets-with-hockey-crossed-sticks-logo-student-group-clothoo-600x395.jpg' },
      { n: 5, tag: 'Brands', title: 'Staff jackets for our launch', body: 'Embroidered logo came out crisp. They handled 40 different sizes without a single mix-up.', name: 'Halcyon Coffee', where: 'Portland, OR', date: 'Apr 2026', product: 'Nylon Bomber ×40' },
      { n: 5, tag: 'Individuals', title: 'Gift for my dad', body: 'Recreated his 1989 letterman from two photos. He cried. Enough said.', name: 'Marcus T.', where: 'Chicago, IL', date: 'Mar 2026', product: 'Custom Varsity', src: TJM + 'Chenille_Embroidery_1024x1024.webp?v=1775220008' },
      { n: 3, tag: 'Individuals', title: 'Good, but slow to ship', body: 'Jacket is well made and the chenille is great. Took a week longer than quoted during the holiday rush; support kept me updated.', name: 'Elena R.', where: 'Madrid', date: 'Jan 2026', product: 'Cropped Varsity' },
      { n: 5, tag: 'Teams', title: 'Second season ordering', body: 'Reordered for the new roster. Same colors, same quality, new names. Easy.', name: 'Riverside FC', where: 'Sydney', date: 'Dec 2025', product: 'Satin Varsity ×22', src: TJM + 'Team_1024x1024.webp?v=1775220777' },
      { n: 4, tag: 'Schools', title: 'Band jackets', body: 'Purple wool with white sleeves for 26 band members. Only note: sleeve numbers a little small. Would order again.', name: 'Lincoln HS Band', where: 'Denver, CO', date: 'Nov 2025', product: 'Wool Varsity ×26' },
    ];
    const s = state;
    const counts = [5, 4, 3, 2, 1].map(n => all.filter(r => r.n === n).length);
    const list = all.filter(r => (s.tag === 'All' || r.tag === s.tag) && (!s.stars || r.n === s.stars));
    return {
      footerNoop: e => e.preventDefault(), cartCount: 0,
      bars: [5, 4, 3, 2, 1].map((n, i) => ({ label: n + ' ★', count: counts[i], pct: Math.round(counts[i] / all.length * 100) + '%', active: s.stars === n, select: () => setState({ stars: s.stars === n ? 0 : n }) })),
      tags: ['All', 'Schools', 'Teams', 'Brands', 'Individuals'].map(t => ({ label: t, active: s.tag === t, select: () => setState({ tag: t }) })),
      list: list.map(r => ({ ...r, slot: 'rv-' + all.indexOf(r), stars: '★'.repeat(r.n) + '☆'.repeat(5 - r.n) })),
      showForm: s.showForm, toggleForm: () => setState({ showForm: !s.showForm }),
      starPick: [1, 2, 3, 4, 5].map(n => ({ color: n <= s.pick ? 'var(--gold)' : 'var(--cream-2)', select: () => setState({ pick: n }) })),
      submit: e => { e.preventDefault(); setState({ showForm: false }); },
    };
  }

  const { bars, cartCount, list, showForm, starPick, submit, tags, toggleForm } = renderVals();

  return (
    <div className="pg-reviews">
      <Nav cta="cart" cartCount={cartCount} />
      {/* Reviews header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Reviews</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'end', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              What customers
              <br />
              say
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Verified reviews from customers in 30+ countries. Photos are theirs, unedited.
            </p>
          </div>
          <A href="/design" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.7' }}>
              <ImageSlot slot="reviews-hero" shape="rect" src="https://clothoo.com/frontend/images/home/custom-jacket-design-options-colors-fabrics-patches-clothoo-600.jpg" placeholder="Jacket photo" />
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
      {/* Rating summary */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '20px' }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(96px,12vw,160px)', lineHeight: '0.85' }}>4.9</div>
          <div>
            <div className="ez-star" style={{ fontSize: '24px' }}>★★★★★</div>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px' }}>Based on 1,284 verified reviews</div>
          </div>
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {bars.map((b, bIdx) => (
            <button key={bIdx} type="button" onClick={b.select} aria-pressed={b.active} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 48px', gap: '12px', alignItems: 'center', background: 'none', border: '0', padding: '4px 0', font: 'inherit', cursor: 'pointer', color: 'var(--ink)', textAlign: 'left' }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>{b.label}</span>
              <span style={{ height: '10px', background: 'var(--cream-2)', borderRadius: '1px', overflow: 'hidden', display: 'block' }}>
                <span style={{ display: 'block', height: '100%', background: 'var(--gold)', width: b.pct }} />
              </span>
              <span style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'right' }}>{b.count}</span>
            </button>
          ))}
        </div>
      </section>
      {/* Review filters */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tags.map((t, tIdx) => (
              <button key={tIdx} type="button" className="ez-chip" aria-pressed={t.active} onClick={t.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
                {t.label}
              </button>
            ))}
          </div>
          <button type="button" className="ez-btn" onClick={toggleForm} style={{ minHeight: '44px', fontSize: '17px' }}>Write a review</button>
        </div>
      </section>
      {/* Review form */}
      {showForm ? (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
          <form onSubmit={submit} style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,32px)', display: 'grid', gap: '16px', maxWidth: '720px' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
              Your review
            </h2>
            <div className="ez-label">
              Rating
              <div style={{ display: 'flex', gap: '4px' }}>
                {starPick.map((s, sIdx) => (
                  <button key={sIdx} type="button" onClick={s.select} style={{ background: 'none', border: '0', fontSize: '30px', cursor: 'pointer', color: s.color, padding: '0 2px' }}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label className="ez-label">
                Name
                <input className="ez-input" required />
              </label>
              <label className="ez-label">
                Order number
                <input className="ez-input" placeholder="EJ-12345" />
              </label>
            </div>
            <label className="ez-label">
              Title
              <input className="ez-input" required placeholder="Sum it up" />
            </label>
            <label className="ez-label">
              Review
              <textarea className="ez-input" required />
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="ez-btn ez-btn-ink">Submit review</button>
              <button type="button" className="ez-btn" onClick={toggleForm}>Cancel</button>
            </div>
          </form>
        </section>
      ) : null}
      {/* Review list */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
          {list.map((r, rIdx) => (
            <div key={rIdx} style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: '22px', display: 'grid', gap: '12px', alignContent: 'start' }}>
              {r.src ? (
                <div style={{ aspectRatio: '4/3', borderRadius: '2px', overflow: 'hidden', background: 'var(--cream-2)', margin: '-22px -22px 4px' }}>
                  <ImageSlot slot={r.slot} shape="rect" src={r.src} placeholder="Customer photo" />
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span className="ez-star" style={{ fontSize: '16px' }}>{r.stars}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                  ✓ Verified
                </span>
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                {r.title}
              </div>
              <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.6', color: 'var(--ink-2)' }}>{r.body}</p>
              <div style={{ fontSize: '13px', color: 'var(--muted)', borderTop: '1px solid var(--cream-2)', paddingTop: '12px' }}>
                <strong style={{ color: 'var(--ink)' }}>{r.name}</strong>
                {' '}· {r.where} · {r.date}
                <br />
                <span>{r.product}</span>
              </div>
            </div>
          ))}
        </div>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design" className="ez-btn ez-btn-gold">Design your own</A>
            <A href="/shop" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Shop ready styles →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
