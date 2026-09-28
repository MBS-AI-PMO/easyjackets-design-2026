// models/Metadata.js
import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  title: { type: String },
  h1: { type: String, default: '' },
  description: { type: String },
  keywords: { type: String },
  // Per-page Open Graph / Twitter card image. Empty means the page falls back
  // to the site-wide default social card.
  ogImage: { type: String, default: '' },
  favicon: { type: String },
  navbarLogo: { type: String },
  footerLogo: { type: String },
  navbarLogoHeight: { type: Number, default: 75 },
  footerLogoHeight: { type: Number, default: 66 },
  // When true the storefront emits <meta name="robots" content="noindex, nofollow">
  // for this route AND the route is dropped from every sitemap. Both halves matter:
  // a URL that is noindexed but still listed in a sitemap is reported by Search
  // Console as "Submitted URL marked noindex".
  noIndex: { type: Boolean, default: false },
  sitemapEnabled: { type: Boolean, default: true },
  sitemapOrder: { type: Number, default: 100 },
  sitemapPriority: { type: Number, default: 0.5 },
  sitemapChangefreq: { type: String, default: 'monthly' },
  route: { type: String, required: true, unique: true }, // Ensure each route has unique metadata
}, { timestamps: true });

const Metadata = mongoose.model('Metadata', metadataSchema);
export default Metadata;
