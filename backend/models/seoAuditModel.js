// models/seoAuditModel.js
// Stores the most recent audit for each route so "View Report" and the summary
// cards can render without recomputing. One document per route.
import mongoose from 'mongoose';

const checkSchema = new mongoose.Schema({
  id: String,
  group: String,
  label: String,
  weight: Number,
  earned: Number,
  status: { type: String, enum: ['pass', 'warn', 'fail', 'info'] },
  value: String,
  message: String,
  fix: String,
}, { _id: false });

const seoAuditSchema = new mongoose.Schema({
  route: { type: String, required: true, unique: true, index: true },
  // Whether the page was noindexed at audit time. Stored so the summary can keep
  // hidden pages out of the site average without re-reading every source.
  noIndex: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  grade: { type: String, default: 'poor' },
  label: { type: String, default: 'Poor' },
  totalWeight: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  checks: { type: [checkSchema], default: [] },
  counts: {
    total: { type: Number, default: 0 },
    passed: { type: Number, default: 0 },
    warnings: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  // Snapshot of what was audited, so a stale report is recognisable when the
  // metadata has been edited since.
  snapshot: {
    title: String,
    description: String,
    keywords: String,
    ogImage: String,
    noIndex: Boolean,
  },
  auditedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('SeoAudit', seoAuditSchema);
