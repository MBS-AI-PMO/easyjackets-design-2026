// Embroidery & Patches — the Photo Gallery layout, for stitched details only:
// chenille letters, patches, embroidery, names and numbers. Tiles come from
// the admin's Gallery (tagged by their captions) and the client's own detail
// shots in public/images/site; both sets alternate down the grid.
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchGallery, fetchPatchPhotos, patchTags } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import PHOTOS from '../data/embroidery-photos.json';

const IMG = '/images/site';
const TAGS = ['Patches', 'Chenille', 'Embroidery', 'Rhinestone', 'Printed', 'Names & numbers'];

// Patch and lettering samples photographed in the workshop, hosted on the live
// site's upload storage (scripts/uploadToLiveStorage.mjs fills in the urls).
const SAMPLES = PHOTOS.filter((p) => p.url).map((p) => ({ id: p.slug, src: p.url, cap: p.cap, tags: p.tags }));
const RATIOS = ['4/5', '3/2', '1/1'];

// (the other site photos — Moldrik, Robinson, AKA, Mya — were taken off this page at the client's request)
const OWN = [
  { id: 'own-s', src: `${IMG}/red-s-jacket.webp`, cap: 'Chenille letter, name & numbers', tags: ['Chenille', 'Patches', 'Names & numbers'] },
];

const interleave = (a, b) => {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
  return out;
};

export default function EmbroideryPatches() {
  usePageTitle('Embroidery & Patches', 'Chenille letters, embroidered patches, crests, names and numbers on real custom varsity jackets — stitched, never printed.');
  const [tag, setTag] = useState('All');
  const { data: gallery } = useAsync(fetchGallery, []);
  // Photos uploaded in the admin's Embroidery & Patches screen come first; the
  // launch set from the manifest follows (until it is re-uploaded there).
  const { data: adminPhotos } = useAsync(fetchPatchPhotos, []);

  const fromGallery = (gallery || []).map((g) => ({ id: g.id, src: g.image, cap: g.caption || 'Customer photo', tags: patchTags(g.caption || '') }));
  const fromAdmin = (adminPhotos || []).map((p) => ({ id: p.id, src: p.image, cap: p.caption || 'Patch photo', tags: p.tags }));
  const all = interleave(fromGallery, [...fromAdmin, ...SAMPLES, ...OWN]).map((p, i) => ({ ...p, ratio: RATIOS[i % RATIOS.length], slot: `emb-${p.id}` }));
  const photos = all.filter((p) => tag === 'All' || p.tags.includes(tag));
  const chips = ['All', ...TAGS].map((c) => ({ label: c, active: tag === c, select: () => setTag(c) }));

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
          {/* phones: the device's own dropdown instead of the chips */}
          <select className="ez-input ez-chip-select" aria-label="Filter photos" value={(chips.find((c) => c.active) || chips[0] || {}).label || ''} onChange={(e) => chips.find((c) => c.label === e.target.value)?.select()}>
            {chips.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
          </select>
        </div>
      </section>
      {/* grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px clamp(16px,4vw,48px) 0' }}>
        <div style={{ columns: '3 280px', columnGap: '20px' }}>
          {photos.map((p) => (
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
        {!photos.length ? (
          <p style={{ color: 'var(--muted)', margin: '8px 0 0' }}>No photos in this group yet — add some in the admin's Gallery and they appear here.</p>
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
