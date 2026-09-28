// models/pageViewModel.js
// One document per page a visitor opens. Ordered by `viewedAt` within a
// session, these form the visitor's journey through the site.
import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  visitorId: { type: String, required: true, index: true },

  path: { type: String, required: true, index: true },
  title: { type: String, default: '' },
  referrer: { type: String, default: '' },

  viewedAt: { type: Date, default: Date.now, index: true },
  // Filled in when the next pageview arrives or the session ends, so the last
  // page of a session keeps 0 unless a leave beacon lands.
  secondsOnPage: { type: Number, default: 0 },

  sequence: { type: Number, default: 1 },

  // Denormalised from the session so "top pages" can exclude crawler traffic
  // without joining back to VisitorSession on every report.
  isBot: { type: Boolean, default: false, index: true },
}, { timestamps: true });

pageViewSchema.index({ sessionId: 1, viewedAt: 1 });
pageViewSchema.index({ viewedAt: -1 });

export default mongoose.model('PageView', pageViewSchema);
