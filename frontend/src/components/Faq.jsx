import { useId, useState } from 'react';
import { safeHtml, stripHtml } from '../lib/html';
import './faq.css';

const hasMarkup = (s) => /<[a-z][\s\S]*>/i.test(s);

/** FAQPage structured data for search engines, built from the list that is on screen. */
export function faqSchema(items) {
  const entities = (items || [])
    .filter((f) => f.q && stripHtml(String(f.a || '')))
    .map((f) => ({ '@type': 'Question', name: stripHtml(f.q), acceptedAnswer: { '@type': 'Answer', text: stripHtml(String(f.a)) } }));
  return entities.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities } : null;
}

/**
 * An accordion row that opens and closes smoothly (a native <details>
 * snaps). Same look as the design's FAQ rows. Answers come from the admin's
 * rich-text editor, so HTML is rendered (sanitised) and plain text as a
 * paragraph; `points` is the optional bullet list some answers carry.
 */
export function FaqItem({ q, a, points, size = 'md' }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  let body = a;
  if (typeof a === 'string') body = hasMarkup(a) ? <div className="ez-faq-rich" dangerouslySetInnerHTML={{ __html: safeHtml(a, { stripStyles: true }) }} /> : <p>{a}</p>;
  return (
    <div className={`ez-faq${open ? ' is-open' : ''}`}>
      <button type="button" className={`ez-faq-q ez-faq-${size}`} aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span>{q}</span>
        <span className="faq-plus" aria-hidden="true">+</span>
      </button>
      <div id={id} className="ez-faq-a" role="region">
        <div className="ez-faq-inner">
          {body}
          {points?.length ? <ul className="ez-faq-points">{points.map((p) => <li key={p}>{p}</li>)}</ul> : null}
        </div>
      </div>
    </div>
  );
}

/** A list of FAQ rows; `schema` also emits the FAQPage JSON-LD (one per page). */
export default function Faq({ items, size, schema = false }) {
  const data = schema ? faqSchema(items) : null;
  return (
    <div className="ez-faq-list">
      {data ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} /> : null}
      {items.map((f) => <FaqItem key={f.id || f.q} q={f.q} a={f.a} points={f.points} size={size} />)}
      <div className="ez-faq-end" />
    </div>
  );
}
