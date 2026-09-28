// models/visitorSessionModel.js
// One document per browsing session. A session is opened by the storefront
// tracker and kept alive by heartbeats; `lastSeenAt` is what "currently live"
// is derived from.
import mongoose from 'mongoose';

const visitorSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  // Stable across sessions for the same browser (localStorage), so returning
  // visitors can be recognised without any login.
  visitorId: { type: String, required: true, index: true },

  // Identity, when the visitor is signed in. Anonymous sessions leave these null.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
  name: { type: String, default: '' },
  email: { type: String, default: '' },

  startedAt: { type: Date, default: Date.now, index: true },
  lastSeenAt: { type: Date, default: Date.now, index: true },
  durationSeconds: { type: Number, default: 0 },

  pageCount: { type: Number, default: 0 },
  entryPage: { type: String, default: '' },
  currentPage: { type: String, default: '' },
  exitPage: { type: String, default: '' },

  referrer: { type: String, default: '' },
  referrerHost: { type: String, default: '' },
  landingSource: { type: String, default: 'direct' }, // direct | search | social | referral | campaign
  utm: {
    source: { type: String, default: '' },
    medium: { type: String, default: '' },
    campaign: { type: String, default: '' },
  },

  userAgent: { type: String, default: '' },
  browser: { type: String, default: 'Unknown' },
  os: { type: String, default: 'Unknown' },
  device: { type: String, default: 'desktop' }, // desktop | mobile | tablet | bot
  screen: { type: String, default: '' },
  language: { type: String, default: '' },
  timezone: { type: String, default: '' },

  ip: { type: String, default: '' },
  isBot: { type: Boolean, default: false },
  isReturning: { type: Boolean, default: false },
}, { timestamps: true });

visitorSessionSchema.index({ startedAt: -1 });
visitorSessionSchema.index({ lastSeenAt: -1 });

export default mongoose.model('VisitorSession', visitorSessionSchema);
