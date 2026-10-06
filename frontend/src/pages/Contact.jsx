// Contact: the workshop's details from the admin's Website Details and the
// message form, which emails the workshop through POST /features/contact.
import { useState } from 'react';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { fetchWebsiteDetails, isEmail, submitContact, telHref } from '../lib/site';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';

const TOPICS = ['Sizing', 'Artwork & proof', 'Existing order', 'Team order', 'Wholesale', 'Other'];
const EMPTY = { name: '', email: '', phone: '', order: '', msg: '' };
const IDLE = { sending: false, sent: false, error: '', message: '' };
// The design's details, used until (or unless) Website Details provides its own.
const FALLBACK_EMAIL = 'info@easyjackets.com';
const FALLBACK_ADDRESS = { label: '', lines: ['Sialkot, Pakistan'] };

const eyebrow = { fontSize: '12px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' };
const big = { display: 'block', fontFamily: 'var(--display)', fontWeight: '800', fontSize: '26px', lineHeight: '1', textTransform: 'uppercase', textDecoration: 'none', color: 'inherit', marginTop: '8px', overflowWrap: 'anywhere' };
const note = { margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' };
const fieldError = { fontSize: '12px', fontWeight: '500', letterSpacing: '0', textTransform: 'none', color: '#b3261e' };

export default function Contact() {
  usePageTitle('Contact', 'Talk to the Easy Jackets workshop about sizing, artwork, team orders or an order in production — a real person replies within one business day.');
  const { data: site, loading: siteLoading } = useAsync(fetchWebsiteDetails, []);
  const email = site?.email || FALLBACK_EMAIL;
  const phone = site?.phone || '';
  const [workshop, ...offices] = site?.addresses?.length ? site.addresses : [FALLBACK_ADDRESS];
  const socials = site?.socials || [];

  const [topic, setTopic] = useState('Sizing');
  const [form, setForm] = useState(EMPTY);
  const [invalid, setInvalid] = useState({});
  const [status, setStatus] = useState(IDLE);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const bad = {};
    if (form.name.trim().length < 2) bad.name = 'Please tell us your name.';
    if (!isEmail(form.email)) bad.email = 'Enter a valid email so we can reply.';
    if (form.msg.trim().length < 10) bad.msg = 'A few more words, please (at least 10 characters).';
    return bad;
  };

  const submit = async (e) => {
    e.preventDefault();
    const bad = validate();
    setInvalid(bad);
    if (Object.keys(bad).length) { setStatus({ ...IDLE, error: 'Please fix the highlighted fields.' }); return; }
    setStatus({ ...IDLE, sending: true });
    // The API's email templates show name, email and message only, so the
    // topic, order number and phone travel at the top of the message.
    const [firstName, ...rest] = form.name.trim().split(/\s+/);
    const details = [`Topic: ${topic}`, form.order.trim() && `Order: ${form.order.trim()}`, form.phone.trim() && `Phone: ${form.phone.trim()}`].filter(Boolean);
    try {
      const r = await submitContact({ firstName, lastName: rest.join(' '), email: form.email.trim(), message: `${details.join(' · ')}\n\n${form.msg.trim()}` });
      setStatus({ ...IDLE, sent: true, message: r?.message || 'Message sent successfully!' });
    } catch (err) {
      setStatus({ ...IDLE, error: err?.message || 'Failed to send message. Please try again.' });
    }
  };
  const sentName = form.name.trim().split(/\s+/)[0] || 'there';
  const reset = () => { setForm(EMPTY); setInvalid({}); setStatus(IDLE); };

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
        <div className="ez-head" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px,420px)', gap: '20px clamp(24px,4vw,64px)', alignItems: 'center', marginTop: '16px' }}>
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
          {/* the shop page's campaign card */}
          <A href="/design-custom-jacket" className="ez-card" style={{ position: 'relative', display: 'block', aspectRatio: '1', borderRadius: '4px', overflow: 'hidden', background: 'var(--ink)', textDecoration: 'none', color: 'var(--cream)' }}>
            <div style={{ position: 'absolute', inset: '0', opacity: '0.92' }}>
              <ImageSlot slot="contact-hero" shape="rect" src="/images/site/campaign-varsity-back.webp" fit="cover" placeholder="Jacket photo" aria-label="Navy and red varsity jacket with Senior Class 26 Brooklyn lettering on the back" eager />
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
      {/* Contact body */}
      <section className="ez-two" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(16px,4vw,48px) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '40px clamp(24px,5vw,80px)', alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '24px' }}>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={eyebrow}>Email</div>
              <A href={`mailto:${email}`} style={big}>{email}</A>
              <p style={note}>Orders, artwork, sizing</p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={eyebrow}>WhatsApp / phone</div>
              {phone ? (
                <A href={telHref(phone)} style={big}>{phone}</A>
              ) : siteLoading ? (
                <div className="ez-skeleton" aria-busy="true" style={{ height: '26px', width: '80%', marginTop: '8px' }} />
              ) : (
                <span style={big}>By email, for now</span>
              )}
              <p style={note}>Mon–Sat, 9am–7pm EST</p>
            </div>
            <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
              <div style={eyebrow}>Team orders</div>
              <A href="/bulk-order" style={big}>Bulk quote form →</A>
              <p style={note}>10+ jackets, volume pricing</p>
            </div>
            <div style={{ borderTop: '3px solid var(--gold)', paddingTop: '16px' }}>
              <div style={eyebrow}>Workshop</div>
              <div style={big}>{workshop.lines[workshop.lines.length - 1]}</div>
              <p style={note}>{[...workshop.lines.slice(0, -1), 'Ships worldwide via DHL & FedEx'].join(' · ')}</p>
            </div>
            {offices.map((o) => (
              <div key={o.lines.join('|')} style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
                <div style={eyebrow}>{o.label || 'Office'}</div>
                <div style={big}>{o.lines[o.lines.length - 1]}</div>
                {o.lines.length > 1 ? <p style={note}>{o.lines.slice(0, -1).join(' · ')}</p> : null}
              </div>
            ))}
            {socials.length ? (
              <div style={{ borderTop: '3px solid var(--ink)', paddingTop: '16px' }}>
                <div style={eyebrow}>Follow along</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', marginTop: '8px' }}>
                  {socials.map((s) => (
                    <A key={s.key} href={s.url} target="_blank" rel="noreferrer" style={{ fontFamily: 'var(--display)', fontWeight: '800', fontSize: '22px', lineHeight: '1', textTransform: 'uppercase', textDecoration: 'none', color: 'inherit', borderBottom: '2px solid var(--gold)' }}>{s.name}</A>
                  ))}
                </div>
                <p style={note}>Customer photos and workshop days</p>
              </div>
            ) : null}
          </div>
          <div className="ez-offset-frame" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '14px -14px -14px 14px', background: 'var(--ink)', borderRadius: '4px' }} />
            <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '4px', overflow: 'hidden', background: '#E8DFCB' }}>
              <ImageSlot slot="contact-photo" shape="rect" src="/images/site/campaign-coach-duo.webp" fit="cover" placeholder="Campaign photo" aria-label="Two Easy Jacket coach jackets from the campaign shoot" />
            </div>
          </div>
        </div>
        <div style={{ background: '#fbf8f2', border: '1px solid var(--cream-2)', borderRadius: '4px', padding: 'clamp(22px,3vw,36px)' }}>
          {!status.sent ? (
            <>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: 'clamp(32px,3.5vw,44px)', lineHeight: '0.9', textTransform: 'uppercase', margin: '0' }}>
                Send a message
              </h2>
              {/* offered to AI agents as a tool (WebMCP, lib/webmcp.js): an agent may fill it in, the visitor sends it */}
              <form onSubmit={submit} noValidate style={{ display: 'grid', gap: '18px', marginTop: '24px' }}
                toolname="send_contact_message" tooldescription="Fills in the Easy Jackets contact form, which emails the workshop (sizing, artwork and proofs, an existing order, team or wholesale orders). The visitor reviews the message and presses Send; a person replies within one business day.">
                <div className="ez-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <label className="ez-label">
                    Name
                    <input className="ez-input" name="name" required placeholder="Jordan Lee" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!invalid.name} toolparamdescription="The sender's full name." />
                    {invalid.name ? <span style={fieldError}>{invalid.name}</span> : null}
                  </label>
                  <label className="ez-label">
                    Email
                    <input className="ez-input" type="email" name="email" required placeholder="you@example.com" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!invalid.email} toolparamdescription="The email address the reply goes to." />
                    {invalid.email ? <span style={fieldError}>{invalid.email}</span> : null}
                  </label>
                </div>
                <div className="ez-form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '14px' }}>
                  <label className="ez-label">
                    Phone
                    <input className="ez-input" type="tel" name="phone" placeholder="Optional" autoComplete="tel" value={form.phone} onChange={set('phone')} toolparamdescription="A phone number, optional." />
                  </label>
                  <label className="ez-label">
                    Order number
                    <input className="ez-input" name="order" placeholder="EJ-12345 (if any)" value={form.order} onChange={set('order')} toolparamdescription="The order number, if the message is about an existing order." />
                  </label>
                </div>
                <div className="ez-label">
                  Topic
                  <div className="ez-chip-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {TOPICS.map((t) => (
                      <button key={t} type="button" className="ez-chip" aria-pressed={topic === t} onClick={() => setTopic(t)}>{t}</button>
                    ))}
                    {/* phones: the device's own dropdown instead of the chips */}
                    <select className="ez-input ez-chip-select" name="topic" aria-label="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} toolparamdescription="What the message is about.">
                      {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <label className="ez-label">
                  Message
                  <textarea className="ez-input" name="msg" required placeholder="Tell us what you need…" value={form.msg} onChange={set('msg')} aria-invalid={!!invalid.msg} toolparamdescription="The message, at least 10 characters." />
                  {invalid.msg ? <span style={fieldError}>{invalid.msg}</span> : null}
                </label>
                {status.error ? <p role="alert" style={{ margin: '0', fontSize: '14px', color: '#b3261e', lineHeight: '1.5' }}>{status.error}</p> : null}
                <button type="submit" className="ez-btn ez-btn-ink" disabled={status.sending} style={{ width: '100%', opacity: status.sending ? 0.7 : 1 }}>{status.sending ? 'Sending…' : 'Send message →'}</button>
                <p style={{ margin: '0', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  We reply within one business day. Attach artwork by replying to our confirmation email.
                </p>
              </form>
            </>
          ) : (
            <div role="status" style={{ textAlign: 'center', padding: '40px 10px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold)', display: 'grid', placeItems: 'center', margin: '0 auto', fontFamily: 'var(--display)', fontWeight: '900', fontSize: '32px' }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'var(--display)', fontWeight: '900', fontSize: '40px', lineHeight: '0.9', textTransform: 'uppercase', margin: '20px 0 0' }}>
                Message sent
              </h2>
              <p style={{ color: 'var(--muted)', lineHeight: '1.6', margin: '14px auto 0', maxWidth: '36ch' }}>
                Thanks, {sentName}. We'll reply within one business day — a copy is on its way to your inbox.
              </p>
              <p style={{ color: 'var(--gold-2)', fontSize: '13px', fontWeight: '600', margin: '10px auto 0', maxWidth: '36ch' }}>{status.message}</p>
              <button type="button" className="ez-btn" onClick={reset} style={{ marginTop: '24px' }}>Send another</button>
            </div>
          )}
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
          <A href="/sizechart" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
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
          <A href="/shipping#exchanges" className="ez-card" style={{ display: 'block', padding: '24px', border: '1px solid var(--ink)', borderRadius: '4px', textDecoration: 'none', color: 'inherit' }}>
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
