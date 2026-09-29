// A jacket saved in the builder (custom-jacket/), reviewed on the site like the live site's design
// page: every rendered view, the price, and every detail of the build (materials, sizing, colors,
// styles, advanced options and the artwork on each placement), with Share and Edit. The builder's
// Review button, the cart's "Review design" and the live site's old /Design/<id> links land here.
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import A from '../components/A';
import ImageSlot from '../components/ImageSlot';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import { useCart } from '../lib/cart';
import { designDetails, designLine, designName, designViews, editDesignUrl, fetchDesign, isDesignLine, shareDesign } from '../lib/designs';
import { money } from '../lib/orders';
import { useAsync } from '../lib/useAsync';
import { usePageTitle } from '../lib/usePageTitle';
import './DesignReview.css';

function Card({ title, children, className = '' }) {
  return (
    <section className={`dr-card ${className}`}>
      <h2 className="dr-card-title">{title}</h2>
      {children}
    </section>
  );
}

function Rows({ rows }) {
  return (
    <dl className="dr-rows">
      {rows.map(([k, v]) => (
        <div key={k} className="dr-row">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const Swatch = ({ name, hex }) => (
  <span className="dr-swatch">
    <span className="dr-swatch-dot" style={{ background: hex }} aria-hidden="true" />
    <span className="dr-swatch-name">{name}</span>
    <span className="dr-swatch-hex">{hex.toUpperCase()}</span>
  </span>
);

/** The rendered views, turning every few seconds like the live page (paused while hovered). */
function Views({ id, name, views, loading }) {
  const [n, setN] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = views.length;
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const t = setInterval(() => setN((i) => (i + 1) % count), 3500);
    return () => clearInterval(t);
  }, [count, paused]);
  const shown = views[Math.min(n, count - 1)];
  const go = (d) => setN((i) => (i + d + count) % count);

  return (
    <div className="dr-views" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="dr-stage ez-design-photo">
        {loading && !count ? (
          <div className="ez-skeleton" style={{ width: '100%', height: '100%' }} />
        ) : (
          views.map((v, i) => (
            <div key={v.label} className={`dr-stage-layer${v === shown ? ' is-on' : ''}`} aria-hidden={v !== shown}>
              <ImageSlot slot={`design-${id}-${v.label}`} shape="rect" fit="contain" knockout src={v.src} width={960} eager={i === 0} placeholder="Jacket" aria-label={`${name}, ${v.label.toLowerCase()} view`} />
            </div>
          ))
        )}
      </div>
      {count > 1 ? (
        // the controls sit under the picture, never on it
        <div className="dr-nav">
          <button type="button" className="dr-arrow" onClick={() => go(-1)} aria-label="Previous view">‹</button>
          <span className="dr-view-label">{shown?.label} view <span>{views.indexOf(shown) + 1} / {count}</span></span>
          <button type="button" className="dr-arrow" onClick={() => go(1)} aria-label="Next view">›</button>
        </div>
      ) : null}
      {count > 1 ? (
        <div className="dr-thumbs" role="tablist" aria-label="Views">
          {views.map((v, i) => (
            <button key={v.label} type="button" role="tab" aria-selected={v === shown} className={`dr-thumb${v === shown ? ' is-on' : ''}`} onClick={() => setN(i)}>
              <span className="dr-thumb-img ez-design-photo">
                <ImageSlot slot={`design-${id}-thumb-${v.label}`} shape="rect" fit="contain" knockout src={v.src} width={320} placeholder="" aria-label={`${v.label} view`} />
              </span>
              <span className="dr-thumb-label">{v.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Share: the builder's email (with the PDF spec), sent to the visitor or a friend. */
function ShareDialog({ design, onClose }) {
  const [form, setForm] = useState({ name: '', email: '' });
  const [state, setState] = useState({ busy: false, error: '', sent: false });
  const first = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    first.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', sent: false });
    try {
      await shareDesign(design, form);
      setState({ busy: false, error: '', sent: true });
    } catch (err) {
      setState({ busy: false, error: err?.message || 'The design could not be sent. Please try again.', sent: false });
    }
  };
  return (
    <div className="dr-modal" role="dialog" aria-modal="true" aria-labelledby="dr-share-title">
      <button type="button" className="dr-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="dr-modal-box">
        <div className="dr-modal-head">
          <h2 id="dr-share-title">Share this design</h2>
          <button type="button" className="dr-modal-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        {state.sent ? (
          <div className="dr-modal-body">
            <p className="dr-modal-lead">Sent. <strong>{form.email}</strong> will get the design with every view and the full spec.</p>
            <button type="button" className="ez-btn ez-btn-ink" style={{ width: '100%' }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form className="dr-modal-body" onSubmit={submit}>
            <p className="dr-modal-lead">Email this jacket, with every view and the full spec, to yourself or a friend.</p>
            <label className="dr-field">
              <span>Your name</span>
              <input ref={first} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </label>
            <label className="dr-field">
              <span>Email address</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </label>
            {state.error ? <p className="dr-modal-error" role="alert">{state.error}</p> : null}
            <button type="submit" className="ez-btn ez-btn-ink" style={{ width: '100%' }} disabled={state.busy}>
              {state.busy ? 'Sending…' : 'Send design'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function DesignReview() {
  const { id } = useParams();
  const cart = useCart();
  const { data: design, error, loading } = useAsync((signal) => fetchDesign(id, signal), [id], { live: false });
  const [sharing, setSharing] = useState(false);
  const name = design ? designName(design) : 'Custom jacket';
  usePageTitle(design ? `${name} design` : 'Custom jacket design', 'Review a jacket designed in the Easy Jackets design lab.');

  const views = designViews(design);
  const details = designDetails(design);
  const inCart = design ? cart.items.find((l) => isDesignLine(l) && l.designId === design._id) : null;
  const price = Number(design?.custom_price) || 0;
  const skeleton = (h) => <div className="ez-skeleton" style={{ height: h, borderRadius: '4px' }} />;

  return (
    <div className="pg-design-review">
      <Nav cta="cart" />
      <div className="dr-wrap">
        <div className="dr-crumbs">
          <A href="/">Home</A>
          <span>/</span>
          <A href="/cart">Cart</A>
          <span>/</span>
          <span className="dr-crumb-here">Design</span>
        </div>

        {error && !design ? (
          <div className="dr-missing">
            <div className="dr-missing-title">Design not found</div>
            <p>This link does not open a saved jacket. Start a new one in the design lab.</p>
            <div className="dr-actions-row" style={{ justifyContent: 'center' }}>
              <A href="/design-custom-jacket" className="ez-btn ez-btn-ink">Design a jacket</A>
              <A href="/cart" className="ez-btn">Your cart</A>
            </div>
          </div>
        ) : (
          <>
            <header className="dr-head">
              <div className="dr-eyebrow">Designed in the design lab</div>
              <h1>{design ? name : 'Custom jacket'} <span>design</span></h1>
              <p>Every view and every detail of this build, exactly as it was saved.</p>
            </header>

            <div className="dr-grid">
              <div className="dr-left">
                <Views id={id} name={name} views={views} loading={loading} />
                {design ? (
                  <div className="dr-actions">
                    <button type="button" className="ez-btn ez-btn-ink" onClick={() => setSharing(true)}>Share design</button>
                    <a href={editDesignUrl({ categoryCode: design.categoryCode, designId: design._id })} className="ez-btn">Edit design</a>
                    {inCart ? (
                      <A href="/cart" className="ez-btn ez-btn-gold dr-actions-wide">In your cart · View cart →</A>
                    ) : (
                      <button type="button" className="ez-btn ez-btn-gold dr-actions-wide" onClick={() => cart.add(designLine(design), 1)}>Add to cart · {money(price)}</button>
                    )}
                  </div>
                ) : loading ? (
                  <div className="dr-actions">{skeleton(52)}{skeleton(52)}</div>
                ) : null}
              </div>

              <div className="dr-right">
                {design ? (
                  <section className="dr-price">
                    <div>
                      <div className="dr-price-title">Total estimated price</div>
                      <div className="dr-price-note">Includes all customizations · shipping at checkout</div>
                    </div>
                    <div className="dr-price-value">{money(price)}</div>
                  </section>
                ) : loading ? skeleton(96) : null}

                {details ? (
                  <>
                    <div className="dr-two">
                      <Card title="Materials"><Rows rows={details.materials} /></Card>
                      <Card title="Sizing"><Rows rows={details.sizing} /></Card>
                    </div>
                    {details.colors.length ? (
                      <Card title="Color configuration">
                        <div className="dr-swatches">{details.colors.map((c) => <Swatch key={c.name} {...c} />)}</div>
                      </Card>
                    ) : null}
                    <div className="dr-two">
                      {details.styles.length ? <Card title="Styles"><Rows rows={details.styles} /></Card> : null}
                      {details.advanced.length ? <Card title="Advanced options"><Rows rows={details.advanced} /></Card> : null}
                    </div>
                    <Card title="Artwork & lettering">
                      {details.artwork.length ? (
                        <div className="dr-art">
                          {details.artwork.map((a) => (
                            <div key={a.place} className="dr-art-item">
                              <div className="dr-art-head">
                                <span className="dr-art-place">{a.place}</span>
                                <span className="dr-art-kind">{a.kind}</span>
                              </div>
                              {a.image ? (
                                <div className="dr-art-img"><img src={a.image} alt={`Artwork on the ${a.place.toLowerCase()}`} loading="lazy" /></div>
                              ) : null}
                              {a.rows.length ? <Rows rows={a.rows} /> : null}
                              {a.swatches.length ? <div className="dr-swatches dr-swatches-sm">{a.swatches.map((c) => <Swatch key={c.name} {...c} />)}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="dr-empty">No lettering, patches or artwork on this jacket.</p>
                      )}
                    </Card>
                  </>
                ) : loading ? (
                  <>
                    <div className="dr-two">{skeleton(150)}{skeleton(150)}</div>
                    {skeleton(140)}
                    <div className="dr-two">{skeleton(300)}{skeleton(300)}</div>
                  </>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
      {sharing && design ? <ShareDialog design={design} onClose={() => setSharing(false)} /> : null}
      <Footer />
    </div>
  );
}
