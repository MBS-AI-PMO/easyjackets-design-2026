// A storefront page's editable content (text and images), one row per page, e.g. key 'how-to-design'.
// Written by the admin (Content -> How to Design Page); the shipped content is stored on start-up
// (helpers/pageContent.js ensurePageContentDefaults).
import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });

export default mongoose.model('PageContent', pageContentSchema);
