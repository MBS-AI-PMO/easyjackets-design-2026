import mongoose from 'mongoose';

// "Under construction" for the public site (admin: Settings → Site Status). While it is on, the
// storefront and the jacket builder show a holding page instead of the site; the admin keeps working.
// `previewKey` lets the team use the real site meanwhile (a private link, ?preview=<key>); it is never
// sent to the public. One record, key "global". A new database starts with the site under construction.
const siteStatusSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true, index: true },
    underConstruction: { type: Boolean, default: true },
    message: { type: String, default: '', trim: true, maxlength: 300 },
    previewKey: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteStatus || mongoose.model('SiteStatus', siteStatusSchema);
