import React, { useEffect, useId, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import { hasMarkup, safeHtml, stripHtml } from "../../utils/safeHtml";
import "../../css/site.css";
import "./styles.css";

// The builder's FAQs from the admin's Storefront FAQs screen (page "jacket-builder"), shown with
// the storefront's FAQ block (frontend/src/components/PageFaqs.jsx + Faq.jsx): same layout, same
// accordion, same FAQPage structured data.
const PAGE_KEY = "jacket-builder";

// shown only when the API cannot be reached
const fallbackFaqs = [
  { q: "How do I save my custom jacket design?", a: "Use the Save button in the designer before starting a new jacket. Your saved design keeps the selected style, materials, colors, size, and artwork choices ready for review." },
  { q: "Can I choose different materials for the body and sleeves?", a: "Yes. The custom jacket designer lets you choose the jacket body material and sleeve material separately, including melton wool and leather options where available." },
  { q: "What size should I select for my jacket?", a: "Pick the size that best matches your usual jacket fit. If you are between sizes or want extra layering room, choose the next size up." },
  { q: "Can I share my design before ordering?", a: "Yes. Use the Share button to send your current jacket configuration by email so you or your team can review the look before checkout." },
  { q: "Is my jacket ready to order after customization?", a: "Once your materials, colors, designs, and size are selected, save the jacket and continue to cart. You can review the full custom jacket details before placing the order." },
];

const faqSchema = (items) => {
  const entities = items
    .filter((f) => f.q && stripHtml(String(f.a || "")))
    .map((f) => ({ "@type": "Question", name: stripHtml(f.q), acceptedAnswer: { "@type": "Answer", text: stripHtml(String(f.a)) } }));
  return entities.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: entities } : null;
};

/** An accordion row that opens and closes smoothly; answers from the rich-text editor render as (sanitised) HTML. */
const FaqItem = ({ q, a, points }) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const body = hasMarkup(a)
    ? <div className="ez-faq-rich" dangerouslySetInnerHTML={{ __html: safeHtml(a) }} />
    : <p>{a}</p>;
  return (
    <div className={`ez-faq${open ? " is-open" : ""}`}>
      <button type="button" className="ez-faq-q" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
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
};

const CustomJacketFaqs = () => {
  const [faqs, setFaqs] = useState(null);

  useEffect(() => {
    let mounted = true;
    axiosInstance
      .get("/features/page-faqs", { params: { pageKey: PAGE_KEY } })
      .then((res) => {
        const list = Array.isArray(res.data?.faqs) ? res.data.faqs : [];
        if (mounted) setFaqs(list.map((f) => ({ id: f._id, q: f.question, a: f.answer || "", points: f.points || [] })));
      })
      .catch((error) => {
        console.error("Error fetching custom jacket FAQs:", error);
        if (mounted) setFaqs(fallbackFaqs);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // nothing while loading, nothing when the admin has no questions for the builder
  if (!faqs?.length) return null;
  const schema = faqSchema(faqs);

  return (
    <section className="ez-site ez-builder-faqs" aria-labelledby="ez-builder-faqs-title">
      <div className="ez-builder-faqs-grid">
        <div>
          <div className="ez-eyebrow">FAQ</div>
          <h2 id="ez-builder-faqs-title" className="ez-builder-faqs-title">Good to know</h2>
          <p className="ez-builder-faqs-intro">
            Still stuck? Chat with us any time — we answer within the hour during business days.
          </p>
        </div>
        <div className="ez-faq-list">
          {schema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /> : null}
          {faqs.map((f) => <FaqItem key={f.id || f.q} q={f.q} a={f.a} points={f.points} />)}
          <div className="ez-faq-end" />
        </div>
      </div>
    </section>
  );
};

export default CustomJacketFaqs;
