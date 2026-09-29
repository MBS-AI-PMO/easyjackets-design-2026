import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import "./styles.scss";

const HAS_MARKUP = /<\/?[a-z][^>]*>/i;

/**
 * FAQ answers are written in the admin's rich text editor, so they arrive as
 * HTML — a paragraph, sometimes with a link or a list. Answers written before
 * that editor existed are plain text and are rendered as text.
 *
 * A <div> rather than a <p>, because a paragraph cannot legally hold the lists
 * and headings the editor produces. The storefront app has the same component
 * in src/components/FaqAnswer.jsx; this builder ships separately and cannot
 * import from it.
 */
const FaqAnswer = ({ answer }) => {
  const value = String(answer || "");
  if (!value.trim()) return null;

  return HAS_MARKUP.test(value) ? (
    <div className="faq-answer-body" dangerouslySetInnerHTML={{ __html: value }} />
  ) : (
    <div className="faq-answer-body">{value}</div>
  );
};

const fallbackFaqs = [
  {
    question: "How do I save my custom jacket design?",
    answer:
      "Use the Save button in the designer before starting a new jacket. Your saved design keeps the selected style, materials, colors, size, and artwork choices ready for review.",
  },
  {
    question: "Can I choose different materials for the body and sleeves?",
    answer:
      "Yes. The custom jacket designer lets you choose the jacket body material and sleeve material separately, including melton wool and leather options where available.",
  },
  {
    question: "What size should I select for my jacket?",
    answer:
      "Pick the size that best matches your usual jacket fit. If you are between sizes or want extra layering room, choose the next size up.",
  },
  {
    question: "Can I share my design before ordering?",
    answer:
      "Yes. Use the Share button to send your current jacket configuration by email so you or your team can review the look before checkout.",
  },
  {
    question: "Is my jacket ready to order after customization?",
    answer:
      "Once your materials, colors, designs, and size are selected, save the jacket and continue to cart. You can review the full custom jacket details before placing the order.",
  },
];

const CustomJacketFaqs = () => {
  const [faqs, setFaqs] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchFaqs = async () => {
      try {
        const res = await axiosInstance.get("/features/custom-jacket-faqs?limit=5");
        const nextFaqs = Array.isArray(res.data?.faqs) ? res.data.faqs : [];
        if (mounted) setFaqs(nextFaqs.slice(0, 5));
      } catch (error) {
        console.error("Error fetching custom jacket FAQs:", error);
        if (mounted) setFaqs(fallbackFaqs);
      }
    };

    fetchFaqs();

    return () => {
      mounted = false;
    };
  }, []);

  if (!faqs) return null;
  if (!faqs.length) return null;

  return (
    <section className="cjd-custom-faq-section">
      <div className="ej-container">
        <div className="cjd-custom-faq-heading">
          <div className="ej-label">Questions</div>
          <h2>
            Frequently Asked <em>Questions</em>
          </h2>
        </div>

        <div className="cjd-custom-faq-shell">
          <div className="faq-editorial-wrapper">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              const key = faq._id || `${faq.question}-${index}`;

              return (
                <div
                  key={key}
                  className={`faq-editorial-item ${isOpen ? "is-active" : ""}`}
                >
                  <button
                    className="cjd-custom-faq-button"
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <div className="faq-toggle-icon" aria-hidden="true">
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </button>
                  <div className={`faq-answer ${isOpen ? "is-open" : ""}`}>
                    <div className="faq-answer-inner">
                      <FaqAnswer answer={faq.answer} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomJacketFaqs;
