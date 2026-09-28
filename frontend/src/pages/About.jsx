// Converted from design/Easy Jackets About.dc.html
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { usePageTitle } from '../lib/usePageTitle';

const IMG = '/images/site';

export default function About() {
  usePageTitle('About Us', 'Easy Jackets is a small workshop making custom varsity and letterman jackets to order — one at a time or a hundred for a team — and shipping them worldwide.');

  function renderVals() {
    return { footerNoop: e => e.preventDefault(),
         values: [
           { slot: 'val-1', title: 'Made to order', desc: 'Nothing sits in a warehouse. Every jacket is cut after you approve the proof.', src: '/images/site/bulk-seg-schools.webp', alt: 'Students on a campus in navy varsity jackets' },
           { slot: 'val-2', title: 'Real materials', desc: '24 oz melton wool, full-grain cowhide, quilted satin lining. The same spec as jackets three times the price.', src: '/images/site/bulk-team-madden.webp', alt: 'A team in matching Team Madden 2024 jackets celebrating in the locker room' },
           { slot: 'val-3', title: 'No minimums', desc: 'One jacket gets the same attention as a hundred. Team pricing starts at ten.', src: '/images/site/bulk-seg-businesses.webp', alt: 'An office team in matching branded white varsity jackets' },
           { slot: 'val-4', title: 'Fair to makers', desc: 'Above-market wages, a five-day week and a workshop we are proud to show on video calls.', src: '/images/site/bulk-seg-clubs.jpg', alt: 'Club members in maroon and gold letterman jackets' },
         ],
         team: [{ slot: 'tm-1', name: 'Founder', role: 'Cutting & pattern' }, { slot: 'tm-2', name: 'Head of chenille', role: 'Letters & patches' }, { slot: 'tm-3', name: 'Embroidery lead', role: 'Names & logos' }, { slot: 'tm-4', name: 'Design artist', role: 'Digital proofs' }, { slot: 'tm-5', name: 'Customer care', role: 'Orders & sizing' }] };
  }

  const { team, values } = renderVals();

  return (
    <div className="pg-about">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      {/* About header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>About</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Made by hand,
              <br />
              worn for life
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Easy Jackets is a small workshop that makes custom varsity and letterman jackets to order — one at a time, or a hundred for a team — and ships them anywhere in the world.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="about-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* About hero image */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
          <ImageSlot slot="about-wide" shape="rect" src={`${IMG}/bulk-team-madden.webp`} fit="cover" style={{ objectPosition: 'center 62%' }} placeholder="Team in custom varsity jackets" aria-label="A team celebrating in the locker room in matching black Team Madden 2024 varsity jackets" eager />
        </div>
      </section>
      {/* Story */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '36px clamp(24px,4vw,72px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Our story
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            From one bench to a global team
          </h2>
        </div>
        <div style={{ fontSize: '17px', lineHeight: '1.7', color: 'var(--ink-2)', display: 'grid', gap: '1.2em' }}>
          <p style={{ margin: '0' }}>
            We started in Sialkot, a city that has made sportswear for over a century, with one cutting table and a belief that a varsity jacket should be affordable without being cheap. The first orders were for a local school; the next came from a college in Texas that found us online.
          </p>
          <p style={{ margin: '0' }}>
            Today the workshop stitches jackets for schools, teams, brands and individuals in more than 30 countries. Every jacket still passes through the same hands for cutting, chenille, embroidery and final inspection — and we still send a design proof before a single panel is cut.
          </p>
        </div>
      </section>
      {/* Numbers */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,5vw,72px)', lineHeight: '1' }}>2016</div>
            <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '8px' }}>
              Founded
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,5vw,72px)', lineHeight: '1' }}>
              25k
              <span style={{ color: 'var(--gold)' }}>+</span>
            </div>
            <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '8px' }}>
              Jackets made
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,5vw,72px)', lineHeight: '1' }}>
              30
              <span style={{ color: 'var(--gold)' }}>+</span>
            </div>
            <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '8px' }}>
              Countries shipped
            </div>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(48px,5vw,72px)', lineHeight: '1' }}>
              4.9
              <span style={{ color: 'var(--gold)' }}>★</span>
            </div>
            <div style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '8px' }}>
              Average rating
            </div>
          </div>
        </div>
      </section>
      {/* Values */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          What we stand for
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px' }}>
          {values.map((v, vIdx) => (
            <div key={vIdx} style={{ display: 'grid', gap: '14px', alignContent: 'start' }}>
              <div style={{ aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                <ImageSlot slot={v.slot} shape="rect" src={v.src} placeholder={v.title} aria-label={v.alt} />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', textTransform: 'uppercase', lineHeight: '0.95' }}>
                {v.title}
              </div>
              <p style={{ margin: '0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Team */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'end', justifyContent: 'space-between', gap: '16px 28px', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
            The people on the bench
          </h2>
          <p style={{ margin: '0', color: 'var(--muted)', maxWidth: '40ch', fontSize: '15px', lineHeight: '1.55' }}>
            Cutters, chenille artists and embroiderers — most have been with us since the first year.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px' }}>
          {team.map((p, pIdx) => (
            <div key={pIdx}>
              <div style={{ aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
                <ImageSlot slot={p.slot} shape="rect" placeholder={`${p.name} portrait`} />
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', marginTop: '12px' }}>
                {p.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{p.role}</div>
            </div>
          ))}
        </div>
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Work with us
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Design your first jacket
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Start in the design lab, or send a sketch and let our artists draw it up for free.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Start designing</A>
            <A href="/contact-us" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Contact us →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
