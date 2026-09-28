// Converted from design/Easy Jackets Bulk.dc.html
import { useDcState } from '../lib/useDcState';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { faqSchema } from '../components/Faq';
import FaqGroups from '../components/FaqGroups';
import { BULK_FAQ_GROUPS, groupFaqs, guessBulkGroup } from '../lib/faqGroups';
import { fetchPageFaqs } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { fetchClosures, submitBulkQuote } from '../lib/orders';
import SelectMenu from '../components/SelectMenu';
import { usePageTitle } from '../lib/usePageTitle';
import './BulkOrders.css';

// The live site's bulk form (easyjackets/src/Pages/BulkOrder.jsx): products, linings and design locations.
const PRODUCTS = [
  'Wool and Leather Varsity Jacket', 'Wool Varsity Jacket', 'Hooded Letterman Jacket', 'All Leather Varsity Jacket',
  'Cotton Twill Varsity Jacket', 'Fleece Varsity Jacket', 'Softshell Varsity Jacket', 'Nylon Bomber Jacket',
  'Softshell Bomber Jacket', 'Cotton Twill Bomber Jacket', 'Cropped Wool and Leather Varsity Jacket', 'Cropped Wool Varsity Jacket',
  'Cropped Satin Jacket', 'Nylon Coach Jacket', 'Fleece Hoodie',
];
const LININGS = ['Plain Cotton Lining', 'Quilted Lining', 'Satin Sublimated Lining'];
const DESIGN_LOCATIONS = [
  ['frontCenter', 'Front Center'], ['rightChest', 'Right Chest'], ['leftChest', 'Left Chest'], ['rightPocket', 'Right Pocket'],
  ['leftPocket', 'Left Pocket'], ['rightSleeve', 'Right Sleeve'], ['leftSleeve', 'Left Sleeve'], ['rightCuff', 'Right Cuff'],
  ['leftCuff', 'Left Cuff'], ['backTop', 'Back Top'], ['backMiddle', 'Back Middle'], ['backBottom', 'Back Bottom'], ['nickName', 'Nick Name'],
];
const capitalize = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);

/** A Yes / No switch (the live form's toggle, in this site's style). */
function YesNo({ label, value, onChange }) {
  return (
    <div className="bo-yesno" role="radiogroup" aria-label={label}>
      <button type="button" role="radio" aria-checked={value} onClick={() => onChange(true)}>Yes</button>
      <button type="button" role="radio" aria-checked={!value} onClick={() => onChange(false)}>No</button>
    </div>
  );
}

// The live page's quote brief (bulkQuoteIntro / bulkQuoteLinks), word for word.
const QUOTE_INTRO = [
  'Planning a bulk order for custom varsity jackets, letterman jackets, team apparel, or promotional outerwear? Fill out the form below with your project details, and our team will provide a customized quote tailored to your requirements.',
  'At Easy Jackets, we specialize in manufacturing high-quality custom apparel with complete personalization options, including custom colors, embroidery, chenille patches, tackle twill, screen printing, and private labeling. Whether you are ordering for a school, sports team, business, brand, or organization, we offer factory-direct pricing, professional craftsmanship, and worldwide shipping.',
  'Please provide as much information as possible, including product type, quantity, sizes, artwork, and customization preferences. The more details you share, the more accurate and efficient our quotation process will be.',
  'Need assistance with your design? Our experienced team can help turn your ideas into a professional mockup before production begins.',
];
const QUOTE_LINKS = [
  ['/design-custom-jacket', 'Design Your Own Jacket', 'Build it in the online designer'],
  ['/shop', 'Shop Page', 'Start from one of our jackets'],
  ['/how-to-design-jacket', 'How to Design', 'A step-by-step walkthrough'],
];

const QUANTITIES = ['10–24', '25–49', '50–99', '100–249', '250+'];
const BUDGETS = ['Under $100', '$100–150', '$150–200', '$200+', 'Flexible'];

/**
 * A form dropdown: the navbar-style menu on desktop, the device's own picker on
 * phones and tablets (CSS picks one). Both drive the same value; the native one
 * carries `name`, so the form data stays complete either way.
 */
