import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  address1: {
    type: String
  },
  socialLinks: {
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,

    },
    linkedin: {
      type: String,

    },
  },
  isActive: {
    facebook: {
      type: Boolean,
      default: true,
    },
    twitter: {
      type: Boolean,
      default: true,
    },
    instagram: {
      type: Boolean,
      default: true,
    },
    linkedin: {
      type: Boolean,
      default: true,
    },
  },
  checkout: {
    cod: {
      type: Boolean,
      default: false,
    },
  },
}, { timestamps: true });

export default mongoose.model('website', websiteSchema);
