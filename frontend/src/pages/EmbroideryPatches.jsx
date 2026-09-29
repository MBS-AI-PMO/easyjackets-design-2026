// Embroidery & Patches — the Photo Gallery layout, for stitched details only:
// chenille letters, patches, embroidery, names and numbers. Every tile comes from
// the admin's "Embroidery & Patches" screen (GET /patches, newest first; tags =
// the techniques shown), so photos are added, edited or removed there.
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchPatchPhotos } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';

// the usual techniques lead, in this order; tags the admin adds follow A-Z
const TAG_ORDER = ['Patches', 'Chenille', 'Embroidery', 'Rhinestone', 'Printed', 'Names & numbers'];
const RATIOS = ['4/5', '3/2', '1/1'];

export default function EmbroideryPatches() {
  usePageTitle('Embroidery & Patches', 'Chenille letters, embroidered patches, crests, names and numbers on real custom varsity jackets — stitched, never printed.');
  const [tag, setTag] = useState('All');
  const { data: adminPhotos, loading, error } = useAsync(fetchPatchPhotos, []);

  const all = (adminPhotos || []).map((p, i) => ({ id: p.id, src: p.image, cap: p.caption || 'Patch photo', tags: p.tags, ratio: RATIOS[i % RATIOS.length], slot: `emb-${p.id}` }));
  const photos = all.filter((p) => tag === 'All' || p.tags.includes(tag));
  // filter chips = the tags the visible photos carry (defaults first, then the admin's own, A-Z)
  const used = [...new Set(all.flatMap((p) => p.tags || []))];
  const tags = [...TAG_ORDER.filter((t) => used.includes(t)), ...used.filter((t) => !TAG_ORDER.includes(t)).sort((a, b) => a.localeCompare(b))];
  const chips = ['All', ...tags].map((c) => ({ label: c, active: tag === c, select: () => setTag(c) }));

  return (
    <div className="pg-embroidery">
      <Nav active="/faq" cta="shop" />
      {/* header */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
          <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Embroidery & Patches</span>
        </div>
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,8vw,112px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '0' }}>
              Embroidery
              <br />
              & Patches
            </h1>
            <p style={{ maxWidth: '44ch', margin: '20px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '16px' }}>
              Chenille letters, embroidered patches, crests, names and numbers — every one stitched by hand onto a real customer's jacket. Send us your artwork and you approve a free proof before anything is sewn.
            </p>
          </div>
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="emb-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
            </div>
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to top,rgba(20,17,15,0.85) 18%,rgba(20,17,15,0.35) 42%,rgba(20,17,15,0) 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '14px', pointerEvents: 'none' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  Online builder · Free proof
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', lineHeight: '0.95', textTransform: 'uppercase', marginTop: '6px' }}>
                  Add letters, patches, names & numbers
                </div>
              </div>
              <span className="ez-btn ez-btn-gold" style={{ minHeight: '44px', padding: '0 16px', fontSize: '17px', background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                Start →
              </span>
            </div>
          </A>
        </div>
      </section>
      {/* filter */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px clamp(16px,4vw,48px) 0' }}>
        <div className="ez-chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '2px solid var(--ink)', paddingBottom: '16px' }}>
          {chips.map((c) => (
            <button key={c.label} type="button" className="ez-chip" aria-pressed={c.active} onClick={c.select} style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '18px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '8px 16px' }}>
              {c.label}
            </button>
          ))}
          {/* while the photos load: placeholder chips where the tags will be */}
          {loading ? [92, 104, 124, 118, 96].map((w, i) => (
            <span key={`sk-${i}`} className="ez-chip ez-skeleton" aria-hidden="true" style={{ width: `${w}px`, height: '42px', padding: 0, border: 0, pointerEvents: 'none' }} />
          )) : null}
          {/* phones: the device's own dropdown instead of the chips */}
          <select className="ez-input ez-chip-select" aria-label="Filter photos" value={(chips.find((c) => c.active) || chips[0] || {}).label || ''} onChange={(e) => chips.find((c) => c.label === e.target.value)?.select()}>
            {chips.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
          </select>
        </div>
      </section>
      {/* grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
        {error ? <p role="alert" style={{ color: 'var(--muted)', margin: '0 0 16px' }}>The photos could not be loaded ({error.message}).</p> : null}
        <div style={{ columns: '3 280px', columnGap: '20px' }}>
          {loading ? Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="ez-gal" aria-busy="true" style={{ aspectRatio: RATIOS[i % RATIOS.length] }}>
              <div className="ez-skeleton" style={{ position: 'absolute', inset: '0', borderRadius: '4px' }} />
            </div>
          )) : photos.map((p) => (
            <div key={p.id} className="ez-gal ez-reveal" style={{ aspectRatio: p.ratio }}>
              <ImageSlot slot={p.slot} shape="rect" src={p.src} width={640} placeholder={p.cap} aria-label={p.cap} />
              <div className="ez-gal-cap">
                <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)' }}>
                  {p.tags.join(' · ')}
                </div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', textTransform: 'uppercase', lineHeight: '1', marginTop: '4px' }}>
                  {p.cap}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!loading && !error && !photos.length ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0', margin: '0' }}>
            {all.length ? 'No photos with this tag yet. Try another.' : 'No photos yet. They appear here as soon as they are added in the admin (Embroidery & Patches).'}
          </p>
        ) : null}
      </section>
      {/* CTA */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 96px' }}>
        <div style={{ background: 'var(--ink)', color: 'var(--cream)', borderRadius: '4px', padding: 'clamp(28px,4vw,48px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '24px clamp(24px,4vw,64px)', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)' }}>
              Your artwork
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(36px,4.5vw,64px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
              Stitched, never printed
            </h2>
            <p style={{ margin: '14px 0 0', color: 'rgba(244,239,230,0.8)', lineHeight: '1.6', fontSize: '15px', maxWidth: '48ch' }}>
              Send a logo, a sketch or a photo of an old jacket. Our artists redraw it for chenille or thread, and you approve the proof before we sew.
            </p>
          </div>
          <div className="ez-btn-pair" style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'flex-end' }}>
            <A href="/design-custom-jacket" className="ez-btn ez-btn-gold">Design your own</A>
            <A href="/bulk-order" className="ez-btn" style={{ color: 'var(--cream)', borderColor: 'var(--cream)' }}>Get a team quote →</A>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
