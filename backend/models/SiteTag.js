import mongoose from 'mongoose';

const siteTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }, // Friendly name for admin, e.g., "Google Fonts", "Ahrefs Verification", "Main Title"
  tagType: {
    type: String,
    required: true,
    enum: ['meta', 'link', 'script', 'title', 'style', 'noscript']
  }, // The actual HTML tag to create
  attributes: {
    type: mongoose.Schema.Types.Mixed
  }, // Key-value pairs for tag attributes, e.g., { "rel": "stylesheet", "href": "..." }
  content: {
    type: String
  }, // Inner HTML content, used for <title>, <script>, <style>
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('SiteTag', siteTagSchema);
