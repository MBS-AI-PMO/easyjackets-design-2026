import mongoose from 'mongoose';

/**
 * One FAQ entry belonging to one page.
 *
 * `pageKey` is either a storefront route ('/faq', '/bulk-order', '/shop', ...) or
 * one of the template keys ('product-template', 'catalog-template') that stand in
 * for a whole class of generated pages. Keeping FAQs per page — rather than in
 * shared sets — means editing one page's FAQ can never silently rewrite another's,
 * which is what the admin screen implies when it shows one tab per page.
 *
 * Answers are stored as plain text. They are rendered into FAQPage JSON-LD as
 * well as onto the page, and Google rejects markup inside those values.
 */
const pageFaqSchema = new mongoose.Schema(
  {
    pageKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    // Only the bulk-order quote question uses these today, but the storefront has
    // always rendered them, so dropping the field would lose visible content.
    points: {
      type: [String],
      default: undefined,
    },
    // Groups the FAQ page (Ordering, Sizing, Shipping, ...). Optional; the
    // storefront groups by keyword when it is empty.
    category: {
      type: String,
      trim: true,
      default: '',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pageFaqSchema.index({ pageKey: 1, sortOrder: 1 });

export default mongoose.models.PageFaq || mongoose.model('PageFaq', pageFaqSchema);