function FormSelect({ id, label, name, value, options, onChange }) {
  const pairs = options.map((o) => (Array.isArray(o) ? o : [o, o]));
  return (
    <div className="ez-label bo-select">
      <span id={id}>{label}</span>
      <span className="bo-select-desktop"><SelectMenu value={value} options={pairs} onChange={onChange} labelledBy={id} /></span>
      <select className="ez-input bo-select-native" name={name} aria-labelledby={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {pairs.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

const INITIAL_STATE = { type: 'Wool and Leather Varsity Jacket', qty: '10–24', budget: 'Under $100', org: 'School', closure: 'buttons', lining: 'Quilted Lining', zipout: false, flap: false, locations: {}, sent: false, sentName: '', sending: false, error: '' };

export default function BulkOrders() {
  const [state, setState] = useDcState(INITIAL_STATE);
  usePageTitle('Bulk & team orders', 'Team pricing from ten jackets: free mockup, sizing run and a production timeline for your date.');

  function renderVals() {
    const footerNoop = e => e.preventDefault();
    const s = state;
    return {
      footerNoop,
      notSent: !s.sent, sent: s.sent, sentName: s.sentName || 'there',
      orgTypes: ['School', 'Sports team', 'Business', 'Club', 'Event', 'Other'].map(l => ({ label: l, active: s.org === l, select: () => setState({ org: l }) })),
      locations: DESIGN_LOCATIONS.map(([key, label]) => ({ key, label, on: Boolean(s.locations[key]), set: (on) => setState({ locations: { ...s.locations, [key]: on } }) })),
      sending: s.sending, error: s.error,
      submit: async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const v = (k) => String(fd.get(k) || '').trim();
        if (!v('name') || !v('email') || !v('org')) { setState({ error: 'Please add your name, organization and email.' }); return; }
        setState({ sending: true, error: '' });
        try {
          const chosen = DESIGN_LOCATIONS.filter(([key]) => s.locations[key]).map(([, label]) => label);
          await submitBulkQuote({
            name: v('name'), org: v('org'), orgType: s.org, email: v('email'), phone: v('phone'), type: s.type, qty: s.qty, date: v('date'), budget: s.budget,
            closure: capitalize(s.closure), lining: s.lining, zipout: s.zipout ? 'Yes' : 'No', flap: s.flap ? 'Yes' : 'No',
            locations: chosen.length ? chosen.join(', ') : 'None',
            details: v('details'),
          });
          setState({ sent: true, sentName: v('name').split(' ')[0], sending: false });
        } catch (err) {
          setState({ sending: false, error: err.message || 'The request could not be sent. Please try again or email us.' });
        }
      },
      reset: () => setState({ sent: false }),
      segments: [
        { slot: 'seg-1', name: 'Schools', desc: 'Letterman jackets for athletics, band and class of ’27.', src: '/images/site/bulk-seg-schools.webp', alt: 'Students on a campus in navy varsity jackets' },
        { slot: 'seg-2', name: 'Teams', desc: 'Matching colors, individual names and numbers.', src: '/images/site/bulk-team-madden.webp', alt: 'A team in matching Team Madden 2024 jackets celebrating in the locker room' },
        { slot: 'seg-3', name: 'Businesses', desc: 'Branded jackets for staff, launches and gifting.', src: '/images/site/bulk-seg-businesses.webp', alt: 'An office team in matching branded white varsity jackets' },
        { slot: 'seg-4', name: 'Clubs', desc: 'Car clubs, fraternities, esports and alumni groups.', src: '/images/site/bulk-seg-clubs.jpg', alt: 'Club members in maroon and gold letterman jackets' },
      ],
      tiers: [
        { range: '10–24 jackets', note: 'Mixed sizes and colors', off: '10% off', from: '$135' },
        { range: '25–49 jackets', note: 'Free physical sample', off: '15% off', from: '$127' },
        { range: '50–99 jackets', note: 'Dedicated specialist', off: '20% off', from: '$120' },
        { range: '100+ jackets', note: 'Pantone matching included', off: 'Up to 30% off', from: '$105' },
      ],
      faqs: [
        { q: 'What is the minimum for bulk pricing?', a: 'Ten jackets. Below that you can still order any quantity at regular price — there is no minimum order.' },
        { q: 'Can everyone have a different size, name and number?', a: 'Yes. Send a roster sheet and each jacket is made and labelled individually. Mixed sizes and colors count toward the same volume tier.' },
        { q: 'Can you match our school colors exactly?', a: 'We stock 40+ wool and leather colors and can Pantone-match rib knit and lining on orders of 100+. Send a swatch or code and we will confirm the closest match on the mockup.' },
        { q: 'How long does a team order take?', a: 'Typically 3–4 weeks in production after mockup approval, plus 4–5 business days shipping. Tell us your deadline and we will confirm before you commit.' },
        { q: 'Do you offer samples?', a: 'A free digital mockup for every quote. A physical sample jacket is available on orders of 25 or more, credited back against the order.' },
        { q: 'How do payment and invoicing work?', a: '50% deposit to start production, balance before shipping. We issue invoices and W-9s for schools and businesses, and accept purchase orders from institutions.' },
      ],
    };
  }

  const { error, faqs, locations, notSent, orgTypes, reset, segments, sending, sent, sentName, submit, tiers } = renderVals();
  // front closure options come from the admin's closures list, as on the live site
  const { data: closures } = useAsync(fetchClosures, []);
  // FAQs from the admin's Storefront FAQs screen, as on the live site; the design's list only if the API is unreachable.
  const { data: faqData, error: faqError } = useAsync(() => fetchPageFaqs('/bulk-order'), []);
  const faqItems = faqData ?? (faqError ? faqs : null);
  // grouped by the category set in the admin, or by what the question asks until one is set
  const faqGroups = faqItems ? groupFaqs(faqItems, BULK_FAQ_GROUPS, guessBulkGroup) : null;
  const faqJsonLd = faqItems ? faqSchema(faqItems) : null;

  return (
    <div className="pg-bulk-orders">
      <Nav active="/bulk-order" cta="shop" />
      {/* hero + form */}
      {/* Bulk hero */}
      <section className="ez-bulk" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'minmax(0,6fr) minmax(0,5fr)', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', gap: '8px' }}>
            <A href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</A>
            <span>/</span>
            <span style={{ color: 'var(--ink)', fontWeight: '600' }}>Bulk orders</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '24px' }}>
            <span style={{ width: '28px', height: '6px', background: 'repeating-linear-gradient(90deg,var(--gold) 0 8px,var(--ink) 8px 12px)' }} />
            Schools · Teams · Businesses · Clubs
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(56px,7.5vw,108px)', lineHeight: '0.88', textTransform: 'uppercase', margin: '14px 0 0' }}>
            Bulk varsity
            <br />
            & custom
            <br />
            <span style={{ color: 'var(--gold-2)' }}>jacket orders</span>
          </h1>
          <p style={{ maxWidth: '48ch', margin: '24px 0 0', color: 'var(--ink-2)', lineHeight: '1.6', fontSize: '17px' }}>
            Order custom varsity jackets in bulk for your school, team, business, club or organization. Tell us the colors, the roster and the date — we handle the sizing run, individual names and numbers, and one shipment to your door.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '20px 28px', marginTop: '36px' }}>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                10
                <span style={{ color: 'var(--gold)' }}>+</span>
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Jackets for bulk pricing
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                Up to 30
                <span style={{ color: 'var(--gold)' }}>%</span>
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Volume discount
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>Free</div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Design proof & mockup
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '1' }}>
                3
                <span style={{ color: 'var(--gold)' }}>–</span>
                4 wks
              </div>
              <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: '6px' }}>
                Typical team turnaround
              </div>
            </div>
          </div>
          <div className="bo-hero-frame" style={{ position: 'relative', marginTop: '44px' }}>
            <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: '4px', overflow: 'hidden', background: 'var(--cream-2)' }}>
              <ImageSlot slot="bulk-hero" shape="rect" src="/images/site/bulk-team-madden.webp" placeholder="Team in matching jackets" aria-label="A team celebrating in the locker room in matching black Team Madden 2024 varsity jackets" eager />
            </div>
          </div>
          {/* quote brief (the live page's copy) */}
          <section className="bo-brief" aria-labelledby="bo-brief-title">
            <div className="bo-brief-kicker">Request a bulk order quote</div>
            <h2 id="bo-brief-title" className="bo-brief-title">Tell us what you need, and we will shape the quote around it.</h2>
            {QUOTE_INTRO.map((para) => <p key={para.slice(0, 24)}>{para}</p>)}
            <nav className="bo-brief-links" aria-label="Helpful links">
              <div className="bo-brief-links-label">Helpful links</div>
              <div className="bo-brief-links-row">
                {QUOTE_LINKS.map(([href, label, note]) => (
                  <A key={href} href={href} className="bo-brief-link">
                    <span className="bo-brief-link-name">{label}</span>
                    <span className="bo-brief-link-note">{note}</span>
                    <span className="bo-brief-link-arrow" aria-hidden="true">→</span>
                  </A>
                ))}
              </div>
            </nav>
          </section>
        </div>
        {/* form */}
        <div className="ez-form-side" style={{ position: 'sticky', top: '104px', background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          {notSent ? (
            <>
              <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
                Free quote · replies within 1 business day
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,44px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '8px 0 0' }}>
                Request a bulk quote
              </h2>
              <form onSubmit={submit} style={{ display: 'grid', gap: '18px', marginTop: '24px' }} noValidate>
                <div className="bo-contact-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <label className="ez-label">
                    Full name
                    <input className="ez-input" name="name" required placeholder="Jordan Lee" />
                  </label>
                  <label className="ez-label">
                    Organization
                    <input className="ez-input" name="org" required placeholder="Lincoln High School" />
                  </label>
                </div>
                <div className="bo-contact-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <label className="ez-label">
                    Email
                    <input className="ez-input" type="email" name="email" required placeholder="you@school.edu" />
                  </label>
                  <label className="ez-label">
                    Phone
                    <input className="ez-input" type="tel" name="phone" placeholder="+1 (555) 000-0000" />
                  </label>
                </div>
                <div className="ez-label">
                  Order type
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {orgTypes.map((o, oIdx) => (
                      <button key={oIdx} type="button" className="ez-chip" aria-pressed={o.active} onClick={o.select}>{o.label}</button>
                    ))}
                  </div>
                </div>
                <div className="bo-type-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <FormSelect id="bo-type" label="Jacket type" name="type" value={state.type} options={[...PRODUCTS, 'Not sure yet']} onChange={(type) => setState({ type })} />
                  <FormSelect id="bo-qty" label="Quantity" name="qty" value={state.qty} options={QUANTITIES} onChange={(qty) => setState({ qty })} />
                </div>
                <div className="bo-two">
                  <FormSelect id="bo-closure" label="Front closure" name="closure" value={state.closure}
                    options={(closures && closures.length ? closures : ['buttons', 'zipper', 'pullover', 'flap']).map((c) => [c, capitalize(c)])}
                    onChange={(closure) => setState({ closure })} />
                  <FormSelect id="bo-lining" label="Lining" name="lining" value={state.lining} options={LININGS} onChange={(lining) => setState({ lining })} />
                  <div className="ez-label">
                    ½ Zipout lining
                    <YesNo label="½ Zipout lining" value={state.zipout} onChange={(on) => setState({ zipout: on })} />
                  </div>
                  <div className="ez-label">
                    Flap closure
                    <YesNo label="Flap closure" value={state.flap} onChange={(on) => setState({ flap: on })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <label className="ez-label">
                    Needed by
                    <input className="ez-input" type="date" name="date" />
                  </label>
                  <FormSelect id="bo-budget" label="Budget per jacket" name="budget" value={state.budget} options={BUDGETS} onChange={(budget) => setState({ budget })} />
                </div>
                <div className="ez-label">
                  Personalization
                  <span className="bo-hint">Where should we add a design? Choose Yes for every spot you want decorated.</span>
                  <div className="bo-locations">
                    {locations.map((l) => (
                      <div key={l.key} className="bo-location">
                        <span>{l.label}</span>
                        <YesNo label={l.label} value={l.on} onChange={l.set} />
                      </div>
                    ))}
                  </div>
                </div>
                <label className="ez-label">
                  Details
                  <textarea className="ez-input" name="details" placeholder="School colors, sizes, logo placement, anything else…" />
                </label>
                <p style={{ margin: '0', fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Logo or artwork? Reply to our email with PNG, JPG, PDF, AI or SVG files and our artists draw the mockup from them.
                </p>
                {error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e', lineHeight: '1.5' }}>{error}</p> : null}
                <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }} disabled={sending}>{sending ? 'Sending…' : 'Get my quote →'}</button>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  No commitment. We'll send pricing, a free mockup and a production timeline. By submitting you agree to be contacted about your order.
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
                Request received
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '14px auto 0', maxWidth: '36ch' }}>
                Thanks, {sentName}. A team specialist will email pricing and a free mockup within one business day.
              </p>
              <button type="button" className="ez-btn" onClick={reset} style={{ marginTop: '24px' }}>Send another request</button>
            </div>
          ) : null}
        </div>
      </section>
      {/* who we serve */}
      {/* Who */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
          Who orders in bulk
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 36px' }}>
          One jacket, the whole crew
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '20px' }}>
          {segments.map((s, sIdx) => (
            <div key={sIdx} style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', color: 'var(--cream)' }}>
              <div style={{ position: 'absolute', inset: '0', opacity: '0.8' }}>
                <ImageSlot slot={s.slot} shape="rect" src={s.src} placeholder={s.name} aria-label={s.alt} />
              </div>
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', padding: '20px', background: 'linear-gradient(to top,rgba(20,17,15,0.92),transparent)' }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '30px', lineHeight: '0.95', textTransform: 'uppercase' }}>
                  {s.name}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: '1.5', color: 'rgba(244,239,230,0.85)' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* pricing tiers */}
      {/* Pricing */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '32px clamp(24px,4vw,72px)', alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
            Volume pricing
          </div>
          <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 0' }}>
            More jackets, lower price
          </h2>
          <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '20px 0 0', maxWidth: '40ch' }}>
            Discounts apply to the whole order, mixed sizes and colors included. Names, numbers and patches are priced once per design, not per jacket.
          </p>
        </div>
        <div style={{ display: 'grid', gap: '0' }}>
          {tiers.map((t, tIdx) => (
            <div key={tIdx} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto auto', gap: '16px 24px', alignItems: 'baseline', padding: '18px 0', borderTop: '1px solid var(--ink)' }}>
              <div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '28px', lineHeight: '1', textTransform: 'uppercase' }}>
                  {t.range}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{t.note}</div>
              </div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '26px', color: 'var(--gold-2)' }}>{t.off}</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                from{' '}
                <strong style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '24px', color: 'var(--ink)' }}>{t.from}</strong>
                /jacket
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--ink)' }} />
        </div>
      </section>
      {/* process */}
      {/* Process */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(16px,4vw,48px) 0' }}>
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(40px,5vw,72px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0 0 32px' }}>
          How a team order works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '28px 24px' }}>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>01</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Request a quote
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Send colors, logo, quantity and date. A specialist replies within one business day.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>02</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Approve the mockup
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Free digital proof of the exact jacket. A physical sample is available for orders of 25+.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>03</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              Send the roster
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              Names, numbers and sizes in a simple sheet. We double-check the sizing run with you.
            </p>
          </div>
          <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '44px', lineHeight: '1', color: 'var(--gold-2)' }}>04</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '24px', textTransform: 'uppercase', marginTop: '10px' }}>
              One delivery
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)', lineHeight: '1.55', fontSize: '14px' }}>
              3–4 weeks in production, labelled by name, shipped together to your office.
            </p>
          </div>
        </div>
      </section>
      {/* faq */}
      {/* FAQ */}
      {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}
      <FaqGroups
        id="faq"
        className="ez-faq-layout-bulk"
        groups={faqGroups}
        idPrefix="faq-"
        side={(
          <>
            <div style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold-2)' }}>
              FAQ
            </div>
            <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(44px,6vw,80px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '10px 0 28px' }}>
              Bulk order questions
            </h2>
          </>
        )}
      />
      <Footer faq={false} />
    </div>
  );
}
