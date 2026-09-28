import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
    // unique: true,
  },
  image: { type: String },
  code: {
    type: String,
  },
  materials: [{
    type: mongoose.ObjectId,
    ref: 'material'
  }],
  slug: {
    type: String,
    lowercase: true,
  },
  section: {
    type: String,
    enum: ['jackets', 'sports'],
    default: 'jackets'
  },
  showOnLanding: {
    type: Boolean,
    default: true
  },
  serial: {
    type: Number,
    default: 0
  }
});

export default mongoose.model("Category", categorySchema);
