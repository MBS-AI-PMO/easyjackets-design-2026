import mongoose from 'mongoose';

// The text of the "under construction" screens (admin: Settings → Site Status). The screens themselves
// show by themselves while any of the four apps is being deployed (controllers/deploymentStatusController.js);
// this only holds their headline. One record, key "global"; empty = the default headline.
const siteStatusSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true, index: true },
    message: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.SiteStatus || mongoose.model('SiteStatus', siteStatusSchema);
